// CommentUtils.tsx
import React from "react";
import { View, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const renderStars = (
  rating: number,
  onPress?: (star: number) => void
) => {
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onPress && onPress(star)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={
              rating >= star
                ? "star"
                : rating >= star - 0.5
                ? "star-half-full"
                : "star-outline"
            }
            size={18}
            color="#FFB800"
            style={{ marginRight: 2 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export const getMockComments = () => [
  {
    id: "1",
    user: {
      id: "user1",
      username: "foodlover",
      avatar: "https://randomuser.me/api/portraits/women/43.jpg",
    },
    text: "The pasta here is absolutely amazing! I highly recommend trying their carbonara.",
    timeAgo: "2h ago",
    rating: 4.5,
    hasVisited: true,
    likes: 12,
    isLiked: false,
    replies: [
      {
        id: "reply1",
        user: {
          id: "user3",
          username: "pastaexpert",
          avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        },
        text: "I agree! Their homemade pasta is the best in town.",
        timeAgo: "1h ago",
      },
    ],
  },
  {
    id: "2",
    user: {
      id: "user2",
      username: "culinaryadventurer",
      avatar: "https://randomuser.me/api/portraits/women/63.jpg",
    },
    text: "The ambiance was great but I found the service to be a bit slow during peak hours.",
    timeAgo: "5h ago",
    rating: 3.5,
    hasVisited: true,
    likes: 8,
    isLiked: true,
    replies: [],
  },
  {
    id: "3",
    user: {
      id: "user4",
      username: "foodcritic",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    },
    text: "Is the parking situation as bad as people say? Planning to visit this weekend.",
    timeAgo: "1d ago",
    hasVisited: false,
    likes: 3,
    isLiked: false,
    replies: [
      {
        id: "reply2",
        user: {
          id: "user1",
          username: "foodlover",
          avatar: "https://randomuser.me/api/portraits/women/43.jpg",
        },
        text: "There's a parking garage two blocks away that's not too expensive!",
        timeAgo: "20h ago",
      },
    ],
  },
];
