import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Links = () => {
  const [links, setLinks] = useState([]);
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all links
  const fetchLinks = async () => {
    try {
      setErrors(""); // Clear previous errors
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/links");
      setLinks(res.data);
    } catch (error) {
      console.error("Error fetching links:", error);
      setErrors("Failed to fetch links. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Delete a link by ID
  const deleteLink = async (id) => {
    if (!window.confirm("Are you sure you want to delete this link?")) return;

    try {
      setErrors(""); // Clear previous errors
      setLoading(true);
      await axios.delete(`http://localhost:3000/api/links/delete/${id}`);
      fetchLinks(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting link:", error);
      setErrors("Failed to delete the link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 rounded-lg shadow-lg bg-gray-100">
      <h2 className="text-3xl font-bold text-center text-indigo-600">
        Manage Links
      </h2>
      {errors && <p className="text-red-600 mt-4 text-center">{errors}</p>}
      {loading && <p className="text-gray-500 text-center">Loading...</p>}

      {/* Link list */}
      <ul className="space-y-6 mt-6">
        {links.length > 0 ? (
          links.map((link) => (
            <li
              key={link.shortId}
              className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-md"
            >
              <div className="flex-1 text-center md:text-left">
                {/* Original URL */}
                <p className="text-indigo-600 font-medium truncate">
                  Original Link:{" "}
                  <a
                    href={link.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {/* {link.originalUrl} */}
                  </a>
                </p>

                {/* Shortened Link */}
                <p className="text-gray-700 mt-2">
                  Shortened Link:{" "}
                  <Link
                    to={`/analytics/${link.shortId}`}
                    className="text-indigo-500 underline break-words"
                  >
                    {link.shortUrl}
                  </Link>
                </p>
              </div>

              {/* Delete button */}
              <button
                onClick={() => deleteLink(link.shortId)}
                disabled={loading}
                className={`mt-4 md:mt-0 px-4 py-2 rounded-lg text-white ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-700"
                }`}
              >
                Delete
              </button>
            </li>
          ))
        ) : (
          <p className="text-gray-500 text-center mt-6">
            No links available. Create some to get started!
          </p>
        )}
      </ul>
    </div>
  );
};

export default Links;
