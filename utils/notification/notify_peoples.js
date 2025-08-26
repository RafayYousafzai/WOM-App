import { sendBulkPushNotifications } from "../../lib/sendBulkPushNotifications";

export default async function notifyPeoples(user, tags) {
  try {
    const peopleWithTokens = tags
      .filter((tag) => tag?.user_notifications_tokens?.token) // check nested token
      .map((tag) => ({
        token: tag.user_notifications_tokens.token, // correct path
        username: tag.username || tag.id, // fallback for logging
      }));

    await sendBulkPushNotifications(
      peopleWithTokens,
      `New Mention from ${user.fullName}`,
      `@${user.username} mentioned you in a new post!`
    );

    return true;
  } catch (error) {
    console.error("Error notifying people:", error);
    throw error;
  }
}
