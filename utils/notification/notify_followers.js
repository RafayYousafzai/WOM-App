import { getFollowersIdAndNotificationToken } from "@/lib/supabase/followActions";
import { sendBulkPushNotifications } from "../../lib/sendBulkPushNotifications";

export default async function notifyFollowers(supabase, user) {
  const followers = await getFollowersIdAndNotificationToken(supabase, user.id);

  // Example notification send (pseudo)
  for (const follower of followers) {
    if (follower.token) {
      await sendBulkPushNotifications(
        followers,
        `New Post from ${user.fullName}`,
        `@${user.username} just posted something!`
      );
    }
  }

  return;
}
