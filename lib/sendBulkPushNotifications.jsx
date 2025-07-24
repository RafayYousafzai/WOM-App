export const sendBulkPushNotifications = async (followers, title, body) => {
  const validFollowers = followers.filter(
    (f) => f.token && typeof f.token === "string"
  );

  if (validFollowers.length === 0) {
    console.warn("No valid push tokens found among followers.");
    return;
  }

  try {
    for (const follower of validFollowers) {
      const payload = {
        to: follower.token,
        title,
        body,
      };

      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.warn(
          `Failed to send notification to ${follower.username}. Status: ${response.status}`
        );
      }
    }
  } catch (error) {
    console.error("Error sending bulk notifications:", error);
  }
};
