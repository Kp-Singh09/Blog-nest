import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Slider from "react-slick";
import Image from "./Image";

const fetchFeaturedPosts = async () => {
  const res = await axios.get(
    `${import.meta.env.VITE_API_URL}/posts?featured=true&limit=5`
  );
  return res.data;
};

const FeaturedPosts = () => {
  const { isPending, error, data } = useQuery({
    queryKey: ["featuredPosts"],
    queryFn: fetchFeaturedPosts,
  });

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    appendDots: (dots) => (
      <div style={{ bottom: "25px" }}>
        <ul style={{ margin: "0px" }}> {dots} </ul>
      </div>
    ),
  };

  // --- UPDATED, MORE DETAILED SKELETON LOADER ---
  if (isPending) {
    return (
      <div className="mt-8">
        
        <div className="relative h-[500px] bg-white rounded-2xl animate-pulse overflow-hidden">
          <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full flex justify-between items-end">
            <div className="w-2/3 space-y-4">
              <div className="h-5 w-1/4 bg-slate-400 rounded"></div>
              <div className="h-8 w-3/4 bg-slate-400 rounded"></div>
              <div className="h-5 w-full bg-slate-400 rounded"></div>
            </div>
            <div className="h-12 w-28 bg-slate-400 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div>Error loading featured posts.</div>;

  const posts = data?.posts;
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h1 className=" mb-8 text-2xl font-bold text-gray-700">Featured Posts </h1>
      <Slider {...settings}>
        {posts.map((post) => (
          <div key={post._id} className="relative h-[500px] rounded-2xl overflow-hidden">
            <Image
              src={post.img}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white w-full flex justify-between items-end">
              <div>
                <Link
                  to={`/posts?cat=${post.category}`}
                  className="bg-blue-600 text-xs font-semibold px-3 py-1 rounded-full hover:bg-blue-500 transition-colors"
                >
                  {post.category}
                </Link>
                <Link to={`/${post.slug}`}>
                  <h2 className="text-2xl md:text-4xl font-bold mt-4 hover:underline">
                    {post.title}
                  </h2>
                </Link>
                <p className="mt-2 text-gray-200 hidden md:block max-w-xl">
                  {post.desc}
                </p>
              </div>
              <Link
                to={`/${post.slug}`}
                className="shrink-0 bg-white text-black font-semibold py-2 px-5 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Read More
              </Link>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default FeaturedPosts;