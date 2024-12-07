const Link = require("../models/LinkModel.js");
const { nanoid } = require("nanoid");

// Create a new shortened link
const createLink = async (req, res) => {
  try {
    const { originalUrl, expiresAt, user } = req.body;

    // Validate original URL
    if (!originalUrl || !/^https?:\/\/\S+$/.test(originalUrl)) {
      return res
        .status(400)
        .json({ error: "Invalid or missing original URL." });
    }

    // Validate expiration date
    if (expiresAt && new Date(expiresAt) <= new Date()) {
      return res
        .status(400)
        .json({ error: "Expiration date must be in the future." });
    }

    const shortId = nanoid(8);

    // Ensure BASE_URL is configured
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      return res.status(500).json({
        error: "Server configuration error. Missing BASE_URL.",
      });
    }

    const link = new Link({
      originalUrl,
      shortId,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      user,
    });

    await link.save();

    res.status(201).json({
      shortUrl: `${baseUrl}/${shortId}`,
      shortId,
      originalUrl,
    });
  } catch (error) {
    console.error("Error creating link:", error.stack);
    res.status(500).json({ error: "Failed to shorten URL." });
  }
};

// Redirect to the original URL
const redirectOriginal = async (req, res) => {
  const { shortId } = req.params;

  try {
    const link = await Link.findOne({ shortId });

    if (!link) {
      return res.status(404).json({ error: "Link not found." });
    }

    // Check for expiration
    if (link.expiresAt && new Date() > link.expiresAt) {
      await Link.deleteOne({ shortId }); // Clean up expired link
      return res.status(410).json({ error: "This link has expired." });
    }

    // Increment click count
    try {
      link.clickCount += 1;
      await link.save();
    } catch (updateError) {
      console.error("Failed to update click count:", updateError.stack);
    }
    return res.redirect(link.originalUrl);
  } catch (error) {
    console.error("Error during redirection:", error.stack);
    res.status(500).json({ error: "Failed to redirect." });
  }
};

// Fetch all links
const getAllLinks = async (req, res) => {
  try {
    const links = await Link.find().sort({ createdAt: -1 }); // Sort by most recent
    res.status(200).json(links);
  } catch (error) {
    console.error("Error fetching links:", error.stack);
    res.status(500).json({ error: "Failed to fetch links." });
  }
};

// Fetch analytics for a link
const getAnalytics = async (req, res) => {
  const { shortId } = req.params;

  try {
    const link = await Link.findOne({ shortId });

    if (!link) {
      return res.status(404).json({ error: "Link not found." });
    }

    res.status(200).json({
      originalUrl: link.originalUrl,
      clickCount: link.clickCount,
      createdAt: link.createdAt,
      expiresAt: link.expiresAt,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error.stack);
    res.status(500).json({ error: "Failed to fetch analytics." });
  }
};

// Delete a link
const deleteLink = async (req, res) => {
  const { shortId } = req.params;

  try {
    const link = await Link.findOneAndDelete({ shortId });

    if (!link) {
      return res.status(404).json({ error: "Link not found." });
    }

    res.status(200).json({ message: "Link deleted successfully." });
  } catch (error) {
    console.error("Error deleting link:", error.stack);
    res.status(500).json({ error: "Failed to delete link." });
  }
};

module.exports = {
  createLink,
  redirectOriginal,
  getAnalytics,
  getAllLinks,
  deleteLink,
};
