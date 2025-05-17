import { exec } from "child_process";
import { promisify } from "util";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const execPromise = promisify(exec);

// Configuration for timing (in minutes)
const PORTFOLIO_UPDATE_MIN_INTERVAL = 45;
const PORTFOLIO_UPDATE_MAX_INTERVAL = 90;
const MENTION_CHECK_MIN_INTERVAL = 5;
const MENTION_CHECK_MAX_INTERVAL = 15;

// Get random time in milliseconds between min and max minutes
function getRandomInterval(minMinutes: number, maxMinutes: number): number {
  const minMs = minMinutes * 60 * 1000;
  const maxMs = maxMinutes * 60 * 1000;
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

// Format time for logging
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// Run portfolio update process (index.ts)
async function runPortfolioUpdate() {
  console.log(`[${formatTime(new Date())}] Running portfolio update...`);
  try {
    const { stdout, stderr } = await execPromise("node dist/index.js");
    if (stdout) console.log(`Portfolio update output: ${stdout}`);
    if (stderr) console.error(`Portfolio update error: ${stderr}`);
  } catch (error) {
    console.error("Failed to run portfolio update:", error);
  }
}

// Run mention check process (check-and-reply.ts)
async function runMentionCheck() {
  console.log(`[${formatTime(new Date())}] Checking for mentions...`);
  try {
    const { stdout, stderr } = await execPromise(
      "node dist/check-and-reply.js"
    );
    if (stdout) console.log(`Mention check output: ${stdout}`);
    if (stderr) console.error(`Mention check error: ${stderr}`);
  } catch (error) {
    console.error("Failed to run mention check:", error);
  }
}

// Schedule next portfolio update
function scheduleNextPortfolioUpdate() {
  const nextInterval = getRandomInterval(
    PORTFOLIO_UPDATE_MIN_INTERVAL,
    PORTFOLIO_UPDATE_MAX_INTERVAL
  );
  const nextTime = new Date(Date.now() + nextInterval);

  console.log(
    `Next portfolio update scheduled at: ${formatTime(
      nextTime
    )} (in ${Math.round(nextInterval / 60000)} minutes)`
  );

  setTimeout(async () => {
    await runPortfolioUpdate();
    scheduleNextPortfolioUpdate();
  }, nextInterval);
}

// Schedule next mention check
function scheduleNextMentionCheck() {
  const nextInterval = getRandomInterval(
    MENTION_CHECK_MIN_INTERVAL,
    MENTION_CHECK_MAX_INTERVAL
  );
  const nextTime = new Date(Date.now() + nextInterval);

  console.log(
    `Next mention check scheduled at: ${formatTime(nextTime)} (in ${Math.round(
      nextInterval / 60000
    )} minutes)`
  );

  setTimeout(async () => {
    await runMentionCheck();
    scheduleNextMentionCheck();
  }, nextInterval);
}

// Main function to start both processes
async function main() {
  console.log("Starting autonomous operation...");

  // Initial run of both processes
  await runPortfolioUpdate();
  await runMentionCheck();

  // Schedule next runs
  scheduleNextPortfolioUpdate();
  scheduleNextMentionCheck();

  // Keep the process alive
  setInterval(() => {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    console.log(
      `[${formatTime(
        new Date()
      )}] Bot running for ${days}d ${hours}h ${minutes}m`
    );
  }, 3600000); // Log uptime every hour
}

// Start the processes
main().catch((error) => {
  console.error("Fatal error in scheduler:", error);
  process.exit(1);
});
