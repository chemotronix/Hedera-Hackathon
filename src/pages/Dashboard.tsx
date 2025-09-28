// // // Extend the Window type to include 'ethereum'
// declare global {
//   interface Window {
//     ethereum?: any;
//   }
// }

// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Eye,
//   EyeOff,
//   Wallet,
//   Coins,
//   ArrowUpRight,
//   ArrowDownRight,
//   CheckCircle,
// } from "lucide-react";
// import { ethers } from "ethers";
// import { abi } from "../constants/abi";
// import { useNavigate } from "react-router-dom";

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const [showBalance, setShowBalance] = useState(true);
//   const [showProjectBalance, setShowProjectBalance] = useState(true);
//   const [showRetiredCredits, setShowRetiredCredits] = useState(true);
//   const [hasMetamask, setHasMetamask] = useState(false);
//   const [account, setAccount] = useState<string | null>(null);
//   const [provider, setProvider] =
//     useState<ethers.providers.Web3Provider | null>(null);
//   const [isConnected, setIsConnected] = useState(false);

//   const toggleVisibility = (
//     setter: React.Dispatch<React.SetStateAction<boolean>>
//   ) => {
//     setter((prev) => !prev);
//   };

//   const formatBalance = (value: number, show: boolean) => {
//     return show ? `${value.toLocaleString()} CMX` : "••••••••";
//   };

//   useEffect(() => {
//     checkMetamaskAndConnection();
//   }, []);

//   const checkMetamaskAndConnection = async () => {
//     if (typeof window.ethereum !== "undefined") {
//       setHasMetamask(true);

//       // Check if already connected
//       try {
//         const provider = new ethers.providers.Web3Provider(window.ethereum);
//         const accounts = await provider.listAccounts();
//         if (accounts.length > 0) {
//           setAccount(accounts[0]);
//           setProvider(provider);
//           setIsConnected(true);
//         }
//       } catch (error) {
//         console.error("Error checking connection:", error);
//       }
//     }
//   };

//   const handleConnectWallet = async () => {
//     try {
//       if (!hasMetamask) {
//         alert("Please install MetaMask!");
//         return;
//       }

//       // Switch to Hedera network
//       try {
//         await window.ethereum.request({
//           method: "wallet_switchEthereumChain",
//           params: [{ chainId: "0x128" }], // 296 in hex
//         });
//       } catch (switchError: any) {
//         // If the chain hasn't been added to MetaMask, add it
//         if (switchError.code === 4902) {
//           try {
//             await window.ethereum.request({
//               method: "wallet_addEthereumChain",
//               params: [
//                 {
//                   chainId: "0x128",
//                   chainName: "Hedera Testnet",
//                   nativeCurrency: {
//                     name: "HBAR",
//                     symbol: "HBAR",
//                     decimals: 18,
//                   },
//                   rpcUrls: ["https://testnet.hashio.io/api"],
//                   blockExplorerUrls: ["https://hashscan.io/testnet"],
//                 },
//               ],
//             });
//           } catch (addError) {
//             console.error("Error adding Hedera network:", addError);
//             throw addError;
//           }
//         } else {
//           throw switchError;
//         }
//       }

//       // Request account access
//       await window.ethereum.request({ method: "eth_requestAccounts" });

//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();
//       const address = await signer.getAddress();

//       setAccount(address);
//       setProvider(provider);
//       setIsConnected(true);
//     } catch (error) {
//       console.error("Error connecting wallet:", error);
//       alert("Failed to connect wallet. Please try again.");
//     }
//   };

//   const handleDisconnect = () => {
//     setAccount(null);
//     setProvider(null);
//     setIsConnected(false);
//   };

//   return (
//     <div className="min-h-screen bg-background p-6">
//       <div className="max-w-7xl mx-auto space-y-8">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <div>
//             <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-climate bg-clip-text text-transparent">
//               Carbon Credit Dashboard
//             </h1>
//             <p className="text-muted-foreground mt-1">
//               Manage your carbon credits on Hedera Guardian
//             </p>
//             {isConnected && account && (
//               <p className="text-sm text-success mt-1">
//                 Connected: {account.slice(0, 6)}...{account.slice(-4)}
//               </p>
//             )}
//           </div>
//           <div className="flex gap-2">
//             <Button
//               onClick={isConnected ? handleDisconnect : handleConnectWallet}
//               className="gradient-hero text-primary-foreground"
//             >
//               <Wallet className="mr-2 h-4 w-4" />
//               {isConnected ? "Disconnect" : "Connect Wallet"}
//             </Button>
//           </div>
//         </div>

