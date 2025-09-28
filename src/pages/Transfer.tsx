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

const Transfer = () => {
  const [recipient, setRecipient] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [personalBalance, setPersonalBalance] = useState<number>(0);
  const [projectBalance, setProjectBalance] = useState<number>(0);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasMetamask, setHasMetamask] = useState(false);
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);

  const availableCredits = 1250;

  const formatBalance = (value: number, show: boolean) => {
    return show ? `${value.toLocaleString()} CMX` : "••••••••";
  };

  const toggleVisibility = (
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setter((prev) => !prev);
  };

  // fetch balance
  const fetchBalances = async () => {
    if (!provider || !account) return;

    setIsLoadingBalances(true);
    setBalanceError(null);

    try {
      const signer = provider.getSigner();
      const contractAddress = "0x682dc0bb02e7f985fe6861a5693d2dbd405f396e";

      const contract = new ethers.Contract(contractAddress, abi, signer);
      const projectId = "project1";

      //  get balance
      const personalBal = await contract.getPersonalProjectBalance(projectId);
      setPersonalBalance(parseFloat(ethers.utils.formatEther(personalBal)));

      // Project Balance - this would depend on your contract structure
      // You might have a separate method for project-generated credits
      try {
        const projectBal = await contract.getProjectBalance(projectId);
        setProjectBalance(parseFloat(ethers.utils.formatEther(projectBal)));
      } catch (error) {
        // If projectBalanceOf doesn't exist, you might calculate it differently
        console.log("Project balance method not available:", error);
        setProjectBalance(0);
      }

      // Alternative approach if you have events to track retired credits
      // You could query past events to calculate retired credits
      /*
        try {
          const retiredEvents = await contract.queryFilter(
            contract.filters.CreditsRetired(account),
            0,
            'latest'
          );
          const totalRetired = retiredEvents.reduce((sum, event) => {
            return sum + parseFloat(ethers.utils.formatEther(event.args.amount));
          }, 0);
          setRetiredCredits(totalRetired);
        } catch (error) {
          console.log("Error fetching retired credits from events:", error);
        }
        */
    } catch (error) {
      console.error("Error fetching balances:", error);
      // setBalanceError(
      //   "Failed to fetch balances. Please check your connection."
      // );
    } finally {
      setIsLoadingBalances(false);
    }
  };

  useEffect(() => {
    if (isConnected && account && provider) {
      fetchBalances();
    }
  }, [isConnected, account, provider]);

  const handleTransfer = async () => {
    if (recipient || transferAmount) {
      setIsLoading(true);
      console.log("I am here one");

      try {
        const signer = provider.getSigner();
        const contractAddress = "0x682dc0bb02e7f985fe6861a5693d2dbd405f396e";
        const contract = new ethers.Contract(contractAddress, abi, signer);
        const projectId = "project1";
        const address = "0xD3FA22780F4b73564044dd9F6B4529812Cc15306";
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
          const approveTx = await tokenContract.approve(
            contractAddress,
            amount
          );
          await approveTx.wait();
          console.log("Tokens approved");
        }

        console.log("Approval confirmed");

        // Now perform the transfer
        console.log("Submitting transfer...");
        const tx = await contract.transferCredits(
          projectId,
          recipient,
          amount,
          {
            gasLimit: 500000,
          }
        );

        console.log("Transaction sent:", tx.hash);
        const receipt = await tx.wait();

        if (receipt.status === 1) {
          console.log("Transaction confirmed:", receipt.transactionHash);
          alert("Credits transferred successfully!");
        } else {
          alert("Transaction failed during execution");
        }
      } catch (err) {
        console.error("Transfer failed:", err);
        alert(err.message || "Error during transfer");
      } finally {
        setIsLoading(false);
      }
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

  // useEffect(() => {
  // checkMetamaskAndConnection();
  const checkBalance = async () => {
    setIsLoading(true);

    try {
      const signer = provider.getSigner();
      const contractAddress = "0x07dac1f0404152a86d1c1a20e3f5438bbb6a45e6";
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const tx = await contract.getProjectBalance("project1");

      console.log("Project balance:", ethers.utils.formatUnits(tx, 18));

      console.log("Transaction confirmed");
    } catch (error: any) {
      console.error("Error verifying project:", error);

      // More specific error messages
      if (error.code === 4001) {
        alert("Transaction rejected by user.");
      } else if (error.code === -32603) {
        alert("Internal RPC error. Please check your network connection.");
      } else if (error.message?.includes("insufficient funds")) {
        alert("Insufficient funds for transaction.");
      } else {
        alert(`Error submitting project: ${error.message || error}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  // }, []);

  const validateAddress = (address: string) => {
    // Basic Hedera address validation
    return address.startsWith("0") && address.length > 6;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* <Button onClick={checkBalance}>Check Balance</Button> */}
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-muted-foreground bg-clip-text text-transparent">
            Transfer Carbon Credits
          </h1>
          <p className="text-muted-foreground">
            Send carbon credits to other addresses on Hedera network
          </p>
        </div>

        {/* Balance Overview */}
        <Card className="gradient-card">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary mb-2">
                {isLoadingBalances ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                ) : (
                  formatBalance(personalBalance, showBalance)
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleVisibility(setShowBalance)}
                  className="h-8 w-8 p-0 ml-5"
                >
                  {showBalance ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
              </h2>
              <p className="text-muted-foreground">Available for Transfer</p>
            </div>
          </CardContent>
        </Card>

        {/* Transfer Interface */}
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
              <Label htmlFor="recipient">Recipient Hedera Address</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0.0.123456..."
                className="text-lg font-mono"
              />
              {recipient && !validateAddress(recipient) && (
                <p className="text-sm text-destructive">
                  Invalid Hedera address format
                </p>
              )}
              {recipient && validateAddress(recipient) && (
                <p className="text-sm text-success">✓ Valid Hedera address</p>
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
                max={availableCredits}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Max available: {availableCredits.toLocaleString()} CMX
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTransferAmount(availableCredits.toString())}
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
                    <p className="font-mono text-xs break-all">{recipient}</p>
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
                        availableCredits - Number(transferAmount)
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
                isLoading
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

        {/* Transfer History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Transfer History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  type: "sent",
                  amount: "50 CMX",
                  address: "0.0.789123",
                  txHash: "0x1234567890abcdef",
                  status: "completed",
                  time: "2 hours ago",
                },
                {
                  type: "received",
                  amount: "75 CMX",
                  address: "0.0.456789",
                  txHash: "0xabcdef1234567890",
                  status: "completed",
                  time: "1 day ago",
                },
                {
                  type: "sent",
                  amount: "25 CMX",
                  address: "0.0.321654",
                  txHash: "0x9876543210fedcba",
                  status: "pending",
                  time: "2 days ago",
                },
              ].map((transfer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
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
                        {transfer.address}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      {transfer.status === "completed" ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                      <Badge
                        variant={
                          transfer.status === "completed"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          transfer.status === "completed"
                            ? "bg-success"
                            : "bg-yellow-500"
                        }
                      >
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Transfer;
// export default Transfer;
