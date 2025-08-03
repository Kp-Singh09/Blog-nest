import { Link, useParams } from "react-router-dom";
import Image from "../components/Image";
import PostMenuActions from "../components/PostMenuActions";
import Comments from "../components/Comments";
import Search from "../components/Search";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { format } from "timeago.js";

const fetchPost = async (slug) => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${slug}`);
  return res.data;
};

const fetchComments = async (postId) => {
  if (!postId) return [];
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/comments/${postId}`);
  return res.data;
};

const SinglePostPage = () => {
  const { slug } = useParams();

  const { isPending, error, data } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPost(slug),
  });

  const { data: commentsData } = useQuery({
    queryKey: ["comments", data?._id],
    queryFn: () => fetchComments(data?._id),
    enabled: !!data,
  });

  if (isPending) return "loading...";
  if (error) return "Something went wrong!" + error.message;
  if (!data) return "Post not found!";

  const authorImage = data.user.img || "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";

  return (
    <div className="pt-8 pb-4 flex flex-col gap-8 mt-4">
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
          {data.img && (
            <div className="w-full rounded-xl overflow-hidden">
              <Image
                src={data.img}
                className="object-cover w-full max-h-96"
                alt={data.title}
              />
            </div>
          )}
          <div
            className="lg:text-lg flex flex-col gap-6 text-justify"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
          
          {/* Conditionally render the comment list */}
          {commentsData && commentsData.length > 0 && (
            <Comments
              postId={data._id}
              postAuthorClerkId={data.user.clerkUserId}
              showForm={false}
              commentsData={commentsData}
            />
          )}
        </div>

        {/* --- SIDEBAR (RIGHT) --- */}
        <div className="w-full lg:w-1/3 flex flex-col gap-8 lg:pl-12 lg:border-l lg:border-gray-300">
          {/* Author Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Author</h2>
            <div className="flex items-center gap-4">
              <Image
                src={authorImage}
                className="w-12 h-12 rounded-full object-cover"
                w="48"
                h="48"
              />
              <div>
                <Link className="text-blue-800 font-semibold">
                  {data.user.username}
                </Link>
                <p className="text-sm text-gray-600">
                  A full-stack developer passionate about building clean, efficient applications.
                </p>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions</h2>
            <div className="flex flex-col gap-2">
              <PostMenuActions post={data} />
            </div>
          </div>

          {/* Renders the comment FORM only */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Leave a Comment</h2>
            <Comments
              postId={data._id}
              postAuthorClerkId={data.user.clerkUserId}
              showList={false}
            />
          </div>

          {/* Categories Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Categories</h2>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/posts" className="text-gray-600 hover:text-blue-800 hover:underline">All</Link>
              <Link to="/posts?cat=web-design" className="text-gray-600 hover:text-blue-800 hover:underline">Web Design</Link>
              <Link to="/posts?cat=development" className="text-gray-600 hover:text-blue-800 hover:underline">Development</Link>
              <Link to="/posts?cat=databases" className="text-gray-600 hover:text-blue-800 hover:underline">Databases</Link>
              <Link to="/posts?cat=seo" className="text-gray-600 hover:text-blue-800 hover:underline">SEO</Link>
            </div>
          </div>

          {/* Search Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Search</h2>
            <Search />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePostPage;