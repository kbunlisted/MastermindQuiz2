import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev_secret_key',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    const user = await storage.getUserByUsername(username);
    if (!user || !(await comparePasswords(password, user.password))) {
      return done(null, false);
    }
    return done(null, user);
  }));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
    });

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Password reset endpoints
  app.post("/api/request-reset", async (req, res) => {
    try {
      const { username } = req.body;
      const user = await storage.getUserByUsername(username);
      if (!user) {
        // Don't reveal if user exists
        return res.status(200).json({ message: "If the account exists, a reset code has been sent" });
      }

      // Generate a 6-digit code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      await storage.setResetCode(username, resetCode, expiry);

      // In a real app, you would send this code via email
      // For testing, we'll return it in the response
      res.json({ message: "Reset code generated", code: resetCode });
    } catch (err) {
      res.status(500).json({ message: "Failed to generate reset code" });
    }
  });

  app.post("/api/verify-reset-code", async (req, res) => {
    try {
      const { username, code } = req.body;
      const isValid = await storage.validateResetCode(username, code);

      if (!isValid) {
        return res.status(400).json({ message: "Invalid or expired code" });
      }

      res.json({ message: "Code verified" });
    } catch (err) {
      res.status(500).json({ message: "Failed to verify code" });
    }
  });

  app.post("/api/reset-password", async (req, res) => {
    try {
      const { username, code, newPassword } = req.body;
      const isValid = await storage.validateResetCode(username, code);

      if (!isValid) {
        return res.status(400).json({ message: "Invalid or expired code" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.resetPassword(username, hashedPassword);

      res.json({ message: "Password reset successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}