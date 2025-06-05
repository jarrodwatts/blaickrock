import { generateText } from "ai";
import dotenv from "dotenv";
import { mkdir } from "fs/promises";
import { join } from "path";
import { CoreMessage } from "ai";
import { google } from "@ai-sdk/google";
import createUserPrompt, { systemPrompt } from "./prompt/prompts.js";
import {
  twitterSystemPrompt,
  twitterUserPrompt,
} from "./prompt/twitterPrompts.js";
import {
  executorSystemPrompt,
  executorUserPrompt,
} from "./prompt/executorPrompts.js";
import postTweet from "./tools/twitter/post-tweet.js";
import { executeSwapTool } from "./tools/execute-swap.js";
import { Scraper } from "agent-twitter-client";
import { loginTwitter } from "./tools/twitter/login.js";
import getPreviousTweets from "./tools/twitter/get-previous-tweets.js";
import { openai } from "@ai-sdk/openai";

dotenv.config();

// Ensure logs directory exists
await mkdir(join(process.cwd(), "logs"), { recursive: true });

const messages: CoreMessage[] = [];
const executorMessages: CoreMessage[] = [];
const twitterMessages: CoreMessage[] = [];

async function processTradeDecisionToExecution(
  tradeDecision: string
): Promise<string> {
  try {
    executorMessages.push({ role: "system", content: executorSystemPrompt });
    executorMessages.push({
      role: "user",
      content: `${executorUserPrompt}
${tradeDecision}
`,
    });

    const executorResult = (
      await generateText({
        model: google("gemini-2.5-pro-preview-05-06"),
        messages: executorMessages,
        tools: {
          executeSwapTool,
        },
        maxSteps: 3,
      })
    ).text;

    return executorResult;
  } catch (error) {
    console.error("Error processing trade decision:", error);
    return tradeDecision;
  }
}

async function processTradeDecisionToTweet(
  scraper: Scraper,
  tradeDecision: string
): Promise<string> {
  try {
    const previousTweets = await getPreviousTweets(scraper);

    twitterMessages.push({ role: "system", content: twitterSystemPrompt });
    twitterMessages.push({
      role: "user",
      content: `<trade_decision>
${tradeDecision}
</trade_decision>

<previous_tweets>
${previousTweets}
</previous_tweets>

<instruction>
Avoid repeating similar phrases, openings, or structures from your previous tweets. Use the context and variation guide to create something fresh while maintaining your personality.
</instruction>

Your Tweet:`,
    });

    const tweetResult = (
      await generateText({
        // model: google("gemini-2.5-pro-preview-05-06"),
        model: openai("gpt-4.1"),
        messages: twitterMessages,
      })
    ).text;

    process.stdout.write(tweetResult);
    let tweetContent = tweetResult;

    console.log("\nTweet generated:");
    console.log(tweetContent);

    return tweetContent;
  } catch (error) {
    console.error("Error generating tweet:", error);
    return "Error generating tweet";
  }
}

async function main() {
  try {
    // Connect to twitter
    const scraper = await loginTwitter(new Scraper());

    // Fetch info from Abstract portal API for the analyst agent to use as context
    const currentStatePrompt = await createUserPrompt();
    messages.push({ role: "user", content: currentStatePrompt });

    const analystResponse = (
      await generateText({
        system: systemPrompt,
        // model: google("gemini-2.5-pro-preview-05-06"),
        model: openai("gpt-4.1"),
        messages,
      })
    ).text;

    process.stdout.write(analystResponse);
    process.stdout.write("\n\n");

    messages.push({ role: "assistant", content: analystResponse });

    // Step 2: Process the trade decision through the executor agent
    let executionResult: string | null = null;
    try {
      // executionResult = await processTradeDecisionToExecution(analystResponse);
      // executionResult += `\n\nBlaickrock.`;
    } catch (error) {
      console.error("Error processing trade decision:", error);
      executionResult = null;
    }

    // if (
    //   executionResult?.includes("CANNOT_EXECUTE") ||
    //   !executionResult?.startsWith("0x")
    // ) {
    //   console.log("Cannot execute trade decision");
    //   executionResult = null;
    // }

    // Step 3: Generate tweet based on trade decision and execution result
    const tweet = await processTradeDecisionToTweet(scraper, analystResponse);

    // await postTweet(scraper, tweet, executionResult as `0x${string}` | null);
  } catch (error) {
    console.error("Error in main loop:", error);
  }
}

// Run main function if this is the entry point
main().catch((error) => {
  console.error("Fatal error in main process:", error);
  if (error instanceof Error) {
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
  }
  process.exit(1); // Exit with error code
});
