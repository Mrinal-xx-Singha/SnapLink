const dotenv = require("dotenv");

module.exports = () => {
  dotenv.config();

  if (!process.env.BASE_URL || !process.env.MONGO_URI) {
    console.error("Missing essential environment variables in .env file");
    process.exit(1);
  }
};
