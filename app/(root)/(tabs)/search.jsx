import SearchList from "@/components/search-feed/SearchList";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchResultsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <SearchList />;
    </SafeAreaView>
  );
}
