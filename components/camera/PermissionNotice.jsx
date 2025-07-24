import React from "react";
import { View, Text, Button } from "react-native";
import { styles } from "./styles";

const PermissionNotice = ({ requestPermission }) => (
  <View style={styles.permissionContainer}>
    <Text style={styles.permissionText}>
      We need your permission to use the camera.
    </Text>
    <Button onPress={requestPermission} title="Grant Permission" />
  </View>
);

export default PermissionNotice;
