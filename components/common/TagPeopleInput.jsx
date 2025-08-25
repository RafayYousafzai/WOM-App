"use client";

import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from "react-native";
import { useSupabase } from "@/context/supabaseContext";
import { Ionicons } from "@expo/vector-icons";

const TagPeopleInput = ({ tags = [], setTags, title = "Tag people..." }) => {
  const { supabase } = useSupabase();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);

      const searchTerm = `%${query.trim()}%`;

      const { data, error } = await supabase
        .from("users")
        .select(
          `
          id, 
          first_name, 
          last_name, 
          username, 
          email
          `
        )
        .or(
          `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},username.ilike.${searchTerm},email.ilike.${searchTerm}`
        )
        .order("first_name", { ascending: true })
        .limit(3);

      if (error) {
        console.error("Error fetching users:", error.message);
      } else {
        // filter out already tagged
        const filtered = (data || []).filter(
          (user) => !tags.some((t) => t.id === user.id)
        );
        setResults(filtered);

        if (filtered.length > 0) {
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }).start();
        }
      }

      setLoading(false);
    };

    const timeout = setTimeout(fetchUsers, 400); // debounce
    return () => clearTimeout(timeout);
  }, [query, supabase, tags]);

  const handleSelect = (user) => {
    if (!tags.some((t) => t.id === user.id)) {
      const updated = [...tags, user];
      setTags(updated);
      setQuery("");
      setResults([]);

      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleRemoveTag = (idToRemove) => {
    const updated = tags.filter((tag) => tag.id !== idToRemove);
    setTags(updated);
  };

  return (
    <View style={styles.container}>
      {/* Input */}
      <TextInput
        placeholder={title}
        value={query}
        onChangeText={setQuery}
        style={styles.input}
        placeholderTextColor="#9ca3af"
        returnKeyType="done"
      />

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      )}

      {/* Suggestions */}
      {query.length > 0 && results.length > 0 && (
        <Animated.View
          style={[
            styles.suggestionsList,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                style={styles.suggestionItem}
                activeOpacity={0.7}
              >
                <View style={styles.suggestionContent}>
                  <Text style={styles.suggestionName}>
                    {item.first_name} {item.last_name}
                  </Text>
                  <Text style={styles.suggestionUsername}>
                    @{item.username}
                  </Text>
                </View>
                <Ionicons name="add-circle" size={24} color="#6366F1" />
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
      )}

      {/* Tags */}
      <Animated.View
        style={[
          styles.tagsContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {tags.map((tag) => (
          <View key={tag.id} style={styles.tag}>
            <Text style={styles.tagText}>
              {tag.first_name} {tag.last_name}
            </Text>
            <TouchableOpacity
              onPress={() => handleRemoveTag(tag.id)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginVertical: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f39f1e",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#f77f00",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  tagText: {
    marginRight: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  input: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 16,
    fontSize: 18,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  suggestionsList: {
    marginTop: 8,
    maxHeight: 230,
    backgroundColor: "#fff",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  suggestionUsername: {
    fontSize: 14,
    color: "#6B7280",
  },
});

export default TagPeopleInput;
