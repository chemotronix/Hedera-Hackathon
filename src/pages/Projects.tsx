// Extend the Window type to include 'ethereum'
declare global {
  interface Window {
    ethereum?: any;
  }
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  Upload,
  MapPin,
  Calendar,
  Users,
  Wallet,
} from "lucide-react";
import { abi } from "../constants/abi";
import { ethers } from "ethers";

const Projects = () => {
  const [showForm, setShowForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [operator, setOperator] = useState("You");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Wallet connection states
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasMetamask, setHasMetamask] = useState(false);

  const [projects, setProjects] = useState([
    {
      name: "Solar Farm Alpha",
      type: "Solar Energy",
      location: "California, USA",
      capacity: "1,200 CMX/year",
      status: "verified",
      credits: 850,
      operator: "GreenEnergy Corp",
    },
    {
      name: "Wind Project Beta",
      type: "Wind Power",
      location: "Texas, USA",
      capacity: "800 CMX/year",
      status: "pending",
      credits: 0,
      operator: "WindTech Solutions",
    },
    {
      name: "Forest Conservation",
      type: "Reforestation",
      location: "Brazil",
      capacity: "2,000 CMX/year",
      status: "verified",
      credits: 1450,
      operator: "EcoForest Initiative",
    },
    {
      name: "Biogas Facility",
      type: "Methane Capture",
      location: "Denmark",
      capacity: "600 CMX/year",
      status: "under_review",
      credits: 0,
      operator: "BioGas Nordic",
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

  const connectWallet = async () => {
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

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setIsConnected(false);
  };

  const handleVerifyProject = async () => {
    if (!projectName.trim()) {
      alert("Please enter a project name.");
      return;
    }

    if (!isConnected || !provider) {
      alert("Please connect your wallet first.");
      return;
    }

    setIsSubmitting(true);

    try {
      const signer = provider.getSigner();
      const contractAddress = "0x682dc0bb02e7f985fe6861a5693d2dbd405f396e";

      const contract = new ethers.Contract(contractAddress, abi, signer);

      console.log("Calling verifyProject with:", projectName);
      console.log("Contract address:", contractAddress);
      console.log("Account:", account);

      // Call the contract method
      const tx = await contract.verifyProject(projectName);
      console.log("Transaction sent:", tx.hash);

      // Wait for transaction confirmation
      await tx.wait();
      console.log("Transaction confirmed");

      // Add project to list
      const newProject = {
        name: projectName,
        type: projectType,
        location,
        capacity: `${capacity} CMX/year`,
        status: "pending",
        credits: 0,
        operator,
      };

      setProjects((prev) => [newProject, ...prev]);
      setShowForm(false);

      // Reset form
      setProjectName("");
      setProjectType("");
      setLocation("");
      setCapacity("");
      setDescription("");

      alert("Project submitted for verification successfully!");
      console.log("Project submitted for verification:", projectName);
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
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              Project Verification
            </h1>
            <p className="text-muted-foreground mt-1">
              Submit and verify carbon credit projects
            </p>
            {/* Connection Status */}
            <div className="mt-2">
              {isConnected && account ? (
                <p className="text-sm text-success">
                  ✓ Wallet Connected: {account.slice(0, 6)}...
                  {account.slice(-4)}
                </p>
              ) : (
                <p className="text-sm text-amber-600">
                  ⚠ Wallet not connected - Connect your wallet to submit
                  projects
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={isConnected ? disconnectWallet : connectWallet}
              variant="outline"
              className="border-primary/20"
            >
              <Wallet className="mr-2 h-4 w-4" />
              {isConnected ? "Disconnect" : "Connect Wallet"}
            </Button>
            {/* only admin can create a new project */}
            {/* <Button
              onClick={() => setShowForm(true)}r
              className="gradient-hero text-primary-foreground"
              disabled={!isConnected}
            >
              Submit New Project
            </Button> */}
          </div>
        </div>

        {/* New Project Form */}
        {showForm && (
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Submit New Project for Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="projectName">Project Name *</Label>
                    <Input
                      id="projectName"
                      placeholder="e.g., Solar Farm Alpha"
                      className="mt-1"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="projectType">Project Type</Label>
                    <Input
                      id="projectType"
                      placeholder="e.g., Solar Energy, Wind Power"
                      className="mt-1"
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., California, USA"
                      className="mt-1"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="capacity">
                      Expected Capacity (CMX/year)
                    </Label>
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="1000"
                      className="mt-1"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Project Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your carbon credit project..."
                      className="mt-1 h-32"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="documents">Supporting Documents</Label>
                    <Input
                      id="documents"
                      type="file"
                      multiple
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload environmental impact assessments, certifications,
                      etc.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleVerifyProject}
                  className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                  disabled={isSubmitting || !projectName.trim() || !isConnected}
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Submit for Verification
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <Card
              key={index}
              className="gradient-card hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {project.type}
                    </p>
                  </div>
                  <Badge
                    variant={
                      project.status === "verified" ? "default" : "secondary"
                    }
                    className={
                      project.status === "verified"
                        ? "bg-success"
                        : project.status === "pending"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }
                  >
                    {project.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {project.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Capacity: {project.capacity}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {project.operator}
                  </div>
                </div>

                {project.status === "verified" && (
                  <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                    <p className="text-sm font-medium text-success">
                      Credits Available: {project.credits.toLocaleString()} CMX
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={project.status !== "verified"}
                  >
                    View Details
                  </Button>
                  {project.status === "verified" && (
                    <Button
                      size="sm"
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      Generate Credits
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
