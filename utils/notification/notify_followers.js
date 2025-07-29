import { getFollowersIdAndNotificationToken } from "@/lib/supabase/followActions";
import { sendBulkPushNotifications } from "../../lib/sendBulkPushNotifications";

export default async function notifyFollowers(supabase, user) {
  const followers = await getFollowersIdAndNotificationToken(supabase, user.id);

  // Filter out followers without tokens
  const followersWithTokens = followers.filter((f) => f.token);

  if (followersWithTokens.length === 0) {
    console.log("No followers with notification tokens found");
    return;
  }
  // Send all notifications in one batch
  await sendBulkPushNotifications(
    followersWithTokens,
    `New Post from ${user.fullName}`,
    `@${user.username} just posted something!`
  );

  return;
}
