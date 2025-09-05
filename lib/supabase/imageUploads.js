import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

export const uploadDishImages = async (
  dishes,
  user,
  supabase,
  updateProgress
) => {
  let totalImages = dishes.reduce(
    (count, dish) => count + (dish.images?.length || 0),
    0
  );
  let uploadedCount = 0;

  const updatedDishes = await Promise.all(
    dishes.map(async (dish) => {
      const uploadedImageUrls = await Promise.all(
        dish.images.map(async (img, index) => {
          if (img.startsWith("http")) {
            // Already uploaded → skip
            uploadedCount++;
            updateProgress(
              Math.round((uploadedCount / totalImages) * 100),
              `Skipping existing image ${uploadedCount}/${totalImages}`
            );
            return img;
          }

          try {
            // Handle different image input formats
            let imageUri;

            if (typeof img === "string") {
              // Direct URI string
              imageUri = img;
            } else if (img.uri) {
              // Object with uri property
              imageUri = img.uri;
            } else {
              throw new Error("Invalid image format");
            }

            // Check if file exists
            const fileInfo = await FileSystem.getInfoAsync(imageUri);
            if (!fileInfo.exists) {
              throw new Error("File does not exist");
            }

            // Read file as base64 then convert to ArrayBuffer
            const base64 = await FileSystem.readAsStringAsync(imageUri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            const arrayBuffer = decode(base64);

            // Generate filename and path
            const fileExt = "jpeg"; // Default to jpeg for consistency
            const finalFileName = `${Date.now()}-${
              dish.id
            }-${index}.${fileExt}`;
            const filePath = `dishes/${user.id}/${finalFileName}`;

            // Upload the ArrayBuffer data
            const { error: uploadError } = await supabase.storage
              .from("dish-images")
              .upload(filePath, arrayBuffer, {
                contentType: "image/jpeg",
                upsert: false,
              });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
              .from("dish-images")
              .getPublicUrl(filePath);

            if (!data?.publicUrl) {
              throw new Error("Failed to get public URL.");
            }

            uploadedCount++;
            updateProgress(
              Math.round((uploadedCount / totalImages) * 100),
              `Uploaded ${uploadedCount}/${totalImages} images...`
            );

            return data.publicUrl;
          } catch (error) {
            console.error("Image upload failed:", error);
            throw new Error(
              `Failed to upload image for ${dish.dishName || "a dish"}`
            );
          }
        })
      );

      return { ...dish, images: uploadedImageUrls };
    })
  );

  return updatedDishes;
};
