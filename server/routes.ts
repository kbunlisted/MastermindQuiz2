import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertQuizSchema, insertAttemptSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Achievement and leaderboard routes
  app.get("/api/achievements", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const achievements = await storage.getAllAchievements();
      res.json(achievements);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.get("/api/user/achievements", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const user = await storage.getUser(req.user.id);
      res.json(user?.badges || []);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });

  // Leaderboard endpoint
  app.get("/api/leaderboard", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Handle quiz completion and achievement checks
  app.patch("/api/attempts/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const attempt = await storage.getAttempt(parseInt(req.params.id));
      if (!attempt) return res.sendStatus(404);

      const updatedAttempt = {
        ...attempt,
        completedAt: new Date(),
        score: req.body.score,
        answers: req.body.answers,
      };

      const result = await storage.createAttempt(updatedAttempt);

      // Check and award achievements
      const user = await storage.getUser(req.user.id);
      const userAttempts = await storage.getUserAttempts(user.id);
      const achievements = await storage.getAllAchievements();
      const earnedBadges = user.badges || [];

      for (const achievement of achievements) {
        if (earnedBadges.some(b => b.name === achievement.name)) continue;

        let earned = false;
        switch (achievement.requirement.type) {
          case "quizzes_completed":
            earned = userAttempts.filter(a => a.completedAt).length >= achievement.requirement.threshold;
            break;
          case "perfect_scores":
            earned = userAttempts.filter(a => a.score === 100).length >= achievement.requirement.threshold;
            break;
          case "quiz_score":
            const completedAttempts = userAttempts.filter(a => a.completedAt && a.score !== null);
            const avgScore = completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length;
            earned = avgScore >= achievement.requirement.threshold;
            break;
        }

        if (earned) {
          earnedBadges.push({
            id: achievement.id.toString(),
            name: achievement.name,
            description: achievement.description,
            image: achievement.badgeImage,
            earnedAt: new Date().toISOString()
          });
        }
      }

      await storage.updateUserBadges(user.id, earnedBadges);
      res.json(result);
    } catch (err) {
      res.status(400).json({ message: "Failed to update attempt" });
    }
  });

  // Keep existing routes
  app.post("/api/quizzes", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role === "student") return res.sendStatus(403);

    try {
      const quiz = await storage.createQuiz({
        ...req.body,
        creatorId: req.user.id,
      });
      res.status(201).json(quiz);
    } catch (err) {
      res.status(400).json({ message: "Invalid quiz data" });
    }
  });

  app.get("/api/quizzes", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const quizzes = req.user.role === "student"
        ? await storage.getAssignedQuizzes(req.user.id)
        : await storage.getQuizzesByCreator(req.user.id);
      res.json(quizzes);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  app.get("/api/quizzes/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const quiz = await storage.getQuiz(parseInt(req.params.id));
      if (!quiz) return res.sendStatus(404);
      res.json(quiz);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  app.post("/api/quizzes/:id/attempts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const attempt = await storage.createAttempt({
        quizId: parseInt(req.params.id),
        userId: req.user.id,
        startedAt: new Date(),
        answers: [],
      });
      res.status(201).json(attempt);
    } catch (err) {
      res.status(400).json({ message: "Failed to start quiz attempt" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}