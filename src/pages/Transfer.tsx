import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Send, History, CheckCircle, Clock } from "lucide-react";
import { abi } from "../constants/abi";
import { ethers } from "ethers";
import { Eye, EyeOff, RefreshCw } from "lucide-react";

// Interface for transfer history item
interface TransferHistoryItem {
  type: "sent" | "received";
  amount: string;
  address: string;
  txHash: string;
  status: "completed" | "pending";
  time: string;
  blockNumber: number;
  projectId: string;
}

const Transfer = () => {
  const [recipient, setRecipient] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [personalBalance, setPersonalBalance] = useState<number>(0);
  const [projectBalance, setProjectBalance] = useState<number>(0);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasMetamask, setHasMetamask] = useState(false);
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);

  // Transfer history from blockchain
  const [transferHistory, setTransferHistory] = useState<TransferHistoryItem[]>(
    []
  );
  const [historyError, setHistoryError] = useState<string | null>(null);

  const contractAddress = "0x682dc0bb02e7f985fe6861a5693d2dbd405f396e";
  const projectId = "project1";

  const formatBalance = (value: number, show: boolean) => {
    return show ? `${value.toLocaleString()} CMX` : "••••••••";
  };

  const toggleVisibility = (
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setter((prev) => !prev);
  };

  // Fetch transfer history from blockchain events
  const fetchTransferHistory = async () => {
    if (!provider || !account) return;

    setIsLoadingHistory(true);
    setHistoryError(null);

    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      // Get current block number
      const currentBlock = await provider.getBlockNumber();

      // Query events in smaller chunks to avoid RPC limits
      const fromBlock = Math.max(0, currentBlock - 50000);

      console.log(
        `Querying transfer events from block ${fromBlock} to ${currentBlock}`
      );

      // Get both sent and received transfers
      const sentFilter = contract.filters.creditsTransferred(account); // from = account
      const receivedFilter = contract.filters.creditsTransferred(null, account); // to = account

      let sentEvents = [];
      let receivedEvents = [];

      try {
        // Query sent transfers
        sentEvents = await contract.queryFilter(
          sentFilter,
          fromBlock,
          currentBlock
        );
        console.log(`Found ${sentEvents.length} sent transfers`);

        // Query received transfers
        receivedEvents = await contract.queryFilter(
          receivedFilter,
          fromBlock,
          currentBlock
        );
        console.log(`Found ${receivedEvents.length} received transfers`);
      } catch (error) {
        console.log(
          "Error with filtered query, trying alternative approach:",
          error
        );

        // Fallback: Query all transfer events and filter client-side
        try {
          const allTransfersFilter = contract.filters.creditsTransferred();
          const allEvents = await contract.queryFilter(
            allTransfersFilter,
            fromBlock,
            currentBlock
          );

          // Filter events for the current user
          sentEvents = allEvents.filter((event) => {
            return (
              event.args &&
              event.args[0] &&
              event.args[0].toLowerCase() === account.toLowerCase()
            );
          });

          receivedEvents = allEvents.filter((event) => {
            return (
              event.args &&
              event.args[1] &&
              event.args[1].toLowerCase() === account.toLowerCase() &&
              event.args[0].toLowerCase() !== account.toLowerCase()
            ); // Exclude self-transfers
          });
        } catch (fallbackError) {
          console.log("Fallback query also failed:", fallbackError);
          throw new Error(
            "Unable to fetch transfer events. Try connecting to a different RPC endpoint."
          );
        }
      }

      const historyItems: TransferHistoryItem[] = [];

      // Process sent transfers
      for (const event of sentEvents) {
        try {
          const block = await provider.getBlock(event.blockNumber);
          const date = new Date(block.timestamp * 1000);

          // Extract event data
          // event creditsTransferred(address indexed from, address indexed to, string projectId, uint256 amount);
          const fromAddress = event.args?.[0] || "";
          const toAddress = event.args?.[1] || "";
          const projectIdFromEvent = event.args?.[2] || projectId;
          const amount = event.args?.[3] || "0";

          const formattedAmount = ethers.utils.formatEther(amount);

          const historyItem: TransferHistoryItem = {
            type: "sent",
            amount: `${parseFloat(formattedAmount).toFixed(2)} CMX`,
            address: toAddress,
            txHash: event.transactionHash,
            status: "completed", // If we can query it, it's completed
            time: date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            blockNumber: event.blockNumber,
            projectId: projectIdFromEvent,
          };

          historyItems.push(historyItem);
        } catch (error) {
          console.error("Error processing sent transfer event:", error);
        }
      }

      // Process received transfers
      for (const event of receivedEvents) {
        try {
          const block = await provider.getBlock(event.blockNumber);
          const date = new Date(block.timestamp * 1000);

          // Extract event data
          const fromAddress = event.args?.[0] || "";
          const toAddress = event.args?.[1] || "";
          const projectIdFromEvent = event.args?.[2] || projectId;
          const amount = event.args?.[3] || "0";

          const formattedAmount = ethers.utils.formatEther(amount);

          const historyItem: TransferHistoryItem = {
            type: "received",
            amount: `${parseFloat(formattedAmount).toFixed(2)} CMX`,
            address: fromAddress,
            txHash: event.transactionHash,
            status: "completed",
            time: date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            blockNumber: event.blockNumber,
            projectId: projectIdFromEvent,
          };

          historyItems.push(historyItem);
        } catch (error) {
          console.error("Error processing received transfer event:", error);
        }
      }

      // Sort by block number (most recent first)
      historyItems.sort((a, b) => b.blockNumber - a.blockNumber);
      setTransferHistory(historyItems);

      console.log(`Total transfer history items: ${historyItems.length}`);
    } catch (error) {
      console.error("Error fetching transfer history:", error);
      setHistoryError(
        `Failed to load transfer history: ${error.message || error}`
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
      fetchTransferHistory();
    }
  };

  useEffect(() => {
    if (isConnected && account && provider) {
      fetchBalances();
      fetchTransferHistory();
    }
  }, [isConnected, account, provider]);

  const handleTransfer = async () => {
    if (!recipient || !transferAmount) {
      alert("Please specify recipient and transfer amount");
      return;
    }

    if (!isConnected || !provider) {
      alert("Please connect your wallet first.");
      return;
    }

    // Check if user has sufficient balance
    if (parseFloat(transferAmount) > personalBalance) {
      alert("Insufficient balance for transfer.");
      return;
    }

    setIsLoading(true);

    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const amount = ethers.utils.parseUnits(transferAmount, 18);

      // Get CMX token contract address
      const cmxTokenAddress = await contract.cmxToken();
      const tokenContract = new ethers.Contract(
        cmxTokenAddress,
        [
          "function approve(address spender, uint256 amount) external returns (bool)",
          "function allowance(address owner, address spender) external view returns (uint256)",
        ],
        signer
      );

      // Check project verification and balance
      const isVerified = await contract.verifiedProjects(projectId);
      console.log("Project verified:", isVerified);

      const balance = await contract.getPersonalProjectBalance(projectId);
      console.log("Your balance:", ethers.utils.formatEther(balance));

      if (balance.lt(amount)) {
        alert("Insufficient balance to transfer.");
        return;
      }

      // Check if approval is needed
      const currentAllowance = await tokenContract.allowance(
        await signer.getAddress(),
        contractAddress
      );
      if (currentAllowance.lt(amount)) {
        console.log("Approving tokens...");
        const approveTx = await tokenContract.approve(contractAddress, amount);
        await approveTx.wait();
        console.log("Tokens approved");
      }

      console.log("Approval confirmed");

      // Now perform the transfer
      console.log("Submitting transfer...");
      const tx = await contract.transferCredits(projectId, recipient, amount, {
        gasLimit: 500000,
      });

      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        console.log("Transaction confirmed:", receipt.transactionHash);

        // Clear form
        setRecipient("");
        setTransferAmount("");

        // Refresh data to show updated balances and history
        refreshData();

        alert("Credits transferred successfully!");
      } else {
        alert("Transaction failed during execution");
      }
    } catch (err: any) {
      console.error("Transfer failed:", err);

      // More specific error messages
      if (err.code === 4001) {
        alert("Transaction rejected by user.");
      } else if (err.code === -32603) {
        alert("Internal RPC error. Please check your network connection.");
      } else if (err.message?.includes("insufficient funds")) {
        alert("Insufficient funds for transaction.");
      } else if (err.message?.includes("Insufficient project balance")) {
        alert("Insufficient project balance for transfer.");
      } else {
        alert(`Error during transfer: ${err.message || err}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  const validateAddress = (address: string) => {
    // Basic Ethereum address validation
    return ethers.utils.isAddress(address);
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-muted-foreground bg-clip-text text-transparent">
            Transfer Carbon Credits
          </h1>
          <p className="text-muted-foreground">
            Send carbon credits to other addresses on Hedera network
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
              <p className="text-muted-foreground">Available for Transfer</p>
              {balanceError && (
                <p className="text-sm text-red-500 mt-1">{balanceError}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transfer Interface */}
        {isConnected && (
          <Card className="gradient-card max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Send Credits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recipient Address */}
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x1234567890abcdef..."
                  className="text-lg font-mono"
                />
                {recipient && !validateAddress(recipient) && (
                  <p className="text-sm text-destructive">
                    Invalid address format
                  </p>
                )}
                {recipient && validateAddress(recipient) && (
                  <p className="text-sm text-success">✓ Valid address</p>
                )}
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Transfer (CMX)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="Enter amount..."
                  className="text-lg"
                  max={personalBalance}
                  step="0.01"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    Max available: {personalBalance.toLocaleString()} CMX
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setTransferAmount(personalBalance.toString())
                    }
                    className="h-auto p-1 text-xs"
                  >
                    Use Max
                  </Button>
                </div>
              </div>

              {/* Transfer Summary */}
              {transferAmount && recipient && validateAddress(recipient) && (
                <div className="p-4 bg-accent/50 rounded-lg space-y-3">
                  <h3 className="font-medium">Transfer Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">To</p>
                      <p className="font-mono text-xs break-all">
                        {formatAddress(recipient)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-medium">{transferAmount} CMX</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Network Fee</p>
                      <p className="font-medium text-success">~0.001 HBAR</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Remaining Balance</p>
                      <p className="font-medium">
                        {(
                          personalBalance - Number(transferAmount)
                        ).toLocaleString()}{" "}
                        CMX
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button
                onClick={handleTransfer}
                disabled={
                  !recipient ||
                  !transferAmount ||
                  !validateAddress(recipient) ||
                  isLoading ||
                  personalBalance === 0
                }
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Processing Transfer..." : "Send Carbon Credits"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Transfer History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Transfer History
              {isConnected && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchTransferHistory()}
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
                  Connect your wallet to view transfer history
                </p>
              </div>
            ) : isLoadingHistory ? (
              <div className="text-center py-8">
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading transfer history...
                </div>
              </div>
            ) : historyError ? (
              <div className="text-center py-8">
                <p className="text-red-500">{historyError}</p>
                <Button
                  variant="outline"
                  onClick={() => fetchTransferHistory()}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            ) : transferHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No transfer history found for this address
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {transferHistory.map((transfer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent">
                        {transfer.type === "sent" ? (
                          <ArrowUpRight className="h-4 w-4 text-primary" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 rotate-180 text-success" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {transfer.type === "sent" ? "Sent" : "Received"}{" "}
                          {transfer.amount}
                        </p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {transfer.type === "sent" ? "To" : "From"}:{" "}
                          {formatAddress(transfer.address)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Tx: {transfer.txHash.slice(0, 10)}...
                          {transfer.txHash.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <Badge variant="default" className="bg-success">
                          {transfer.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {transfer.time}
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

export default Transfer;
