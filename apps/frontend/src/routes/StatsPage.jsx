import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

const fetchStats = async () => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/stats`);
  return res.data;
};

const StatsCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-xl shadow-md text-center">
    <h3 className="text-gray-500 text-sm uppercase">{title}</h3>
    <p className="text-4xl font-bold text-blue-800 mt-2">{value}</p>
  </div>
);

const PodiumStep = ({ user, position }) => {
  const styles = {
    1: { bg: "bg-yellow-400", order: "order-2", height: "h-32" },
    2: { bg: "bg-gray-300", order: "order-1", height: "h-24" },
    3: { bg: "bg-yellow-600", order: "order-3", height: "h-20" },
  };
  return (
    <div className={`flex flex-col items-center ${styles[position].order}`}>
      <div className="font-bold text-2xl">{position}</div>
      <div className={`w-24 ${styles[position].height} ${styles[position].bg} rounded-t-lg`}></div>
      <img src={user.img} alt={user.username} className="w-16 h-16 rounded-full -mt-8 border-4 border-white"/>
      <p className="font-semibold mt-2">{user.username}</p>
      <p className="text-sm text-gray-500">{Math.round(user.score)} pts</p>
    </div>
  );
};
const formatCategoryName = (name) => {
    const nameMap = {
      "development": "Dev",
      "databases": "DB",
      "web-design": "Design",
      "marketing": "Marketing",
      "seo": "SEO",
      "general": "General"
    };
    return nameMap[name] || name;
  };
const StatsPage = () => {
  const { isPending, error, data } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
  });

  if (isPending) return <div className="text-center py-10">Loading Statistics...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Failed to load statistics: {error.message}</div>;

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <div className="py-8 px-4 md:px-0">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Blog Statistics</h1>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-3xl mx-auto">
        <StatsCard title="Total Posts" value={data.overall.totalPosts} />
        <StatsCard title="Total Views" value={data.overall.totalVisits} />
        <StatsCard title="Total Comments" value={data.overall.totalComments} />
      </div>

      {/* Top Contributors Podium */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-12 w-full max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">Top Contributors</h2>
        <div className="flex justify-center items-end gap-4">
          {data.topContributors[1] && <PodiumStep user={data.topContributors[1]} position={2} />}
          {data.topContributors[0] && <PodiumStep user={data.topContributors[0]} position={1} />}
          {data.topContributors[2] && <PodiumStep user={data.topContributors[2]} position={3} />}
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Posts per Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data.categoryBreakdown} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={100} label>
                {data.categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              {/* --- UPDATE THE LEGEND PROPS HERE --- */}
              <Legend 
                layout="vertical"
                verticalAlign="middle"
                align="right"
                formatter={formatCategoryName}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
           <h2 className="text-xl font-bold mb-4 text-gray-700">Views per Category</h2>
           <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.categoryPerformance}>
              <XAxis dataKey="_id" tickFormatter={formatCategoryName} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalVisits" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

       {/* Reading Time Stats */}
       <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">Reading Time Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
                <h3 className="text-gray-500 text-sm uppercase">Quickest Read</h3>
                {data.readingStats.shortestRead ? (
                    <Link to={`/${data.readingStats.shortestRead.slug}`} className="text-lg font-semibold text-blue-800 hover:underline">
                        {data.readingStats.shortestRead.title} ({data.readingStats.shortestRead.time} min)
                    </Link>
                ) : <p>-</p>}
            </div>
            <div>
                <h3 className="text-gray-500 text-sm uppercase">Average Read</h3>
                <p className="text-3xl font-bold">{data.readingStats.averageReadingTime} min</p>
            </div>
            <div>
                <h3 className="text-gray-500 text-sm uppercase">Longest Read</h3>
                 {data.readingStats.longestRead ? (
                    <Link to={`/${data.readingStats.longestRead.slug}`} className="text-lg font-semibold text-blue-800 hover:underline">
                        {data.readingStats.longestRead.title} ({data.readingStats.longestRead.time} min)
                    </Link>
                ) : <p>-</p>}
            </div>
        </div>
       </div>
    </div>
  );
};

export default StatsPage;