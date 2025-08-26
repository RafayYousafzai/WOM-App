"use client";

import { useUpload } from "@/context/upload-context";
import { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  Dimensions,
  StyleSheet,
  SafeAreaView,
} from "react-native";

export const LoadingPopover = () => {
  const { uploadState } = useUpload();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (uploadState.isUploading || uploadState.error) {
      // Slide down and fade in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!uploadState.isUploading && !uploadState.error) {
      // Slide up and fade out
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: -100,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [uploadState.isUploading, uploadState.error]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: uploadState.uploadProgress,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [uploadState.uploadProgress]);

  if (
    !uploadState.isUploading &&
    !uploadState.error &&
    uploadState.uploadProgress === 0
  ) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Status indicator */}
          <View style={styles.statusContainer}>
            {uploadState.error ? (
              <View style={[styles.statusDot, styles.errorDot]} />
            ) : (
              <View style={[styles.statusDot, styles.loadingDot]} />
            )}

            <Text style={styles.message}>
              {uploadState.error ||
                uploadState.uploadMessage ||
                "Processing..."}
            </Text>
          </View>

          {/* Progress bar */}
          {uploadState.isUploading && (
            <View style={styles.progressContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                      extrapolate: "clamp",
                    }),
                  },
                ]}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    backdropFilter: "blur(10px)",
  },
  safeArea: {
    backgroundColor: "transparent",
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  loadingDot: {
    backgroundColor: "#3B82F6",
  },
  errorDot: {
    backgroundColor: "#EF4444",
  },
  message: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  progressContainer: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 1,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 1,
  },
});
