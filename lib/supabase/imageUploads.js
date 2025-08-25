export const uploadDishImages = async (dishes, user, supabase) => {
  const updatedDishes = await Promise.all(
    dishes.map(async (dish) => {
      // ... (rest of the code is the same)

      const uploadedImageUrls = await Promise.all(
        dish.images.map(async (img, index) => {
          if (img.startsWith("http")) {
            return img;
          }

          // Fetch the image to get its content type
          const response = await fetch(img);
          const blob = await response.blob();

          // Use the blob's type
          const contentType = blob.type;

          if (!contentType || !contentType.startsWith("image/")) {
            console.error("Invalid file type detected:", contentType);
            throw new Error("Invalid file type. Please select an image file.");
          }

          const fileExt = contentType.split("/")[1];
          const fileName = `${Date.now()}-${dish.id}-${index}.${fileExt}`;
          const filePath = `dishes/${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("dish-images")
            .upload(filePath, {
              uri: img,
              type: contentType, // Use the correct, fetched MIME type
              name: fileName,
            });

          if (uploadError) {
            console.error("Image upload failed:", uploadError);
            throw new Error(
              `Failed to upload image for dish: ${dish.dishName}`
            );
          }

          const { data } = supabase.storage
            .from("dish-images")
            .getPublicUrl(filePath);

          if (!data?.publicUrl) {
            console.error(
              "No public URL returned for uploaded image:",
              filePath
            );
            throw new Error("Failed to get public URL for uploaded image.");
          }

          return data.publicUrl;
        })
      );

      return { ...dish, images: uploadedImageUrls };
    })
  );

  return updatedDishes;
};
