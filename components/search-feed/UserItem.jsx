import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSearch } from "@/context/searchContext";
import { useSupabase } from "@/context/supabaseContext";
import { getTotalFollowersCount } from "@/lib/supabase/followActions";
import { getBlockedUserIds } from "@/lib/supabase/user_blocks";
import { useUser } from "@clerk/clerk-expo";

const UsersList = ({ limit = 20 }) => {
  const { supabase } = useSupabase();
  const { searchQuery } = useSearch();
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState({});

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const currentUserId = currentUser?.id;
      const blockedUserIds =
        (await getBlockedUserIds(supabase, currentUserId)) || [];

      let query = supabase
        .from("users")
        .select("id, first_name, last_name, username, image_url")
        .limit(limit);

      if (blockedUserIds.length > 0) {
        query = query.not("id", "in", `(${blockedUserIds.join(",")})`);
      }

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
  }, [searchQuery, currentUser?.id, supabase]);

  useEffect(() => {
    const getFollowers = async () => {
      const newFollowers = {};
      for (const user of users) {
        const totalFollowersCount = await getTotalFollowersCount(
          supabase,
          user.id
        );
        newFollowers[user.id] = totalFollowersCount;
      }
      setFollowers(newFollowers);
    };

    if (users.length > 0) {
      getFollowers();
    }
  }, [users, supabase]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center h-screen">
        <ActivityIndicator size="large" color="#fb923c" />
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-slate-50"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View className="px-4 py-6 mt-3 ">
        <View className="mb-8">
          <Text className="text-5xl font-bold text-gray-900 mb-2">Users</Text>
        </View>

        <View className="bg-white rounded-2xl shadow-md p-4">
          {users.map((user, index) => (
            <TouchableOpacity
              key={`${user.id}-${index}`}
              className=" mb-8 "
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}
              onPress={() => router.push(`/(public)/profile/${user.id}`)}
            >
              <View className="overflow-hidden rounded-2xl">
                <View className="flex-row">
                  <View
                    style={{ width: 60, height: 60 }}
                    className="relative flex"
                  >
                    <Image
                      source={{
                        uri:
                          user.image_url || "https://via.placeholder.com/150",
                      }}
                      style={{
                        width: "100%",
                        flex: 1,
                        borderRadius: "100%",
                      }}
                      resizeMode="cover"
                    />
                  </View>

                  <View className="flex-1 px-3 justify-between">
                    <View>
                      <Text
                        className="text-gray-800 text-lg font-semibold capitalize"
                        numberOfLines={1}
                      >
                        {user.first_name} {user.last_name}
                      </Text>
                      <Text className="text-gray-500 text-sm" numberOfLines={1}>
                        @{user.username}
                      </Text>
                    </View>

                    <View className="flex-row items-center mt-2">
                      <Ionicons name="people" size={14} color="#e73c3e" />
                      <Text className="text-pink-700 ml-1 text-xs font-semibold">
                        {followers[user.id] ?? 0} followers
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {(!users || users.length === 0) && !loading && (
          <View className="items-center py-16">
            <View className="bg-white rounded-2xl p-8 shadow-lg items-center">
              <View className="bg-orange-100 rounded-full p-6 mb-6">
                <Ionicons name="people" size={48} color="#ffd100" />
              </View>
              <Text className="text-gray-900 text-2xl font-bold mb-2">
                No users found
              </Text>
              <Text className="text-gray-600 text-center text-base leading-relaxed max-w-xs">
                We couldn't find any users matching your search.
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default UsersList;
