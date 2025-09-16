import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, Shield, Lock, Calendar } from "lucide-react";

const Retire = () => {
  const [retireAmount, setRetireAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const availableCredits = 1250;

  const handleRetire = async () => {
    if (!retireAmount || !reason) return;
    
    setIsLoading(true);
    // Simulate retirement process
    setTimeout(() => {
      setIsLoading(false);
      // Reset form
      setRetireAmount("");
      setReason("");
    }, 2000);
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
                {availableCredits.toLocaleString()} tCO2
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
              <Label htmlFor="amount">Amount to Retire (tCO2)</Label>
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
                Max available: {availableCredits.toLocaleString()} tCO2
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
                    <p className="font-bold text-climate">{retireAmount} tons</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Equivalent to</p>
                    <p className="font-bold text-climate">
                      ~{Math.round(Number(retireAmount) * 2200).toLocaleString()} miles driven
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
                    Once retired, these credits cannot be traded or transferred. This action is irreversible.
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
              {[
                {
                  amount: "25 tCO2",
                  reason: "Personal carbon footprint offset",
                  date: "March 15, 2024",
                  certificate: "RET-2024-001234"
                },
                {
                  amount: "150 tCO2",
                  reason: "Corporate sustainability commitment",
                  date: "February 28, 2024",
                  certificate: "RET-2024-001189"
                },
                {
                  amount: "50 tCO2",
                  reason: "Conference event compensation",
                  date: "January 12, 2024",
                  certificate: "RET-2024-000987"
                }
              ].map((retirement, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="h-4 w-4 text-climate" />
                      <p className="font-medium">Retired {retirement.amount}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{retirement.reason}</p>
                    <p className="text-xs text-muted-foreground">Certificate: {retirement.certificate}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-2">Permanent</Badge>
                    <p className="text-sm text-muted-foreground">{retirement.date}</p>
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