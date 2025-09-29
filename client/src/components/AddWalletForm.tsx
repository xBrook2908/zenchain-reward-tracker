import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Wallet, AlertCircle } from "lucide-react";
import { useState } from "react";

interface AddWalletFormProps {
  onSubmit: (wallet: { address: string; label: string; type: string }) => void;
  onCancel: () => void;
  isVisible: boolean;
}

export default function AddWalletForm({ onSubmit, onCancel, isVisible }: AddWalletFormProps) {
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');
  const [walletType, setWalletType] = useState('staking');
  const [errors, setErrors] = useState<{ address?: string; label?: string }>({});

  const validateAddress = (addr: string) => {
    // Basic Ethereum address validation
    const ethereumRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethereumRegex.test(addr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { address?: string; label?: string } = {};
    
    if (!address.trim()) {
      newErrors.address = 'Wallet address is required';
    } else if (!validateAddress(address)) {
      newErrors.address = 'Please enter a valid Ethereum address';
    }
    
    if (!label.trim()) {
      newErrors.label = 'Wallet label is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit({ address: address.trim(), label: label.trim(), type: walletType });
      // Reset form
      setAddress('');
      setLabel('');
      setWalletType('staking');
      setErrors({});
    }
  };

  const handleCancel = () => {
    setAddress('');
    setLabel('');
    setWalletType('staking');
    setErrors({});
    onCancel();
  };

  if (!isVisible) return null;

  return (
    <Card className="max-w-md mx-auto" data-testid="card-add-wallet">
      <CardHeader className="flex flex-row items-center space-x-2 space-y-0 pb-4">
        <Plus className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="text-lg font-medium">Add New Wallet</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wallet-address">Wallet Address</Label>
            <Input
              id="wallet-address"
              placeholder="0x742d35Cc6634C0532925a3b8D3Ac19C7C1C3a67e"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`font-mono ${errors.address ? 'border-destructive' : ''}`}
              data-testid="input-wallet-address"
            />
            {errors.address && (
              <div className="flex items-center space-x-1 text-destructive text-sm">
                <AlertCircle className="h-3 w-3" />
                <span data-testid="error-address">{errors.address}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet-label">Wallet Label</Label>
            <Input
              id="wallet-label"
              placeholder="e.g., Main Staking Wallet"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className={errors.label ? 'border-destructive' : ''}
              data-testid="input-wallet-label"
            />
            {errors.label && (
              <div className="flex items-center space-x-1 text-destructive text-sm">
                <AlertCircle className="h-3 w-3" />
                <span data-testid="error-label">{errors.label}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet-type">Primary Function</Label>
            <Select value={walletType} onValueChange={setWalletType}>
              <SelectTrigger data-testid="select-wallet-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staking">Staking Rewards</SelectItem>
                <SelectItem value="validator">Validator Node</SelectItem>
                <SelectItem value="both">Both Staking & Validator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted p-3 rounded-md">
            <div className="flex items-start space-x-2">
              <Wallet className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">What we'll track:</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">Staking Rewards</Badge>
                  <Badge variant="outline" className="text-xs">Validator Rewards</Badge>
                  <Badge variant="outline" className="text-xs">Reward History</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <Button 
              type="submit" 
              className="flex-1"
              data-testid="button-add-wallet"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Wallet
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}