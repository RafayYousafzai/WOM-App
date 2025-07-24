import { FlatList, Text, View } from "react-native";

// Assuming these components are as they were originally,
// each containing its own ScrollView internally.
import PostList from "./PostList";
import UsersList from "./UserItem";
import ReviewsList from "./ReviewItem";

export default function AllResultsList({ searchQuery }) {
  // We define the sections as data for the FlatList.
  // Each item in this array will be rendered by the FlatList.
  const sectionsData = [
    {
      id: "users",
      title: "Users",
      component: UsersList,
      props: { limit: 5, searchQuery: searchQuery },
    },
    {
      id: "reviews",
      title: "Reviews",
      component: ReviewsList,
      props: { limit: 5, searchQuery: searchQuery },
    },
    {
      id: "posts",
      title: " Homemade Dish",
      component: PostList,
      props: { limit: 5, searchQuery: searchQuery },
    },
  ];

  const renderSection = ({ item }) => {
    const ComponentToRender = item.component; // Get the component itself

    return (
      <View className="mb-4">
        {/* Label for the section */}
        <Text className="text-xl font-bold mb-2 ml-4">{item.title}</Text>
        {/* Render the actual list component, passing its props */}
        <ComponentToRender {...item.props} />
      </View>
    );
  };

  return (
    <FlatList
      data={sectionsData}
      keyExtractor={(item) => item.id}
      renderItem={renderSection}
      className="flex-1 mt-4 mb-32 bg-white"
      // Important: Setting these props to prevent outer FlatList from taking over
      // the scroll, and hoping the inner ScrollViews handle it.
      // However, this often leads to a poor UX and janky scrolling.
      // If the content of the inner ScrollViews is large, this will still be slow.
      // This FlatList will still render all sections at once if they are short,
      // and if they are long, it won't virtualize well because the 'item' is a complex component.
      // Setting these *might* help with scroll locking, but it's not a silver bullet for performance
      // when nested scrollables are present.
      scrollEnabled={true} // The outer FlatList can scroll
      // nestedScrollEnabled={true} // Generally should be true for nested scroll views, but still problematic
      // This is the core issue: FlatList is not designed to contain *other scrollable components* as its items.
      // It's for a list of *non-scrollable* items.
    />
  );
}
