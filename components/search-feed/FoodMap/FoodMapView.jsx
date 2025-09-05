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
} from "react-native"; // Changed back to react-native for universal compatibility
import MapView, { Marker, PROVIDER_GOOGLE, Heatmap } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useDishesHandler } from "@/hooks/useSearch";
import { useRouter } from "expo-router"; // Use the actual hook in a real app
import { useGlobal } from "@/context/globalContext";

// --- Constants ---
const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const safeHeatmapRadius = Platform.OS === "android" ? 50 : 30;

// --- Main Component ---
const FoodMapView = () => {
  const { setRenderPosts } = useGlobal();

  const mapRef = useRef(null);
  const router = useRouter(); // Use the real router hook
  const { posts, loading, error } = useDishesHandler();

  const [userLocation, setUserLocation] = useState(null);

  // Default region set to Lahore, a good fallback
  const [region, setRegion] = useState({
    latitude: 31.5204,
    longitude: 74.3587,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

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
        // Set user location state
        setUserLocation(newUserLocation);
        // Animate map to the new location
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              ...newUserLocation,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            },
            1000
          );
        }
      } catch (e) {
        console.error("Could not fetch location:", e);
      }
    })();
  }, []);

  // Memoized and FILTERED data to prevent crashes from bad data. This is great.
  const mapPoints = useMemo(() => {
    if (!posts || posts.length === 0) return [];
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
      }));
  }, [posts]);

  // Your clustering logic is efficient and correctly uses the sanitized `mapPoints`.
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

  // Heatmap data correctly derived from filtered points.
  const heatmapData = useMemo(() => {
    return mapPoints.map((point) => ({
      latitude: point.location.latitude,
      longitude: point.location.longitude,
      weight: point.rating || 1, // Default weight to 1 if rating is null
    }));
  }, [mapPoints]);

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

  const handleClusterPress = useCallback(
    (cluster) => {
      // Step 1: Get the IDs of all posts within the clicked cluster.
      const postIdsInCluster = new Set(cluster.posts.map((p) => p.id));

      // Step 2: Filter the original, full 'posts' array to get the complete data for this cluster.
      // This is crucial because cluster.posts only has partial data (id, location, etc.).
      const fullPostsInCluster = posts.filter((p) =>
        postIdsInCluster.has(p.id)
      );

      // Step 3: Normalize the shape of these posts so the '/posts' screen can use them.
      const normalizedPosts = fullPostsInCluster.map((p) => {
        // Extract all image URLs from the post's dishes
        const images =
          p.post_dishes
            ?.flatMap((dish) => dish.image_urls || [])
            .filter((url) => url) || [];

        return {
          ...p,
          images, // An array of all image URLs
          dishes: p.post_dishes || [],
          isLiked: false, // Default 'isLiked' state, you can add your logic here
          // Standardize the user object
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
          // Rename for consistency on the next screen
          restaurant: p.restaurants,
        };
      });

      // Step 4: Set the state that the '/posts' screen will use to render.
      // We assume 'setRenderPosts' is a state setter passed into this component.
      setRenderPosts({
        posts: normalizedPosts,
        loading: false,
        initialScrollIndex: 0, // Always start at the first post in the list
      });

      // Step 5: Navigate to the posts screen.
      router.push("/posts");
    },
    [router, posts, setRenderPosts] // Add all external dependencies here
  );

  // Your loading and error states are perfect.
  if (loading) {
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
      >
        {/*
          // DEBUGGING TIP: If the map still doesn't work,
          // try commenting out the <Heatmap> component first.
          // Sometimes, it has compatibility issues on web.
        */}
        {heatmapData.length > 0 && (
          <Heatmap
            points={heatmapData}
            radius={safeHeatmapRadius}
            opacity={10}
            gradient={{
              colors: ["#79E0EE", "#3498db", "#f39c12", "#e74c3c"],
              startPoints: [0.1, 0.4, 0.7, 0.9],
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

      <TouchableOpacity
        style={styles.locationButton}
        onPress={goToCurrentLocation}
      >
        <Ionicons name="navigate" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

// --- Styles --- (Your styles are great, no changes needed)
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
});

export default FoodMapView;
