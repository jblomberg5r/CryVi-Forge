import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { eq } from 'drizzle-orm';

// Schema for wallet authentication
const walletAuthSchema = z.object({
  walletAddress: z.string().min(1),
  signature: z.string().min(1),
  message: z.string().min(1)
});

// Register auth-related routes
export function registerAuthRoutes(app: Express) {
  // Connect wallet
  app.post('/api/auth/connect', async (req: Request, res: Response) => {
    try {
      const { walletAddress, signature, message } = walletAuthSchema.parse(req.body);
      
      // In a production app, you would verify the signature here to ensure the
      // user actually controls the wallet address they're claiming to own
      
      // Check if user exists with this wallet
      let user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        // Create new user if not exists
        user = await storage.upsertUser({
          id: Date.now().toString(), // Generate a unique ID
          walletAddress: walletAddress
        });
      }
      
      // Store user info in session
      req.session.user = {
        id: user.id,
        walletAddress: user.walletAddress || '',
        username: user.firstName || 'User'
      };
      
      return res.status(200).json({ success: true, user });
      
    } catch (error) {
      console.error('Wallet connection error:', error);
      return res.status(400).json({ success: false, message: 'Invalid wallet data' });
    }
  });
  
  // Get current authenticated user
  app.get('/api/auth/user', async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = await storage.getUser(req.session.user.id.toString());
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Disconnect wallet (logout)
  app.post('/api/auth/disconnect', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      
      return res.status(200).json({ message: 'Logged out successfully' });
    });
  });
}