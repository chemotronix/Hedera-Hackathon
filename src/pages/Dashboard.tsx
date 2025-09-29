declare global {
  interface Window {
    ethereum?: any;
  }
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  EyeOff,
  Wallet,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  RefreshCw,
  Send,
  TrendingUp,
} from "lucide-react";
import { ethers } from "ethers";
import { abi } from "../constants/abi";
import { useNavigate } from "react-router-dom";

// Interface for recent activity item
interface ActivityItem {
  action: "Minted" | "Transferred" | "Received" | "Retired";
  amount: string;
  project: string;
  time: string;
  status: "verified" | "completed" | "pending";
  transactionHash: string;
  blockNumber: number;
  address?: string; // For transfers, the to/from address
}

const CONTRACT_ADDRESS = "0x682dc0bb02e7f985fe6861a5693d2dbd405f396e";

export default function Dashboard() {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [showProjectBalance, setShowProjectBalance] = useState(true);
  const [showRetiredCredits, setShowRetiredCredits] = useState(true);
  const [hasMetamask, setHasMetamask] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Balance states
  const [personalBalance, setPersonalBalance] = useState<number>(0);
  const [projectBalance, setProjectBalance] = useState<number>(0);
  const [retiredCredits, setRetiredCredits] = useState<number>(0);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  // Recent activities state
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  const projectId = "project1";

  const toggleVisibility = (
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setter((prev) => !prev);
  };

  const formatBalance = (value: number, show: boolean) => {
    return show ? `${value.toLocaleString()} CMX` : "••••••••";
  };

  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffInMinutes = Math.floor((now - timestamp * 1000) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
  };

  // Fetch recent activities from blockchain events
  const fetchRecentActivities = async () => {
    if (!provider || !account) return;

    setIsLoadingActivities(true);
    setActivitiesError(null);

    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

      // Get current block number
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 50000);

      console.log(
        `Querying activities from block ${fromBlock} to ${currentBlock}`
      );

      const activities: ActivityItem[] = [];

      try {
        // 1. Fetch Mint Events (creditsMinted)
        const mintFilter = contract.filters.creditsMinted(account);
        const mintEvents = await contract.queryFilter(
          mintFilter,
          fromBlock,
          currentBlock
        );

        for (const event of mintEvents) {
          try {
            const block = await provider.getBlock(event.blockNumber);
            const amount = ethers.utils.formatEther(event.args?.[2] || "0");
            const projectFromEvent = event.args?.[1] || projectId;

            activities.push({
              action: "Minted",
              amount: `${parseFloat(amount).toFixed(2)} CMX`,
              project: `Project: ${projectFromEvent}`,
              time: getTimeAgo(block.timestamp),
              status: "verified",
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber,
            });
          } catch (error) {
            console.error("Error processing mint event:", error);
          }
        }

        // 2. Fetch Transfer Events (Sent)
        const transferSentFilter = contract.filters.creditsTransferred(account);
        const transferSentEvents = await contract.queryFilter(
          transferSentFilter,
          fromBlock,
          currentBlock
        );

        for (const event of transferSentEvents) {
          try {
            const block = await provider.getBlock(event.blockNumber);
            const amount = ethers.utils.formatEther(event.args?.[3] || "0");
            const projectFromEvent = event.args?.[2] || projectId;
            const toAddress = event.args?.[1] || "";

            activities.push({
              action: "Transferred",
              amount: `${parseFloat(amount).toFixed(2)} CMX`,
              project: `Project: ${projectFromEvent}`,
              time: getTimeAgo(block.timestamp),
              status: "completed",
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber,
              address: toAddress,
            });
          } catch (error) {
            console.error("Error processing transfer sent event:", error);
          }
        }

        // 3. Fetch Transfer Events (Received)
        const transferReceivedFilter = contract.filters.creditsTransferred(
          null,
          account
        );
        const transferReceivedEvents = await contract.queryFilter(
          transferReceivedFilter,
          fromBlock,
          currentBlock
        );

        for (const event of transferReceivedEvents) {
          try {
            // Skip if it's the same address (self-transfer)
            const fromAddress = event.args?.[0] || "";
            if (fromAddress.toLowerCase() === account.toLowerCase()) continue;

            const block = await provider.getBlock(event.blockNumber);
            const amount = ethers.utils.formatEther(event.args?.[3] || "0");
            const projectFromEvent = event.args?.[2] || projectId;

            activities.push({
              action: "Received",
              amount: `${parseFloat(amount).toFixed(2)} CMX`,
              project: `Project: ${projectFromEvent}`,
              time: getTimeAgo(block.timestamp),
              status: "completed",
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber,
              address: fromAddress,
            });
          } catch (error) {
            console.error("Error processing transfer received event:", error);
          }
        }

        // 4. Fetch Retirement Events (creditsRetired)
        const retireFilter = contract.filters.creditsRetired(account);
        const retireEvents = await contract.queryFilter(
          retireFilter,
          fromBlock,
          currentBlock
        );

        for (const event of retireEvents) {
          try {
            const block = await provider.getBlock(event.blockNumber);
            const amount = ethers.utils.formatEther(event.args?.[2] || "0");
            const projectFromEvent = event.args?.[1] || projectId;

            activities.push({
              action: "Retired",
              amount: `${parseFloat(amount).toFixed(2)} CMX`,
              project: `Project: ${projectFromEvent}`,
              time: getTimeAgo(block.timestamp),
              status: "completed",
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber,
            });
          } catch (error) {
            console.error("Error processing retirement event:", error);
          }
        }
      } catch (error) {
        console.log(
          "Error with filtered queries, trying fallback approach:",
          error
        );

        // Fallback: Query all events and filter client-side
        try {
          const allMintEvents = await contract.queryFilter(
            contract.filters.creditsMinted(),
            fromBlock,
            currentBlock
          );
          const allTransferEvents = await contract.queryFilter(
            contract.filters.creditsTransferred(),
            fromBlock,
            currentBlock
          );
          const allRetireEvents = await contract.queryFilter(
            contract.filters.creditsRetired(),
            fromBlock,
            currentBlock
          );

          // Process and filter events for the current user
          // [Similar processing logic as above but with client-side filtering]
        } catch (fallbackError) {
          console.log("Fallback query also failed:", fallbackError);
          throw new Error(
            "Unable to fetch activity events. Try refreshing or connecting to a different RPC endpoint."
          );
        }
      }

      // Sort activities by block number (most recent first) and limit to 10
      activities.sort((a, b) => b.blockNumber - a.blockNumber);
      const limitedActivities = activities.slice(0, 10);

      setRecentActivities(limitedActivities);
      console.log(`Found ${limitedActivities.length} recent activities`);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      setActivitiesError(
        `Failed to load recent activities: ${error.message || error}`
      );
    } finally {
      setIsLoadingActivities(false);
    }
  };

  useEffect(() => {
    checkMetamaskAndConnection();
  }, []);

  useEffect(() => {
    if (isConnected && account && provider) {
      fetchBalances();
      fetchRecentActivities();
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

  const fetchBalances = async () => {
    if (!provider || !account) return;

    setIsLoadingBalances(true);
    setBalanceError(null);

    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

      // Personal Balance
      const personalBal = await contract.getPersonalProjectBalance(projectId);
      setPersonalBalance(parseFloat(ethers.utils.formatEther(personalBal)));

      // Project Balance
      try {
        const projectBal = await contract.getProjectBalance(projectId);
        setProjectBalance(parseFloat(ethers.utils.formatEther(projectBal)));
      } catch (error) {
        console.log("Project balance method not available:", error);
        setProjectBalance(0);
      }

      // Retired Credits
      try {
        const retiredBal = await contract.getTotalRetiredCredits();
        setRetiredCredits(parseFloat(ethers.utils.formatEther(retiredBal)));
      } catch (error) {
        console.log("Retired credits method not available:", error);
        setRetiredCredits(0);
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
      setBalanceError(
        "Failed to fetch balances. Please check your connection."
      );
    } finally {
      setIsLoadingBalances(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      if (!hasMetamask) {
        alert("Please install MetaMask!");
        return;
      }

      // Switch to Hedera network
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x128" }], // 296 in hex
        });
      } catch (switchError: any) {
        // If the chain hasn't been added to MetaMask, add it
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x128",
                  chainName: "Hedera Testnet",
                  nativeCurrency: {
                    name: "HBAR",
                    symbol: "HBAR",
                    decimals: 18,
                  },
                  rpcUrls: ["https://testnet.hashio.io/api"],
                  blockExplorerUrls: ["https://hashscan.io/testnet"],
                },
              ],
            });
          } catch (addError) {
            console.error("Error adding Hedera network:", addError);
            throw addError;
          }
        } else {
          throw switchError;
        }
      }

      // Request account access
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

  const handleDisconnect = () => {
    setAccount(null);
    setProvider(null);
    setIsConnected(false);
    // Reset all data when disconnecting
    setPersonalBalance(0);
    setProjectBalance(0);
    setRetiredCredits(0);
    setRecentActivities([]);
    setBalanceError(null);
    setActivitiesError(null);
  };

  const handleRefreshData = () => {
    if (isConnected && account && provider) {
      fetchBalances();
      fetchRecentActivities();
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "Minted":
        return <Coins className="h-4 w-4 text-success" />;
      case "Transferred":
        return <Send className="h-4 w-4 text-primary" />;
      case "Received":
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case "Retired":
        return <ArrowDownRight className="h-4 w-4 text-climate" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case "Minted":
        return "bg-success";
      case "Transferred":
        return "bg-primary";
      case "Received":
        return "bg-blue-500";
      case "Retired":
        return "bg-climate";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-climate bg-clip-text text-transparent">
              Carbon Credit Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your carbon credits on Hedera Guardian
            </p>
            {isConnected && account && (
              <p className="text-sm text-success mt-1">
                Connected: {account.slice(0, 6)}...{account.slice(-4)}
              </p>
            )}
            {(balanceError || activitiesError) && (
              <p className="text-sm text-red-500 mt-1">
                {balanceError || activitiesError}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {isConnected && (
              <Button
                onClick={handleRefreshData}
                variant="outline"
                size="sm"
                disabled={isLoadingBalances || isLoadingActivities}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${
                    isLoadingBalances || isLoadingActivities
                      ? "animate-spin"
                      : ""
                  }`}
                />
                {isLoadingBalances || isLoadingActivities
                  ? "Refreshing..."
                  : "Refresh"}
              </Button>
            )}
            <Button
              onClick={isConnected ? handleDisconnect : handleConnectWallet}
              className="gradient-hero text-primary-foreground"
            >
              <Wallet className="mr-2 h-4 w-4" />
              {isConnected ? "Disconnect" : "Connect Wallet"}
            </Button>
          </div>
        </div>

        {/* Balance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Personal Balance */}
          <Card className="gradient-card border-accent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Personal Balance
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleVisibility(setShowBalance)}
                className="h-8 w-8 p-0"
              >
                {showBalance ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {isLoadingBalances ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                ) : (
                  formatBalance(personalBalance, showBalance)
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Available carbon credits
              </p>
            </CardContent>
          </Card>

          {/* Project Balance */}
          <Card className="gradient-card border-success/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Project 1 Balance
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleVisibility(setShowProjectBalance)}
                className="h-8 w-8 p-0"
              >
                {showProjectBalance ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {isLoadingBalances ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                ) : (
                  formatBalance(projectBalance, showProjectBalance)
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Project-generated credits
              </p>
            </CardContent>
          </Card>

          {/* Retired Credits */}
          <Card className="gradient-card border-climate/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Project 1 Retired Credits
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleVisibility(setShowRetiredCredits)}
                className="h-8 w-8 p-0"
              >
                {showRetiredCredits ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-climate">
                {isLoadingBalances ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                ) : (
                  formatBalance(retiredCredits, showRetiredCredits)
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Permanently retired
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-24 flex flex-col gap-2 border-primary/20 hover:bg-accent"
            disabled={!isConnected}
            onClick={() => navigate("/projects")}
          >
            <CheckCircle className="h-6 w-6 text-primary" />
            <span className="text-sm">Verify Project</span>
          </Button>

          <Button
            variant="outline"
            className="h-24 flex flex-col gap-2 border-success/20 hover:bg-accent"
            disabled={!isConnected}
            onClick={() => navigate("/mint")}
          >
            <Coins className="h-6 w-6 text-success" />
            <span className="text-sm">Mint Tokens</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex flex-col gap-2 border-climate/20 hover:bg-accent"
            disabled={!isConnected}
            onClick={() => navigate("/retire")}
          >
            <ArrowDownRight className="h-6 w-6 text-climate" />
            <span className="text-sm">Retire Credits</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex flex-col gap-2 border-muted-foreground/20 hover:bg-accent"
            disabled={!isConnected}
            onClick={() => navigate("/transfer")}
          >
            <ArrowUpRight className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm">Transfer Credits</span>
          </Button>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Recent Activity
              <Badge variant="secondary" className="ml-auto">
                Live
              </Badge>
              {isConnected && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchRecentActivities()}
                  disabled={isLoadingActivities}
                  className="ml-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      isLoadingActivities ? "animate-spin" : ""
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
                  Connect your wallet to view recent activities
                </p>
              </div>
            ) : isLoadingActivities ? (
              <div className="text-center py-8">
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading recent activities...
                </div>
              </div>
            ) : activitiesError ? (
              <div className="text-center py-8">
                <p className="text-red-500">{activitiesError}</p>
                <Button
                  variant="outline"
                  onClick={() => fetchRecentActivities()}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No recent activities found for this address
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0 hover:bg-accent/50 transition-colors rounded px-2"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${getActivityColor(
                          activity.action
                        )}`}
                      />
                      <div className="flex items-center gap-2">
                        {getActivityIcon(activity.action)}
                      </div>
                      <div>
                        <p className="font-medium">
                          {activity.action} {activity.amount}
                          {activity.address && (
                            <span className="text-sm text-muted-foreground ml-1">
                              {activity.action === "Transferred"
                                ? "to"
                                : "from"}{" "}
                              {formatAddress(activity.address)}
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.project}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Tx: {activity.transactionHash.slice(0, 10)}...
                          {activity.transactionHash.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {activity.time}
                      </p>
                      <Badge
                        variant={
                          activity.status === "verified"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          activity.status === "verified"
                            ? "bg-success"
                            : activity.status === "completed"
                            ? "bg-climate"
                            : ""
                        }
                      >
                        {activity.status}
                      </Badge>
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
}
