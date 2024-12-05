import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [links, setLinks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle URL shortening
  const handleShorten = async () => {
    // URL validation
    const urlPattern = /^https?:\/\/\S+/;
    if (!urlPattern.test(longUrl)) {
      setError("Please enter a valid URL");
      return;
    }

    // Expiration date validation (if any)
    if (expiresAt) {
      const selectedDate = new Date(expiresAt);
      if (selectedDate <= new Date()) {
        setError("Expiration date must be in the future");
        return;
      }
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:3000/shorten", {
        originalUrl: longUrl,
        expiresAt: expiresAt || null, // Send null if no expiration is set
      });

      setShortUrl(res.data.shortUrl);
      fetchLinks();
      setError(""); // Clear previous errors
    } catch (error) {
      setError("Failed to shorten URL. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics of a shortened link
  const fetchAnalytics = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:3000/analytics/${id}`);
      setAnalytics(res.data);
      setError(""); // Clear previous errors
    } catch (error) {
      setError("Failed to fetch analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all links
  const fetchLinks = async () => {
    try {
      const res = await axios.get("http://localhost:3000/links");
      setLinks(res.data);
    } catch (error) {
      setError("Failed to fetch links: " + error.message);
    }
  };

  // Confirm before deleting a link
  const deleteLink = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this link?");
    if (!confirmDelete) return;

    try {
      setLoading(true);
      await axios.delete(`http://localhost:3000/delete/${id}`);
      fetchLinks(); // Refresh the list after deletion
      setError(""); // Clear previous errors
    } catch (error) {
      setError("Failed to delete the link: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch links when the page loads
  useEffect(() => {
    fetchLinks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6 space-y-6">
        <h1 className="text-3xl font-bold text-indigo-600 text-center">SnapLink</h1>
        <p className="text-gray-600 text-center">Shorten, Manage, and Track Your Links</p>

        <div className="space-y-4">
          {/* Input fields for URL and expiration */}
          <input
            type="text"
            placeholder="Enter URL"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleShorten}
            className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700"
            disabled={loading}
          >
            {loading ? "Shortening..." : "Shorten URL"}
          </button>

          {/* Error message */}
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        </div>

        {/* Display shortened URL */}
        {shortUrl && (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg">
            <p>Your Shortened URL:</p>
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 break-all"
            >
              {shortUrl}
            </a>
          </div>
        )}

        {/* Display link analytics */}
        {analytics && (
          <div className="mt-4 bg-gray-50 p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold">Analytics</h2>
            <p>Original URL: {analytics.originalUrl}</p>
            <p>Clicks: {analytics.clickCount}</p>
            <p>Created At: {new Date(analytics.createdAt).toLocaleString()}</p>
            {analytics.expiresAt && (
              <p>Expires At: {new Date(analytics.expiresAt).toLocaleString()}</p>
            )}
          </div>
        )}
      </div>

      <div className="w-full max-w-2xl mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Links</h2>
        {links.length > 0 ? (
          <ul className="space-y-4">
            {links.map((link) => (
              <li key={link.shortId} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg shadow-md">
                <div>
                  <p className="text-gray-800 font-semibold break-all truncate">{link.originalUrl}</p>
                  <a
                    href={`http://localhost:3000/${link.shortId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 break-all"
                  >
                    {link.shortId}
                  </a>
                </div>
                <div className="flex mt-2 sm:mt-0">
                  <button
                    onClick={() => deleteLink(link.shortId)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => fetchAnalytics(link.shortId)}
                    className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    View Analytics
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 text-center">No links available. Create your first short link!</p>
        )}
      </div>
    </div>
  );
};

export default App;
