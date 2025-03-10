import { User, InsertUser, Quiz, InsertQuiz, Attempt, InsertAttempt, Achievement, InsertAchievement } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBadges(userId: number, badges: User["badges"]): Promise<User>;

  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuiz(id: number): Promise<Quiz | undefined>;
  getQuizzesByCreator(creatorId: number): Promise<Quiz[]>;
  getAssignedQuizzes(userId: number): Promise<Quiz[]>;

  createAttempt(attempt: InsertAttempt): Promise<Attempt>;
  getAttempt(id: number): Promise<Attempt | undefined>;
  getUserAttempts(userId: number): Promise<Attempt[]>;
  getQuizAttempts(quizId: number): Promise<Attempt[]>;

  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getAchievement(id: number): Promise<Achievement | undefined>;
  getAllAchievements(): Promise<Achievement[]>;

  getLeaderboard(): Promise<{ userId: number; username: string; score: number }[]>;

  sessionStore: session.Store;
  setResetCode(username: string, code: string, expiry: Date): Promise<void>;
  validateResetCode(username: string, code: string): Promise<boolean>;
  resetPassword(username: string, newPassword: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quizzes: Map<number, Quiz>;
  private attempts: Map<number, Attempt>;
  private achievements: Map<number, Achievement>;
  private currentIds: { users: number; quizzes: number; attempts: number; achievements: number };
  readonly sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.quizzes = new Map();
    this.attempts = new Map();
    this.achievements = new Map();
    this.currentIds = { users: 1, quizzes: 1, attempts: 1, achievements: 1 };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });

    // Add default achievements
    this.createAchievement({
      name: "Quiz Master",
      description: "Complete 10 quizzes",
      badgeImage: "🎓",
      requirement: { type: "quizzes_completed", threshold: 10 }
    });
    this.createAchievement({
      name: "Perfect Score",
      description: "Get 100% on any quiz",
      badgeImage: "⭐",
      requirement: { type: "perfect_scores", threshold: 1 }
    });
    this.createAchievement({
      name: "High Achiever",
      description: "Maintain an average score above 90%",
      badgeImage: "🏆",
      requirement: { type: "quiz_score", threshold: 90 }
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { 
      ...insertUser,
      id,
      role: insertUser.role || "student",
      badges: [] 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBadges(userId: number, badges: User["badges"]): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const updatedUser = {
      ...user,
      badges
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const id = this.currentIds.achievements++;
    const newAchievement: Achievement = {
      ...achievement,
      id
    };
    this.achievements.set(id, newAchievement);
    return newAchievement;
  }

  async getAchievement(id: number): Promise<Achievement | undefined> {
    return this.achievements.get(id);
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getLeaderboard(): Promise<{ userId: number; username: string; score: number }[]> {
    const userScores = new Map<number, { attempts: number; totalScore: number }>();

    // Calculate average scores for each user
    for (const attempt of this.attempts.values()) {
      if (attempt.score !== null && attempt.completedAt) {
        const userStats = userScores.get(attempt.userId) || { attempts: 0, totalScore: 0 };
        userStats.attempts++;
        userStats.totalScore += attempt.score;
        userScores.set(attempt.userId, userStats);
      }
    }

    // Convert to array and sort by average score
    const leaderboard = Array.from(userScores.entries())
      .map(([userId, stats]) => ({
        userId,
        username: this.users.get(userId)?.username || "Unknown",
        score: Math.round((stats.totalScore / stats.attempts) * 100) / 100
      }))
      .sort((a, b) => b.score - a.score);

    return leaderboard;
  }

  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const id = this.currentIds.quizzes++;
    const quiz: Quiz = { 
      ...insertQuiz,
      id,
      timeLimit: insertQuiz.timeLimit || null 
    };
    this.quizzes.set(id, quiz);
    return quiz;
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async getQuizzesByCreator(creatorId: number): Promise<Quiz[]> {
    return Array.from(this.quizzes.values()).filter(
      (quiz) => quiz.creatorId === creatorId,
    );
  }

  async getAssignedQuizzes(userId: number): Promise<Quiz[]> {
    return Array.from(this.quizzes.values());
  }

  async createAttempt(insertAttempt: InsertAttempt): Promise<Attempt> {
    const id = this.currentIds.attempts++;
    const attempt: Attempt = {
      ...insertAttempt,
      id,
      completedAt: insertAttempt.completedAt || null,
      score: insertAttempt.score || null,
      answers: insertAttempt.answers || null
    };
    this.attempts.set(id, attempt);
    return attempt;
  }

  async getAttempt(id: number): Promise<Attempt | undefined> {
    return this.attempts.get(id);
  }

  async getUserAttempts(userId: number): Promise<Attempt[]> {
    return Array.from(this.attempts.values()).filter(
      (attempt) => attempt.userId === userId,
    );
  }

  async getQuizAttempts(quizId: number): Promise<Attempt[]> {
    return Array.from(this.attempts.values()).filter(
      (attempt) => attempt.quizId === quizId,
    );
  }
  async setResetCode(username: string, code: string, expiry: Date): Promise<void> {
    const user = await this.getUserByUsername(username);
    if (!user) throw new Error("User not found");

    const updatedUser = {
      ...user,
      resetCode: code,
      resetCodeExpiry: expiry
    };
    this.users.set(user.id, updatedUser);
  }

  async validateResetCode(username: string, code: string): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    if (!user) return false;

    const now = new Date();
    if (!user.resetCode || !user.resetCodeExpiry || user.resetCodeExpiry < now) {
      return false;
    }

    return user.resetCode === code;
  }

  async resetPassword(username: string, newPassword: string): Promise<void> {
    const user = await this.getUserByUsername(username);
    if (!user) throw new Error("User not found");

    const updatedUser = {
      ...user,
      password: newPassword,
      resetCode: null,
      resetCodeExpiry: null
    };
    this.users.set(user.id, updatedUser);
  }
}

export const storage = new MemStorage();