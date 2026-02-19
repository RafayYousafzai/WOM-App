import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Heatmap,
  Circle,
} from "react-native-maps";
import Slider from "@react-native-community/slider";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useDishesHandler } from "@/hooks/useSearch";
import { useFocusEffect, useRouter } from "expo-router";
import { useGlobal } from "@/context/globalContext";

// --- Constants ---
const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const safeHeatmapRadius = Platform.OS === "android" ? 50 : 300;
const NEARBY_THRESHOLD_KM = 10; // 10km radius for "nearby" posts
const MAX_HEATMAP_POINTS_ANDROID = 1000;
const MIN_HEATMAP_WEIGHT_ANDROID = 0.5;
const MAX_HEATMAP_WEIGHT_ANDROID = 5;

// Radius selector constants
const MIN_RADIUS = 1; // 1km minimum
const MAX_RADIUS = 5000; // 50km maximum
const DEFAULT_RADIUS = 10; // 10km default

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

const clampNumber = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

// --- Main Component ---
const FoodMapView = () => {
  const { setRenderPosts } = useGlobal();
  const mapRef = useRef(null);
  const router = useRouter();
  const { posts, loading, error } = useDishesHandler();

  const [userLocation, setUserLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: null,
    longitude: null,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  const [selectedRadius, setSelectedRadius] = useState(DEFAULT_RADIUS);
  const [showRadiusSelector, setShowRadiusSelector] = useState(false);

  // Effect to get user's current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location was denied");
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        const newUserLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setUserLocation(newUserLocation);
        setRegion((prev) => ({
          ...prev,
          ...newUserLocation,
        }));
      } catch (e) {
        console.error("Could not fetch location:", e);
      }
    })();
  }, []);

  // Memoized and FILTERED data to prevent crashes from bad data
  const mapPoints = useMemo(() => {
    if (!posts || posts.length === 0 || !userLocation) return [];

    return posts
      .filter(
        (post) =>
          post &&
          post.restaurants &&
          typeof post.restaurants.latitude === "number" &&
          typeof post.restaurants.longitude === "number"
      )
      .map((post) => ({
        id: post.id,
        location: {
          latitude: post.restaurants.latitude,
          longitude: post.restaurants.longitude,
        },
        rating: post.restaurants.rating,
        review: post.review,
        user: post.users?.full_name || "Unknown User",
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          post.restaurants.latitude,
          post.restaurants.longitude
        ),
      }))
      .filter((post) => post.distance <= selectedRadius); // Filter by selected radius
  }, [posts, userLocation, selectedRadius]);

  // Clustering logic
  const clusterGroups = useMemo(() => {
    if (!mapPoints || mapPoints.length === 0) return [];

    const clusters = new Map();
    const precision = 4; // Adjust precision to control cluster sensitivity

    mapPoints.forEach((point) => {
      if (!point.location) return;

      const lat = point.location.latitude.toFixed(precision);
      const lng = point.location.longitude.toFixed(precision);
      const key = `${lat}_${lng}`;

      if (!clusters.has(key)) {
        clusters.set(key, {
          location: point.location,
          posts: [point],
          count: 1,
        });
      } else {
        const cluster = clusters.get(key);
        cluster.posts.push(point);
        cluster.count += 1;
      }
    });

    return Array.from(clusters.values());
  }, [mapPoints]);

  // Heatmap data
  const heatmapData = useMemo(() => {
    const basePoints = mapPoints.map((point) => ({
      latitude: point.location.latitude,
      longitude: point.location.longitude,
      weight:
        Platform.OS === "android"
          ? clampNumber(
              Number.isFinite(point.rating) ? point.rating : 1,
              MIN_HEATMAP_WEIGHT_ANDROID,
              MAX_HEATMAP_WEIGHT_ANDROID
            )
          : point.rating || 1,
    }));

    if (Platform.OS === "android") {
      return basePoints.slice(0, MAX_HEATMAP_POINTS_ANDROID);
    }

    return basePoints;
  }, [mapPoints]);

  // Effect to automatically center the map based on the requirements
  useEffect(() => {
    if (loading || !userLocation || mapPoints.length === 0) return;

    // Check for posts near user's location
    const nearbyPosts = mapPoints.filter((point) => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        point.location.latitude,
        point.location.longitude
      );
      return distance <= NEARBY_THRESHOLD_KM;
    });

    if (nearbyPosts.length > 0) {
      // Center on user's location if there are nearby posts
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            ...userLocation,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          },
          1000
        );
      }
    } else {
      // Find the area with the highest concentration of posts
      if (clusterGroups.length === 0) return;

      let highestDensityCluster = clusterGroups[0];
      for (let i = 1; i < clusterGroups.length; i++) {
        if (clusterGroups[i].count > highestDensityCluster.count) {
          highestDensityCluster = clusterGroups[i];
        }
      }

      // Center on the highest density area
      if (mapRef.current && highestDensityCluster) {
        mapRef.current.animateToRegion(
          {
            ...highestDensityCluster.location,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          },
          1000
        );
      }
    }
  }, [loading, userLocation, mapPoints, clusterGroups]);

  const goToCurrentLocation = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...userLocation,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        },
        1000
      );
    } else {
      alert(
        "User location not available yet. Please wait or check permissions."
      );
    }
  }, [userLocation]);

  const handleRadiusChange = useCallback((radius) => {
    setSelectedRadius(radius);
  }, []);

  const toggleRadiusSelector = useCallback(() => {
    setShowRadiusSelector(!showRadiusSelector);
  }, [showRadiusSelector]);

  const handleClusterPress = useCallback(
    (cluster) => {
      const postIdsInCluster = new Set(cluster.posts.map((p) => p.id));
      const fullPostsInCluster = posts.filter((p) =>
        postIdsInCluster.has(p.id)
      );

      const normalizedPosts = fullPostsInCluster.map((p) => {
        const images =
          p.post_dishes
            ?.flatMap((dish) => dish.image_urls || [])
            .filter((url) => url) || [];

        return {
          ...p,
          images,
          dishes: p.post_dishes || [],
          isLiked: false,
          user: p.users
            ? {
                id: p.users.id,
                name: p.users.full_name || "Unknown User",
                first_name: p.users.full_name?.split(" ")[0] || "Unknown",
                last_name:
                  p.users.full_name?.split(" ").slice(1).join(" ") || "",
                image_url: p.users.image_url ?? null,
              }
            : null,
          restaurant: p.restaurants,
        };
      });

      setRenderPosts({
        posts: normalizedPosts,
        loading: false,
        initialScrollIndex: 0,
      });

      router.push("/posts");
    },
    [router, posts, setRenderPosts]
  );

  if (loading || !region.latitude || !region.longitude) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#fb923c" />
        <Text style={styles.loadingText}>Finding delicious food spots...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Could not load map data.</Text>
        <Text style={styles.errorSubText}>{error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onRegionChangeComplete={(region) => setRegion(region)}
      >
        {/* Radius Circle */}
        {userLocation && (
          <Circle
            center={userLocation}
            radius={selectedRadius * 1000} // Convert km to meters
            strokeColor="rgba(251, 146, 60, 0.8)"
            strokeWidth={2}
            fillColor="rgba(251, 146, 60, 0.1)"
          />
        )}

        {heatmapData.length > 0 && (
          <Heatmap
            points={heatmapData}
            radius={safeHeatmapRadius}
            opacity={Platform.OS === "android" ? 0.8 : 3}
            gradient={{
              colors: [
                "rgba(0, 255, 255, 0)", // Transparent cyan (low density)
                "rgba(0, 255, 255, 0.6)", // Light cyan
                "rgba(0, 255, 0, 0.8)", // Green
                "rgba(255, 255, 0, 0.9)", // Yellow
                "rgba(255, 165, 0, 1)", // Orange
                "rgba(255, 0, 0, 1)", // Red (high density)
              ],
              startPoints: [0.0, 0.2, 0.4, 0.6, 0.8, 1.0],
              colorMapSize: 256,
            }}
          />
        )}

        {clusterGroups.map((cluster) => (
          <Marker
            key={`${cluster.location.latitude}_${cluster.location.longitude}`}
            coordinate={cluster.location}
            onPress={() => handleClusterPress(cluster)}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View
              style={[
                styles.markerContainer,
                {
                  width: 36 + cluster.count * 4,
                  height: 36 + cluster.count * 4,
                  borderRadius: (36 + cluster.count * 4) / 2,
                },
              ]}
            >
              <Text style={styles.markerText}>{cluster.count}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Radius Control Button */}
      <TouchableOpacity
        style={styles.radiusButton}
        onPress={toggleRadiusSelector}
      >
        <Ionicons name="resize-outline" size={24} color="white" />
      </TouchableOpacity>

      {/* Radius Selector Panel */}
      {showRadiusSelector && (
        <View style={styles.radiusPanel}>
          <View style={styles.radiusPanelHeader}>
            <Text style={styles.radiusTitle}>Search Radius</Text>
            <TouchableOpacity onPress={toggleRadiusSelector}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.radiusSliderContainer}>
            <Text style={styles.radiusValue}>{selectedRadius} km</Text>
            <Slider
              style={styles.radiusSlider}
              minimumValue={MIN_RADIUS}
              maximumValue={MAX_RADIUS}
              value={selectedRadius}
              onValueChange={handleRadiusChange}
              step={1}
              minimumTrackTintColor="#fb923c"
              maximumTrackTintColor="#e5e7eb"
              thumbStyle={styles.sliderThumb}
              trackStyle={styles.sliderTrack}
            />
            <View style={styles.radiusLabels}>
              <Text style={styles.radiusLabel}>{MIN_RADIUS} km</Text>
              <Text style={styles.radiusLabel}>{MAX_RADIUS} km</Text>
            </View>
          </View>

          <Text style={styles.radiusDescription}>
            Showing {mapPoints.length}{" "}
            {mapPoints.length === 1 ? "restaurant" : "restaurants"} within{" "}
            {selectedRadius} km
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.locationButton}
        onPress={goToCurrentLocation}
      >
        <Ionicons name="navigate" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6c757d",
  },
  errorText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc3545",
    textAlign: "center",
    marginTop: 10,
  },
  errorSubText: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    marginTop: 5,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(251, 146, 60, 0.9)",
    borderColor: "rgba(255, 255, 255, 0.7)",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  locationButton: {
    position: "absolute",
    bottom: 60,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fb923c",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  radiusButton: {
    position: "absolute",
    bottom: 120,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  radiusPanel: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  radiusPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  radiusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  radiusSliderContainer: {
    marginBottom: 15,
  },
  radiusValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fb923c",
    textAlign: "center",
    marginBottom: 10,
  },
  radiusSlider: {
    width: "100%",
    height: 40,
  },
  sliderThumb: {
    backgroundColor: "#fb923c",
    width: 20,
    height: 20,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
  },
  radiusLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  radiusLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  radiusDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default FoodMapView;
