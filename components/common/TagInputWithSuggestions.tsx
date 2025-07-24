import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import snakeCaseToSentence from "@/utils/snakeCaseToSentence";
// normalize input (lowercase, no spaces)
const normalize = (text: string) =>
  text.toLowerCase().trim().replace(/\s+/g, "_");

const TagInputWithSuggestions = ({
  tags: value = [],
  setTags: setValue = (tags: string[]) => {},
  title = "Add tags...",
  sc = "#",
  suggestions = ["apple", "banana", "carrot"],
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (value?.length && tags.length === 0) {
      const normalized = value.map(normalize);
      setTags(normalized); // internal state
      setValue(normalized); // sync external state
    }
  }, [value]);

  const filteredSuggestions = suggestions.filter(
    (s) =>
      normalize(s).includes(normalize(input)) && !tags.includes(normalize(s))
  );

  const handleAddTag = (tag: string) => {
    const cleaned = normalize(tag);
    if (cleaned && !tags.includes(cleaned)) {
      const updated = [...tags, cleaned];
      setTags(updated);
      setValue(updated); // sync with parent
      setInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    const updated = [...tags];
    updated.splice(index, 1);
    setTags(updated);
    setValue(updated); // sync with parent
  };

  return (
    <View style={styles.container}>
      {/* Input */}
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder={title}
        style={styles.input}
        onSubmitEditing={() => handleAddTag(input)}
        returnKeyType="done"
      />

      {/* Suggestions */}
      {input.length > 0 && filteredSuggestions.length > 0 && (
        <FlatList
          data={filteredSuggestions}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleAddTag(item)}
              style={styles.suggestionItem}
            >
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          )}
          style={styles.suggestionsList}
        />
      )}
      {/* Tags */}
      <View style={styles.tagsContainer}>
        {tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>
              {sc}
              {snakeCaseToSentence(tag)}
            </Text>
            <TouchableOpacity onPress={() => handleRemoveTag(index)}>
              <Ionicons name="close-circle" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

export default TagInputWithSuggestions;

const styles = StyleSheet.create({
  container: {},
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 10,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fca311",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tagText: {
    marginRight: 6,
    fontSize: 12,
    color: "#fff",
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 100,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  suggestionsList: {
    marginTop: 4,
    maxHeight: 120,
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  suggestionText: {
    fontSize: 14,
    color: "#222",
  },
});
