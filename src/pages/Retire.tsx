import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, Shield, Lock, Calendar } from "lucide-react";
import { abi } from "../constants/abi";
import { ethers } from "ethers";
import { Eye, EyeOff, RefreshCw } from "lucide-react";

// Interface for retirement history item
interface RetirementHistoryItem {
  amount: string;
  reason: string;
  date: string;
  certificate: string;
  transactionHash: string;
  blockNumber: number;
  certificateId: string;
}

const Retire = () => {
  const [retireAmount, setRetireAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [personalBalance, setPersonalBalance] = useState<number>(0);
  const [projectBalance, setProjectBalance] = useState<number>(0);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);

  // Retirement history from blockchain
  const [retirementHistory, setRetirementHistory] = useState<
    RetirementHistoryItem[]
  >([]);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Wallet connection states
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasMetamask, setHasMetamask] = useState(false);

  const contractAddress = "0x682dc0bb02e7f985fe6861a5693d2dbd405f396e";
  const projectId = "project1";

  const toggleVisibility = (
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setter((prev) => !prev);
  };

  const formatBalance = (value: number, show: boolean) => {
    return show ? `${value.toLocaleString()} CMX` : "••••••••";
  };

  // Fetch retirement history from blockchain events
  const fetchRetirementHistory = async () => {
    if (!provider || !account) return;

    setIsLoadingHistory(true);
    setHistoryError(null);

    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      // Get current block number
      const currentBlock = await provider.getBlockNumber();

      // Query events in smaller chunks to avoid RPC limits
      // Start from a reasonable block range (last 50,000 blocks or deployment block)
      const fromBlock = Math.max(0, currentBlock - 50000); // Reduced range for RPC compatibility

      console.log(`Querying events from block ${fromBlock} to ${currentBlock}`);

      // Query creditsRetired events for the current user
      const filter = contract.filters.creditsRetired(account);

      let events = [];
      try {
        events = await contract.queryFilter(filter, fromBlock, currentBlock);
      } catch (error) {
        console.log(
          "Error with filtered query, trying alternative approach:",
          error
        );

        // Fallback: Query all creditsRetired events and filter client-side
        try {
          const allEventsFilter = contract.filters.creditsRetired();
          const allEvents = await contract.queryFilter(
            allEventsFilter,
            fromBlock,
            currentBlock
          );

          // Filter events for the current user
          events = allEvents.filter((event) => {
            return (
              event.args &&
              event.args[0] &&
              event.args[0].toLowerCase() === account.toLowerCase()
            );
          });
        } catch (fallbackError) {
          console.log("Fallback query also failed:", fallbackError);
          throw new Error(
            "Unable to fetch retirement events. Try connecting to a different RPC endpoint."
          );
        }
      }

      const historyItems: RetirementHistoryItem[] = [];

      for (const event of events) {
        try {
          // Get block information for timestamp
          const block = await provider.getBlock(event.blockNumber);
          const date = new Date(block.timestamp * 1000);

          // Extract event data - adjust indices based on your event signature
          // event creditsRetired(address indexed by, string projectId, uint256 amount, uint256 certificateId);
          const userAddress = event.args?.[0] || account;
          const projectIdFromEvent = event.args?.[1] || projectId;
          const amount = event.args?.[2] || "0";
          const certificateId = event.args?.[3]?.toString() || "N/A";

          const formattedAmount = ethers.utils.formatEther(amount);

          const historyItem: RetirementHistoryItem = {
            amount: `${parseFloat(formattedAmount).toFixed(2)} CMX`,
            reason: `Project: ${projectIdFromEvent}`,
            date: date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            certificate: `CERT-${certificateId}`,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
            certificateId: certificateId,
          };

          historyItems.push(historyItem);
        } catch (error) {
          console.error("Error processing retirement event:", error);
        }
      }

      // Sort by block number (most recent first)
      historyItems.sort((a, b) => b.blockNumber - a.blockNumber);
      setRetirementHistory(historyItems);

      if (historyItems.length === 0) {
        console.log("No retirement events found for this address");
      } else {
        console.log(`Found ${historyItems.length} retirement events`);
      }
    } catch (error) {
      console.error("Error fetching retirement history:", error);
      setHistoryError(
        `Failed to load retirement history: ${error.message || error}`
      );
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // fetch balance
  const fetchBalances = async () => {
    if (!provider || !account) return;

    setIsLoadingBalances(true);
    setBalanceError(null);

    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      //  get balance
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
    } catch (error) {
      console.error("Error fetching balances:", error);
      setBalanceError("Failed to fetch balances");
    } finally {
      setIsLoadingBalances(false);
    }
  };

  // Refresh both balances and history
  const refreshData = () => {
    if (isConnected && account && provider) {
      fetchBalances();
      fetchRetirementHistory();
    }
  };

  useEffect(() => {
    if (isConnected && account && provider) {
      fetchBalances();
      fetchRetirementHistory();
    }
  }, [isConnected, account, provider]);

  useEffect(() => {
    checkMetamaskAndConnection();
  }, []);

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

  const handleRetire = async () => {
    if (!retireAmount || !reason) {
      alert("Please specify retirement amount and reason");
      return;
    }

    if (!isConnected || !provider) {
      alert("Please connect your wallet first.");
      return;
    }

    // Check if user has sufficient balance
    if (parseFloat(retireAmount) > personalBalance) {
      alert("Insufficient balance for retirement.");
      return;
    }

    setIsLoading(true);

    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      console.log("Retire amount:", retireAmount);
      console.log("Retire reason:", reason);

      const amount = ethers.utils.parseUnits(retireAmount, 18);
      const tokenURI =
        "https://bafybeia6hmpwrqnycg6p7rzpf22euw3da7nm53jgppanevvc5igg6voudm.ipfs.w3s.link/cert1.webp";

      const tx = await contract.retireCredits(projectId, amount, tokenURI);
      console.log("Transaction submitted:", tx.hash);

      const receipt = await tx.wait();
      console.log("Credits retired! Tx:", receipt.transactionHash);

      // Clear form
      setRetireAmount("");
      setReason("");

      // Refresh data to show updated balances and history
      refreshData();

      alert("Credits retired successfully!");
    } catch (error: any) {
      console.error("Error retiring credits:", error);

      // More specific error messages
      if (error.code === 4001) {
        alert("Transaction rejected by user.");
      } else if (error.code === -32603) {
        alert("Internal RPC error. Please check your network connection.");
      } else if (error.message?.includes("insufficient funds")) {
        alert("Insufficient funds for transaction.");
      } else if (error.message?.includes("Insufficient project balance")) {
        alert("Insufficient project balance for retirement.");
      } else {
        alert(`Error retiring credits: ${error.message || error}`);
      }
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-climate to-primary bg-clip-text text-transparent">
            Retire Carbon Credits
          </h1>
          <p className="text-muted-foreground">
            Permanently retire credits to claim environmental impact
          </p>
          {!isConnected && (
            <Button onClick={connectWallet} className="mt-4">
              Connect Wallet
            </Button>
          )}
          {isConnected && account && (
            <p className="text-sm text-success">
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </p>
          )}
        </div>

        {/* Balance Overview */}
        <Card className="gradient-card">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-bold text-primary">
                  {isLoadingBalances ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    formatBalance(personalBalance, showBalance)
                  )}
                </h2>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshData}
                  disabled={
                    !isConnected || isLoadingBalances || isLoadingHistory
                  }
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      isLoadingBalances || isLoadingHistory
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                </Button>
              </div>
              <p className="text-muted-foreground">Available for Retirement</p>
              {balanceError && (
                <p className="text-sm text-red-500 mt-1">{balanceError}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Retirement Interface */}
        {isConnected && (
          <Card className="gradient-card max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownRight className="h-5 w-5 text-climate" />
                Retire Credits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Retire (CMX)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={retireAmount}
                  onChange={(e) => setRetireAmount(e.target.value)}
                  placeholder="Enter amount..."
                  className="text-lg"
                  max={personalBalance}
                  step="0.01"
                />
                <p className="text-sm text-muted-foreground">
                  Max available: {personalBalance.toLocaleString()} CMX
                </p>
              </div>

              {/* Retirement Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">Retirement Reason</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Corporate carbon neutrality commitment, Personal offset, Event compensation..."
                  className="min-h-[100px]"
                />
              </div>

              {/* Retirement Impact */}
              {retireAmount && (
                <div className="p-4 bg-climate/10 rounded-lg border border-climate/20">
                  <h3 className="font-medium flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-climate" />
                    Environmental Impact
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">CO2 Offset</p>
                      <p className="font-bold text-climate">
                        {retireAmount} tons
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Equivalent to</p>
                      <p className="font-bold text-climate">
                        ~
                        {Math.round(
                          Number(retireAmount) * 2200
                        ).toLocaleString()}{" "}
                        miles driven
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning Notice */}
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-2">
                  <Lock className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                      Permanent Action
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-300">
                      Once retired, these credits cannot be traded or
                      transferred. This action is irreversible.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleRetire}
                disabled={
                  !retireAmount || !reason || isLoading || personalBalance === 0
                }
                className="w-full bg-climate hover:bg-climate/90 text-climate-foreground"
                size="lg"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Lock className="mr-2 h-4 w-4" />
                )}
                {isLoading
                  ? "Retiring Credits..."
                  : "Retire Credits Permanently"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Retirement History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Retirement History
              {isConnected && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchRetirementHistory()}
                  disabled={isLoadingHistory}
                  className="ml-auto"
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
                  Connect your wallet to view retirement history
                </p>
              </div>
            ) : isLoadingHistory ? (
              <div className="text-center py-8">
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading retirement history...
                </div>
              </div>
            ) : historyError ? (
              <div className="text-center py-8">
                <p className="text-red-500">{historyError}</p>
                <Button
                  variant="outline"
                  onClick={() => fetchRetirementHistory()}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            ) : retirementHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No retirement history found for this address
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {retirementHistory.map((retirement, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Lock className="h-4 w-4 text-climate" />
                        <p className="font-medium">
                          Retired {retirement.amount}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {retirement.reason}
                      </p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <p>Certificate: {retirement.certificate}</p>
                        <p>Block: {retirement.blockNumber}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tx: {retirement.transactionHash.slice(0, 10)}...
                        {retirement.transactionHash.slice(-8)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-2">
                        Permanent
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {retirement.date}
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

export default Retire;
