# React Flow Mind Map App

![mindmap](https://user-images.githubusercontent.com/2857535/210797861-510f0a3d-fd67-46a7-8a8d-c409cb7dbcdb.png)

This mind map app was created as an example for the blog post ["Tutorial: Build a Mind Map App with React Flow"](https://reactflow.dev/blog/mind-map-app-with-react-flow/), which has a step-by-step guide on how to build a this mindmap (for intermediate or advanced React users). [React Flow](https://reactflow.dev) is a library for creating node-based UIs.

### Features of the mindmap include
- Quickly create new nodes on drag + mouse-release
- Organize nodes by moving child notes with their parent
- Edit text in nodes
- **Customize node background and text colors**
- **Delete individual nodes**
- **Customize edge arrows** (start, end, both, none)
- **Undo/Redo** support
- **Export** your mind map to PNG or PDF

### Fullstack Authentication & Storage
- Fully functional **Node.js/Express backend** connected to MongoDB.
- User **registration and login** authentication using JWT.
- Ability to **save multiple mind maps** per user.
- A **sidebar dashboard** to quickly switch between or delete your saved mind maps.

### The tutorial covers React Flow topics including
- Using Zustand for state management
- Custom node with an input field
- Using node area as a handle
- Dynamic width and auto focus

Demo: https://react-flow-mindmap.netlify.app

## Development

We are using [Vite](https://vitejs.dev/) for the frontend development and Express for the backend.

### Installation

Before you start, you need to install the dependencies in both the root and backend directories:

```sh
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Configuration

Create a `.env` file in the root directory:
```
VITE_API_URL=http://localhost:8080
```

Create a `.env` file in the `backend` directory:
```
PORT=8080
MONGODB_URI=mongodb://127.0.0.1:27017/mindmap
JWT_SECRET=your_super_secret_key
```

### Dev Server

To run the frontend only:
```sh
npm run dev
```

**To run the full stack (Frontend + Backend simultaneously):**
```sh
npm run fullstack
```

### Build

```sh
npm run build
```
