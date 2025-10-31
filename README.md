# 🌍 Chemotronix – Smart Contracts for Sustainable Energy (DLT Operations for Carbon Credits: Hedera Hackathon)
## Project Overview 
Chemotronix is building decentralized clean energy solutions using Hedera’s smart contracts. Our submission demonstrates how renewable energy transactions, carbon credits, and energy-sharing agreements can be securely managed on the Hedera network, ensuring transparency, traceability, and low-cost operations. We believe the future of clean energy depends on trustless systems that guarantee fairness, accountability, and efficiency values that Hedera makes possible. This project aims to create a smart carbon credit dashboard and utilizes AI/ML models to extract valuable insights. The project provides policymakers, NGOs, and other stakeholders with a platform to simulate interventions and assess their potential impact on the community as we build future cities. Chek out our website at www.chemotronix.org, https://youtu.be/e0aQW13iF_4

## Problem Statement
Energy access in emerging markets faces challenges:\
i) Lack of transparent energy trading between producers and consumers.\
ii) High transaction costs for carbon credits and offtake agreements.\
iii) Limited trust in reporting and verification of clean energy impact.

## Our Solution
Chemotronix leverages Hedera smart contracts to:\
i) Enable peer-to-peer renewable energy trading between producers and consumers.\
ii) Automate Power Purchase Agreements (PPAs) and Offtake Agreements.\
iii) Issue digital carbon credits with embedded Monitoring, Reporting, and Verification (MRV).\
iv) Ensure auditable, immutable records of all transactions on Hedera.  \
This creates a scalable Energy + MRV + Carbon Credit ecosystem for both rural and urban communities.This project addresses this issue by enabling individuals and organizations offset their carbon footprint.

## Tech Stack
i) Smart Contracts: Solidity on Hedera (Primary programming language for smart contract development).\
IPFS Decentralized storage for digital certificates\
ii) Blockchain Network: Hedera Hashgraph (Testnet)\
iii) Frontend: React.js + TailwindCSS\
iv) Backend: Node.js / Express\
v) Wallet Integration: HashConnect / Hedera SDK\
vi) Data Storage: IPFS + Hedera File Service (HFS)

### How It Works
a) Energy Producer Registers: Farmers, mini-grid operators, or solar users register their energy capacity.
b) Smart Contract Deployment: Hedera smart contracts create binding agreements.
c) Consumer Purchases Energy: Payments are executed via $HBAR or tokenized credits.
d) Carbon Credit Issuance: Verified emissions reductions are minted as Hedera tokens.
e) Immutable Record: Transactions and impact data are permanently stored on Hedera.

### Architecture
[Producer/Consumer Wallets]  →  [Frontend DApp]  →  [Backend API]  →  [Hedera Smart Contracts]  →  [Hedera Consensus Service + HFS]
A) Use Cases: Peer-to-Peer Clean Energy Trading, Transparent PPAs for Mini-Grids, Community Carbon Credit Markets, MRV-integrated Smart Contracts for Sustainable Development

📂 Repository Structure \
/contracts   → Solidity smart contracts for Hedera \
/frontend    → React app for interaction \
/backend     → Node.js server & APIs \
/docs        → Whitepaper, hackathon notes \
▶️ Getting Started \
Prerequisites \
Node.js v18+ \
Hedera SDK \
HashConnect wallet \
Installation 
# Clone repo
git clone https://github.com/chemotronix/Hedera-Hackathon \
cd Hedera-Hackathon
# Install dependencies
npm install
# Run frontend
cd frontend && npm start \
Deploy Smart Contracts \
cd contracts \
npx hardhat compile \
npx hardhat run scripts/deploy.js --network testnet \

🎥 Demo \
Video Walkthrough: https://youtu.be/LXgWDnsYPCE?si=byTckj7bBRa36GoQ\
Pitch deck: https://drive.google.com/file/d/1JwD2G79tbcAOl4KBsIxXK0Ae0D4WbHcf/view?usp=sharing

# 👥 Team Chemotronix
1. Peace Bello – CEO, Clean Energy Systems & MRV Lead
2. Oreoluwa Akinola - Smart Contract Engineer
3. Joshua Akintemi - Full Stack Engineer

Acknowledgments :Special thanks to Hedera Hackathon organizers, mentors, and community for support.


## Future Work
i) Data Integration: Combining satellite imagery, GIS data (if available), and potentially smart payment data. \
ii) 3D Representation: (Future Enhancement) Building a 3D model of the slum, including informal structures, utilities, and environmental features. Currently focuses on GIS layers. \
iii) AI/ML Insights: Utilizing AI/ML to extract information from satellite imagery (e.g., object detection, land use classification, population density estimation) \
iv) Simulation Capabilities: Allowing users to simulate interventions (e.g., adding solar panels, improving sanitation, providing access to clean water) and visualize the results using GeoPandas: For geospatial data manipulation and analysis, Scikit-learn: For machine learning models, TensorFlow/Keras: For deep learning (object detection), OpenCV (cv2): For image processing, QGIS: For data digitization and visualization), Unity3D or CesiumJS: Visualization platform.\ 

Currently this project focuses on the data processing and AI/ML backend, the visualization component is for future work.
