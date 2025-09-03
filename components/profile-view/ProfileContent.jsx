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
  <View className="flex-row justify-between mt-3 bg-white rounded-2xl p-2 border-gray-100">
    <TouchableOpacity className="items-center flex-1">
      <Text className="text-xl font-bold text-gray-800">{counts.posts}</Text>
      <Text className="text-gray-600 text-sm">Posts</Text>
    </TouchableOpacity>

    <View className="h-full w-px bg-gray-200" />

    <TouchableOpacity
      onPress={() => router.push(`/followers/${userId}`)}
      className="items-center flex-1"
    >
      <Text className="text-xl font-bold text-gray-800">
        {counts.followers}
      </Text>
      <Text className="text-gray-600 text-sm">Followers</Text>
    </TouchableOpacity>

    <View className="h-full w-px bg-gray-200" />

    <TouchableOpacity
      onPress={() => router.push(`/following/${userId}`)}
      className="items-center flex-1"
    >
      <Text className="text-xl font-bold text-gray-800">
        {counts.following}
      </Text>
      <Text className="text-gray-600 text-sm">Following</Text>
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
        className="flex-1 py-2.5 rounded-xl border bg-gray-200 border-gray-200 items-center justify-center"
      >
        <Text className="font-semibold">Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleShare(userId, username)}
        className="flex-1 py-2.5 rounded-xl border bg-gray-200 border-gray-200 items-center justify-center"
      >
        <Text className="font-semibold">Share Profile</Text>
      </TouchableOpacity>
    </View>
  );
};
const ProfileHeader = ({ user, pickImage }) => (
  <View className="flex-row justify-between items-start">
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
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="text-sm text-gray-500 mb-1">@{user?.username}</Text>
        </View>

        <View className="flex-row mr-4">
          <TouchableOpacity
            onPress={() => router.push("/account-settings")}
            className="rounded-full"
          >
            <Image
              source={require("../../assets/home-icons/settings.png")}
              className="w-7 h-7"
            />
          </TouchableOpacity>
        </View>
      </View>

      {user?.unsafeMetadata?.bio && (
        <Text className="text-gray-700 mt-1 mb-2 text-sm">
          {user.unsafeMetadata.bio}
        </Text>
      )}
    </View>
  </View>
);
export const ProfileContentScreen = ({ setIsEditing }) => {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const [activeFilter, setActiveFilter] = useState("reviews");
  const [scrollY] = useState(new Animated.Value(0));

  const [counts, setCounts] = useState({
    posts: 0,
    followers: 0,
    following: 0,
  });
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchData = async () => {
    try {
      const [postsData, totalFollowersCount, totalFollowingCount] =
        await Promise.all([
          getTotalPostsCount(supabase, user.id),
          getTotalFollowersCount(supabase, user.id),
          getTotalFollowingCount(supabase, user.id),
        ]);

      setCounts({
        posts: postsData.reviewCount, // Changed from allPosts.all to postsData.reviewCount
        followers: totalFollowersCount,

        following: totalFollowingCount,
      });
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };
  const onRefresh = async () => {
    console.log("Refreshing profile data...");
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    setRefreshCount((prev) => prev + 1);
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
    const init = async () => {
      setLoading(true);
      if (user && supabase) {
        await fetchData();
      }
      setLoading(false);
    };
    init();
  }, [user, supabase]);

  if (loading) {
    return <ProfileContentSkeleton />;
  }

  // Create a single data array for FlatList to render
  const profileSections = [
    {
      id: "header",
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressViewOffset={50}
            colors={["#eab308"]}
            tintColor="#eab308"
          />
        }
      />
    </View>
  );
};
