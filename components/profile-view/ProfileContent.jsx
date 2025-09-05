"use client";

import { Feather } from "@expo/vector-icons";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
  RefreshControl,
  FlatList,
} from "react-native";
import { useState, useMemo, useEffect } from "react";
import { useUser } from "@clerk/clerk-expo";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import ProfileFilters from "./ProfileFilters";
import { getTotalPostsCount } from "@/lib/supabase/userActions";
import {
  getTotalFollowersCount,
  getTotalFollowingCount,
} from "@/lib/supabase/followActions";
import { useSupabase } from "@/context/supabaseContext";
import { ProfileContentSkeleton } from "./ProfileSkeleton";
import { Share } from "react-native";

const ProfileStats = ({ counts, userId }) => (
  <View className="flex-row justify-around mt-4 p-6">
    <TouchableOpacity className="items-center flex-1">
      <Text className="text-2xl font-bold text-slate-800 mb-1">
        {counts.posts}
      </Text>
      <Text className="text-slate-500 text-base font-medium">Posts</Text>
    </TouchableOpacity>

    <View className="h-12 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-4" />

    <TouchableOpacity
      onPress={() => router.push(`/followers/${userId}`)}
      className="items-center flex-1  "
    >
      <Text className="text-2xl font-bold text-slate-800 mb-1">
        {counts.followers}
      </Text>
      <Text className="text-slate-500 text-base font-medium">Followers</Text>
    </TouchableOpacity>

    <View className="h-12 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-4" />

    <TouchableOpacity
      onPress={() => router.push(`/following/${userId}`)}
      className="items-center flex-1"
    >
      <Text className="text-2xl font-bold text-slate-800 mb-1">
        {counts.following}
      </Text>
      <Text className="text-slate-500 text-base font-medium">Following</Text>
    </TouchableOpacity>
  </View>
);

