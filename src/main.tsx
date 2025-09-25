import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { ethers } from "ethers";

const getLibrary = (provider: any) => {
  return new ethers.providers.Web3Provider(provider);
};

createRoot(document.getElementById("root")!).render(
  <Web3ReactProvider getLibrary={getLibrary}>
    <App />
  </Web3ReactProvider>
);
