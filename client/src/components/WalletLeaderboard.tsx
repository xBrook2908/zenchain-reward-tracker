import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, TrendingUp, Crown } from "lucide-react";

interface LeaderboardWallet {
  id: string;
  address: string;
  label: string;
  totalRewards: number;
  totalRewardsUsd: number;
  stakingRewards: number;
  validatorRewards: number;
  rank: number;
  rewardChange24h: number;
}

interface WalletLeaderboardProps {
  wallets: LeaderboardWallet[];
  showTop?: number;
}

export default function WalletLeaderboard({ wallets, showTop = 10 }: WalletLeaderboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatZTC = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount) + ' ZTC';
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Trophy className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Medal className="h-4 w-4 text-amber-600" />;
      default:
        return <Award className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge variant="default" className="bg-yellow-500 text-yellow-50">🥇 #1</Badge>;
    if (rank === 2) return <Badge variant="secondary" className="bg-gray-400 text-gray-50">🥈 #2</Badge>;
    if (rank === 3) return <Badge variant="secondary" className="bg-amber-600 text-amber-50">🥉 #3</Badge>;
    return <Badge variant="outline">#{rank}</Badge>;
  };

  const getPerformanceBadge = (rewardChange24h: number) => {
    if (rewardChange24h > 20) return <Badge variant="default" className="bg-green-600">🔥 Hot</Badge>;
    if (rewardChange24h > 10) return <Badge variant="secondary" className="bg-green-500">📈 Rising</Badge>;
    if (rewardChange24h > 0) return <Badge variant="outline" className="text-green-600">+ Gaining</Badge>;
    return <Badge variant="outline" className="text-muted-foreground">- Stable</Badge>;
  };

  const topWallets = wallets.slice(0, showTop);

  return (
    <Card data-testid="card-wallet-leaderboard">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <Trophy className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-lg font-medium">Top Performers</CardTitle>
          <Badge variant="secondary">{wallets.length} wallets</Badge>
        </div>
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          <span>Ranked by total rewards</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {topWallets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground" data-testid="text-no-wallets">
            No wallets to display
          </div>
        ) : (
          topWallets.map((wallet) => (
            <div 
              key={wallet.id}
              className={`flex items-center justify-between p-3 rounded-lg border hover-elevate transition-all duration-200 ${
                wallet.rank <= 3 ? 'bg-muted/50' : 'bg-card'
              }`}
              data-testid={`leaderboard-entry-${wallet.id}`}
            >
              <div className="flex items-center space-x-3 flex-1">
                {/* Rank and Avatar */}
                <div className="flex items-center space-x-2">
                  {getRankIcon(wallet.rank)}
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {wallet.label.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Wallet Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-sm truncate" data-testid={`text-wallet-label-${wallet.id}`}>
                      {wallet.label}
                    </h4>
                    {getRankBadge(wallet.rank)}
                    {getPerformanceBadge(wallet.rewardChange24h)}
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <span className="font-mono">{truncateAddress(wallet.address)}</span>
                    <span>•</span>
                    <div className="flex space-x-2">
                      {wallet.stakingRewards > 0 && (
                        <Badge variant="outline" className="text-xs py-0">
                          Staking: {formatZTC(wallet.stakingRewards)}
                        </Badge>
                      )}
                      {wallet.validatorRewards > 0 && (
                        <Badge variant="outline" className="text-xs py-0">
                          Validator: {formatZTC(wallet.validatorRewards)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rewards */}
              <div className="text-right space-y-1">
                <div className="font-bold text-sm" data-testid={`text-total-rewards-${wallet.id}`}>
                  {formatCurrency(wallet.totalRewardsUsd)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatZTC(wallet.totalRewards)}
                </div>
                <div className={`text-xs flex items-center justify-end space-x-1 ${
                  wallet.rewardChange24h > 0 ? 'text-green-600' : 'text-muted-foreground'
                }`}>
                  <TrendingUp className="h-3 w-3" />
                  <span data-testid={`text-change-${wallet.id}`}>
                    {wallet.rewardChange24h > 0 ? '+' : ''}{wallet.rewardChange24h.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Summary Stats */}
        {topWallets.length > 0 && (
          <div className="pt-4 mt-4 border-t border-border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm font-medium" data-testid="text-total-wallets">
                  {wallets.length}
                </div>
                <div className="text-xs text-muted-foreground">Total Wallets</div>
              </div>
              <div>
                <div className="text-sm font-medium" data-testid="text-total-value">
                  {formatCurrency(wallets.reduce((sum, w) => sum + w.totalRewardsUsd, 0))}
                </div>
                <div className="text-xs text-muted-foreground">Total Value</div>
              </div>
              <div>
                <div className="text-sm font-medium" data-testid="text-avg-reward">
                  {formatCurrency(wallets.reduce((sum, w) => sum + w.totalRewardsUsd, 0) / wallets.length)}
                </div>
                <div className="text-xs text-muted-foreground">Avg. Reward</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}