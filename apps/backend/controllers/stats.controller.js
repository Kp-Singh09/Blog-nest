import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";



const calculateReadingTime = (content) => {
    if (!content) return 0;
    const text = content.replace(/<[^>]*>/g, ""); // Strip HTML tags
    const words = text.split(/\s+/).filter(Boolean); // Split by whitespace and remove empty strings
    const wordCount = words.length;
    const wpm = 225; // Average words per minute
    return Math.ceil(wordCount / wpm);
  };

export const getStats = async (req, res) => {
  try {
    // Run all database queries in parallel for efficiency
    const [
      totalPosts,
      totalComments,
      totalVisitsResult,
      categoryPostCounts,
      categoryVisitCounts,
      postsByUser,
      allPostsForReadingTime,
      commentsReceivedByUser,
    ] = await Promise.all([
      Post.countDocuments(),
      Comment.countDocuments(),
      Post.aggregate([{ $group: { _id: null, total: { $sum: "$visit" } } }]),
      Post.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
      Post.aggregate([{ $group: { _id: "$category", totalVisits: { $sum: "$visit" } } }]),
      Post.aggregate([{ $group: { _id: "$user", postCount: { $sum: 1 }, totalVisits: { $sum: "$visit" } } }]),
      Comment.aggregate([
        { $lookup: { from: "posts", localField: "post", foreignField: "_id", as: "post" } },
        { $unwind: "$post" },
        { $group: { _id: "$post.user", commentCount: { $sum: 1 } } },
      ]),
      Post.find().select("title slug content"),
    ]);

    // Calculate Top Contributors
    const userStats = {};
    postsByUser.forEach(stat => {
        userStats[stat._id] = { postCount: stat.postCount, totalVisits: stat.totalVisits, commentCount: 0 };
    });
    commentsReceivedByUser.forEach(stat => {
        if (userStats[stat._id]) {
            userStats[stat._id].commentCount = stat.commentCount;
        }
    });

    const userIds = Object.keys(userStats);
    const users = await User.find({ _id: { $in: userIds } }).select("username img");

    const topContributors = users.map(user => {
      const stats = userStats[user._id];
      const score = (stats.postCount * 25) + (stats.totalVisits * 1) + (stats.commentCount * 10);
      return {
        username: user.username,
        img: user.img,
        score,
      };
    }).sort((a, b) => b.score - a.score).slice(0, 3);


    // --- NEW: Reading Time Calculation ---
    const postsWithReadingTime = allPostsForReadingTime.map(post => ({
      ...post.toObject(),
      readingTime: calculateReadingTime(post.content),
    }));

    postsWithReadingTime.sort((a, b) => a.readingTime - b.readingTime);
    
    const shortestRead = postsWithReadingTime.length > 0 ? { title: postsWithReadingTime[0].title, slug: postsWithReadingTime[0].slug, time: postsWithReadingTime[0].readingTime } : null;
    const longestRead = postsWithReadingTime.length > 0 ? { title: postsWithReadingTime[postsWithReadingTime.length - 1].title, slug: postsWithReadingTime[postsWithReadingTime.length - 1].slug, time: postsWithReadingTime[postsWithReadingTime.length - 1].readingTime } : null;

    const totalReadingTime = postsWithReadingTime.reduce((sum, post) => sum + post.readingTime, 0);
    const averageReadingTime = totalPosts > 0 ? Math.round(totalReadingTime / totalPosts) : 0;


    // Format final response
    res.status(200).json({
      overall: {
        totalPosts,
        totalComments,
        totalVisits: totalVisitsResult[0]?.total || 0,
      },
      topContributors,
      categoryBreakdown: categoryPostCounts,
      categoryPerformance: categoryVisitCounts,
      // --- ADD NEW READING TIME STATS ---
      readingStats: {
        shortestRead,
        longestRead,
        averageReadingTime,
      }
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Failed to fetch stats." });
  }
};