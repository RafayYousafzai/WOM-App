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
      <View className="">
        {/* Label for the section */}
        {/* Render the actual list component, passing its props */}
        <ComponentToRender {...item.props} />
      </View>
    );
  };

  return (
    <>
      {/* <UsersList limit={5} searchQuery={searchQuery} /> */}
      <PostList limit={5} searchQuery={searchQuery} />
      <ReviewsList limit={5} searchQuery={searchQuery} />
    </>
  );
}
