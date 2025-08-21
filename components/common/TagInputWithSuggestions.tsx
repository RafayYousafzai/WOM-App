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

  useEffect(() => {
    setTags(value);
  }, [value]);

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.name.toLowerCase().includes(input.toLowerCase()) &&
      !tags.some((tag) => tag.id === s.id)
  );

  const handleAddTag = (tag: Tag) => {
    if (!tags.some((t) => t.id === tag.id)) {
      const updated = [...tags, tag];
      setTags(updated);
      setValue(updated);
      setInput("");
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
      />

      {/* Suggestions */}
      {input.length > 0 && filteredSuggestions.length > 0 && (
        <FlatList
          data={filteredSuggestions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleAddTag(item)}
              style={styles.suggestionItem}
            >
              <Text style={styles.suggestionText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          style={styles.suggestionsList}
        />
      )}

      {/* Tags */}
      <View style={styles.tagsContainer}>
        {tags.map((tag) => (
          <View key={tag.id} style={styles.tag}>
            <Text style={styles.tagText}>
              {sc}
              {snakeCaseToSentence(tag.name)}
            </Text>
            <TouchableOpacity onPress={() => handleRemoveTag(tag.id)}>
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
