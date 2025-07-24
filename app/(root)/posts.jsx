import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobal } from "@/context/globalContext";
import PostListing from "@/components/post-listing/PostListing";
import CustomHeader from "@/components/common/CustomHeader";

export default function Posts() {
  const { renderPosts } = useGlobal();
  console.log(renderPosts);

  const initialScrollIndex = renderPosts?.initialScrollIndex || 0;
  const posts = renderPosts?.posts || [];
  const loading = renderPosts?.loading || false;

  // Reorder posts only if we have posts and a valid initialScrollIndex
  const reorderedPosts = (() => {
    if (!posts.length) return [];
    if (initialScrollIndex <= 0 || initialScrollIndex >= posts.length)
      return posts;

    return [
      posts[initialScrollIndex],
      ...posts.slice(0, initialScrollIndex),
      ...posts.slice(initialScrollIndex + 1),
    ];
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
