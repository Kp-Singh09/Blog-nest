import { useEffect, useState } from 'react';
import BlogCard from './BlogCard';
import axios from 'axios';
const url=import.meta.env.VITE_BACKEND_URL

interface Blog {
  id: number;
  author: {
    name: string;
  };
  title: string;
  content: string;
  createdAt: string; 
  authorId:number
}

const Blogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const name = localStorage.getItem("name");
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(`${url}/api/v1/all-blog`, {
          headers: {
            'Authorization': token,
          },
        });
        const sortedBlogs = response.data.sort((a: Blog, b: Blog) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setBlogs(sortedBlogs);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      }
    };

    fetchBlogs();
  }, [token]);

  return (
    <div>
      <nav className="bg-sky-950 p-4">
        <div className="mx-auto flex items-center justify-between">
          <div className="text-slate-50 text-4xl font-bold font-serif ml-12">BlogNest</div>
          <div className="space-x-6">
            <a href="/write" className="text-slate-50 font-serif text-xl hover:underline">Create Blog</a>
            <a href="/signin" className="text-slate-50 font-serif text-xl hover:underline">Logout</a>
            <div className="relative inline-flex items-center justify-center w-8 h-8 overflow-hidden bg-white rounded-full">
              <span className="font-medium text-sky-950">{name?.slice(0, 1).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </nav>
      <div className="mt-4">
        {blogs.map((blog) => (
          <BlogCard
            id={blog.id}
            author={blog.author.name}
            authorId={blog.authorId}
            title={blog.title}
            content={blog.content}
            date={blog.createdAt} 
          />
        ))}
      </div>
    </div>
  );
};

export default Blogs;

