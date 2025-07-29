import { sendBulkPushNotifications } from "../../lib/sendBulkPushNotifications";

export default async function notifyPeoples(user, tags) {
  try {
    // Transform tags into the format expected by sendBulkPushNotifications
    const peopleWithTokens = tags
      .filter((tag) => tag.token) // Only include tags with tokens
      .map((tag) => ({
        token: tag.token,
        username: tag.username || tag.id, // For logging purposes
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
