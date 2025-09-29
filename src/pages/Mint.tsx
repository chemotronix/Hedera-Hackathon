import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Coins,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { abi } from "../constants/abi";
import { ethers } from "ethers";

// Interface for minting history item
interface MintHistoryItem {
  amount: string;
  project: string;
  txHash: string;
  status: "confirmed" | "pending";
  time: string;
  blockNumber: number;
  projectId: string;
}

const Mint = () => {
  const [mintAmount, setMintAmount] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Wallet connection states
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasMetamask, setHasMetamask] = useState(false);

  // Minting history from blockchain
  const [mintingHistory, setMintingHistory] = useState<MintHistoryItem[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const contractAddress = "0x682dc0bb02e7f985fe6861a5693d2dbd405f396e";

  const availableProjects = [
    {
      id: "project1",
      name: "Solar",
      available: 850,
      rate: "1:1",
    },
    {
      id: "project2",
      name: "Solar Farm Alpha",
      available: 850,
      rate: "1:1",
    },
    {
      id: "project3",
      name: "Forest Conservation",
      available: 1450,
      rate: "1:1",
    },
  ];

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffInMinutes = Math.floor((now - timestamp * 1000) / (1000 * 60));

    if (diffInMinutes < 1) {
      return "less than a minute ago";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
  };

  const getProjectName = (projectId: string) => {
    const project = availableProjects.find((p) => p.id === projectId);
    return project ? project.name : projectId;
  };

  // Fetch minting history from blockchain events
  const fetchMintingHistory = async () => {
    if (!provider || !account) return;

    setIsLoadingHistory(true);
    setHistoryError(null);

    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      // Get current block number
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 50000);

      console.log(
        `Querying minting events from block ${fromBlock} to ${currentBlock}`
      );

      let mintEvents = [];

      try {
        // Query creditsMinted events for the current user
        const mintFilter = contract.filters.creditsMinted(account);
        mintEvents = await contract.queryFilter(
          mintFilter,
          fromBlock,
          currentBlock
        );
        console.log(`Found ${mintEvents.length} minting events`);
      } catch (error) {
        console.log(
          "Error with filtered query, trying alternative approach:",
          error
        );

        // Fallback: Query all mint events and filter client-side
        try {
          const allMintFilter = contract.filters.creditsMinted();
          const allEvents = await contract.queryFilter(
            allMintFilter,
            fromBlock,
            currentBlock
          );

          // Filter events for the current user
          mintEvents = allEvents.filter((event) => {
            return (
              event.args &&
              event.args[0] &&
              event.args[0].toLowerCase() === account.toLowerCase()
            );
          });
        } catch (fallbackError) {
          console.log("Fallback query also failed:", fallbackError);
          throw new Error(
            "Unable to fetch minting events. Try connecting to a different RPC endpoint."
          );
        }
      }

      const historyItems: MintHistoryItem[] = [];

      for (const event of mintEvents) {
        try {
          // Get block information for timestamp
          const block = await provider.getBlock(event.blockNumber);
          const date = new Date(block.timestamp * 1000);

          // Extract event data
          // event creditsMinted(address indexed to, string projectId, uint256 amount);
          const toAddress = event.args?.[0] || account;
          const projectIdFromEvent = event.args?.[1] || "unknown";
          const amount = event.args?.[2] || "0";

          const formattedAmount = ethers.utils.formatEther(amount);

          const historyItem: MintHistoryItem = {
            amount: `${parseFloat(formattedAmount).toFixed(2)} CMX`,
            project: getProjectName(projectIdFromEvent),
            txHash: event.transactionHash,
            status: "confirmed", // If we can query it, it's confirmed
            time: getTimeAgo(block.timestamp),
            blockNumber: event.blockNumber,
            projectId: projectIdFromEvent,
          };

          historyItems.push(historyItem);
        } catch (error) {
          console.error("Error processing minting event:", error);
        }
      }

      // Sort by block number (most recent first)
      historyItems.sort((a, b) => b.blockNumber - a.blockNumber);
      setMintingHistory(historyItems);

      console.log(`Total minting history items: ${historyItems.length}`);
    } catch (error) {
      console.error("Error fetching minting history:", error);
      setHistoryError(
        `Failed to load minting history: ${error.message || error}`
      );
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    checkMetamaskAndConnection();
  }, []);

  useEffect(() => {
    if (isConnected && account && provider) {
      fetchMintingHistory();
    }
  }, [isConnected, account, provider]);

  const checkMetamaskAndConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      setHasMetamask(true);

      // Check if already connected
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setProvider(provider);
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    try {
      if (!hasMetamask) {
        alert("Please install MetaMask!");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      setAccount(address);
      setProvider(provider);
      setIsConnected(true);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  };

  const handleMint = async () => {
    if (!mintAmount || !selectedProject) {
      alert("Please select a project and enter an amount to mint.");
      return;
    }

    if (!isConnected || !provider) {
      alert("Please connect your wallet first.");
      return;
    }

    setIsLoading(true);

    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      console.log("Calling mintNewToken with:", selectedProject, mintAmount);
      console.log("Contract address:", contractAddress);
      console.log("Account:", account);

      // Call the contract method
      const tx = await contract.mintNewToken(
        selectedProject,
        ethers.utils.parseUnits(mintAmount, 18)
      );

      console.log("Transaction submitted:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt.transactionHash);

      // Clear form
      setSelectedProject("");
      setMintAmount("");

      // Refresh minting history
      fetchMintingHistory();

      alert("Credits minted successfully!");
    } catch (error: any) {
      console.error("Error minting tokens:", error);

      // More specific error messages
      if (error.code === 4001) {
        alert("Transaction rejected by user.");
      } else if (error.code === -32603) {
        alert("Internal RPC error. Please check your network connection.");
      } else if (error.message?.includes("insufficient funds")) {
        alert("Insufficient funds for transaction.");
      } else if (error.message?.includes("Project not verified")) {
        alert("Project not verified. Please verify the project first.");
      } else {
        alert(`Error minting tokens: ${error.message || error}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            Mint Carbon Credits
          </h1>
          <p className="text-muted-foreground">
            Convert verified project capacity into tradeable carbon credit
            tokens
          </p>
          {!isConnected && (
            <Button onClick={connectWallet} className="mt-4">
              Connect Wallet
            </Button>
          )}
          {isConnected && account && (
            <p className="text-sm text-success">
              Connected: {formatAddress(account)}
            </p>
          )}
        </div>

        {/* Minting Interface */}
        {isConnected && (
          <Card className="gradient-card max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-success" />
                Token Minting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Selection */}
              <div className="space-y-2">
                <Label htmlFor="project">Select Verified Project</Label>
                <Select
                  value={selectedProject}
                  onValueChange={setSelectedProject}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a verified project..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{project.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            {project.available} CMX available
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Mint (CMX)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  placeholder="Enter amount..."
                  className="text-lg"
                  step="0.01"
                />
                {selectedProject && (
                  <p className="text-sm text-muted-foreground">
                    Max available:{" "}
                    {
                      availableProjects.find((p) => p.id === selectedProject)
                        ?.available
                    }{" "}
                    CMX
                  </p>
                )}
              </div>

              {/* Minting Summary */}
              {mintAmount && selectedProject && (
                <div className="p-4 bg-accent/50 rounded-lg space-y-3">
                  <h3 className="font-medium">Minting Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Project</p>
                      <p className="font-medium">
                        {
                          availableProjects.find(
                            (p) => p.id === selectedProject
                          )?.name
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-medium">{mintAmount} CMX</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rate</p>
                      <p className="font-medium">1:1 (Project:Token)</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gas Fee</p>
                      <p className="font-medium text-success">~0.001 HBAR</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button
                onClick={handleMint}
                disabled={!mintAmount || !selectedProject || isLoading}
                className="w-full bg-success hover:bg-success/90 text-success-foreground"
                size="lg"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Coins className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Minting Tokens..." : "Mint Carbon Credits"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Mints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Recent Minting Activity
              <Badge variant="secondary" className="ml-auto">
                <TrendingUp className="h-3 w-3 mr-1" />
                Live
              </Badge>
              {isConnected && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchMintingHistory()}
                  disabled={isLoadingHistory}
                  className="ml-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      isLoadingHistory ? "animate-spin" : ""
                    }`}
                  />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Connect your wallet to view minting history
                </p>
              </div>
            ) : isLoadingHistory ? (
              <div className="text-center py-8">
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading minting history...
                </div>
              </div>
            ) : historyError ? (
              <div className="text-center py-8">
                <p className="text-red-500">{historyError}</p>
                <Button
                  variant="outline"
                  onClick={() => fetchMintingHistory()}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            ) : mintingHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No minting history found for this address
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {mintingHistory.map((mint, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          mint.status === "confirmed"
                            ? "bg-success"
                            : "bg-yellow-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium">Minted {mint.amount}</p>
                        <p className="text-sm text-muted-foreground">
                          {mint.project}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Tx: {mint.txHash.slice(0, 10)}...
                          {mint.txHash.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {mint.status === "confirmed" ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                        <Badge
                          variant={
                            mint.status === "confirmed"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            mint.status === "confirmed"
                              ? "bg-success"
                              : "bg-yellow-500"
                          }
                        >
                          {mint.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {mint.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Mint;
