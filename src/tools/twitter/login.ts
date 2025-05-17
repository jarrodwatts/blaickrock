import { Scraper } from "agent-twitter-client";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { Cookie } from "tough-cookie";

const COOKIES_PATH = path.join(process.cwd(), "twitter-cookies.json");

export async function loginTwitter(scraper?: Scraper) {
  if (!scraper) {
    scraper = new Scraper();
  }

  try {
    // First try to login with saved cookies
    if (await tryLoginWithCookies(scraper)) {
      console.log("Logged in successfully with saved cookies.");
      return scraper;
    }

    // If cookie login fails, try to login with credentials
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

    // Check if login was successful
    if (await scraper.isLoggedIn()) {
      // Save cookies for next time
      await saveCookies(scraper);
      console.log("Login successful, cookies saved.");
      return scraper;
    } else {
      throw new Error("Login failed with credentials");
    }
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}

async function tryLoginWithCookies(scraper: Scraper): Promise<boolean> {
  try {
    if (!fs.existsSync(COOKIES_PATH)) {
      console.log("No saved cookies found.");
      return false;
    }

    console.log("Attempting to login with saved cookies...");
    const cookiesRaw = fs.readFileSync(COOKIES_PATH, "utf-8");
    const cookiesJson = JSON.parse(cookiesRaw);

    // Convert JSON to Cookie objects
    const cookies = cookiesJson.reduce((acc: Cookie[], current: any) => {
      const cookie = Cookie.fromJSON(current);
      if (cookie) acc.push(cookie);
      return acc;
    }, []);

    // Set cookies in the scraper
    await scraper.setCookies(cookies);

    // Verify login was successful
    return await scraper.isLoggedIn();
  } catch (error) {
    console.log("Error logging in with cookies:", error);
    return false;
  }
}

async function saveCookies(scraper: Scraper): Promise<void> {
  try {
    const cookies = await scraper.getCookies();
    fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies));
  } catch (error) {
    console.error("Failed to save cookies:", error);
  }
}
