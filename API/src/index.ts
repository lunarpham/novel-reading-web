import express from "express";
import dotenv from "dotenv";
import { Constants } from "./lib/constants/index";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import { setupSwagger } from "./lib/swagger/config";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = Constants.PORT;
const HOST = Constants.HOST;

app.use(cors());

setupSwagger(app);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Wattpad Clone API",
    documentation: "/api-docs",
    health: "/health",
  });
});

async function startServer(): Promise<void> {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    process.exit(1);
  }
}

startServer();
