export async function sendPushNotification(
  expoPushToken,
  title = "Hey",
  message = "Test"
) {
  if (!expoPushToken) {
    console.warn("No Expo push token provided, skipping notification.");
    return;
  }

  const messagePayload = {
    to: expoPushToken,
    sound: "default",
    title,
    body: message,
    data: { someData: "optional extra data" },
  };

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messagePayload),
  });

  console.log("Notification sent:", title, message);

  const data = await response.json();
}
