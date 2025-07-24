import {
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/lib/firebase/config"; // Ensure Firebase is initialized

/**
 * Uploads a file to Firebase Storage.
 * @param {string} uri - The local file URI.
 * @param {string} folder - The folder path in Firebase Storage.
 * @returns {Promise<string>} - The download URL of the uploaded file.
 */
export const uploadFileToFirebase = async (uri, folder = "uploads") => {
  try {
    // Fetch blob from URI
    const response = await fetch(uri);
    const blob = await response.blob();

    // Generate a unique file name
    const filename = `${new Date().getTime()}-${Math.random()
      .toString(36)
      .substring(7)}`;

    // Firebase storage reference
    const storageRef = ref(storage, `${folder}/${filename}`);

    // Upload file
    await uploadBytes(storageRef, blob);

    // Get download URL
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("File upload failed:", error);
    throw error;
  }
};

/**
 * Deletes a file from Firebase Storage.
 * @param {string} path - The file path in Firebase Storage.
 * @returns {Promise<void>}
 */
export const deleteFileFromFirebase = async (path) => {
  try {
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
  } catch (error) {
    console.error("File deletion failed:", error);
    throw error;
  }
};
