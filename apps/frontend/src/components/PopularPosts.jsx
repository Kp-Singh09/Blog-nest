import { Link } from "react-router-dom";
import Image from "./Image";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { format } from "timeago.js";

// This function fetches the top 4 most popular posts
const fetchPopularPosts = async () => {
  const res = await axios.get(
    `${import.meta.env.VITE_API_URL}/posts?sort=popular&limit=4`
  );
  return res.data;
};

const PopularPosts = () => {
  const { isPending, error, data } = useQuery({
    queryKey: ["popularPosts"],
    queryFn: fetchPopularPosts,
  });

  if (isPending) return <div>Loading popular posts...</div>;
  if (error) return <div>Something went wrong!</div>;

  const posts = data?.posts;

  if (!posts || posts.length === 0) {
    return null; // Don't render anything if there are no popular posts
  }

  const mainPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <div className="mt-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-700">Most Popular</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* LARGE POST ON THE LEFT */}
        <div className="w-full lg:w-2/3 flex flex-col gap-4">
          {mainPost.img && (
            <Link to={`/${mainPost.slug}`}>
              <Image
                src={mainPost.img}
                className="rounded-3xl object-cover w-full aspect-video"
                w="895"
              />
            </Link>
          )}
          <div className="flex items-center gap-4 text-gray-500 text-sm">
            <Link to={`/posts?cat=${mainPost.category}`} className="text-blue-800 font-semibold">{mainPost.category}</Link>
            <span>{format(mainPost.createdAt)}</span>
          </div>
          <Link to={`/${mainPost.slug}`}>
            <h2 className="text-xl lg:text-3xl font-bold">
              {mainPost.title}
            </h2>
          </Link>
          <p className="text-gray-600 hidden md:block">{mainPost.desc}</p>
        </div>

        {/* SMALLER POSTS ON THE RIGHT */}
        <div className="w-full lg:w-1/3 flex flex-col gap-8">
          {otherPosts.map((post) => (
            <div key={post._id} className="flex gap-4">
              {post.img && (
                <div className="w-1/3 aspect-video">
                   <Link to={`/${post.slug}`}>
                    <Image
                      src={post.img}
                      className="rounded-xl object-cover w-full h-full"
                      w="298"
                    />
                   </Link>
                </div>
              )}
              <div className="w-2/3 flex flex-col justify-between">
                <Link to={`/${post.slug}`}>
                  <h3 className="font-semibold text-md leading-tight">
                    {post.title}
                  </h3>
                </Link>
                <div className="text-xs text-gray-500">
                  <span>{format(post.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularPosts;    