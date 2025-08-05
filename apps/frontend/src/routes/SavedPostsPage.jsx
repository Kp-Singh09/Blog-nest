import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import PostListItem from "../components/PostListItem";
import { PostListItemSkeleton } from "../components/PostList"; // Import the skeleton

const SavedPostsPage = () => {
  const { getToken } = useAuth();

  const { isPending, error, data: savedPosts } = useQuery({
    queryKey: ["savedPostsList"],
    queryFn: async () => {
      const token = await getToken();
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/saved`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    },
  });

  return (
    <div className="py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-800">Your Saved Posts</h1>
      {isPending ? (
        <div>
          <PostListItemSkeleton />
          <PostListItemSkeleton />
        </div>
      ) : error ? (
        <div className="text-red-500">Failed to load saved posts. Please try again later.</div>
      ) : savedPosts && savedPosts.length > 0 ? (
        <div>
          {savedPosts.map((post) => (
            <PostListItem key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-slate-100 rounded-xl">
          <p className="text-gray-600">You haven't saved any posts yet.</p>
          <p className="text-sm text-gray-500 mt-2">Click the save icon on any post to add it to your list.</p>
        </div>
      )}
    </div>
  );
};

export default SavedPostsPage;