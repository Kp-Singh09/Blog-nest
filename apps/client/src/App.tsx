import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import Dashboard from './pages/Dasboard'
import Blogs from './pages/Blogs'
import Write from './pages/Write'
import Update from './pages/Update'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard/>} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/blogs" element={<Blogs/>} />
          <Route path="/write" element={<Write/>} />
          <Route path="/update/:id" element={<Update/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
