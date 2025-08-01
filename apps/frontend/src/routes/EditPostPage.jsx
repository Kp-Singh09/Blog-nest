import { useAuth, useUser } from "@clerk/clerk-react";
import "react-quill-new/dist/quill.snow.css";
import ReactQuill from "react-quill-new";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Upload from "../components/Upload";

const EditPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { isLoaded, isSignedIn } = useUser();

  const [value, setValue] = useState("");
  const [cover, setCover] = useState(null);
  const [progress, setProgress] = useState(0);

  // 1. Fetch the existing post data
  const { data: postData, isLoading: isPostLoading } = useQuery({
    queryKey: ["post", slug],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${slug}`);
      return res.data;
    },
  });

  // 2. Pre-fill the editor once data is loaded
  useEffect(() => {
    if (postData) {
      setValue(postData.content);
    }
  }, [postData]);

  // 3. Create the mutation for updating
  const mutation = useMutation({
    mutationFn: (updatedPost) => {
      return getToken().then((token) => {
        return axios.patch(
          `${import.meta.env.VITE_API_URL}/posts/${postData._id}`,
          updatedPost,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      });
    },
    onSuccess: (res) => {
      toast.success("Post updated successfully!");
      navigate(`/${res.data.slug}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update post.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const data = {
      title: formData.get("title"),
      category: formData.get("category"),
      desc: formData.get("desc"),
      content: value,
      ...(cover && { img: cover.filePath }), // Only include img if a new one is uploaded
    };

    mutation.mutate(data);
  };
  
  if (!isLoaded || isPostLoading) return <div>Loading...</div>;
  if (!isSignedIn) return <div>You must be signed in to edit a post.</div>;
  if (!postData) return <div>Post not found.</div>;


  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit Post</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1 mb-6">
        <Upload type="image" setProgress={setProgress} setData={setCover}>
          <button type="button" className="w-max p-2 shadow-md rounded-xl text-sm text-gray-500 bg-white">
            Change Cover Image
          </button>
        </Upload>
        <input
          className="text-4xl font-semibold bg-transparent outline-none"
          type="text"
          name="title"
          defaultValue={postData.title}
        />
        <div className="flex items-center gap-4">
          <label htmlFor="category" className="text-sm">Category:</label>
          <select
            name="category"
            id="category"
            className="p-2 rounded-xl bg-white shadow-md"
            defaultValue={postData.category}
          >
            <option value="general">General</option>
            <option value="web-design">Web Design</option>
            <option value="development">Development</option>
            <option value="databases">Databases</option>
            <option value="seo">Search Engines</option>
            <option value="marketing">Marketing</option>
          </select>
        </div>
        <textarea
          className="p-4 rounded-xl bg-white shadow-md"
          name="desc"
          placeholder="A Short Description"
          defaultValue={postData.desc}
        />
        <div className="flex flex-1 min-h-[400px]">
          <ReactQuill
            theme="snow"
            className="flex-1 rounded-xl bg-white shadow-md"
            value={value}
            onChange={setValue}
            readOnly={progress > 0 && progress < 100}
          />
        </div>
        <button
          disabled={mutation.isPending || (progress > 0 && progress < 100)}
          className="bg-blue-800 text-white font-medium rounded-xl mt-4 p-2 w-36 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? "Updating..." : "Update Post"}
        </button>
      </form>
    </div>
  );
};

export default EditPostPage;