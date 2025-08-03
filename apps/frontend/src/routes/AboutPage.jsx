import React from 'react';

const SkillBadge = ({ children }) => (
  <span className="bg-blue-100 text-blue-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded-full">
    {children}
  </span>
);

const AboutPage = () => {
  return (
    <div className="py-8 px-4 md:px-0 max-w-4xl mx-auto">
      {/* --- Section 1: Welcome to BlogNest --- */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Welcome to BlogNest</h1>
        <p className="text-lg text-gray-600">
          A place for developers to gather, learn, and grow. This is a nest for incubating new ideas, building skills with practical guides, and hatching solutions to complex problems in the world of web development.
        </p>
      </div>

      {/* --- Section 2: About the Author (Image Removed) --- */}
      <div className="bg-white p-8 rounded-xl shadow-md mb-12 text-center">
        <h2 className="text-3xl font-bold text-gray-700">Karanpreet Singh</h2>
        <p className="mt-2 text-gray-600">
          Hi, I'm a Bachelor of Technology student at Guru Tegh Bahadur Institute of Technology, specializing in AI and Data Science. I'm passionate about building efficient, full-stack applications, and this blog is one of my key projects. Here, I document my journey and explore practical solutions for everything from backend architecture to frontend experiences.
        </p>
      </div>

      {/* --- Section 3: Technical Skills --- */}
      <div className="bg-white p-8 rounded-xl shadow-md mb-12">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">My Tech Stack</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-600 mb-2">Languages</h3>
            <div className="flex flex-wrap gap-2">
              <SkillBadge>JavaScript</SkillBadge>
              <SkillBadge>TypeScript</SkillBadge>
              <SkillBadge>HTML</SkillBadge>
              <SkillBadge>CSS</SkillBadge>
              <SkillBadge>Java</SkillBadge>
              <SkillBadge>C++</SkillBadge>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-600 mb-2">Frontend</h3>
            <div className="flex flex-wrap gap-2">
              <SkillBadge>React.js</SkillBadge>
              <SkillBadge>Next.js</SkillBadge>
              <SkillBadge>Tailwind CSS</SkillBadge>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-600 mb-2">Backend & Databases</h3>
            <div className="flex flex-wrap gap-2">
              <SkillBadge>Node.js</SkillBadge>
              <SkillBadge>Express.js</SkillBadge>
              <SkillBadge>Mongoose</SkillBadge>
              <SkillBadge>Prisma ORM</SkillBadge>
              <SkillBadge>MongoDB</SkillBadge>
              <SkillBadge>PostgreSQL</SkillBadge>
            </div>
          </div>
        </div>
      </div>

      {/* --- Section 4: Join the Conversation --- */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Join the Conversation</h2>
        <p className="text-lg text-gray-600 mb-6">
          This blog is a space for learning and collaboration. If you find an article helpful or have a question, feel free to leave a comment. You can also find my other projects on GitHub or connect with me on LinkedIn.
        </p>
        <div className="flex justify-center gap-4">
          <a href="https://github.com/Kp-Singh09" className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/kp-singh-/" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors">
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;