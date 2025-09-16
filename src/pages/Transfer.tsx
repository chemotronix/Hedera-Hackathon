import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Send, History, CheckCircle, Clock } from "lucide-react";

const Transfer = () => {
  const [recipient, setRecipient] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const availableCredits = 1250;

  const handleTransfer = async () => {
    if (!recipient || !transferAmount) return;
    
    setIsLoading(true);
    // Simulate transfer process
    setTimeout(() => {
      setIsLoading(false);
      // Reset form
      setRecipient("");
      setTransferAmount("");
    }, 2000);
  };

  const validateAddress = (address: string) => {
    // Basic Hedera address validation
    return address.startsWith("0.0.") && address.length > 6;
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
                <p className="text-sm text-destructive">Invalid Hedera address format</p>
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
                <span>Max available: {availableCredits.toLocaleString()} tCO2</span>
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
                    <p className="font-medium">{(availableCredits - Number(transferAmount)).toLocaleString()} tCO2</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <Button 
              onClick={handleTransfer}
              disabled={!recipient || !transferAmount || !validateAddress(recipient) || isLoading}
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
                  time: "2 hours ago"
                },
                {
                  type: "received",
                  amount: "75 tCO2",
                  address: "0.0.456789",
                  txHash: "0xabcdef1234567890",
                  status: "completed",
                  time: "1 day ago"
                },
                {
                  type: "sent",
                  amount: "25 tCO2",
                  address: "0.0.321654",
                  txHash: "0x9876543210fedcba",
                  status: "pending",
                  time: "2 days ago"
                }
              ].map((transfer, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
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
                        {transfer.type === "sent" ? "Sent" : "Received"} {transfer.amount}
                      </p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {transfer.type === "sent" ? "To" : "From"}: {transfer.address}
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
                        variant={transfer.status === "completed" ? "default" : "secondary"}
                        className={transfer.status === "completed" ? "bg-success" : "bg-yellow-500"}
                      >
                        {transfer.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{transfer.time}</p>
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