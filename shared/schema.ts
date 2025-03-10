// Data models using Drizzle ORM
import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model with reset code support
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["student", "teacher", "admin"] }).notNull().default("student"),
  resetCode: text("reset_code"),
  resetCodeExpiry: timestamp("reset_code_expiry"),
  badges: json("badges").$type<{
    id: string;
    name: string;
    description: string;
    image: string;
    earnedAt: string;
  }[]>().default([]),
});

// Achievement definitions
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  badgeImage: text("badge_image").notNull(),
  requirement: json("requirement").$type<{
    type: "quiz_score" | "quizzes_completed" | "perfect_scores";
    threshold: number;
  }>().notNull(),
});

// Quiz model
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  creatorId: integer("creator_id").notNull(),
  timeLimit: integer("time_limit"),
  questions: json("questions").$type<{
    id: number;
    type: "MCQ" | "TrueFalse" | "ShortAnswer";
    text: string;
    options?: string[];
    correctAnswer: string;
  }[]>().notNull(),
});

// Quiz attempts tracking
export const attempts = pgTable("attempts", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull(),
  userId: integer("user_id").notNull(),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  score: integer("score"),
  answers: json("answers").$type<{
    questionId: number;
    answer: string;
  }[]>(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertQuizSchema = createInsertSchema(quizzes);
export const insertAttemptSchema = createInsertSchema(attempts);
export const insertAchievementSchema = createInsertSchema(achievements);

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Attempt = typeof attempts.$inferSelect;
export type InsertAttempt = z.infer<typeof insertAttemptSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;