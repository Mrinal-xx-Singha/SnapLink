const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { nanoid } = require("nanoid");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Validate Base URL in .env
if (!process.env.BASE_URL) {
  console.error("BASE_URL is not defined in the .env file.");
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Database connection error:", err));

// Link Schema
const LinkSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }, // Optional expiration
  clickCount: { type: Number, default: 0 },
  user: { type: String }, // Optional user field for user-specific links
});

const Link = mongoose.model("Link", LinkSchema);

// Create a new shortened link
app.post("/shorten", async (req, res) => {
  try {
    const { originalUrl, expiresAt, user } = req.body;
    const MAX_URL_LENGTH = 2048;

    // Validate URL
    const urlRegex = /^(http|https):\/\/[^ "]+$/;
    if (!urlRegex.test(originalUrl)) {
      return res.status(400).json({ error: "Invalid URL format" });
    }
    if (originalUrl.length > MAX_URL_LENGTH) {
      return res.status(400).json({ error: "URL too long" });
    }

    // Validate expiration date if provided
    if (expiresAt) {
      const parsedExpiresAt = new Date(expiresAt);
      if (isNaN(parsedExpiresAt.getTime()) || parsedExpiresAt <= new Date()) {
        return res.status(400).json({ error: "Invalid expiration date" });
      }
    }

    const shortId = nanoid(8);
    const link = new Link({ originalUrl, shortId, expiresAt, user });
    await link.save();

    res.json({
      shortUrl: `${process.env.BASE_URL}/${shortId}`,
      shortId,
      originalUrl,
    });
  } catch (error) {
    console.error("Error creating shortened link:", error);
    res.status(500).json({ error: "Failed to shorten URL. Please try again." });
  }
});

// Redirect to the original URL
app.get("/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;
    const link = await Link.findOne({ shortId });

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    // Check if link is expired
    if (link.expiresAt && new Date() > link.expiresAt) {
      await Link.deleteOne({ shortId }); // Optionally delete expired link
      return res.status(410).json({ error: "Link has expired" });
    }

    // Increment click count
    link.clickCount += 1;
    await link.save();

    res.redirect(link.originalUrl);
  } catch (error) {
    console.error("Error redirecting to original URL:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch all links
app.get("/links", async (req, res) => {
  try {
    const links = await Link.find();
    res.json(links);
  } catch (error) {
    console.error("Error fetching links:", error);
    res.status(500).json({ error: "Failed to fetch links. Please try again." });
  }
});

// Fetch analytics for a link
app.get("/analytics/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;
    const link = await Link.findOne({ shortId });

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }
    res.json({
      originalUrl: link.originalUrl,
      shortId: link.shortId,
      createdAt: link.createdAt,
      expiresAt: link.expiresAt,
      clickCount: link.clickCount,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch analytics. Please try again." });
  }
});

// Delete a link
app.delete("/delete/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;
    const link = await Link.findOneAndDelete({ shortId });

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    res.json({ message: "Link deleted successfully" });
  } catch (error) {
    console.error("Error deleting link:", error);
    res
      .status(500)
      .json({ error: "Failed to delete the link. Please try again." });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
