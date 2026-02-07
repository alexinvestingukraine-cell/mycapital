import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();

/**
 * GET /users/me
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

    return res.json({ user: updatedUser });
  }
);

/**
 * PUT /users/me/password
 * Смена пароля
 */
router.put(
  "/me/password",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "currentPassword and newPassword are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isValid) {
      return res.status(401).json({ message: "Invalid current password" });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newPasswordHash },
    });

    return res.json({
      message: "Password updated successfully",
    });
  }
);

export default router;
