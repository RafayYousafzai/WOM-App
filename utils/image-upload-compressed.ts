import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { decode } from "base64-arraybuffer";
import { SupabaseClient } from "@supabase/supabase-js";

const UPLOAD_CONFIG = {
  maxFileSize: 15 * 1024 * 1024, // 15MB
  compression: {
    quality: 0.8,
    format: ImageManipulator.SaveFormat.JPEG,
  },
  maxRetries: 3,
  timeout: 60000, // 60 seconds
};

type ProgressCallback = (progress: number, message: string) => void;

async function compressImage(uri: string): Promise<{ uri: string; originalSize: number; compressedSize: number }> {
  try {
    const originalInfo = await FileSystem.getInfoAsync(uri);
    const originalSize = originalInfo.size || 0;

    if (originalSize === 0) {
      throw new Error("Original image has size 0.");
    }

    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [], // No resize actions, only compress
      {
        compress: UPLOAD_CONFIG.compression.quality,
        format: UPLOAD_CONFIG.compression.format,
      }
    );

    const compressedInfo = await FileSystem.getInfoAsync(manipulatedImage.uri);
    const compressedSize = compressedInfo.size || 0;

    console.log(`Image compressed: ${(originalSize / 1024 / 1024).toFixed(2)}MB -> ${(compressedSize / 1024 / 1024).toFixed(2)}MB`);

    return {
      uri: manipulatedImage.uri,
      originalSize,
      compressedSize,
    };
  } catch (error) {
    console.error("Image compression failed:", error);
    const originalInfo = await FileSystem.getInfoAsync(uri);
    return {
      uri,
      originalSize: originalInfo.size || 0,
      compressedSize: originalInfo.size || 0,
    };
  }
}

export const uploadImage = async (
  supabase: SupabaseClient,
  uri: string,
  userId: string,
  onProgress?: ProgressCallback
): Promise<string | null> => {
  if (uri.startsWith("https://nhzzlxtvtlbvboesexcp.supabase.co/storage/v1/")) {
    onProgress?.(100, "Already uploaded");
    return uri;
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= UPLOAD_CONFIG.maxRetries; attempt++) {
    try {
      onProgress?.(0, `Attempt ${attempt}/${UPLOAD_CONFIG.maxRetries}...`);

      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) throw new Error("File does not exist.");
      if (fileInfo.size > UPLOAD_CONFIG.maxFileSize) throw new Error("File is too large.");

      onProgress?.(10, "Compressing image...");
      const { uri: compressedUri } = await compressImage(uri);

      onProgress?.(40, "Preparing upload...");
      const fileName = `posts/${userId}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
      const base64 = await FileSystem.readAsStringAsync(compressedUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const arrayBuffer = decode(base64);

      onProgress?.(60, "Uploading...");
      const uploadPromise = supabase.storage
        .from("reviews-images")
        .upload(fileName, arrayBuffer, {
          contentType: "image/jpeg",
          upsert: false,
        });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Upload timeout")), UPLOAD_CONFIG.timeout)
      );

      const { error: uploadError } = await Promise.race([uploadPromise, timeoutPromise]);

      if (uploadError) throw uploadError;

      onProgress?.(90, "Getting public URL...");
      const { data } = supabase.storage.from("reviews-images").getPublicUrl(fileName);

      if (compressedUri !== uri) {
        await FileSystem.deleteAsync(compressedUri, { idempotent: true });
      }

      onProgress?.(100, "Upload complete!");
      return data.publicUrl;

    } catch (error) {
      lastError = error as Error;
      console.error(`Upload attempt ${attempt} failed:`, error);
      onProgress?.(0, `Attempt ${attempt} failed. Retrying...`);

      if (attempt < UPLOAD_CONFIG.maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  console.error("Upload failed after all retries.", lastError);
  if (lastError) throw lastError;
  return null;
};

export const uploadImages = async (
  supabase: SupabaseClient,
  uris: string[],
  userId: string,
  onOverallProgress?: (progress: number, message: string) => void
): Promise<string[]> => {
  const uploadedUrls: string[] = [];
  const totalImages = uris.length;

  if (totalImages === 0) return [];

  onOverallProgress?.(0, "Starting image uploads...");

  for (let i = 0; i < totalImages; i++) {
    const uri = uris[i];
    const imageNumber = i + 1;

    try {
      const singleImageProgress = (progress: number, message: string) => {
        const overallProgress = ((i + progress / 100) / totalImages) * 100;
        onOverallProgress?.(overallProgress, `Image ${imageNumber}/${totalImages}: ${message}`);
      };

      const uploadedUrl = await uploadImage(supabase, uri, userId, singleImageProgress);

      if (uploadedUrl) {
        uploadedUrls.push(uploadedUrl);
      }
    } catch (error) {
      console.error(`Failed to upload image ${imageNumber}:`, error);
      onOverallProgress?.(((i + 1) / totalImages) * 100, `Failed image ${imageNumber}, continuing...`);
    }
  }

  onOverallProgress?.(100, `Finished. ${uploadedUrls.length}/${totalImages} uploaded.`);
  return uploadedUrls;
};

