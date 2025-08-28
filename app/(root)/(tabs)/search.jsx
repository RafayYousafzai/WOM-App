import SearchList from "@/components/search-feed/SearchList";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDishesHandler } from "../../../hooks/useSearch";
import { useSearch } from "@/context/searchContext";

export default function SearchResultsScreen() {
  const { posts } = useDishesHandler();

  const { selectedFilters, searchQuery } = useSearch();

  console.log("posts", posts.length);
  console.log(selectedFilters, searchQuery);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <SearchList />;
    </SafeAreaView>
  );
}
