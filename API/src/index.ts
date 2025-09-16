import express from "express";
import dotenv from "dotenv";
import { Constants } from "./config/constants";
import authRoutes from "./routes/authRoute";
import userRoutes from "./routes/userRoute";
import storyRoutes from "./routes/storyRoute";
import chapterRoutes from "./routes/chapterRoute";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
import cors from "cors";
import { errorHandler } from "./middleware/error";
import "./types";
import { Request, Response } from "express";
dotenv.config();

const app = express();

const PORT = Constants.PORT;
const HOST = Constants.HOST;

app.use(cors());

const swaggerOptions = {
  swaggerOptions: {
    supportedSubmitMethods: ["get", "post", "put", "delete", "patch"],
    showRequestHeaders: true,
    url: "/swagger.json?v=" + Date.now(),
  },
};

app.use(express.json());

app.get("/swagger.json", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerDocument);
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, swaggerOptions)
);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/chapters", chapterRoutes);
app.use(errorHandler);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Novel API",
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
