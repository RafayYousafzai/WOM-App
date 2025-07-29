export const sendBulkPushNotifications = async (followers, title, body) => {
  const validFollowers = followers.filter(
    (f) => f.token && typeof f.token === "string"
  );

  if (validFollowers.length === 0) {
    console.warn("No valid push tokens found among followers.");
    return;
  }

  // Split into chunks of 100 (Expo's recommended batch size)
  const CHUNK_SIZE = 100;
  const chunks = [];
  for (let i = 0; i < validFollowers.length; i += CHUNK_SIZE) {
    chunks.push(validFollowers.slice(i, i + CHUNK_SIZE));
  }

  try {
    for (const chunk of chunks) {
      const messages = chunk.map((follower) => ({
        to: follower.token,
        title,
        body,
      }));

      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      });

      const result = await response.json();

      if (response.ok) {
        // Check for individual errors in the response
        if (result.data) {
          result.data.forEach((receipt, index) => {
            if (receipt.status === "error") {
              console.warn(
                `Failed to send notification to ${chunk[index].username}:`,
                receipt.message
              );
            }
          });
        }
      } else {
        throw new Error(result.message || "Failed to send notifications");
      }
    }
  } catch (error) {
    console.error("Error sending bulk notifications:", error);
    throw error;
  }
};
