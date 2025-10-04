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
git clone https://github.com/chemotronix/Hedera-Hackathon
cd Hedera-Hackathon


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

Oreoluwa Akinola - Smart Contract Engineer

Joshua Akintemi - Full Stack Engineer

🙌 Acknowledgments
Special thanks to Hedera Hackathon organizers, mentors, and community for support.