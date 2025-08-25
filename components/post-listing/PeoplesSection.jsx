import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSupabase } from "@/context/supabaseContext";
import snakeCaseToSentence from "@/utils/snakeCaseToSentence";

export const PeoplesSection = ({ people = [] }) => {
  const [showAll, setShowAll] = useState(false);
  const [loadingUser, setLoadingUser] = useState(null); // store username being loaded
  const router = useRouter();
  const { supabase } = useSupabase();

  const toggle = () => setShowAll((prev) => !prev);
  const displayedPeople = showAll ? people : people.slice(0, 3);

  const handlePress = async (username) => {
    try {
      setLoadingUser(username);
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single();

      if (error || !data) {
        Alert.alert(
          "User not found",
          `Could not find profile for @${username}`
        );
        return;
      }

      router.push(`/profile/${data.id}`);
    } catch (err) {
      console.error("Error fetching user ID:", err);
    } finally {
      setLoadingUser(null);
    }
  };

  return (
    <View className="px-1 pt-2">
      <View className="flex-row flex-wrap">
        {displayedPeople.map((username, index) => (
          <TouchableOpacity
            key={`${username}-${index}`}
            className="flex-row items-center justify-center px-2 py-1 rounded-full bg-gray-100 mr-2 mb-2"
            onPress={() => handlePress(username)}
            disabled={loadingUser === username}
          >
            {loadingUser === username ? (
              <ActivityIndicator size="small" color="#f59e0b" />
            ) : (
              <Text className="text-gray-700 text-xs">
                @{snakeCaseToSentence(username)}
              </Text>
            )}
          </TouchableOpacity>
        ))}
        {people.length > 3 && (
          <TouchableOpacity
            onPress={toggle}
            className="flex-row items-center justify-center px-2 py-1 rounded-full bg-gray-100 mr-2 mb-2"
          >
            <Text className="text-gray-700 text-xs">
              {showAll ? "Show less" : `+${people.length - 3} more`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
