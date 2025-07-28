import Navbar from "./Navbar";
import Footer from "./Footer";
import Middle from "./Middle";


const Dashboard = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Middle/>
      <Footer />
    </div>
  );
};

export default Dashboard;
