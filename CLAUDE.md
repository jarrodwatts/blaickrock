# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- `pnpm install` - Install dependencies
- `pnpm run build` - Compile TypeScript to dist/
- `pnpm run start` - Build and run main three-step trading flow (index.ts)
- `pnpm run dev` - Run in development mode with tsx watch
- `pnpm run check-mentions` - Run Twitter mention checking and reply logic
- `pnpm run scheduler` - Build and run autonomous scheduler
- `pnpm run daemon` - Run scheduler as background daemon with logging

## Architecture Overview

**Blaickrock** is an AI-powered crypto trading agent operating on the Abstract blockchain. It manages a portfolio through three coordinated AI agents:

### Core Agent Flow
1. **Researcher Agent** (src/index.ts) - Analyzes portfolio state and market conditions, decides on trades
2. **Executor Agent** (src/index.ts) - Executes trades via Uniswap using the execute-swap tool
3. **Twitter Agent** (src/index.ts) - Posts trade decisions and results to Twitter

### Key Components

**Entry Points:**
- `src/index.ts` - Main three-step agent flow
- `src/check-and-reply.ts` - Twitter mention monitoring and replies
- `src/scheduler.ts` - Autonomous operation scheduler

**Agent Prompts:**
- `src/prompt/prompts.ts` - Researcher agent system prompt and context builder
- `src/prompt/executorPrompts.ts` - Executor agent prompts
- `src/prompt/twitterPrompts.ts` & `src/prompt/tweetReplyPrompts.ts` - Twitter agent prompts

**Tools Architecture:**
- `src/tools/all-tools.ts` - Central tool registry with oracle, user, and game tools
- `src/tools/execute-swap.ts` - Primary tool for Uniswap trading execution
- `src/tools/abstract-oracle/` - Market data tools (ETH price, popular tokens, metadata)
- `src/tools/abstract-user/` - Portfolio analysis tools (balances, transactions, value history)
- `src/tools/twitter/` - Twitter integration (login, mentions, posting, replies)

**Core Libraries:**
- `src/lib/` - Abstract Global Wallet (AGW) client setup and wallet utilities
- `src/const/` - Blockchain constants and contract addresses

### Data Flow
1. Researcher fetches portfolio state via abstract-user tools and market data via oracle tools
2. Generates trade decision based on analysis
3. Executor receives decision and executes via execute-swap tool if viable
4. Twitter agent posts results with transaction links
5. Separate process monitors Twitter mentions for user interactions

### Technology Stack
- TypeScript with ES modules (NodeNext)
- AI SDK with OpenAI GPT-4o-mini and Google Gemini models
- Abstract Global Wallet for blockchain interactions
- Thirdweb and Viem for Web3 functionality
- agent-twitter-client for Twitter integration

### Environment Requirements
This project requires sensitive environment variables for Twitter authentication and private keys. See .env.example for required variables.