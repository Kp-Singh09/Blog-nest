const Navbar = () =>{
    return (
    <nav className="bg-sky-950 p-4">
      <div className=" container mx-auto flex items-center justify-between">
        <div className="text-slate-50 text-4xl font-bold font-serif">
          BlogNest
        </div>
        <div className="space-x-6">
        <a href="/signup" className="text-slate-50 font-serif text-xl hover:underline">Signup</a>
        <a href="/signin" className="text-slate-50 font-serif text-xl hover:underline">Signin</a>
        </div>
      </div>
    </nav>
    )
}

export default Navbar