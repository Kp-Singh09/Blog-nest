import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { UpdatePostType } from '@mohit-kumar/common-zod-all';
import Loader from './Loader';
const key = import.meta.env.VITE_KEY;
const url=import.meta.env.VITE_BACKEND_URL
const genAi = new GoogleGenerativeAI(key);
const model = genAi.getGenerativeModel({
  model: 'gemini-1.5-pro',
});

const Update: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [postInputs, setPostInputs] = useState<UpdatePostType>({ id: -1, title: '', content: '' });
  const [query, setQuery] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const token =localStorage.getItem("token")

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`${url}/api/v1/blog/${id}`, {
          headers: {
            Authorization: token,
          },
        });
        setPostInputs(response.data);
      } catch (error) {
        console.error('Error fetching the blog post:', error);
      }
    };

    fetchPost();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem('token'); 
    setLoading(true); 
    try {
      if (postInputs) {
        await axios.put(`${url}/api/v1/blog`, {
          ...postInputs,
        }, {
          headers: {
            'Authorization': token
          }
        });
        setTimeout(() => {
          setLoading(false); 
          navigate("/blogs");
        }, 100);
      }
    } catch (error) {
      setLoading(false);
      alert("Something went wrong");
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault(); 
    try {
      const r = await model.generateContent(query);
      const content = r.response.text() || 'No content generated';
      const truncatedContent = content.slice(0, 400);
      setBlogContent(truncatedContent); 
    } catch (error) {
      setBlogContent('Error generating content');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(blogContent);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000); 
  };

  return (
    <div className="flex h-screen">
       {loading ? (
        <Loader />  
      ) : (
        <>
      <div className="flex flex-col justify-center px-8 w-1/2">
        <div className="border-2 border-neutral-300 w-[450px] shadow-2xl rounded-xl p-6 mx-auto">
          <h1 className="text-3xl font-bold text-center text-sky-950 mb-2">Update the Blog</h1>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label className="block text-lg font-medium text-sky-950">Title</label>
              <input
                type="text"
                name="title"
                placeholder="Enter blog title"
                value={postInputs.title}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-lg focus:outline-none focus:border-sky-950 text-sky-950"
                onChange={(e) => setPostInputs({ ...postInputs, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-sky-950">Content</label>
              <textarea
                name="content"
                rows={4}
                placeholder="Enter blog content"
                value={postInputs.content}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-lg focus:outline-none focus:border-sky-950 text-sky-950"
                onChange={(e) => setPostInputs({ ...postInputs, content: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-3 font-bold rounded-md text-slate-50 bg-sky-950 hover:bg-sky-800 text-lg"
            >
              Publish
            </button>
          </form>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center w-1/2 bg-sky-950 p-6">
        <div className="max-w-2xl w-[450px] bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl text-center font-bold text-sky-950 mb-6">Generate using AI</h1>
          <form onSubmit={handleGenerate} className="flex flex-col space-y-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter search query"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-sky-950 text-sky-950"
            />
            <button
              type="submit"
              className="w-full py-2 px-4 bg-sky-950 text-slate-50 rounded-md shadow-sm hover:bg-sky-800"
            >
              Generate
            </button>
          </form>
          <div className="mt-6 p-4 border border-gray-300 h-[275px] rounded-md bg-gray-50">
            <div className='flex items-center justify-between'>
              <h2 className="text-lg font-semibold text-sky-950 mb-2">Generated Blog:</h2>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center px-4 py-2 text-slate-50 rounded-md shadow-sm"
              >
                {isCopied ? (
                  <span> ✔</span>
                ) : (
                  <img width="24" height="24" src="https://img.icons8.com/material-rounded/24/copy.png" alt="copy" />
                )}
              </button>
            </div>
            <p className="text-sky-950">{blogContent || 'Generated blog content will appear here...'}</p>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default Update;

