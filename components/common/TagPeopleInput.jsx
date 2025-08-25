import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useSupabase } from "@/context/supabaseContext";
import { Ionicons } from "@expo/vector-icons";

const TagPeopleInput = ({ tags = [], setTags, title = "Tag people..." }) => {
  const { supabase } = useSupabase();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  console.log(tags);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
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
        .limit(6);

      if (error) {
        console.error("Error fetching users:", error.message);
      } else {
        // filter out already tagged
        const filtered = (data || []).filter(
          (user) => !tags.some((t) => t.id === user.id)
        );
        setResults(filtered);
      }

      setLoading(false);
    };

    const timeout = setTimeout(fetchUsers, 400); // debounce
    return () => clearTimeout(timeout);
  }, [query, supabase, tags]);

  const handleSelect = (user) => {
    setTags([...tags, user]);
    setQuery("");
    setResults([]);
  };

  const handleRemoveTag = (idToRemove) => {
    setTags(tags.filter((tag) => tag.id !== idToRemove));
  };

  return (
    <View style={{ width: "100%" }}>
      <TextInput
        placeholder={title}
        value={query}
        onChangeText={setQuery}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 20,
          padding: 10,
          marginBottom: 8,
        }}
      />

      {loading && <ActivityIndicator size="small" color="#555" />}

      {!loading && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelect(item)}
              style={{
                padding: 10,
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
              }}
            >
              <Text style={{ fontWeight: "600" }}>
                {item.first_name} {item.last_name}
              </Text>
              <Text style={{ color: "#666" }}>@{item.username}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Selected tags */}
      {tags.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
          {tags.map((tag) => (
            <View
              key={tag.id}
              style={{
                backgroundColor: "#f39f1e",
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 20,
                margin: 4,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff" }}>
                {tag.first_name} {tag.last_name}
              </Text>
              <Pressable
                onPress={() => handleRemoveTag(tag.id)}
                className="ml-2"
              >
                <Ionicons name="close-circle" size={16} color="#fff" />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default TagPeopleInput;
