const express = require("express");
const {
  createLink,
  redirectOriginal,
  getAnalytics,
  getAllLinks,
  deleteLink,
} = require("../controllers/linkController.js");

const router = express.Router();

// Create a new shortened link
router.post("/shorten", createLink);

// Get all links
router.get("/", getAllLinks);

// Get analytics for a specific link
router.get("/analytics/:shortId", getAnalytics);

// Delete a specific link
router.delete("/delete/:shortId", deleteLink);

// Redirect to the original URL
router.get("/:shortId", redirectOriginal);

module.exports = router;
