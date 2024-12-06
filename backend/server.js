const app = require("./app.js");
const dbConnect = require("./utils/dbConnect.js");

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await dbConnect(); // Establish database connection
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to the database:", err.message);
    process.exit(1); // Exit with failure status code if database connection fails
  }
})();
