# 📝 BlogNest

BlogNest is a full-stack blogging platform where users can write, publish, update, delete, and explore blogs. It features user authentication, a beautiful UI, and a clean, responsive layout.

## 🚀 Features

- ✍️ **Write Blogs** – Create and share your thoughts with the world.
- 📚 **Read Blogs** – Explore blogs from all users, sorted by date.
- 🛠 **Update & Delete** – Modify or remove your blogs with ease.
- 🔐 **Authentication** – Secure signup/signin with token-based auth.
- 📋 **Clipboard Copy** – Copy blog content with a single click.
- 🖼️ **Responsive UI** – Fully responsive design with Tailwind CSS.
- ⏳ **Loader Component** – Beautiful loading animations using `react-loader-spinner`.

## 🧩 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Authentication**: JWT
- **Validation**: Zod schemas

## 🔧 Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/blognest.git
   cd blognest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set environment variables**
   Create a `.env` file in the root with the following:
   ```env
   VITE_BACKEND_URL=https://your-backend-api.com
   VITE_KEY=your-api-key-if-used
   ```

4. **Run the app**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```
