import React, { useState } from "react";
import axios from "axios";

const Home = () => {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateUrl = (url) => {
    // Enhanced URL validation
    const urlPattern =
      /^(https?:\/\/)?([\w\-]+\.)+[\w]{2,}(\/[\w\-./?%&=]*)?$/i;
    return urlPattern.test(url);
  };

  const handleShorten = async () => {
    setError(""); // Clear previous error

    if (!validateUrl(longUrl)) {
      setError("Please enter a valid URL.");
      return;
    }

    if (expiresAt && new Date(expiresAt) <= new Date()) {
      setError("Expiration date must be in the future.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:3000/api/links/shorten", {
        originalUrl: longUrl,
        expiresAt: expiresAt || null,
      });
      setShortUrl(res.data.shortUrl);
      setError(""); // Clear any error after success
    } catch (err) {
      setError("Failed to shorten URL. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    alert("Shortened URL copied to clipboard!");
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center text-indigo-600">
        Shorten URL
      </h2>
      <div className="space-y-4 mt-6">
        <input
          type="text"
          placeholder="Enter URL"
          value={longUrl}
          onChange={(e) => {
            setLongUrl(e.target.value);
            setError(""); // Clear error when user types
          }}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => {
            setExpiresAt(e.target.value);
            setError(""); // Clear error when user sets a valid date
          }}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
        <button
          disabled={loading}
          onClick={handleShorten}
          className={`w-full text-white font-bold py-2 rounded-lg ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Shortening..." : "Shorten URL"}
        </button>
        {error && <p className="text-red-500">{error}</p>}
        {shortUrl && (
          <div className="text-green-500 break-all">
            <p>
              Shortened URL:{" "}
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-indigo-600"
              >
                {shortUrl}
              </a>
            </p>
            <button
              onClick={handleCopyToClipboard}
              className="mt-2 bg-indigo-600 text-white px-4 py-1 rounded-lg hover:bg-indigo-700"
            >
              Copy to Clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;