import { generateText } from "ai";
import { CoreMessage } from "ai";
import { google } from "@ai-sdk/google";
import {
  twitterReplySystemPrompt,
  twitterReplyUserPrompt,
} from "../../prompt/tweetReplyPrompts.js";
import { Tweet } from "agent-twitter-client";

export async function generateTweetReply(tweet: Tweet): Promise<string> {
  try {
    const messages: CoreMessage[] = [];

    // Replace placeholder in the prompt with the actual tweet content
    const tweetContent = tweet.text || "";

    const tweetUrl = `https://x.com/${tweet.username}/status/${tweet.id}`;
    console.log(`Replying to tweet: ${tweetUrl}`);

    const userPrompt = twitterReplyUserPrompt.replace(
      "{tweetContent}",
      tweetContent
    );

    messages.push({ role: "user", content: userPrompt });

    // Use the same model as in index.ts or adjust as needed
    const replyResult = (
      await generateText({
        model: google("gemini-2.5-flash-preview-04-17"),
        messages: messages,
        system: twitterReplySystemPrompt,
      })
    ).text;

    console.log(replyResult);

    return replyResult;
  } catch (error) {
    console.error("Error generating reply:", error);
    throw error;
  }
}
