import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupSession } from "./session";
import { registerAuthRoutes } from "./routes/auth";
import { isAuthenticated } from "./middleware/auth";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertProjectSchema, 
  insertFileSchema, 
  insertContractSchema, 
  insertTokenSchema,
  insertActivitySchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session handling
  setupSession(app);
  
  // Register authentication routes
  registerAuthRoutes(app);

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // User routes
  app.post("/api/users/wallet", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { walletAddress } = z.object({
        walletAddress: z.string()
      }).parse(req.body);
      
      const user = await storage.updateUserWallet(userId, walletAddress);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid data", error });
    }
  });

  // Project routes
  app.get("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = parseInt(req.user.claims.sub);
      const projects = await storage.getProjectsByUser(userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Error fetching projects", error });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      
      // Create activity for project creation
      await storage.createActivity({
        userId: projectData.userId,
        action: "create",
        entityType: "project",
        entityId: project.id,
        details: { name: project.name }
      });
      
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data", error });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertProjectSchema.partial().parse(req.body);
      
      const updatedProject = await storage.updateProject(id, updates);
      
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(updatedProject);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data", error });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProject(id);
      
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting project", error });
    }
  });

  // File routes
  app.get("/api/files/project/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const files = await storage.getFilesByProject(projectId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Error fetching files", error });
    }
  });

  app.get("/api/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const file = await storage.getFile(id);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.json(file);
    } catch (error) {
      res.status(500).json({ message: "Error fetching file", error });
    }
  });

  app.post("/api/files", async (req, res) => {
    try {
      // For development, assume user ID 1 if not provided
      const userId = 1;
      const fileData = insertFileSchema.parse(req.body);
      const file = await storage.createFile(fileData);
      
      // Create activity for file creation
      await storage.createActivity({
        userId: userId,
        action: "create",
        entityType: "file",
        entityId: file.id,
        details: { name: file.name, projectId: file.projectId }
      });
      
      res.status(201).json(file);
    } catch (error) {
      console.error("File creation error:", error);
      res.status(400).json({ message: "Invalid file data", error });
    }
  });

  app.put("/api/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { content, userId } = z.object({
        content: z.string(),
        userId: z.number()
      }).parse(req.body);
      
      const updatedFile = await storage.updateFile(id, content);
      
      if (!updatedFile) {
        return res.status(404).json({ message: "File not found" });
      }
      
      // Create activity for file update
      await storage.createActivity({
        userId,
        action: "update",
        entityType: "file",
        entityId: id,
        details: { name: updatedFile.name }
      });
      
      res.json(updatedFile);
    } catch (error) {
      res.status(400).json({ message: "Invalid file data", error });
    }
  });

  app.delete("/api/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteFile(id);
      
      if (!success) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting file", error });
    }
  });

  // Contract routes
  app.get("/api/contracts/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const contracts = await storage.getContractsByUser(userId);
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching contracts", error });
    }
  });

  app.get("/api/contracts/project/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const contracts = await storage.getContractsByProject(projectId);
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching contracts", error });
    }
  });

  app.post("/api/contracts", async (req, res) => {
    try {
      const contractData = insertContractSchema.parse(req.body);
      const contract = await storage.createContract(contractData);
      
      // Create activity for contract deployment
      await storage.createActivity({
        userId: contractData.userId,
        action: "deploy",
        entityType: "contract",
        entityId: contract.id,
        details: { 
          name: contract.name, 
          network: contract.network,
          address: contract.address
        }
      });
      
      res.status(201).json(contract);
    } catch (error) {
      res.status(400).json({ message: "Invalid contract data", error });
    }
  });

  // Token routes
  app.get("/api/tokens/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const tokens = await storage.getTokensByUser(userId);
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tokens", error });
    }
  });

  app.post("/api/tokens", async (req, res) => {
    try {
      const tokenData = insertTokenSchema.parse(req.body);
      const token = await storage.createToken(tokenData);
      
      // Create activity for token creation
      await storage.createActivity({
        userId: tokenData.userId,
        action: "create",
        entityType: "token",
        entityId: token.id,
        details: { 
          name: token.name, 
          symbol: token.symbol,
          type: token.type
        }
      });
      
      res.status(201).json(token);
    } catch (error) {
      res.status(400).json({ message: "Invalid token data", error });
    }
  });

  // Activity routes
  app.get("/api/activities/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getActivities(userId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Error fetching activities", error });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      res.status(400).json({ message: "Invalid activity data", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
