import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Wallet, Clock, DollarSign } from "lucide-react";

interface DashboardOverviewProps {
  totalRewards: number;
  activeWallets: number;
  lastUpdate: string;
  rewardChange: number;
}

export default function DashboardOverview({ 
  totalRewards, 
  activeWallets, 
  lastUpdate, 
  rewardChange 
}: DashboardOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card data-testid="card-total-rewards">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="text-total-rewards">
            {formatCurrency(totalRewards)}
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span data-testid="text-reward-change">
              {rewardChange > 0 ? '+' : ''}{rewardChange.toFixed(2)}% from last month
            </span>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-active-wallets">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="text-active-wallets">
            {activeWallets}
          </div>
          <Badge variant="secondary" className="mt-1">
            All Connected
          </Badge>
        </CardContent>
      </Card>

      <Card data-testid="card-last-update">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Update</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium" data-testid="text-last-update">
            {formatDate(lastUpdate)}
          </div>
          <Badge variant="outline" className="mt-1">
            Live Sync
          </Badge>
        </CardContent>
      </Card>

      <Card data-testid="card-reward-types">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reward Types</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Staking</span>
              <Badge variant="secondary">Active</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Validator</span>
              <Badge variant="secondary">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}