// Example frontend call
export const uploadImages = async () => {
  const base64Images = await convertToBase64(localImageUris);

  const response = await fetch("http://localhost:3000/upload_to_images_s3", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      userId: currentUser.id,
      images: base64Images,
      postData: {
        caption: "My delicious pizza",
        rating: 4.5,
      },
    }),
  });

  const result = await response.json();
  if (result.success) {
    // Handle success
  }
};
