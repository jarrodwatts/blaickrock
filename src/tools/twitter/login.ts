import { Scraper } from "agent-twitter-client";
import "dotenv/config";

export async function loginTwitter(scraper?: Scraper) {
  if (!scraper) {
    scraper = new Scraper();
  }

  try {
    // Check if we're already logged in
    if (await scraper.isLoggedIn()) {
      console.log("Already logged in.");
      return scraper;
    }

    // If not logged in, try to login with credentials
    if (
      !process.env.TWITTER_USERNAME ||
      !process.env.TWITTER_PASSWORD ||
      !process.env.TWITTER_EMAIL
    ) {
      throw new Error("Twitter credentials not found in environment variables");
    }

    console.log("Logging in with credentials...");
    await scraper.login(
      process.env.TWITTER_USERNAME,
      process.env.TWITTER_PASSWORD,
      process.env.TWITTER_EMAIL,
      process.env.TWITTER_2FA_SECRET
    );

    return scraper;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}
