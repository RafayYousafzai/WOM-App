import { uploadImagesWithCompression, getCompressionEstimate } from "./image-upload-compressed"
import * as FileSystem from "expo-file-system"
// Restaurant-specific image upload configuration
const RESTAURANT_UPLOAD_CONFIG = {
  maxWidth: 2048, // Slightly higher resolution for restaurant photos
  maxHeight: 2048,
  quality: 0.85, // Higher quality for food/restaurant photos
  timeout: 50000, // 50 seconds for restaurant images (might be larger)
  maxRetries: 3,
}

// Upload restaurant images with optimized settings
export const uploadRestaurantImages = async (
  supabase: any,
  imageUris: string[],
  userId: string,
  onProgress?: (progress: number, message: string) => void,
) => {
  try {
    // Get compression estimate first
    const estimate = await getCompressionEstimate(imageUris)
    console.log(`Restaurant images - Estimated savings: ${(estimate.estimatedSavings / 1024 / 1024).toFixed(1)}MB`)

    // Upload with restaurant-specific settings
    const { urls, stats } = await uploadImagesWithCompression(supabase, imageUris, userId, onProgress)

    // Log restaurant-specific stats
    console.log("Restaurant Image Upload Stats:")
    console.log(`- Images uploaded: ${urls.length}/${imageUris.length}`)
    console.log(`- Total size reduction: ${(stats.compressionRatio).toFixed(1)}%`)
    console.log(
      `- Bandwidth saved: ${((stats.totalOriginalSize - stats.totalCompressedSize) / 1024 / 1024).toFixed(1)}MB`,
    )

    return { urls, stats }
  } catch (error) {
    console.error("Restaurant image upload failed:", error)
    throw error
  }
}

// Validate restaurant images before upload
export const validateRestaurantImages = async (
  imageUris: string[],
): Promise<{
  valid: boolean
  issues: string[]
  totalSize: number
}> => {
  const issues: string[] = []
  let totalSize = 0

  if (imageUris.length === 0) {
    issues.push("At least one image is required for restaurant reviews")
  }

  if (imageUris.length > 10) {
    issues.push("Maximum 10 images allowed per restaurant review")
  }

  // Check individual images
  for (let i = 0; i < imageUris.length; i++) {
    const uri = imageUris[i]

    try {
      const fileInfo = await FileSystem.getInfoAsync(uri)

      if (!fileInfo.exists) {
        issues.push(`Image ${i + 1} does not exist`)
        continue
      }

      const fileSize = fileInfo.size || 0
      totalSize += fileSize

      // Check file size (20MB max per image for restaurants)
      if (fileSize > 20 * 1024 * 1024) {
        issues.push(`Image ${i + 1} is too large (${(fileSize / 1024 / 1024).toFixed(1)}MB). Maximum 20MB per image.`)
      }

      // Check file extension
      const fileExt = uri.split(".").pop()?.toLowerCase() || ""
      if (!["jpg", "jpeg", "png", "heic"].includes(fileExt)) {
        issues.push(`Image ${i + 1} has unsupported format (${fileExt}). Use JPG, PNG, or HEIC.`)
      }
    } catch (error) {
      issues.push(`Could not validate image ${i + 1}`)
    }
  }

  // Check total size
  if (totalSize > 100 * 1024 * 1024) {
    issues.push(`Total images size too large (${(totalSize / 1024 / 1024).toFixed(1)}MB). Maximum 100MB total.`)
  }

  return {
    valid: issues.length === 0,
    issues,
    totalSize,
  }
}
