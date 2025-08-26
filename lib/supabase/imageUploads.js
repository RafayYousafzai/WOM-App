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
            // Fetch the file to get content type
            const response = await fetch(img);
            const blob = await response.blob();
            const contentType = blob.type;

            if (!contentType?.startsWith("image/")) {
              throw new Error("Invalid file type. Please select an image.");
            }

            const fileExt = contentType.split("/")[1];
            const fileName = `${Date.now()}-${dish.id}-${index}.${fileExt}`;
            const filePath = `dishes/${user.id}/${fileName}`;

            // Upload
            const { error: uploadError } = await supabase.storage
              .from("dish-images")
              .upload(filePath, {
                uri: img,
                type: contentType,
                name: fileName,
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
