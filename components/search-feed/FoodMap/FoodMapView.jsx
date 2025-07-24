import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Heatmap,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  Button,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useFoodMapData } from "./FoodMapDataProvider";
import * as Location from "expo-location";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const safeHeatmapRadius = Math.min(Math.max(30, 10), 50);

const FoodMapView = () => {
  const mapRef = useRef(null);
  const { loading, posts, region, setRegion } = useFoodMapData();
  const [userLocation, setUserLocation] = useState(null);
  const [restaurantLocations, setRestaurantLocations] = useState([]); // Added for heatmap

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: region.latitudeDelta, // Keep current zoom level
        longitudeDelta: region.longitudeDelta,
      });
    })();
  }, []);

  useEffect(() => {
    // Simulate fetching restaurant data (replace with your actual data source)
    // This example uses the posts data for heatmap.  Adjust as needed.
    const dummyRestaurants = posts.map((post) => ({
      latitude: post.location?.latitude || 0, // Use 0 as default if no location
      longitude: post.location?.longitude || 0,
      intensity: 1, // You might want to adjust intensity based on review count or other factors
    }));
    setRestaurantLocations(dummyRestaurants);
  }, [posts]);

  const goToCurrentLocation = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(userLocation, 1000);
    }
  }, [userLocation]);

  // Cluster grouping logic
  const clusterGroups = useMemo(() => {
    const clusters = new Map();

    posts.forEach((post) => {
      if (!post.location) return;

      const lat = post.location.latitude.toFixed(4);
      const lng = post.location.longitude.toFixed(4);
      const key = `${lat}_${lng}`;

      if (!clusters.has(key)) {
        clusters.set(key, {
          location: post.location,
          posts: [post],
          count: 1,
        });
      } else {
        const cluster = clusters.get(key);
        cluster.posts.push(post);
        cluster.count += 1;
      }
    });

    return Array.from(clusters.values());
  }, [posts]);

  const handleClusterPress = useCallback(
    (cluster) => {
      const { count, posts } = cluster;
      const [firstPost] = posts;

      const isSinglePost = count === 1;
      const postType =
        firstPost.source_table === "own_reviews" ? "own_review" : "review";

      if (isSinglePost) {
        router.push({
          pathname: `/review/${firstPost.id}`,
          params: {
            id: firstPost.id,
            postType,
          },
        });
      } else {
        const clusterParams = posts.map(({ id, source_table }) => ({
          id,
          source_table,
        }));

        router.push({
          pathname: `/cluster/show-all`,
          params: {
            cluster: JSON.stringify(clusterParams),
          },
        });
      }
    },
    [router]
  );

  // Marker rendering
  const renderClusterMarker = useCallback(
    (cluster) => {
      const baseSize = 40;
      const clusterSize = Math.min(baseSize + cluster.count * 4, 80);

      return (
        <Marker
          key={`cluster_${cluster.location.latitude}_${cluster.location.longitude}`}
          coordinate={cluster.location}
          onPress={() => handleClusterPress(cluster)}
        />
      );
    },
    [handleClusterPress]
  );

  const heatmapData = restaurantLocations.map((rest) => ({
    latitude: rest.latitude,
    longitude: rest.longitude,
    weight: rest.intensity, // Use intensity as weight
  }));

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#f39f1e" />
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        region={region}
        provider={PROVIDER_GOOGLE}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
      >
        {heatmapData.length > 0 && (
          <Heatmap
            points={heatmapData}
            radius={safeHeatmapRadius}
            opacity={0.7}
            gradient={{
              colors: ["lime", "yellow", "orange", "red"],
              startPoints: [0.2, 0.4, 0.6, 0.8],
              colorMapSize: 256,
            }}
          />
        )}
        {clusterGroups.map(renderClusterMarker)}
      </MapView>
      <View style={styles.buttonContainer}>
        <Button title="Go to My Location" onPress={goToCurrentLocation} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 165, 0, 0.8)", // Orange with some transparency
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  },
  markerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
});

export default FoodMapView;
