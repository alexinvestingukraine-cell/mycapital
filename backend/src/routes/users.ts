import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();

/**
 * POST /users — регистрация
 */
router.post("/", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return res.status(409).json({ error: "User already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });

  res.status(201).json(user);
});

/**
 * GET /users — ТОЛЬКО С ТОКЕНОМ
 */
router.get("/", authMiddleware, async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(users);
});

export default router;
