import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Analytics = () => {
  const { shortId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setError(""); // Reset error before fetching
        const res = await axios.get(
          `http://localhost:3000/api/links/analytics/${shortId}`
        );
        setAnalytics(res.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setError("Failed to fetch analytics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [shortId]);

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center text-indigo-600">
        Link Analytics
      </h2>
      {loading && <p className="text-gray-500 text-center mt-4">Loading...</p>}
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      {!loading && !error && analytics && (
        <div className="mt-6 flex flex-col gap-4">
          <p className="text-gray-700">
            <strong>Original URL:</strong>{" "}
            <a
              href={analytics.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 underline"
            >
              {analytics.originalUrl}
            </a>
          </p>
          <p className="text-gray-700">
            <strong>Clicks:</strong> {analytics.clickCount}
          </p>
          <p className="text-gray-700">
            <strong>Created At:</strong>{" "}
            {new Date(analytics.createdAt).toLocaleString()}
          </p>
          {analytics.expiresAt && (
            <p className="text-gray-700">
              <strong>Expires At:</strong>{" "}
              {new Date(analytics.expiresAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
      {!loading && !error && !analytics && (
        <p className="text-gray-500 text-center mt-4">
          No analytics data available for this link.
        </p>
      )}
    </div>
  );
};

export default Analytics;
