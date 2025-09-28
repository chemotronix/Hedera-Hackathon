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

const Retire = () => {
  const [retireAmount, setRetireAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [personalBalance, setPersonalBalance] = useState<number>(0);
  const [projectBalance, setProjectBalance] = useState<number>(0);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);

  // Wallet connection states
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasMetamask, setHasMetamask] = useState(false);

  const availableCredits = 1250;

  const toggleVisibility = (
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setter((prev) => !prev);
  };

  const formatBalance = (value: number, show: boolean) => {
    return show ? `${value.toLocaleString()} CMX` : "••••••••";
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

  const [retired, setRetired] = useState([
    {
      amount: "25 CMX",
      reason: "Personal carbon footprint offset",
      date: "March 15, 2024",
      certificate: "RET-2024-001234",
    },
    {
      amount: "150 CMX",
      reason: "Corporate sustainability commitment",
      date: "February 28, 2024",
      certificate: "RET-2024-001189",
    },
    {
      amount: "50 CMX",
      reason: "Conference event compensation",
      date: "January 12, 2024",
      certificate: "RET-2024-000987",
    },
  ]);

  const handleRetire = async () => {
    if (!retireAmount || !reason) {
      alert("Please sepecify retirement amount and reason");
      return;
    }

    if (!isConnected || !provider) {
      alert("Please connect your wallet first.");
      return;
    }

    setIsLoading(true);

    try {
      const signer = provider.getSigner();
      // const contractAddress = "0x07dac1f0404152a86d1c1a20e3f5438bbb6a45e6";
      // const contractAddress = "0x3b6fe79938f3422bb1a3bf7c672067a83b3c762e";
      const contractAddress = "0x682dc0bb02e7f985fe6861a5693d2dbd405f396e";

      const contract = new ethers.Contract(contractAddress, abi, signer);

      console.log("Retire amount:", retireAmount);
      console.log("Retire reason:", reason);
      const projectId = "project1";
      const amount = ethers.utils.parseUnits(retireAmount, 18); // 10 CMX tokens (assuming 18 decimals)
      const tokenURI =
        "https://bafybeia6hmpwrqnycg6p7rzpf22euw3da7nm53jgppanevvc5igg6voudm.ipfs.w3s.link/cert1.webp"; // your metadata link

      const tx = await contract.retireCredits(projectId, amount, tokenURI);
      const receipt = await tx.wait();

      console.log("Credits retired! Tx:", receipt.transactionHash);

      console.log("Transaction confirmed");

      // Add new retired  to list
      const newRetired = {
        amount: retireAmount,
        reason: reason,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        certificate: "RET-2024-001234",
      };

      setRetired((prev) => [newRetired, ...prev]);

      alert("Project retired successfully!");
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
        </div>

        {/* Balance Overview */}
        <Card className="gradient-card">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary mb-2">
                {/* {availableCredits.toLocaleString()} CMX */}
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
              <p className="text-muted-foreground">Available for Retirement</p>
            </div>
          </CardContent>
        </Card>

        {/* Retirement Interface */}
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
                max={availableCredits}
              />
              <p className="text-sm text-muted-foreground">
                Max available: {availableCredits.toLocaleString()} CMX
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
                      {Math.round(Number(retireAmount) * 2200).toLocaleString()}{" "}
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
                    Once retired, these credits cannot be traded or transferred.
                    This action is irreversible.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleRetire}
              disabled={!retireAmount || !reason || isLoading}
              className="w-full bg-climate hover:bg-climate/90 text-climate-foreground"
              size="lg"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Lock className="mr-2 h-4 w-4" />
              )}
              {isLoading ? "Retiring Credits..." : "Retire Credits Permanently"}
            </Button>
          </CardContent>
        </Card>

        {/* Retirement History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Retirement History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {retired.map((retirement, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="h-4 w-4 text-climate" />
                      <p className="font-medium">Retired {retirement.amount}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {retirement.reason}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Certificate: {retirement.certificate}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Retire;
