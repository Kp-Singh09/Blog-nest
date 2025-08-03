import axios from "axios";
import Comment from "./Comment";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";

// This component is now simplified to handle either the form or the list
const Comments = ({
  postId,
  postAuthorClerkId,
  showForm = true,
  showList = true,
  commentsData, // Accept comments data as a prop
}) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newComment) => {
      const token = await getToken();
      return axios.post(
        `${import.meta.env.VITE_API_URL}/comments/${postId}`,
        newComment,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: (error) => {
      toast.error(error.response.data);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const desc = formData.get("desc");

    if (!desc) return; // Prevent submitting empty comments

    mutation.mutate({ desc });
    e.target.reset();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* --- RENDER THE FORM --- */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-stretch gap-4 w-full"
        >
          <textarea
            name="desc"
            placeholder="Write a comment..."
            className="w-full p-3 rounded-xl border border-gray-200 resize-none bg-slate-100"
            rows={2}
          />
          <button className="bg-blue-800 px-4 py-2 text-white font-medium rounded-xl h-full">
            Send
          </button>
        </form>
      )}

      {/* --- RENDER THE LIST --- */}
      {showList && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Comments</h2>
          {mutation.isPending && (
            <Comment
              comment={{
                desc: `${mutation.variables.desc} (Sending...)`,
                createdAt: new Date(),
                user: {
                  img: user.imageUrl,
                  username: user.username,
                },
              }}
            />
          )}
          {commentsData?.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              postId={postId}
              postAuthorClerkId={postAuthorClerkId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comments;