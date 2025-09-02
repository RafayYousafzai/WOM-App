import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobal } from "@/context/globalContext";
import PostListing from "@/components/post-listing/PostListing";
import CustomHeader from "@/components/common/CustomHeader";
export default function Posts() {
  const { renderPosts } = useGlobal();
  console.log("[Posts screen] renderPosts:", renderPosts);

  const initialScrollIndex = renderPosts?.initialScrollIndex || 0;
  const posts = renderPosts?.posts || [];
  const loading = renderPosts?.loading || false;

  console.log("[Posts screen] posts length:", posts.length);
  console.log("[Posts screen] initialScrollIndex:", initialScrollIndex);

  const reorderedPosts = (() => {
    if (!posts.length) {
      console.log("[Posts screen] reorderedPosts: empty");
      return [];
    }
    if (initialScrollIndex <= 0 || initialScrollIndex >= posts.length) {
      console.log("[Posts screen] reorderedPosts: no reorder applied");
      return posts;
    }

    const reordered = [
      posts[initialScrollIndex],
      ...posts.slice(0, initialScrollIndex),
      ...posts.slice(initialScrollIndex + 1),
    ];
    console.log("[Posts screen] reorderedPosts length:", reordered.length);
    return reordered;
  })();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <PostListing
        ListHeaderComponent={<CustomHeader handleBack={undefined} />}
        posts={reorderedPosts}
        loading={loading}
        handleRefresh={undefined}
      />
    </SafeAreaView>
  );
}
