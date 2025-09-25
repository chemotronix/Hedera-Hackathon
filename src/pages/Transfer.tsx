import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Send, History, CheckCircle, Clock } from "lucide-react";
import { abi } from "../constants/abi";
import { ethers } from "ethers";

const Transfer = () => {
  const [recipient, setRecipient] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasMetamask, setHasMetamask] = useState(false);
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);

  const availableCredits = 1250;

  const handleTransfer = async () => {
    if (recipient || transferAmount) {
      setIsLoading(true);
      console.log("I am here one");

      // try {
      //   const signer = provider.getSigner();
      //   const contractAddress = "0x3b6fe79938f3422bb1a3bf7c672067a83b3c762e";
      //   const contract = new ethers.Contract(contractAddress, abi, signer);

      //   const projectId = "project1";
      //   const address = "0xD3FA22780F4b73564044dd9F6B4529812Cc15306"; // oreoluwa address

      //   const amount = ethers.utils.parseUnits("1", 18); // 10 tokens

      //   // STEP 1: Check project verification
      //   const isVerified = await contract.verifiedProjects(projectId);
      //   console.log("Project verified:", isVerified);

      //   // STEP 2: Check balance
      //   const balance = await contract.getPersonalProjectBalance(projectId);
      //   console.log("Your balance:", ethers.utils.formatEther(balance));
      //   if (balance.lt(amount)) {
      //     alert("Insufficient balance to transfer.");
      //     return;
      //   }
      //   console.log("one");
      //   // STEP 3: Perform transfer
      //   const tx = await contract.transferCredits(projectId, address, amount, {
      //     gasLimit: 500000,
      //   });

      //   console.log("Transaction sent:", tx.hash);
      //   console.log("Waiting for confirmation...");

      //   // CRITICAL: Wait for the transaction to be mined
      //   const receipt = await tx.wait();

      //   console.log("two");
      //   console.log("Transaction sent:", tx.hash);
      //   console.log("three");

      //   // const receipt = await tx.wait();
      //   console.log("four");
      //   // console.log("Transaction confirmed:", receipt.transactionHash);
      //   console.log("five");

      //   // Check if transaction was successful
      //   if (receipt.status === 1) {
      //     console.log("Transaction confirmed:", receipt.transactionHash);
      //     alert("Credits transferred successfully!");
      //   } else {
      //     console.error("Transaction failed:", receipt);
      //     alert("Transaction failed during execution");
      //   }

      //   alert("Credits transferred successfully!");
      // } catch (err) {
      //   console.error("Transfer failed:", err);
      //   // Better error handling
      //   if (err.code === "UNPREDICTABLE_GAS_LIMIT") {
      //     alert("Transaction will likely fail. Check contract conditions.");
      //   } else if (err.code === "CALL_EXCEPTION") {
      //     alert(
      //       "Smart contract rejected the transaction. Check your inputs and contract state."
      //     );
      //   } else {
      //     alert(err.message || "Error during transfer1");
      //   }
      //   alert(err.message || "Error during transfer2");
      // } finally {
      //   setIsLoading(false);
      // }

      // second function

      // try {
      //   const signer = provider.getSigner();
      //   const contractAddress = "0x3b6fe79938f3422bb1a3bf7c672067a83b3c762e";
      //   const contract = new ethers.Contract(contractAddress, abi, signer);
      //   const projectId = "project1";
      //   const address = "0xD3FA22780F4b73564044dd9F6B4529812Cc15306";
      //   const amount = ethers.utils.parseUnits("1", 18);

      //   // Get the current user's address
      //   const userAddress = await signer.getAddress();
      //   console.log("User address:", userAddress);

      //   // STEP 1: Check project verification
      //   const isVerified = await contract.verifiedProjects(projectId);
      //   console.log("Project verified:", isVerified);

      //   // STEP 2: Check balance
      //   const balance = await contract.getPersonalProjectBalance(projectId);
      //   console.log("Your balance:", ethers.utils.formatEther(balance));

      //   if (balance.lt(amount)) {
      //     alert("Insufficient balance to transfer.");
      //     return;
      //   }

      //   // ADDITIONAL DEBUGGING: Check various contract states
      //   try {
      //     // Check if the recipient address is valid (not zero address)
      //     console.log("Recipient address:", address);

      //     // Check if the project exists or has any special requirements
      //     console.log("Project ID:", projectId);

      //     // Try to simulate the transaction first (this might give us more details)
      //     console.log("Simulating transaction...");
      //     await contract.callStatic.transferCredits(projectId, address, amount);
      //     console.log("Simulation successful - transaction should work");
      //   } catch (simulationError) {
      //     console.error("Simulation failed:", simulationError);
      //     alert("Transaction simulation failed: " + simulationError.message);
      //     return;
      //   }

      //   console.log("Submitting transaction...");

      //   // STEP 3: Perform transfer
      //   const tx = await contract.transferCredits(projectId, address, amount, {
      //     gasLimit: 500000,
      //   });

      //   console.log("Transaction sent:", tx.hash);
      //   console.log("Waiting for confirmation...");

      //   const receipt = await tx.wait();

      //   if (receipt.status === 1) {
      //     console.log("Transaction confirmed:", receipt.transactionHash);
      //     alert("Credits transferred successfully!");
      //   } else {
      //     console.error("Transaction failed:", receipt);
      //     alert("Transaction failed during execution");
      //   }
      // } catch (err) {
      //   console.error("Transfer failed:", err);

      //   // More detailed error logging
      //   console.log("Error details:", {
      //     code: err.code,
      //     message: err.message,
      //     data: err.data,
      //     transaction: err.transaction,
      //     receipt: err.receipt,
      //   });

      //   if (err.code === "UNPREDICTABLE_GAS_LIMIT") {
      //     alert("Transaction will likely fail. Check contract conditions.");
      //   } else if (err.code === "CALL_EXCEPTION") {
      //     alert(
      //       "Smart contract rejected the transaction. Check your inputs and contract state."
      //     );
      //   } else {
      //     alert(err.message || "Error during transfer");
      //   }
      // } finally {
      //   setIsLoading(false);
      // }

      // third function

      try {
        const signer = provider.getSigner();
        const contractAddress = "0x682dc0bb02e7f985fe6861a5693d2dbd405f396e";
        const contract = new ethers.Contract(contractAddress, abi, signer);
        const projectId = "project1";
        const address = "0xD3FA22780F4b73564044dd9F6B4529812Cc15306";
        const amount = ethers.utils.parseUnits("1", 18);

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

        // ore
        // const approve = await contract.approve(contractAddress, amount);

        // console.log("Approval transaction sent:", approve.hash);
        // await approve.wait();
        console.log("Approval confirmed");

        // Now perform the transfer
        console.log("Submitting transfer...");
        const tx = await contract.transferCredits(projectId, address, amount, {
          gasLimit: 500000,
        });

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
    return address.startsWith("0.0.") && address.length > 6;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <Button onClick={checkBalance}>Check Balance</Button>
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
                {availableCredits.toLocaleString()} tCO2
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
              <Label htmlFor="amount">Amount to Transfer (tCO2)</Label>
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
                  Max available: {availableCredits.toLocaleString()} tCO2
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
                    <p className="font-medium">{transferAmount} tCO2</p>
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
                      tCO2
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
                  amount: "50 tCO2",
                  address: "0.0.789123",
                  txHash: "0x1234567890abcdef",
                  status: "completed",
                  time: "2 hours ago",
                },
                {
                  type: "received",
                  amount: "75 tCO2",
                  address: "0.0.456789",
                  txHash: "0xabcdef1234567890",
                  status: "completed",
                  time: "1 day ago",
                },
                {
                  type: "sent",
                  amount: "25 tCO2",
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
