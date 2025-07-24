import AWS from "aws-sdk";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { Alert } from "react-native";

const s3 = new AWS.S3({
  accessKeyId: "AKIAUCG2JGJEBCEOF3OH",
  secretAccessKey: "NQsX9amJRPcXz5wF9qT58IXjPyXLbjMa/OgmQ7Zq",
  region: "us-east-1", // change this to your region
});

// Remove AWS SDK from client-side! Use backend API instead
export const uploadImagesToS3 = async (uris, userId) => {
  if (!userId) {
    console.error("User ID not available");
    return [];
  }

  const uploadedUrls = [];

  try {
    for (const uri of uris) {
      // Skip S3-hosted images
      if (uri.startsWith("https://rafay-media-store.s3")) {
        uploadedUrls.push(uri);
        continue;
      }

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        console.warn(`File not found: ${uri}`);
        continue;
      }

      // Read as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Get MIME type dynamically
      const mimeType = (await FileSystem.getContentUriAsync(uri)).split(";")[0];

      // Send to secure backend
      const response = await fetch("YOUR_BACKEND_UPLOAD_ENDPOINT", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOUR_AUTH_TOKEN`,
        },
        body: JSON.stringify({
          userId,
          file: base64,
          mimeType,
          fileName: `posts/${userId}/${Date.now()}`,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        uploadedUrls.push(data.url);
      } else {
        throw new Error(data.error || "Upload failed");
      }
    }
    return uploadedUrls;
  } catch (error) {
    console.error("Upload failed:", error);
    Alert.alert("Upload Error", error.message);
    return [];
  }
};