const ProfileActions = ({ setIsEditing, userId, username }) => {
  const handleShare = async () => {
    try {
      const universalUrl = `https://wordofmouth.vercel.app/profile/${userId}`;
      const shareMessage = `Check out ${
        username || "this user's"
      } profile on Word of Mouth!\n${universalUrl}`;

      const shareOptions = await Share.share({
        title: "Share this profile",
        message: shareMessage, // Android
        url: universalUrl, // iOS
      });
      await Share.open(shareOptions);
    } catch (error) {
      console.error("Error sharing profile:", error.message);
    }
  };

  return (
    <View className="flex-row mt-4 gap-2">
      <TouchableOpacity
        onPress={() => setIsEditing(true)}
        className="flex-1 py-2.5 rounded-full border bg-gray-100 border-gray-100 items-center justify-center"
      >
        <Text className="">Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleShare(userId, username)}
        className="flex-1 py-2.5 rounded-full border bg-gray-100 border-gray-100 items-center justify-center"
      >
        <Text className="">Share Profile</Text>
      </TouchableOpacity>
    </View>
  );
};
const ProfileHeader = ({ user, pickImage }) => {
  const unsafeMetadata = user?.unsafeMetadata;
  const username = user?.username;
  const firstName = user?.firstName;
  const lastName = user?.lastName;
  const bio = unsafeMetadata?.bio;

  return (
    <View className="flex-row items-start">
      <TouchableOpacity onPress={pickImage} className="relative">
        <View className="w-24 h-24 rounded-full border-4 border-white overflow-hidden">
          {user?.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} className="w-full h-full" />
          ) : (
            <View className="w-full h-full bg-gray-100 items-center justify-center">
              <Feather name="user" size={40} color="#f39f1e" />
            </View>
          )}
        </View>
        <View className="absolute bottom-0 right-0 bg-[#f39f1e] p-1.5 rounded-full">
          <Feather name="camera" size={14} color="white" />
        </View>
      </TouchableOpacity>

      <View className="flex-1 ml-4">
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-2xl font-bold text-gray-800">
              {firstName} {lastName}
            </Text>
            <Text className="text-sm text-gray-500 ">@{username}</Text>
          </View>

          <View className="flex-row mr-4">
            <TouchableOpacity
              onPress={() => router.push("/account-settings")}
              className="w-12 h-12 bg-gray-100 rounded-2xl items-center justify-center shadow-sm border border-gray-200 hover:bg-gray-200 transition-colors"
              activeOpacity={0.7}
            >
              <Image
                source={require("../../assets/home-icons/settings.png")}
                className="w-6 h-6 opacity-70"
                style={{ tintColor: "#6B7280" }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {bio && <Text className="text-gray-700 text-sm">{bio}</Text>}
      </View>
    </View>
  );
};
export const ProfileContentScreen = ({
  setIsEditing,
  refreshing,
  setRefreshing,
  setRefreshCount,
  refreshCount,
}) => {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const [activeFilter, setActiveFilter] = useState("reviews");
  const [scrollY] = useState(new Animated.Value(0));

  const [counts, setCounts] = useState({
    posts: 0,
    followers: 0,
    following: 0,
  });
  const [tags, setTags] = useState([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [postsData, totalFollowersCount, totalFollowingCount] =
        await Promise.all([
          getTotalPostsCount(supabase, user.id),
          getTotalFollowersCount(supabase, user.id),
          getTotalFollowingCount(supabase, user.id),
        ]);

      const { data, error } = await supabase
        .from("users")
        .select(
          `
          id,
          username,
          full_name,
          posts (
            post_tags (
              tags (
                id,
                name,
                type
              )
            )
          )
          `
        )
        .eq("id", user.id)
        .single();

      if (error) throw error;

      // Flatten nested structure: user -> posts -> post_tags -> tags
      const tags =
        data?.posts?.flatMap((post) =>
          post.post_tags?.map((pt) => pt.tags).filter(Boolean)
        ) || [];

      // Remove duplicates by `id`
      const uniqueTags = Array.from(
        new Map(tags.map((tag) => [tag.id, tag])).values()
      );

      setCounts({
        posts: postsData.reviewCount, // Changed from allPosts.all to postsData.reviewCount
        followers: totalFollowersCount,

        following: totalFollowingCount,
      });

      setTags(uniqueTags);
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  const pickImage = async () => {
    if (!user) {
      Alert.alert("Error", "You are signed out. Please log in again.");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Update Your Look!",
        "Please allow photo access so you can change your profile picture."
      );

      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets?.length) {
        const asset = result.assets[0];
        const base64Image = `data:image/jpeg;base64,${asset.base64}`;
        await user?.setProfileImage({ file: base64Image });
        await user?.reload();
        Alert.alert("Success", "Profile picture updated!");
      }
    } catch (err) {
      console.error("Error:", err);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleFilterChange = (value) => {
    setActiveFilter(value);
    setShowFilterDropdown(false);
  };

  useEffect(() => {
    const scrollListener = scrollY.addListener(() => {
      if (showFilterDropdown) {
        setShowFilterDropdown(false);
      }
    });

    return () => scrollY.removeListener(scrollListener);
  }, [showFilterDropdown]);

  useEffect(() => {
    console.log("Refresh count changed:", refreshCount);

    const init = async () => {
      if (user && supabase) {
        setRefreshing(true);
        setLoading(true);
        await fetchData();
        setLoading(false);
        setRefreshing(false);
      }
    };
    init();
  }, [user, supabase, refreshCount]);

  const profileSections = [
    {
      id: "header",
      // ✅ properly closed
      component: (
        <View className="pt-6 pb-4 px-5 bg-white">
          <ProfileHeader user={user} pickImage={pickImage} />
          <ProfileStats counts={counts} userId={user.id} />

          <ProfileActions
            userId={user.id} // <-- Pass the user ID here
            username={user.username}
            setIsEditing={setIsEditing}
          />
        </View>
      ),
    },
    {
      id: "filters",
      component: (
        <View style={{ minHeight: 200 }}>
          <ProfileFilters
            activeFilter={activeFilter}
            showFilterDropdown={showFilterDropdown}
            setShowFilterDropdown={setShowFilterDropdown}
            handleFilterChange={handleFilterChange}
            setActiveFilter={setActiveFilter}
            refreshCount={refreshCount}
            setRefreshCount={setRefreshCount}
            tags={tags}
            user={user}
            loading={loading}
          />
        </View>
      ),
    },
  ];

  return (
    <View className="flex-1">
      <FlatList
        data={profileSections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => item.component}
        showsVerticalScrollIndicator={false}
        className="bg-white"
      />
    </View>
  );
};
