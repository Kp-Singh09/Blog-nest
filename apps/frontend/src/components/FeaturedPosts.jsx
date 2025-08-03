import { Link } from "react-router-dom";
import Image from "./Image";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { format } from "timeago.js";

const fetchPost = async () => {
  const res = await axios.get(
    `${import.meta.env.VITE_API_URL}/posts?featured=true&limit=4&sort=newest`
  );
  return res.data;
};

const FeaturedPosts = () => {
  const { isPending, error, data } = useQuery({
    queryKey: ["featuredPosts"],
    queryFn: fetchPost,
  });

  // if (isPending) return "loading...";
  if (error) return "Something went wrong!" + error.message;

  const posts = data?.posts;
  if (!posts || posts.length === 0) {
    return null;
  }

  const mainPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <div className="mt-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-700">Featured Posts</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* First Post (main) */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          {mainPost.img && (
            <Link to={mainPost.slug}>
              <Image
                src={mainPost.img}
                className="rounded-3xl object-cover"
                w="895"
              />
            </Link>
          )}
          <div className="flex items-center gap-4">
            <h1 className="font-semibold lg:text-lg">01.</h1>
            <Link to={`/posts?cat=${mainPost.category}`} className="text-blue-800 lg:text-lg">{mainPost.category}</Link>
            <span className="text-gray-500">{format(mainPost.createdAt)}</span>
          </div>
          <Link
            to={mainPost.slug}
            className="text-xl lg:text-3xl font-semibold lg:font-bold"
          >
            {mainPost.title}
          </Link>
        </div>

        {/* Other Posts */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4 justify-between">
          {otherPosts.map((post, index) => (
            <div key={post._id} className="flex justify-between gap-4">
              {post.img && (
                // --- THIS DIV CONTROLS THE IMAGE SHAPE ---
                <div className="w-1/3 aspect-[4/3]"> {/* Changed to 4/3 aspect ratio */}
                  <Link to={post.slug}>
                    <Image
                      src={post.img}
                      className="rounded-3xl object-cover w-full h-full"
                      w="298"
                    />
                  </Link>
                </div>
              )}
              <div className="w-2/3">
                <div className="flex items-center gap-4 text-sm lg:text-base mb-4">
                  <h1 className="font-semibold">
                    {String(index + 2).padStart(2, '0')}.
                  </h1>
                  <Link to={`/posts?cat=${post.category}`} className="text-blue-800">{post.category}</Link>
                  <span className="text-gray-500 text-sm">{format(post.createdAt)}</span>
                </div>
                <Link
                  to={post.slug}
                  className="text-base sm:text-lg md:text-2xl lg:text-xl xl:text-2xl font-medium"
                >
                  {post.title}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedPosts;