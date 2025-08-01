import { format } from "timeago.js";
import Image from "./Image";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";

//...
const Comment = ({ comment, postId, postAuthorClerkId }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  // --- New Authorization Logic ---
  const isAdmin = user?.publicMetadata?.role === "admin";
  const isPostAuthor = user && user.id === postAuthorClerkId;
  const isCommentAuthor = user && user.id === comment.user?.clerkUserId;

  const canDelete = isAdmin || isPostAuthor || isCommentAuthor;
  // --- End of New Logic ---

  const mutation = useMutation({
    //... (mutation logic remains the same)
  });

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
        {/* Use the new canDelete variable here */}
        {canDelete && (
          <span
            className="text-xs text-red-300 hover:text-red-500 cursor-pointer ml-auto"
            onClick={() => mutation.mutate()}
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