import { format } from "timeago.js";
import Image from "./Image";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";

const Comment = ({ comment, postId, postAuthorClerkId }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  // --- Authorization Logic ---
  const isAdmin = user?.publicMetadata?.role === "admin";
  const isPostAuthor = user && user.id === postAuthorClerkId;
  const isCommentAuthor = user && user.id === comment.user?.clerkUserId;

  const canDelete = isAdmin || isPostAuthor || isCommentAuthor;

  // --- FIX & IMPLEMENTATION: Added the complete delete mutation logic ---
  const mutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return axios.delete(
        `${import.meta.env.VITE_API_URL}/comments/${comment._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: () => {
      toast.success("Comment has been deleted!");
      // Refetch the comments for this post to update the UI
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: (err) => {
      console.error("Delete comment error:", err);
      toast.error(err.response?.data?.message || "Failed to delete comment.");
    },
  });

  // --- DEBUGGING: New handler to log the click event ---
  const handleDelete = () => {
    console.log(`Delete button clicked for comment ID: ${comment._id}`);
    console.log("User has permission to delete:", canDelete);
    if (window.confirm("Are you sure you want to delete this comment?")) {
        mutation.mutate();
    }
  };

  // The comment.user might not exist if the user has been deleted
  if (!comment.user) {
    return (
      <div className="p-4 bg-slate-100 rounded-xl mb-8">
        <p className="text-gray-500 italic">This comment was posted by a user that has since been deleted.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-50 rounded-xl mb-8">
      <div className="flex items-center gap-4">
        {comment.user.img && (
          <Image
            src={comment.user.img}
            className="w-10 h-10 rounded-full object-cover"
            w="40"
          />
        )}
        <span className="font-medium">{comment.user.username}</span>
        <span className="text-sm text-gray-500">
          {format(comment.createdAt)}
        </span>
        {canDelete && (
          <span
            className="text-xs text-red-300 hover:text-red-500 cursor-pointer ml-auto"
            onClick={handleDelete}
          >
            delete
            {mutation.isPending && <span>...</span>}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p>{comment.desc}</p>
      </div>
    </div>
  );
};

export default Comment;