//         {/* Balance Overview Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {/* Personal Balance */}
//           <Card className="gradient-card border-accent">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">
//                 Personal Balance
//               </CardTitle>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => toggleVisibility(setShowBalance)}
//                 className="h-8 w-8 p-0"
//               >
//                 {showBalance ? (
//                   <Eye className="h-4 w-4" />
//                 ) : (
//                   <EyeOff className="h-4 w-4" />
//                 )}
//               </Button>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-primary">
//                 {formatBalance(1250, showBalance)}
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 Available carbon credits
//               </p>
//             </CardContent>
//           </Card>

//           {/* Project Balance */}
//           <Card className="gradient-card border-success/20">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">
//                 Project Balance
//               </CardTitle>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => toggleVisibility(setShowProjectBalance)}
//                 className="h-8 w-8 p-0"
//               >
//                 {showProjectBalance ? (
//                   <Eye className="h-4 w-4" />
//                 ) : (
//                   <EyeOff className="h-4 w-4" />
//                 )}
//               </Button>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-success">
//                 {formatBalance(890, showProjectBalance)}
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 Project-generated credits
//               </p>
//             </CardContent>
//           </Card>

//           {/* Retired Credits */}
//           <Card className="gradient-card border-climate/20">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">
//                 Retired Credits
//               </CardTitle>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => toggleVisibility(setShowRetiredCredits)}
//                 className="h-8 w-8 p-0"
//               >
//                 {showRetiredCredits ? (
//                   <Eye className="h-4 w-4" />
//                 ) : (
//                   <EyeOff className="h-4 w-4" />
//                 )}
//               </Button>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-climate">
//                 {formatBalance(345, showRetiredCredits)}
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 Permanently retired
//               </p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Quick Actions */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           {/* <Link to="/verify"> */}
//           <Button
//             variant="outline"
//             className="h-24 flex flex-col gap-2 border-primary/20 hover:bg-accent"
//             disabled={!isConnected}
//             onClick={() => navigate("/projects")}
//           >
//             <CheckCircle className="h-6 w-6 text-primary" />
//             <span className="text-sm">Verify Project</span>
//           </Button>
//           {/* </Link> */}

//           <Button
//             variant="outline"
//             className="h-24 flex flex-col gap-2 border-success/20 hover:bg-accent"
//             disabled={!isConnected}
//             onClick={() => navigate("/mint")}
//           >
//             <Coins className="h-6 w-6 text-success" />
//             <span className="text-sm">Mint Tokens</span>
//           </Button>
//           <Button
//             variant="outline"
//             className="h-24 flex flex-col gap-2 border-climate/20 hover:bg-accent"
//             disabled={!isConnected}
//             onClick={() => navigate("/retire")}
//           >
//             <ArrowDownRight className="h-6 w-6 text-climate" />
//             <span className="text-sm">Retire Credits</span>
//           </Button>
//           <Button
//             variant="outline"
//             className="h-24 flex flex-col gap-2 border-muted-foreground/20 hover:bg-accent"
//             disabled={!isConnected}
//             onClick={() => navigate("/transfer")}
//           >
//             <ArrowUpRight className="h-6 w-6 text-muted-foreground" />
//             <span className="text-sm">Transfer Credits</span>
//           </Button>
//         </div>

