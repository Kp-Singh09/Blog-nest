import PostListItem from "./PostListItem";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSearchParams } from "react-router-dom";

const fetchPosts = async (pageParam, searchParams) => {
  const searchParamsObj = Object.fromEntries([...searchParams]);

  const res = await axios.get(`${import.meta.env.VITE_API_URL}/posts`, {
    params: { page: pageParam, limit: 10, ...searchParamsObj },
  });
  return res.data;
};

// --- NEW: Helper function to generate the title ---
const generateTitle = (searchParams) => {
  const category = searchParams.get("cat");
  const sort = searchParams.get("sort");
  const author = searchParams.get("author");
  const search = searchParams.get("search");

  if (category) {
    const formattedCategory = category
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
    return `${formattedCategory} Posts`;
  }

  if (sort) {
    switch (sort) {
      case "popular":
        return "Most Popular Posts";
      case "discover":
        return "The Rabbit Hole";
      case "picks":
         return "Editor's Picks";
      case "oldest":
        return "Oldest Posts";
      default:
        return "All Posts";
    }
  }

  if (author) {
    return `Posts by ${author}`;
  }

  if (search) {
    return `Search Results for "${search}"`;
  }

  return "All Posts";
};

const PostList = () => {
  const [searchParams] = useSearchParams();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ["posts", searchParams.toString()],
    queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam, searchParams),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 1 : undefined,
  });

  if (isFetching) return "Loading...";

  if (error) return "Something went wrong!";

  const allPosts = data?.pages?.flatMap((page) => page.posts) || [];
  const title = generateTitle(searchParams); // Generate the dynamic title

  return (
    <div>
      {/* --- USE THE DYNAMIC TITLE HERE --- */}
      <h1 className=" mb-8 text-2xl font-bold text-gray-700">{title}</h1>
      <InfiniteScroll
        dataLength={allPosts.length}
        next={fetchNextPage}
        hasMore={!!hasNextPage}
        loader={<h4>Loading more posts...</h4>}
        endMessage={
          <p style={{ textAlign: "center" }}>
            <b>All posts loaded!</b>
          </p>
        }
      >
        {allPosts.map((post) => (
          <PostListItem key={post._id} post={post} />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default PostList;