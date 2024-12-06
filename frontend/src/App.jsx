import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Home from "./pages/Home";
import Links from "./pages/Links";
import Analytics from "./pages/Analytics";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-indigo-600 text-white p-4">
          <nav className="max-w-6xl mx-auto flex justify-between">
            <div className="flex justify-center items-center gap-3">
            <img src="/logo.png" alt=""
            className="size-7 w-full"
            />
            <h1 className="text-2xl font-bold">
              <Link to="/">SnapLink</Link>
            </h1>
            </div>
      
            <div className="space-x-4">
              <Link to="/" className="hover:text-gray-200">
                Home
              </Link>
              <Link to="/links" className="hover:text-gray-200">
                Links
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/links" element={<Links />} />
            <Route path="/analytics/:shortId" element={<Analytics />} />
          </Routes>
        </main>
        <footer className="bg-gray-800 text-white text-center py-4">
          &copy; 2024 SnapLink. All rights reserved.
        </footer>
      </div>
    </Router>
  );
};

export default App;
