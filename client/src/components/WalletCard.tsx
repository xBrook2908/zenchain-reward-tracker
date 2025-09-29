import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, Eye, Trash2, TrendingUp } from "lucide-react";
import { useState } from "react";

interface WalletCardProps {
  id: string;
  address: string;
  label: string;
  stakingRewards: number;
  validatorRewards: number;
  isConnected: boolean;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function WalletCard({
  id,
  address,
  label,
  stakingRewards,
  validatorRewards,
  isConnected,
  onView,
  onDelete
}: WalletCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const totalRewards = stakingRewards + validatorRewards;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Card 
      className="hover-elevate transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`card-wallet-${id}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium" data-testid={`text-wallet-label-${id}`}>
            {label}
          </CardTitle>
        </div>
        <Badge 
          variant={isConnected ? "secondary" : "destructive"}
          data-testid={`badge-connection-${id}`}
        >
          {isConnected ? "Connected" : "Disconnected"}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Address</div>
          <div 
            className="font-mono text-sm bg-muted px-2 py-1 rounded"
            data-testid={`text-wallet-address-${id}`}
          >
            {truncateAddress(address)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Rewards</span>
            <span className="font-bold" data-testid={`text-total-rewards-${id}`}>
              {formatCurrency(totalRewards)}
            </span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Staking</span>
              <span data-testid={`text-staking-rewards-${id}`}>
                {formatCurrency(stakingRewards)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Validator</span>
              <span data-testid={`text-validator-rewards-${id}`}>
                {formatCurrency(validatorRewards)}
              </span>
            </div>
          </div>
        </div>

        <div 
          className={`flex space-x-2 transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-60'
          }`}
        >
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => onView(id)}
            data-testid={`button-view-${id}`}
          >
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onDelete(id)}
            data-testid={`button-delete-${id}`}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}