import { ethers } from 'ethers';

interface ZenchainConfig {
  rpcUrl: string;
  nativeStakingAddress: string;
  chainId: number;
}

interface StakingInfo {
  stakingAmount: string;
  rewards: string;
  era: number;
}

interface ValidatorInfo {
  commission: string;
  totalStake: string;
  rewards: string;
  era: number;
}

interface RewardInfo {
  era: number;
  amount: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: Date;
  type: 'staking' | 'validator';
}

export class ZenchainService {
  private provider: ethers.JsonRpcProvider;
  private config: ZenchainConfig;

  constructor() {
    // Zenchain testnet configuration
    this.config = {
      rpcUrl: 'https://zenchain-testnet.api.onfinality.io/public',
      nativeStakingAddress: '0x0000000000000000000000000000000000000800', // Precompile address
      chainId: 8408
    };

    this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
  }

  /**
   * Get current network status and era information
   */
  async getNetworkStatus() {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      const blockInfo = await this.provider.getBlock(currentBlock);
      
      // Calculate approximate era (6 hours = 3600 blocks at 6 second intervals)
      const currentEra = Math.floor(currentBlock / 3600);
      
      return {
        currentEra,
        currentBlock,
        blockTimestamp: blockInfo?.timestamp ? new Date(blockInfo.timestamp * 1000) : new Date(),
        chainId: this.config.chainId
      };
    } catch (error) {
      console.error('Error fetching network status:', error);
      throw new Error('Failed to fetch network status');
    }
  }

  /**
   * Get staking information for a wallet address
   */
  async getStakingInfo(walletAddress: string): Promise<StakingInfo> {
    try {
      // Get actual balance from Zenchain
      const balance = await this.provider.getBalance(walletAddress);
      const currentEra = await this.getCurrentEra();
      
      // Create contract interface for NativeStaking precompile
      const stakingContract = new ethers.Contract(
        this.config.nativeStakingAddress,
        [
          // Basic staking info getter - simplified ABI
          "function ledger(address) view returns (uint256 active, uint256 total, uint256[] unlocking, uint256 claimedRewards)",
          "function payee(address) view returns (address)",
        ],
        this.provider
      );

      let stakingAmount = "0.0";
      let rewards = "0.0";

      try {
        // Try to get staking ledger info
        const ledgerInfo = await stakingContract.ledger(walletAddress);
        stakingAmount = ethers.formatEther(ledgerInfo.active || "0");
        rewards = ethers.formatEther(ledgerInfo.claimedRewards || "0");
      } catch (contractError) {
        // If contract call fails, wallet might not be staking
        console.log(`No staking info found for ${walletAddress}:`, contractError);
        stakingAmount = "0.0";
        rewards = "0.0";
      }

      return {
        stakingAmount,
        rewards,
        era: currentEra
      };
    } catch (error) {
      console.error('Error fetching staking info:', error);
      throw new Error(`Failed to fetch staking info for ${walletAddress}`);
    }
  }

  /**
   * Get validator information for a wallet address
   */
  async getValidatorInfo(walletAddress: string): Promise<ValidatorInfo> {
    try {
      const currentEra = await this.getCurrentEra();
      
      // Create contract interface for validator queries
      const stakingContract = new ethers.Contract(
        this.config.nativeStakingAddress,
        [
          "function validators(address) view returns (uint256 commission, bool blocked)",
          "function nominators(address) view returns (address[] targets, uint256 submittedIn, bool suppressed)",
          "function erasValidatorReward(uint32, address) view returns (uint256)",
        ],
        this.provider
      );

      let commission = "0";
      let totalStake = "0.0";
      let rewards = "0.0";

      try {
        // Check if address is a validator
        const validatorInfo = await stakingContract.validators(walletAddress);
        commission = validatorInfo.commission?.toString() || "0";
        
        // Get validator rewards for current era
        const eraRewards = await stakingContract.erasValidatorReward(currentEra - 1, walletAddress);
        rewards = ethers.formatEther(eraRewards || "0");
        
        // For total stake, we'd need to aggregate nominator stakes (complex query)
        totalStake = "0.0"; // Placeholder - would require additional contract calls
        
      } catch (contractError) {
        // Address is not a validator
        console.log(`${walletAddress} is not a validator:`, contractError);
      }

      return {
        commission,
        totalStake,
        rewards,
        era: currentEra
      };
    } catch (error) {
      console.error('Error fetching validator info:', error);
      throw new Error(`Failed to fetch validator info for ${walletAddress}`);
    }
  }

  /**
   * Get reward history for a wallet address
   */
  async getRewardHistory(walletAddress: string, fromBlock?: number, toBlock?: number): Promise<RewardInfo[]> {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      const startBlock = fromBlock || Math.max(0, currentBlock - 10000); // Last 10k blocks
      const endBlock = toBlock || currentBlock;

      const rewards: RewardInfo[] = [];
      
      // Create contract interface for reward events
      const stakingContract = new ethers.Contract(
        this.config.nativeStakingAddress,
        [
          "event Rewarded(address indexed stash, uint256 amount)",
          "event PayoutStarted(uint32 indexed era, address indexed validator)",
        ],
        this.provider
      );

      try {
        // Query reward events
        const rewardFilter = stakingContract.filters.Rewarded(walletAddress);
        const rewardEvents = await stakingContract.queryFilter(rewardFilter, startBlock, endBlock);
        
        for (const event of rewardEvents) {
          const block = await event.getBlock();
          const receipt = await event.getTransactionReceipt();
          
          rewards.push({
            era: Math.floor(event.blockNumber / 3600),
            amount: ethers.formatEther(event.args?.amount || "0"),
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            timestamp: new Date(block.timestamp * 1000),
            type: 'staking' // From Rewarded event
          });
        }

        // Query validator payout events
        const payoutFilter = stakingContract.filters.PayoutStarted(null, walletAddress);
        const payoutEvents = await stakingContract.queryFilter(payoutFilter, startBlock, endBlock);
        
        for (const event of payoutEvents) {
          const block = await event.getBlock();
          
          rewards.push({
            era: event.args?.era || Math.floor(event.blockNumber / 3600),
            amount: "0", // Payout amount would need additional query
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            timestamp: new Date(block.timestamp * 1000),
            type: 'validator'
          });
        }

      } catch (eventError) {
        console.log(`No reward events found for ${walletAddress}:`, eventError);
        // Return empty array if no events found
      }

      return rewards.sort((a, b) => b.blockNumber - a.blockNumber);
    } catch (error) {
      console.error('Error fetching reward history:', error);
      throw new Error(`Failed to fetch reward history for ${walletAddress}`);
    }
  }

  /**
   * Get ZTC price in USD from CoinGecko API
   */
  async getZTCPrice(): Promise<number> {
    try {
      // Try to fetch from CoinGecko API (if ZTC is listed)
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=zenchain&vs_currencies=usd');
      
      if (response.ok) {
        const data = await response.json();
        return data.zenchain?.usd || 0.45;
      }
      
      // Fallback to mock price if API fails
      return 0.45;
    } catch (error) {
      console.error('Error fetching ZTC price:', error);
      return 0.45; // Fallback price
    }
  }

  /**
   * Validate if an address is a valid Ethereum address
   */
  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Get the latest era information
   */
  async getCurrentEra(): Promise<number> {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      return Math.floor(currentBlock / 3600); // 6 hours per era
    } catch (error) {
      console.error('Error fetching current era:', error);
      throw new Error('Failed to fetch current era');
    }
  }

  /**
   * Check if a wallet address is currently a validator
   */
  async isValidator(walletAddress: string): Promise<boolean> {
    try {
      // Would query the validator set from the staking contract
      // For now, return false as we don't have the contract interface
      return false;
    } catch (error) {
      console.error('Error checking validator status:', error);
      return false;
    }
  }

  /**
   * Check if a wallet address has active nominations
   */
  async hasActiveNominations(walletAddress: string): Promise<boolean> {
    try {
      // Would query the nominator data from the staking contract
      // For now, return false as we don't have the contract interface
      return false;
    } catch (error) {
      console.error('Error checking nomination status:', error);
      return false;
    }
  }
}

export const zenchainService = new ZenchainService();
