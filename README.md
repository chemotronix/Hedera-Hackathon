<!-- # Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/c814878e-542a-430f-9992-be23bf781525

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c814878e-542a-430f-9992-be23bf781525) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c814878e-542a-430f-9992-be23bf781525) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain) -->

# 🌍 Chemotronix – Smart Contracts for Sustainable Energy (Hedera Hackathon Submission)
🚀 Project Overview
Chemotronix is building decentralized clean energy solutions using Hedera’s smart contracts.
Our submission demonstrates how renewable energy transactions, carbon credits, and energy-sharing agreements can be securely managed on the Hedera network, ensuring transparency, traceability, and low-cost operations.

We believe the future of clean energy depends on trustless systems that guarantee fairness, accountability, and efficiency—values that Hedera makes possible.

❓ Problem Statement
Energy access in emerging markets faces challenges:

Lack of transparent energy trading between producers and consumers.

High transaction costs for carbon credits and offtake agreements.

Limited trust in reporting and verification of clean energy impact.

💡 Our Solution
Chemotronix leverages Hedera smart contracts to:

Enable peer-to-peer renewable energy trading between producers and consumers.

Automate Power Purchase Agreements (PPAs) and Offtake Agreements.

Issue digital carbon credits with embedded Monitoring, Reporting, and Verification (MRV).

Ensure auditable, immutable records of all transactions on Hedera.

This creates a scalable Energy + MRV + Carbon Credit ecosystem for both rural and urban communities.

🛠️ Tech Stack
Smart Contracts: Solidity on Hedera

Blockchain Network: Hedera Hashgraph (Testnet)

Frontend: React.js + TailwindCSS

Backend: Node.js / Express

Wallet Integration: HashConnect / Hedera SDK

Data Storage: IPFS + Hedera File Service (HFS)

⚙️ How It Works
Energy Producer Registers: Farmers, mini-grid operators, or solar users register their energy capacity.

Smart Contract Deployment: Hedera smart contracts create binding agreements.

Consumer Purchases Energy: Payments are executed via $HBAR or tokenized credits.

Carbon Credit Issuance: Verified emissions reductions are minted as Hedera tokens.

Immutable Record: Transactions and impact data are permanently stored on Hedera.

📊 Architecture
[Producer/Consumer Wallets]  →  [Frontend DApp]  →  [Backend API]  →  [Hedera Smart Contracts]  →  [Hedera Consensus Service + HFS]
🌱 Use Cases
Peer-to-Peer Clean Energy Trading

Transparent PPAs for Mini-Grids

Community Carbon Credit Markets

MRV-integrated Smart Contracts for Sustainable Development

📂 Repository Structure
/contracts   → Solidity smart contracts for Hedera
/frontend    → React app for interaction
/backend     → Node.js server & APIs
/docs        → Whitepaper, hackathon notes
▶️ Getting Started
Prerequisites
Node.js v18+

Hedera SDK

HashConnect wallet

Installation
# Clone repo
git clone https://github.com/Chemotronix/hedera-smartcontracts.git
cd hedera-smartcontracts

# Install dependencies
npm install

# Run frontend
cd frontend && npm start
Deploy Smart Contracts
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network testnet
🎥 Demo
Video Walkthrough (YouTube link)

Live DApp (Testnet link)

👥 Team Chemotronix
Peace Bello – CEO, Clean Energy Systems & MRV Lead

[Add team members with roles]

🙌 Acknowledgments
Special thanks to Hedera Hackathon organizers, mentors, and community for support.