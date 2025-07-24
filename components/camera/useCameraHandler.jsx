import { useRef, useState, useCallback } from "react";
import { useCameraPermissions } from "expo-camera";

export const useCameraHandler = () => {
  const cameraRef = useRef(null);
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();

  const toggleFacing = useCallback(() => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }, []);

  const takePicture = useCallback(async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        return photo ? [photo.uri] : []; // Always return an array of URIs
      } catch (error) {
        console.error("Failed to take picture:", error);
        return [];
      }
    }
    return [];
  }, [cameraRef]);

  return {
    cameraRef,
    facing,
    permission,
    requestPermission,
    toggleFacing,
    takePicture,
  };
};
