import { Scraper, SearchMode, Tweet } from "agent-twitter-client";
import { loginTwitter } from "./login.js";
import { hasRepliedToTweet, markTweetAsReplied } from "./replied-tweets.js";
import { generateTweetReply } from "./generate-reply.js";

async function getMentions(scraper: Scraper) {
  try {
    console.log("Searching for mentions...");
    const mentions = scraper.searchTweets("blaickrock", 5, SearchMode.Top);
    const unrepliedTweets: Tweet[] = [];

    // Collect tweets we haven't replied to yet
    for await (const tweet of mentions) {
      // Skip our own tweets & skip replies.
      if (tweet.username?.toLowerCase() === "blaickrock") {
        continue;
      }

      // Check if we've already replied to this tweet
      const tweetId = tweet.id;
      if (tweetId && !(await hasRepliedToTweet(tweetId))) {
        unrepliedTweets.push(tweet);
      }
    }

    console.log(`Total unreplied mentions found: ${unrepliedTweets.length}`);

    // Process the top unreplied tweet (most recent one)
    if (unrepliedTweets.length > 0) {
      const topTweet = unrepliedTweets[0];
      if (!topTweet || !topTweet.id) {
        console.log("Top tweet is invalid or missing ID");
        return unrepliedTweets;
      }

      console.log("Processing top tweet:", topTweet.text);

      try {
        const reply = await generateTweetReply(topTweet);

        console.log(`Posting reply to tweet.`);

        await postReplyToTweet(scraper, topTweet.id, reply);

        // Mark as replied
        await markTweetAsReplied(topTweet.id);
        console.log(`Marked tweet ${topTweet.id} as replied`);
      } catch (error) {
        console.error("Error generating reply:", error);
      }
    } else {
      console.log("No new mentions to reply to");
    }

    return unrepliedTweets;
  } catch (error) {
    console.error("Error fetching mentions:", error);
    throw error;
  }
}

async function postReplyToTweet(
  scraper: Scraper,
  tweetId: string,
  replyText: string
) {
  try {
    if (!(await scraper.isLoggedIn())) {
      await loginTwitter(scraper);
    }

    const response = await scraper.sendTweet(replyText, tweetId);
    console.log(`Reply posted: ${response}`);
    return response;
  } catch (error) {
    console.error("Error posting reply:", error);
    throw error;
  }
}

// Export the function for use in other modules
export default getMentions;
