import React, { Component } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-xl font-bold text-red-600 mb-4">
            Something went wrong
          </Text>
          <Text className="text-gray-600 mb-4">
            {this.state.error?.message}
          </Text>
          <TouchableOpacity
            className="bg-blue-500 px-4 py-2 rounded"
            onPress={() => {
              this.setState({ hasError: false, error: null });
              router.replace("/home");
            }}
          >
            <Text className="text-white">Go to Home</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
