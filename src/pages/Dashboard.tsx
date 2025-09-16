import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Wallet, Coins, ArrowUpRight, ArrowDownRight, CheckCircle } from "lucide-react";

const Dashboard = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [showProjectBalance, setShowProjectBalance] = useState(true);
  const [showRetiredCredits, setShowRetiredCredits] = useState(true);

  const toggleVisibility = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(prev => !prev);
  };

  const formatBalance = (value: number, show: boolean) => {
    return show ? `${value.toLocaleString()} tCO2` : "••••••••";
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
          </div>
          <Button className="gradient-hero text-primary-foreground">
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        </div>

        {/* Balance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Personal Balance */}
          <Card className="gradient-card border-accent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Personal Balance</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleVisibility(setShowBalance)}
                className="h-8 w-8 p-0"
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatBalance(1250, showBalance)}
              </div>
              <p className="text-xs text-muted-foreground">
                Available carbon credits
              </p>
            </CardContent>
          </Card>

          {/* Project Balance */}
          <Card className="gradient-card border-success/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Project Balance</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleVisibility(setShowProjectBalance)}
                className="h-8 w-8 p-0"
              >
                {showProjectBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {formatBalance(890, showProjectBalance)}
              </div>
              <p className="text-xs text-muted-foreground">
                Project-generated credits
              </p>
            </CardContent>
          </Card>

          {/* Retired Credits */}
          <Card className="gradient-card border-climate/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retired Credits</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleVisibility(setShowRetiredCredits)}
                className="h-8 w-8 p-0"
              >
                {showRetiredCredits ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-climate">
                {formatBalance(345, showRetiredCredits)}
              </div>
              <p className="text-xs text-muted-foreground">
                Permanently retired
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="h-24 flex flex-col gap-2 border-primary/20 hover:bg-accent">
            <CheckCircle className="h-6 w-6 text-primary" />
            <span className="text-sm">Verify Project</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2 border-success/20 hover:bg-accent">
            <Coins className="h-6 w-6 text-success" />
            <span className="text-sm">Mint Tokens</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2 border-climate/20 hover:bg-accent">
            <ArrowDownRight className="h-6 w-6 text-climate" />
            <span className="text-sm">Retire Credits</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2 border-muted-foreground/20 hover:bg-accent">
            <ArrowUpRight className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm">Transfer Credits</span>
          </Button>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Recent Activity
              <Badge variant="secondary" className="ml-auto">Live</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Minted", amount: "100 tCO2", project: "Solar Farm Alpha", time: "2 hours ago", status: "verified" },
                { action: "Retired", amount: "25 tCO2", project: "Personal Offset", time: "5 hours ago", status: "completed" },
                { action: "Transferred", amount: "50 tCO2", project: "Wind Project Beta", time: "1 day ago", status: "completed" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === "verified" ? "bg-success" : "bg-climate"
                    }`} />
                    <div>
                      <p className="font-medium">{activity.action} {activity.amount}</p>
                      <p className="text-sm text-muted-foreground">{activity.project}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                    <Badge 
                      variant={activity.status === "verified" ? "default" : "secondary"}
                      className={activity.status === "verified" ? "bg-success" : ""}
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
};

export default Dashboard;