import { Scraper } from "agent-twitter-client";
import getMentions from "./tools/twitter/get-mentions.js";
import dotenv from "dotenv";
import { loginTwitter } from "./tools/twitter/login.js";

// Load environment variables
dotenv.config();

async function main() {
  console.log("Starting mention check and reply process...");

  try {
    const scraper = await loginTwitter(new Scraper());
    await getMentions(scraper);
    console.log("Process completed successfully");
  } catch (error) {
    console.error("Error in check-and-reply process:", error);
  }
}

// Run main function if this is the entry point
main().catch((error) => {
  console.error("Fatal error in main process:", error);
  process.exit(1); // Exit with error code
});
