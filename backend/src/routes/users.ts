import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();

/**
 * GET /users/me
 * Получить текущего пользователя
 */
router.get(
  "/me",
  authMiddleware,
  async (req: Request, res: Response) => {
    return res.json({
      user: req.user,
    });
  }
);

/**
 * PUT /users/me
 * Обновить профиль (email)
 */
router.put(
  "/me",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { email },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    return res.json({
      user: updatedUser,
    });
  }
);

export default router;
