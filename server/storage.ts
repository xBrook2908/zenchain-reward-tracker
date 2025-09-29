import { 
  type Wallet, 
  type InsertWallet,
  type RewardEntry,
  type InsertRewardEntry,
  type WalletBalance,
  type NetworkStatus,
  type WalletWithBalance,
  type RewardHistoryEntry,
  type DashboardStats,
  type ChartDataPoint
} from "@shared/schema";
import { randomUUID } from "crypto";

// Extended interface for Zenchain reward tracking
export interface IStorage {
  // Wallet management
  getWallet(id: string): Promise<Wallet | undefined>;
  getWalletByAddress(address: string): Promise<Wallet | undefined>;
  getAllWallets(): Promise<WalletWithBalance[]>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWallet(id: string, updates: Partial<Wallet>): Promise<Wallet | undefined>;
  deleteWallet(id: string): Promise<boolean>;

  // Reward tracking
  addRewardEntry(entry: InsertRewardEntry): Promise<RewardEntry>;
  getRewardHistory(walletId?: string, limit?: number, offset?: number): Promise<RewardHistoryEntry[]>;
  getRewardsByTimeframe(walletId: string, days: number): Promise<ChartDataPoint[]>;

  // Wallet balances
  getWalletBalance(walletId: string): Promise<WalletBalance | undefined>;
  updateWalletBalance(walletId: string, balance: Partial<WalletBalance>): Promise<WalletBalance>;

  // Dashboard statistics
  getDashboardStats(): Promise<DashboardStats>;

  // Network status
  getNetworkStatus(): Promise<NetworkStatus | undefined>;
  updateNetworkStatus(status: Partial<NetworkStatus>): Promise<NetworkStatus>;
}

export class MemStorage implements IStorage {
  private wallets: Map<string, Wallet>;
  private rewardEntries: Map<string, RewardEntry>;
  private walletBalances: Map<string, WalletBalance>;
  private networkStatus: NetworkStatus | undefined;

  constructor() {
    this.wallets = new Map();
    this.rewardEntries = new Map();
    this.walletBalances = new Map();
    
    // Initialize with basic network status only
    this.networkStatus = {
      id: "zenchain",
      currentEra: 0,
      currentBlock: 0,
      ztcPriceUsd: "0.45",
      totalStaked: "0.00000000",
      activeValidators: 0,
      lastUpdated: new Date(),
    };
  }

  async getWallet(id: string): Promise<Wallet | undefined> {
    return this.wallets.get(id);
  }

