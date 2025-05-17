import { Scraper, Tweet } from "agent-twitter-client";
import "dotenv/config";
import { loginTwitter } from "./login.js";

export default async function getPreviousTweets(scraper: Scraper) {
  const userId = await scraper.getUserIdByScreenName(
    process.env.TWITTER_USERNAME!
  );
  const tweets = scraper.getTweetsByUserId(userId, 10);

  const previousTweets: Tweet[] = [];

  // Collect tweets we haven't replied to yet
  for await (const tweet of tweets) {
    previousTweets.push(tweet);
  }

  const formattedTweets = await formatTweetsForPrompt(previousTweets);

  console.log(formattedTweets);

  return formattedTweets;
}

async function formatTweetsForPrompt(tweets: Tweet[]) {
  return tweets
    .filter((tweet) => !tweet.text?.startsWith("https://t.co"))
    .map((tweet) => `<tweet>${tweet.text}</tweet>`)
    .join("\n");
}

async function main() {
  const scraper = new Scraper();
  await loginTwitter(scraper);
  await getPreviousTweets(scraper);
}

main();
