import { Link, useParams } from "react-router-dom";
import Image from "../components/Image";
import PostMenuActions from "../components/PostMenuActions";
import Search from "../components/Search";
import Comments from "../components/Comments";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { format } from "timeago.js";

const fetchPost = async (slug) => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${slug}`);
  return res.data;
};

const SinglePostPage = () => {
  const { slug } = useParams();

  const { isPending, error, data } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPost(slug),
  });

  if (isPending) return "loading...";
  if (error) return "Something went wrong!" + error.message;
  if (!data) return "Post not found!";

  return (
    <div className="flex flex-col gap-8 mt-4">
      <div className="flex flex-col lg:flex-row gap-12 justify-between">
        {/* MAIN CONTENT (LEFT) */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <h1 className="text-xl md:text-3xl xl:text-4xl font-semibold">
            {data.title}
          </h1>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span>Written by</span>
            <Link className="text-blue-800">{data.user.username}</Link>
            <span>on</span>
            <Link className="text-blue-800">{data.category}</Link>
            <span>{format(data.createdAt)}</span>
          </div>

          {/* SMALLER POST IMAGE AT THE TOP */}
          {data.img && (
            <div className="w-full rounded-xl overflow-hidden">
              <Image
                src={data.img}
                className="object-cover w-full max-h-96"
                alt={data.title}
              />
            </div>
          )}

          {/* POST CONTENT */}
          <div
            className="lg:text-lg flex flex-col gap-6 text-justify"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />

          {/* COMMENTS SECTION */}
          <Comments postId={data._id} postAuthorClerkId={data.user.clerkUserId} />
        </div>

        {/* SIDEBAR (RIGHT) */}
        <div className="w-full lg:w-1/3 h-max sticky top-24">
          {/* STYLED AUTHOR BOX */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h1 className="mb-4 text-lg font-semibold text-gray-700">Author</h1>
            <div className="flex flex-col gap-4 items-center">
              {data.user.img && (
                <Image
                  src={data.user.img}
                  className="w-16 h-16 rounded-full object-cover"
                  w="64"
                  h="64"
                />
              )}
              <Link className="text-blue-800 font-semibold">
                {data.user.username}
              </Link>
              <p className="text-sm text-gray-500 text-center">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </p>
            </div>
          </div>

          {/* STYLED ACTIONS BOX */}
          <div className="bg-white p-6 rounded-xl shadow-md mt-8">
            <h1 className="mb-4 text-lg font-semibold text-gray-700">Actions</h1>
            <PostMenuActions post={data} />
          </div>

          {/* STYLED CATEGORIES BOX */}
          <div className="bg-white p-6 rounded-xl shadow-md mt-8">
            <h1 className="mb-4 text-lg font-semibold text-gray-700">Categories</h1>
            <div className="flex flex-col gap-2 text-sm">
              <Link className="text-gray-600 hover:underline">All</Link>
              <Link className="text-gray-600 hover:underline" to="/">
                Web Design
              </Link>
              <Link className="text-gray-600 hover:underline" to="/">
                Development
              </Link>
            </div>
          </div>

          {/* STYLED SEARCH BOX */}
          <div className="bg-white p-6 rounded-xl shadow-md mt-8">
            <h1 className="mb-4 text-lg font-semibold text-gray-700">Search</h1>
            <Search />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePostPage;