import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { zenchainService } from "./services/zenchainService";
import { insertWalletSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS middleware for API routes
  app.use("/api/*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Dashboard statistics endpoint
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      const networkStatus = await storage.getNetworkStatus();
      
      res.json({
        ...stats,
        network: networkStatus
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard statistics" });
    }
  });

  // Get all wallets
  app.get("/api/wallets", async (req, res) => {
    try {
      const wallets = await storage.getAllWallets();
      res.json(wallets);
    } catch (error) {
      console.error("Error fetching wallets:", error);
      res.status(500).json({ error: "Failed to fetch wallets" });
    }
  });

  // Get specific wallet by ID
  app.get("/api/wallets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const wallet = await storage.getWallet(id);
      
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }

      const balance = await storage.getWalletBalance(id);
      
      res.json({
        ...wallet,
        balance,
        totalRewards: balance ? 
          parseFloat(balance.totalStakingRewards) + parseFloat(balance.totalValidatorRewards) : 0,
        isConnected: wallet.isActive
      });
    } catch (error) {
      console.error("Error fetching wallet:", error);
      res.status(500).json({ error: "Failed to fetch wallet" });
    }
  });

  // Add new wallet
  app.post("/api/wallets", async (req, res) => {
    try {
      const validatedData = insertWalletSchema.parse(req.body);
      
      // Check if wallet already exists
      const existingWallet = await storage.getWalletByAddress(validatedData.address);
      if (existingWallet) {
        return res.status(409).json({ error: "Wallet address already exists" });
      }

      // Validate address with Zenchain service
      if (!zenchainService.isValidAddress(validatedData.address)) {
        return res.status(400).json({ error: "Invalid wallet address format" });
      }

      const wallet = await storage.createWallet(validatedData);
      
      // Trigger initial data fetch for the wallet
      setImmediate(() => {
        fetchWalletData(wallet.id, wallet.address).catch(error => {
          console.error("Error fetching initial wallet data:", error);
        });
      });

      res.status(201).json(wallet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      
      console.error("Error creating wallet:", error);
      res.status(500).json({ error: "Failed to create wallet" });
    }
  });

  // Update wallet
  app.put("/api/wallets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { label, walletType, isActive } = req.body;
      
      const wallet = await storage.updateWallet(id, {
        label,
        walletType,
        isActive
      });

      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }

      res.json(wallet);
    } catch (error) {
      console.error("Error updating wallet:", error);
      res.status(500).json({ error: "Failed to update wallet" });
    }
  });

  // Delete wallet
  app.delete("/api/wallets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteWallet(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Wallet not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting wallet:", error);
      res.status(500).json({ error: "Failed to delete wallet" });
    }
  });

  // Get reward history
  app.get("/api/rewards/history", async (req, res) => {
    try {
      const { walletId, limit = "50", offset = "0" } = req.query;
      
      const rewards = await storage.getRewardHistory(
        walletId as string,
        parseInt(limit as string),
        parseInt(offset as string)
      );
      
      res.json(rewards);
    } catch (error) {
      console.error("Error fetching reward history:", error);
      res.status(500).json({ error: "Failed to fetch reward history" });
    }
  });

  // Get chart data for rewards
  app.get("/api/rewards/chart/:walletId", async (req, res) => {
    try {
      const { walletId } = req.params;
      const { timeframe = "30" } = req.query;
      
      const days = parseInt(timeframe as string);
      const chartData = await storage.getRewardsByTimeframe(walletId, days);
      
      res.json(chartData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      res.status(500).json({ error: "Failed to fetch chart data" });
    }
  });

  // Sync wallet data with Zenchain
  app.post("/api/wallets/:id/sync", async (req, res) => {
    try {
      const { id } = req.params;
      const wallet = await storage.getWallet(id);
      
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }

      // Trigger data sync
      await fetchWalletData(id, wallet.address);
      
      res.json({ success: true, message: "Sync initiated" });
    } catch (error) {
      console.error("Error syncing wallet data:", error);
      res.status(500).json({ error: "Failed to sync wallet data" });
    }
  });

  // Get network status
  app.get("/api/network/status", async (req, res) => {
    try {
      const networkStatus = await zenchainService.getNetworkStatus();
      const ztcPrice = await zenchainService.getZTCPrice();
      
      // Update stored network status
      await storage.updateNetworkStatus({
        currentEra: networkStatus.currentEra,
        currentBlock: networkStatus.currentBlock,
        ztcPriceUsd: ztcPrice.toString()
      });
      
      res.json({
        ...networkStatus,
        ztcPrice
      });
    } catch (error) {
      console.error("Error fetching network status:", error);
      res.status(500).json({ error: "Failed to fetch network status" });
    }
  });

  // Export reward data as CSV
  app.get("/api/rewards/export", async (req, res) => {
    try {
      const { walletId } = req.query;
      const rewards = await storage.getRewardHistory(walletId as string, 1000, 0);
      
      // Generate CSV
      const csvHeader = "Date,Wallet,Type,Amount,Amount USD,Era,Transaction Hash\n";
      const csvRows = rewards.map(reward => 
        `${reward.timestamp},${reward.walletLabel},${reward.rewardType},${reward.amount},${reward.amountUsd || 0},${reward.era},${reward.transactionHash}`
      ).join("\n");
      
      const csv = csvHeader + csvRows;
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=zenchain-rewards.csv");
      res.send(csv);
    } catch (error) {
      console.error("Error exporting rewards:", error);
      res.status(500).json({ error: "Failed to export rewards" });
    }
  });

  // Background function to fetch wallet data from Zenchain
  async function fetchWalletData(walletId: string, walletAddress: string) {
    try {
      const [stakingInfo, validatorInfo, rewardHistory] = await Promise.all([
        zenchainService.getStakingInfo(walletAddress),
        zenchainService.getValidatorInfo(walletAddress),
        zenchainService.getRewardHistory(walletAddress)
      ]);

      const ztcPrice = await zenchainService.getZTCPrice();

      // Update wallet balance
      const totalStakingRewards = parseFloat(stakingInfo.rewards);
      const totalValidatorRewards = parseFloat(validatorInfo.rewards);
      
      await storage.updateWalletBalance(walletId, {
        totalStakingRewards: stakingInfo.rewards,
        totalValidatorRewards: validatorInfo.rewards,
        totalStakingRewardsUsd: (totalStakingRewards * ztcPrice).toFixed(2),
        totalValidatorRewardsUsd: (totalValidatorRewards * ztcPrice).toFixed(2),
        currentStakedAmount: stakingInfo.stakingAmount,
        lastUpdateEra: stakingInfo.era
      });

      // Add new reward entries
      for (const reward of rewardHistory) {
        await storage.addRewardEntry({
          walletId,
          walletAddress,
          rewardType: reward.type,
          amount: reward.amount,
          amountUsd: (parseFloat(reward.amount) * ztcPrice).toFixed(2),
          era: reward.era,
          blockNumber: reward.blockNumber,
          transactionHash: reward.transactionHash,
          timestamp: reward.timestamp
        });
      }

      console.log(`Updated data for wallet ${walletAddress}`);
    } catch (error) {
      console.error(`Error fetching data for wallet ${walletAddress}:`, error);
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
