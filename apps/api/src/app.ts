import express, { Application } from "express";

import healthRouter from "./routes/health.js";

export const app: Application = express();

app.use(express.json());

app.use("/health", healthRouter);
