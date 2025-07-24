import { useEffect, useState, useCallback } from "react"; // Corrected: React Hooks imported from 'react'
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native"; // React Native components imported from 'react-native'
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSearch } from "@/context/searchContext";
import { useSupabase } from "@/context/supabaseContext";
import { getTotalFollowersCount } from "@/lib/supabase/followActions";
import { useUser } from "@clerk/clerk-expo";
import { getBlockedUserIds } from "@/lib/supabase/user_blocks";

const UserItem = ({ user }) => {
  const { supabase } = useSupabase();

  const [followers, setFollowers] = useState(0);

  const handlePress = () => {
    router.push(`(public)/profile/${user.id}`);
  };

  useEffect(() => {
    const getFollowers = async () => {
      const totalFollowersCount = await getTotalFollowersCount(
        supabase,
        user.id
      );

      setFollowers(totalFollowersCount);
    };

    getFollowers();
  }, [user, supabase]);

  return (
    <TouchableOpacity
      className="flex-row items-center py-3 px-4 border-b border-gray-100"
      onPress={handlePress}
    >
      <View className="w-12 h-12 rounded-full bg-gray-200 mr-3 overflow-hidden">
        <Image source={{ uri: user.image_url }} className="w-full h-full" />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text className="text-base font-medium">
            {user.first_name} {user.last_name}
          </Text>
        </View>
        <Text className="text-gray-500 text-sm">{user.username}</Text>
        <Text className="text-gray-500 text-xs mt-1">
          {followers ?? 0} followers
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
    </TouchableOpacity>
  );
};

const UsersList = ({ limit = 20 }) => {
  const { supabase } = useSupabase();
  const { searchQuery } = useSearch();
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const currentUserId = user?.id;
      const blockedUserIds =
        (await getBlockedUserIds(supabase, currentUserId)) || [];

      console.log("UsersList - Blocked User IDs:", blockedUserIds);

      let query = supabase
        .from("users")
        .select("id, first_name, last_name, username, image_url")
        .limit(limit);

      // --- Start: Apply User Blocking Filter ---
      if (blockedUserIds.length > 0) {
        if (blockedUserIds.length === 1) {
          const blockedId = blockedUserIds[0];
          query = query.not("id", "eq", blockedId);
        } else {
          query = query.not("id", "in", `(${blockedUserIds.join(",")})`);
        }
      }
      // --- End: Apply User Blocking Filter ---

      if (searchQuery) {
        query = query.or(
          `first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching users:", error.message);
      } else {
        setUsers(data || []);
      }

      setLoading(false);
    } catch (error) {
      console.error("Fetch users error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, user?.id, supabase]);

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <UserItem user={item} />}
      ListFooterComponent={
        loading && (
          <View className="flex justify-center items-center h-full">
            <ActivityIndicator size="large" color="#f39f1e" />
          </View>
        )
      }
      contentContainerStyle={{
        flex: 1,
      }}
    />
  );
};

export default UsersList;
