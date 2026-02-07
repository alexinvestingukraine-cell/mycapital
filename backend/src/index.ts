import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./prisma";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  // проверяем, что Prisma реально подключена
  const result = await prisma.$queryRaw`SELECT 1`;
  res.json({ status: "ok", db: result });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
