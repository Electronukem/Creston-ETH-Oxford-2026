# Creston

A Words with Friends–style word game that rewards winners in FLR, the coin of the
Flare network. It's meant as a gentle first step into crypto for people who have
never used it: earn coins by playing a game you already know, then see them in a
simple wallet. Built at ETH Oxford 2026.

## What it does

- 15×15 board with letter values and bonus squares; tap a tile, then a square to
  place it, with shuffle and recall
- Gemini (`gemini-3-flash-preview`) checks that played words are real, writes the
  win message, and gives strategy tips
- Connects a wallet through MetaMask (`eth_requestAccounts`), or simulates one if
  MetaMask isn't installed
- Dashboard with your FLR balance and a "Flare Cash Out" screen

**Hackathon prototype:** rewards, balances and cash-out are simulated in the browser
(fixed demo rate of 1 FLR = $0.04). No on-chain transactions are sent.

## Tech

React 19, TypeScript, Vite, Google Gemini API (`@google/genai`).

## Run locally

Requires Node.js and a Gemini API key.

```bash
npm install
echo "GEMINI_API_KEY=your-key" > .env.local
npm run dev
```
