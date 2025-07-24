import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    width: "100%",
    borderRadius: 40,
    overflow: "hidden",
    height: 600,
    marginBottom: 60,
  },
  // Permission Notice
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: {
    textAlign: "center",
    color: "white",
    marginBottom: 20,
    fontSize: 16,
  },
  // Camera UI & Buttons
  topControlsContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 1,
  },
  controlButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButton: {
    backgroundColor: "#636363",
  },
  nextButton: {
    backgroundColor: "#f39f1e",
  },
  controlButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  bottomControlsContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  shutterButton: {
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
  },
  // Image Preview
  previewContainer: {
    position: "absolute",
    bottom: 150,
    left: 0,
    width: "100%",
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  imagesList: {
    flex: 1,
    backgroundColor: "rgba(205, 205, 205, 0.2)",
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
  thumbnailContainer: {
    marginRight: 10,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 15,
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    height: 28,
    width: 28,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  expandButton: {
    backgroundColor: "white",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  expandButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});
