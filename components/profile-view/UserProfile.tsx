"use client";

import type React from "react";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Button } from "../ui";

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
  userData: {
    id: string;
    username: string;
    name: string;
    avatar: string;
    bio?: string;
    postsCount: number;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
  };
  posts?: any[];
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  visible,
  onClose,
  userData,
  posts = [],
}) => {
  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(userData.isFollowing);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // Here you would call your API to follow/unfollow the user
  };

  const { width } = Dimensions.get("window");
  const numColumns = 3;
  const tileSize = width / numColumns;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView
        className="flex-1"
        style={{
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        }}
      >
        <View className="flex-row items-center p-4 border-b border-gray-200">
          <TouchableOpacity onPress={onClose} className="mr-4">
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold">{userData.username}</Text>
          <TouchableOpacity className="ml-auto">
            <Feather name="more-horizontal" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1">
          <View className="p-5">
            <View className="flex-row justify-between items-center">
              <View className="flex-row flex">
                <View className="relative">
                  <Image
                    source={{ uri: userData.avatar }}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                  />
                </View>
                <View className="mt-2 ml-2">
                  <Text className="text-2xl font-semibold text-gray-800">
                    {userData.name}
                  </Text>
                  <Text className="text-xs font-semibold text-gray-500">
                    @{userData.username}
                  </Text>
                  <View className="flex-row mt-1 gap-1">
                    <Button
                      //   variant={isFollowing ? "outline" : "default"}
                      size="xs"
                      action={isFollowing ? "default" : "primary"}
                      onPress={handleFollow}
                      className={`rounded-full px-3 ${
                        isFollowing ? "border-gray-300" : ""
                      }`}
                    >
                      <Text
                        className={isFollowing ? "text-gray-700" : "text-white"}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </Text>
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      className="rounded-full border-gray-300 px-3"
                    >
                      <Text className="text-gray-700">Message</Text>
                    </Button>
                  </View>
                </View>
              </View>
            </View>

            {userData.bio && (
              <Text className="text-gray-700 mt-4 mb-6">{userData.bio}</Text>
            )}

            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-xl font-bold text-gray-800">
                  {userData.postsCount}
                </Text>
                <Text className="text-gray-600">Posts</Text>
              </View>
              <View className="items-center">
                <Text className="text-xl font-bold text-gray-800">
                  {userData.followersCount}
                </Text>
                <Text className="text-gray-600">Followers</Text>
              </View>
              <View className="items-center">
                <Text className="text-xl font-bold text-gray-800">
                  {userData.followingCount}
                </Text>
                <Text className="text-gray-600">Following</Text>
              </View>
            </View>
          </View>

          <View className="border-t border-gray-200">
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setActiveTab("posts")}
                className={`flex-1 py-3 items-center ${
                  activeTab === "posts" ? "border-b-2 border-[#f39f1e]" : ""
                }`}
              >
                <Feather
                  name="grid"
                  size={22}
                  color={activeTab === "posts" ? "#f39f1e" : "#888"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab("reviews")}
                className={`flex-1 py-3 items-center ${
                  activeTab === "reviews" ? "border-b-2 border-[#f39f1e]" : ""
                }`}
              >
                <Feather
                  name="star"
                  size={22}
                  color={activeTab === "reviews" ? "#f39f1e" : "#888"}
                />
              </TouchableOpacity>
            </View>

            {activeTab === "posts" && (
              <View className="flex-row flex-wrap">
                {posts.length > 0 ? (
                  posts.map((post, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{ width: tileSize, height: tileSize }}
                      className="p-0.5"
                    >
                      <Image
                        source={post.images[0]}
                        style={{ width: "100%", height: "100%" }}
                        className="bg-gray-200"
                      />
                    </TouchableOpacity>
                  ))
                ) : (
                  <View className="p-6 items-center justify-center w-full">
                    <Feather name="camera" size={40} color="#ccc" />
                    <Text className="text-gray-500 mt-2 text-center">
                      No posts yet
                    </Text>
                  </View>
                )}
              </View>
            )}

            {activeTab === "reviews" && (
              <View className="p-6">
                {posts.length > 0 ? (
                  posts.map((post, index) => (
                    <View
                      key={index}
                      className="bg-white rounded-xl p-4 shadow-sm mb-4"
                    >
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="font-bold text-gray-800">
                          {post.restaurantName}
                        </Text>
                        <View className="flex-row">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Feather
                              key={star}
                              name="star"
                              size={16}
                              color={star <= post.rating ? "#f39f1e" : "#ccc"}
                            />
                          ))}
                        </View>
                      </View>
                      <Text className="text-gray-700 mb-2">
                        {post.description}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        {post.postTimeAgo}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View className="items-center justify-center">
                    <Feather name="star" size={40} color="#ccc" />
                    <Text className="text-gray-500 mt-2 text-center">
                      No reviews yet
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
