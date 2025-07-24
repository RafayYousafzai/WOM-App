import { SafeAreaView } from "react-native-safe-area-context";
import SearchList from "@/components/search-feed/SearchList";

export default function SearchScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <SearchList />
    </SafeAreaView>
  );
}
