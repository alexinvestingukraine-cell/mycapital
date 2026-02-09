import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";

const router = Router();

/**
 * POST /users
 * body: { email, password }
 */
router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword, // ⬅️ ВАЖНО: password, НЕ passwordHash
        profile: {
          create: {}, // ⬅️ сразу создаём пустой профиль
        },
      },
      include: {
        profile: true,
      },
    });

    return res.status(201).json({
      id: user.id,
      email: user.email,
      profile: user.profile,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
