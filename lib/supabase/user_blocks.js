export async function blockUser(supabase, currentUserId, userIdToBlock) {
  const { data, error } = await supabase.from("user_blocks").insert([
    {
      user_id: currentUserId,
      blocked_user_id: userIdToBlock,
    },
  ]);
  return { data, error };
}

export async function unblockUser(supabase, currentUserId, userIdToUnblock) {
  console.log("Attempting to unblock:", { currentUserId, userIdToUnblock });
  
  const { data, error, count } = await supabase
    .from("user_blocks")
    .delete()
    .eq("user_id", currentUserId)
    .eq("blocked_user_id", userIdToUnblock)
    .select();  // Add select to see what was deleted

  console.log("Unblock result:", { data, error, count });
  
  return { data, error, count };
}

export async function isUserBlocked(supabase, currentUserId, targetUserId) {
  const { data, error } = await supabase
    .from("user_blocks")
    .select("id")
    .eq("user_id", currentUserId)
    .eq("blocked_user_id", targetUserId)
    .maybeSingle();

  return { isBlocked: !!data, error };
}

export async function getBlockedUserIds(supabase, currentUserId) {
  if (!currentUserId) return [];

  const { data, error } = await supabase
    .from("user_blocks")
    .select("blocked_user_id")
    .eq("user_id", currentUserId);

  if (error) {
    console.error("Error fetching blocked users:", error.message);
    return [];
  }

  return data.map((entry) => entry.blocked_user_id);
}
