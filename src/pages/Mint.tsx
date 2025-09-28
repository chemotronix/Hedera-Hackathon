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
import { Coins, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { abi } from "../constants/abi";
import { ethers } from "ethers";

const Mint = () => {
  const [mintAmount, setMintAmount] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Wallet connection states
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasMetamask, setHasMetamask] = useState(false);

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

  const [minted, setMinted] = useState([
    {
      amount: "100 CMX",
      project: "Solar Farm Alpha",
      txHash: "0x1234...5678",
      status: "confirmed",
      time: "2 hours ago",
    },
    {
      amount: "250 CMX",
      project: "Forest Conservation",
      txHash: "0x8765...4321",
      status: "confirmed",
      time: "1 day ago",
    },
    {
      amount: "75 CMX",
      project: "Solar Farm Alpha",
      txHash: "0x9999...1111",
      status: "pending",
      time: "3 days ago",
    },
  ]);

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

  const handleMint = async () => {
    if (!mintAmount || !selectedProject) {
      alert("Please select a project and anter an amount to mint.");
      return;
    }

    if (!isConnected || !provider) {
      alert("Please connect your wallet first.");
      return;
    }

    setIsLoading(true);

    try {
      const signer = provider.getSigner();
      const contractAddress = "0x682dc0bb02e7f985fe6861a5693d2dbd405f396e";

      const contract = new ethers.Contract(contractAddress, abi, signer);

      console.log("Calling verifyProject with:", selectedProject);
      console.log("Contract address:", contractAddress);
      console.log("Account:", account);

      // Call the contract method

      await contract.mintNewToken(
        selectedProject,
        ethers.utils.parseUnits(mintAmount, 18)
      );
      console.log("I have minted project1");

      console.log("Transaction confirmed");

      // Add mint to list
      const newMint = {
        amount: "10^8 CMX",
        project: selectedProject,
        txHash: "0x1234...5678",
        status: "confirmed",
        time: "less than a minute ago",
      };

      setMinted((prev) => [newMint, ...prev]);
      // setShowForm(false);

      // Reset form
      setSelectedProject("");
      setMintAmount("");
      // setLocation("");
      // setCapacity("");
      // setDescription("");

      alert("Project submitted for verification successfully!");
      console.log("Project submitted for minting:", selectedProject);
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            Mint Carbon Credits
          </h1>
          <p className="text-muted-foreground">
            Convert verified project capacity into tradeable carbon credit
            tokens
          </p>
        </div>

        {/* Minting Interface */}
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
                        availableProjects.find((p) => p.id === selectedProject)
                          ?.name
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

        {/* Recent Mints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Recent Minting Activity
              <Badge variant="secondary" className="ml-auto">
                <TrendingUp className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {minted.map((mint, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
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
                          mint.status === "confirmed" ? "default" : "secondary"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Mint;
