import { SignupType } from "@mohit-kumar/common-zod-all";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "./Loader";
const url=import.meta.env.VITE_BACKEND_URL

const Signup = () => {
     const navigate = useNavigate() 
     const [loading, setLoading] = useState(false); 
     const [postInputs , setPostInputs] = useState<SignupType>({
      name:"",
      password:"",
      email:""
     })

     async function handleRequest(e: React.FormEvent<HTMLFormElement>){
      setLoading(true)
      try{
        e.preventDefault()
        const response=await axios.post(`${url}/api/v1/signup`, postInputs)
        const jwt=response.data.jwt
        const name=response.data.name
        const id=response.data.id
        localStorage.setItem("token",jwt)
        localStorage.setItem("name",name)
        localStorage.setItem("id",id)
        setTimeout(() => {
          setLoading(false); 
          navigate("/blogs");
        }, 1000);
      } catch(error){
        setLoading(false); 
        alert("Something went wrong")
      }
     }

    return (
      <div className="flex h-screen">
             {loading ? (
        <Loader />  
      ) : (
        <>
        <div className="flex flex-col justify-center px-12 w-1/2">
        <div className="border-2 border-neutral-300 w-[450px] shadow-2xl rounded-xl p-8 mx-auto ">
  <h1 className="text-3xl font-bold text-center text-sky-950">Create an account</h1>
  <form className="mt-6 space-y-4" onSubmit={handleRequest}>
    <div className="mb-4">
      <label className="block text-lg font-medium text-sky-950">Username</label>
      <input
        type="text"
        id="username"
        name="username"
        placeholder="Enter your username"
        value={postInputs.name}
        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-lg focus:outline-none focus:border-sky-950 text-sky-950"
        onChange={(e)=>{
          setPostInputs({
            ...postInputs,
            name:e.target.value
          })
        }}
/>
    </div>
    <div className="mb-4">
      <label className=" text-lg font-medium text-sky-950">Email</label>
      <input
        type="email"
        id="email"
        name="email"
        placeholder="Enter your email"
        value={postInputs.email}
        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-lg focus:outline-none focus:border-sky-950 text-sky-950"
        onChange={(e)=>{
          setPostInputs({
            ...postInputs,
            email:e.target.value
          })
        }}
      />
    </div>
    <div className="mb-6">
      <label className=" text-lg font-medium text-sky-950">Password</label>
      <input
        type="password"
        id="password"
        name="password"
        placeholder="Enter your password"
        value={postInputs.password}
        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-lg focus:outline-none focus:border-sky-950 text-sky-950"
        onChange={(e)=>{
          setPostInputs({
            ...postInputs,
            password:e.target.value
          })
        }}
      />
    </div>
    <button
      type="submit"
      className="w-full py-2 px-3 mt-8 font-bold rounded-md  text-slate-50 bg-sky-950 hover:bg-sky-800 text-lg" >
      Sign Up
    </button>
    <p className="mt-2 text-xl font-medium  text-center text-sky-950">
    Already have an account? <a href="/signin" className="text-blue-900 font-bold hover:underline">Signin</a>
  </p>
  </form>
</div>
</div>
  
        <div className="flex-1 flex justify-center items-center bg-sky-950 w-1/2">
          <div className="max-w-md">
            <h1 className="text-2xl  font-mono font-bold text-slate-50  mb-8">
              Step into a world of infinite possibilities. Launch your blogging journey with our app and let your words shine like stars in the vast digital sky!
            </h1>
            <p className="text-xl text-slate-50 mb-2 font-mono ">Karanpreet Singh</p>
            <p className="text-slate-50 text-xl font-mono ">Passionate web developer, creating digital experiences</p>
          </div>
        </div>
        </>)}
      </div>
    );
  };
export default Signup;

