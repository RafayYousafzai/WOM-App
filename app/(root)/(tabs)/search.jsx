import SearchList from "@/components/search-feed/SearchList";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDishesHandler } from "../../../hooks/useSearch";

export default function SearchResultsScreen() {
  const {
    posts,
    loading,
    error,
    setSearchQuery,
    setSelectedFilters,
    fetchPosts,
  } = useDishesHandler();

  console.log("posts", posts.length);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <SearchList />;
    </SafeAreaView>
  );
}
