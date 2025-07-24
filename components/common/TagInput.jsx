import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TagInput = ({ tags, setTags, sc = "@", title }) => {
  const [tag, setTag] = useState("");

  const addTag = () => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
      setTag(""); // Clear input after adding
    }
  };

  const removeTag = (index) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
  };

  return (
    <View className="py-2">
      {/* Input Field */}

      <TextInput
        value={tag}
        onChangeText={setTag}
        placeholder={title}
        className=" bg-gray-50 rounded-lg px-4 py-3 pr-12 text-gray-800"
        onSubmitEditing={addTag}
      />

      {/* Tag List */}
      {tags.length > 0 && (
        <FlatList
          data={tags}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          contentContainerStyle={{ marginTop: 10 }}
          renderItem={({ item, index }) => (
            <View className="flex-row items-center  bg-gray-100 px-3 py-1 rounded-full mr-2">
              <Text className="mr-2 text-xs text-gray-900">{sc + item}</Text>
              <TouchableOpacity onPress={() => removeTag(index)}>
                <Ionicons name="close-circle" size={14} color="gray" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default TagInput;
