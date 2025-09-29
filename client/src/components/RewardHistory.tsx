import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, Search, Download, Filter } from "lucide-react";
import { useState } from "react";

interface RewardEntry {
  id: string;
  date: string;
  walletAddress: string;
  walletLabel: string;
  type: 'staking' | 'validator';
  amount: number;
  transactionHash: string;
}

interface RewardHistoryProps {
  rewards: RewardEntry[];
  onExport: () => void;
}

export default function RewardHistory({ rewards, onExport }: RewardHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'staking' | 'validator'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  const filteredRewards = rewards
    .filter(reward => {
      const matchesSearch = searchTerm === '' || 
        reward.walletLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.walletAddress.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || reward.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return b.amount - a.amount;
      }
    });

  return (
    <Card data-testid="card-reward-history">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">Reward History</CardTitle>
          <Badge variant="secondary">{filteredRewards.length} entries</Badge>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={onExport}
          data-testid="button-export"
        >
          <Download className="h-3 w-3 mr-1" />
          Export
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by wallet label or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
              data-testid="input-search"
            />
          </div>
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-32" data-testid="select-filter-type">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="staking">Staking</SelectItem>
              <SelectItem value="validator">Validator</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-28" data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">By Date</SelectItem>
              <SelectItem value="amount">By Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reward entries */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredRewards.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-rewards">
              No rewards found matching your criteria
            </div>
          ) : (
            filteredRewards.map((reward) => (
              <div 
                key={reward.id}
                className="flex items-center justify-between p-3 border rounded-md hover-elevate"
                data-testid={`reward-entry-${reward.id}`}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={reward.type === 'staking' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {reward.type}
                    </Badge>
                    <span className="text-sm font-medium">{reward.walletLabel}</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Hash: <span className="font-mono">{truncateHash(reward.transactionHash)}</span></div>
                    <div>{formatDate(reward.date)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm" data-testid={`text-reward-amount-${reward.id}`}>
                    {formatCurrency(reward.amount)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}