  async getWalletByAddress(address: string): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(
      (wallet) => wallet.address.toLowerCase() === address.toLowerCase()
    );
  }

  async getAllWallets(): Promise<WalletWithBalance[]> {
    const walletsWithBalances: WalletWithBalance[] = [];
    
    for (const wallet of Array.from(this.wallets.values())) {
      const balance = this.walletBalances.get(wallet.id);
      const totalStaking = parseFloat(balance?.totalStakingRewards || "0");
      const totalValidator = parseFloat(balance?.totalValidatorRewards || "0");
      
      walletsWithBalances.push({
        ...wallet,
        balance,
        totalRewards: totalStaking + totalValidator,
        totalRewardsUsd: parseFloat(balance?.totalStakingRewardsUsd || "0") + parseFloat(balance?.totalValidatorRewardsUsd || "0"),
        isConnected: wallet.isActive,
      });
    }

    return walletsWithBalances.sort((a, b) => b.totalRewards - a.totalRewards);
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const id = randomUUID();
    const wallet: Wallet = {
      ...insertWallet,
      id,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.wallets.set(id, wallet);
    
    // Initialize empty balance
    const balance: WalletBalance = {
      id: randomUUID(),
      walletId: id,
      walletAddress: wallet.address,
      totalStakingRewards: "0.00000000",
      totalValidatorRewards: "0.00000000",
      totalStakingRewardsUsd: "0.00",
      totalValidatorRewardsUsd: "0.00",
      currentStakedAmount: "0.00000000",
      lastUpdateEra: this.networkStatus?.currentEra || 0,
      lastUpdated: new Date(),
    };
    
    this.walletBalances.set(id, balance);
    
    return wallet;
  }

  async updateWallet(id: string, updates: Partial<Wallet>): Promise<Wallet | undefined> {
    const wallet = this.wallets.get(id);
    if (!wallet) return undefined;
    
    const updatedWallet = { ...wallet, ...updates, updatedAt: new Date() };
    this.wallets.set(id, updatedWallet);
    return updatedWallet;
  }

  async deleteWallet(id: string): Promise<boolean> {
    const deleted = this.wallets.delete(id);
    if (deleted) {
      this.walletBalances.delete(id);
      // Remove associated reward entries
      for (const [entryId, entry] of Array.from(this.rewardEntries.entries())) {
        if (entry.walletId === id) {
          this.rewardEntries.delete(entryId);
        }
      }
    }
    return deleted;
  }

  async addRewardEntry(entry: InsertRewardEntry): Promise<RewardEntry> {
    const id = randomUUID();
    const rewardEntry: RewardEntry = {
      ...entry,
      id,
      createdAt: new Date(),
    };
    
    this.rewardEntries.set(id, rewardEntry);
    return rewardEntry;
  }

  async getRewardHistory(walletId?: string, limit = 50, offset = 0): Promise<RewardHistoryEntry[]> {
    let entries = Array.from(this.rewardEntries.values());
    
    if (walletId) {
      entries = entries.filter(entry => entry.walletId === walletId);
    }
    
    entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return entries.slice(offset, offset + limit).map(entry => {
      const wallet = this.wallets.get(entry.walletId);
      return {
        id: entry.id,
        walletAddress: entry.walletAddress,
        walletLabel: wallet?.label || "Unknown Wallet",
        rewardType: entry.rewardType as 'staking' | 'validator',
        amount: parseFloat(entry.amount),
        amountUsd: entry.amountUsd ? parseFloat(entry.amountUsd) : null,
        era: entry.era,
        transactionHash: entry.transactionHash,
        timestamp: entry.timestamp.toISOString(),
      };
    });
  }

  async getRewardsByTimeframe(walletId: string, days: number): Promise<ChartDataPoint[]> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    const entries = Array.from(this.rewardEntries.values())
      .filter(entry => 
        entry.walletId === walletId &&
        new Date(entry.timestamp) >= startDate &&
        new Date(entry.timestamp) <= endDate
      );

    // Group by day
    const groupedByDay = new Map<string, { staking: number; validator: number }>();
    
    entries.forEach(entry => {
      const dateKey = entry.timestamp.toISOString().split('T')[0];
      const existing = groupedByDay.get(dateKey) || { staking: 0, validator: 0 };
      
      if (entry.rewardType === 'staking') {
        existing.staking += parseFloat(entry.amount);
      } else {
        existing.validator += parseFloat(entry.amount);
      }
      
      groupedByDay.set(dateKey, existing);
    });

    const chartData: ChartDataPoint[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      const dayData = groupedByDay.get(dateKey) || { staking: 0, validator: 0 };
      
      chartData.push({
        date: dateKey,
        stakingRewards: dayData.staking,
        validatorRewards: dayData.validator,
        totalRewards: dayData.staking + dayData.validator,
      });
    }

    return chartData;
  }

  async getWalletBalance(walletId: string): Promise<WalletBalance | undefined> {
    return this.walletBalances.get(walletId);
  }

  async updateWalletBalance(walletId: string, balance: Partial<WalletBalance>): Promise<WalletBalance> {
    const existing = this.walletBalances.get(walletId);
    const updated: WalletBalance = {
      ...existing,
      ...balance,
      lastUpdated: new Date(),
    } as WalletBalance;
    
    this.walletBalances.set(walletId, updated);
    return updated;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const wallets = Array.from(this.wallets.values());
    const balances = Array.from(this.walletBalances.values());
    
    const totalRewards = balances.reduce((sum, balance) => {
      return sum + parseFloat(balance.totalStakingRewards) + parseFloat(balance.totalValidatorRewards);
    }, 0);
    
    const totalRewardsUsd = balances.reduce((sum, balance) => {
      return sum + parseFloat(balance.totalStakingRewardsUsd || "0") + parseFloat(balance.totalValidatorRewardsUsd || "0");
    }, 0);

    return {
      totalWallets: wallets.length,
      activeWallets: wallets.filter(w => w.isActive).length,
      totalRewards,
      totalRewardsUsd,
      rewardChange24h: 12.5, // Mock 24h change
      lastUpdateTime: new Date().toISOString(),
    };
  }

  async getNetworkStatus(): Promise<NetworkStatus | undefined> {
    return this.networkStatus;
  }

  async updateNetworkStatus(status: Partial<NetworkStatus>): Promise<NetworkStatus> {
    this.networkStatus = {
      ...this.networkStatus,
      ...status,
      lastUpdated: new Date(),
    } as NetworkStatus;
    
    return this.networkStatus;
  }
}

export const storage = new MemStorage();