//         {/* Recent Activity */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               Recent Activity
//               <Badge variant="secondary" className="ml-auto">
//                 Live
//               </Badge>
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {[
//                 {
//                   action: "Minted",
//                   amount: "100 CMX",
//                   project: "Solar Farm Alpha",
//                   time: "2 hours ago",
//                   status: "verified",
//                 },
//                 {
//                   action: "Retired",
//                   amount: "25 CMX",
//                   project: "Personal Offset",
//                   time: "5 hours ago",
//                   status: "completed",
//                 },
//                 {
//                   action: "Transferred",
//                   amount: "50 CMX",
//                   project: "Wind Project Beta",
//                   time: "1 day ago",
//                   status: "completed",
//                 },
//               ].map((activity, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center justify-between py-3 border-b border-border last:border-0"
//                 >
//                   <div className="flex items-center gap-3">
//                     <div
//                       className={`w-2 h-2 rounded-full ${
//                         activity.status === "verified"
//                           ? "bg-success"
//                           : "bg-climate"
//                       }`}
//                     />
//                     <div>
//                       <p className="font-medium">
//                         {activity.action} {activity.amount}
//                       </p>
//                       <p className="text-sm text-muted-foreground">
//                         {activity.project}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-sm text-muted-foreground">
//                       {activity.time}
//                     </p>
//                     <Badge
//                       variant={
//                         activity.status === "verified" ? "default" : "secondary"
//                       }
//                       className={
//                         activity.status === "verified" ? "bg-success" : ""
//                       }
//                     >
//                       {activity.status}
//                     </Badge>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

// // test

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
import {
  Eye,
  EyeOff,
  Wallet,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { ethers } from "ethers";
import { abi } from "../constants/abi";
import { useNavigate } from "react-router-dom";

// Define the contract address (you'll need to replace this with your actual contract address)
const CONTRACT_ADDRESS = "0x..."; // Replace with your actual contract address

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

  const toggleVisibility = (
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setter((prev) => !prev);
  };

  const formatBalance = (value: number, show: boolean) => {
    return show ? `${value.toLocaleString()} CMX` : "••••••••";
  };

  useEffect(() => {
    checkMetamaskAndConnection();
  }, []);

  useEffect(() => {
    if (isConnected && account && provider) {
      fetchBalances();
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
      const contractAddress = "0x682dc0bb02e7f985fe6861a5693d2dbd405f396e";

      const contract = new ethers.Contract(contractAddress, abi, signer);
      const projectId = "project1";
      // Fetch different types of balances based on your contract's methods
      // Adjust these method calls based on your actual contract ABI
      // await contract.mintNewToken(projectId, ethers.utils.parseUnits("8", 18));
      // Personal Balance - typically the standard balanceOf method
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

      // Retired Credits - again, depends on your contract structure
      try {
        const retiredBal = await contract.getTotalRetiredCredits();
        setRetiredCredits(parseFloat(ethers.utils.formatEther(retiredBal)));
      } catch (error) {
        // If retiredCreditsOf doesn't exist, you might calculate it differently
        console.log("Retired credits method not available:", error);
        setRetiredCredits(0);
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
    // Reset balances when disconnecting
    setPersonalBalance(0);
    setProjectBalance(0);
    setRetiredCredits(0);
    setBalanceError(null);
  };

  const handleRefreshBalances = () => {
    if (isConnected && account && provider) {
      fetchBalances();
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
            {balanceError && (
              <p className="text-sm text-red-500 mt-1">{balanceError}</p>
            )}
          </div>
          <div className="flex gap-2">
            {isConnected && (
              <Button
                onClick={handleRefreshBalances}
                variant="outline"
                size="sm"
                disabled={isLoadingBalances}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${
                    isLoadingBalances ? "animate-spin" : ""
                  }`}
                />
                {isLoadingBalances ? "Refreshing..." : "Refresh"}
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: "Minted",
                  amount: "100 CMX",
                  project: "Solar Farm Alpha",
                  time: "2 hours ago",
                  status: "verified",
                },
                {
                  action: "Retired",
                  amount: "25 CMX",
                  project: "Personal Offset",
                  time: "5 hours ago",
                  status: "completed",
                },
                {
                  action: "Transferred",
                  amount: "50 CMX",
                  project: "Wind Project Beta",
                  time: "1 day ago",
                  status: "completed",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.status === "verified"
                          ? "bg-success"
                          : "bg-climate"
                      }`}
                    />
                    <div>
                      <p className="font-medium">
                        {activity.action} {activity.amount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.project}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {activity.time}
                    </p>
                    <Badge
                      variant={
                        activity.status === "verified" ? "default" : "secondary"
                      }
                      className={
                        activity.status === "verified" ? "bg-success" : ""
                      }
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
