"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import snakeCaseToSentence from "@/utils/snakeCaseToSentence";

interface Tag {
  id: number;
  name: string;
  type: string;
}

interface TagInputWithSuggestionsProps {
  tags?: Tag[];
  setTags?: (tags: Tag[]) => void;
  title?: string;
  sc?: string;
  suggestions?: Tag[];
}

const TagInputWithSuggestions = ({
  tags: value = [],
  setTags: setValue = () => {},
  title = "Add tags...",
  sc = "#",
  suggestions = [],
}: TagInputWithSuggestionsProps) => {
  const [tags, setTags] = useState<Tag[]>(value);
  const [input, setInput] = useState("");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    setTags(value);
  }, [value]);

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.name.toLowerCase().includes(input.toLowerCase()) &&
      !tags.some((tag) => tag.id === s.id)
  );

  useEffect(() => {
    if (input.length > 0 && filteredSuggestions.length > 0) {
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
  }, [input, filteredSuggestions.length]);

  const handleAddTag = (tag: Tag) => {
    if (!tags.some((t) => t.id === tag.id)) {
      const updated = [...tags, tag];
      setTags(updated);
      setValue(updated);
      setInput("");

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

  const handleRemoveTag = (tagId: number) => {
    const updated = tags.filter((tag) => tag.id !== tagId);
    setTags(updated);
    setValue(updated);
  };

  return (
    <View style={styles.container}>
      {/* Input */}
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder={title}
        style={styles.input}
        returnKeyType="done"
        placeholderTextColor="#343a40"
      />

      {/* Suggestions */}
      {input.length > 0 && filteredSuggestions.length > 0 && (
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
            data={filteredSuggestions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleAddTag(item)}
                style={styles.suggestionItem}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionText}>{item.name}</Text>
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
              {sc}
              {snakeCaseToSentence(tag.name)}
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

export default TagInputWithSuggestions;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginVertical: 10,
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
  suggestionsList: {
    marginTop: 8,
    maxHeight: 200,
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
  },
  suggestionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
});
