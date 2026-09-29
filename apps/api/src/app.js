import express from "express";
import healthRouter from "./routes/health.js";
import workflowRouter from "./routes/workflows.js";
export const app = express();
app.use(express.json());
app.use("/health", healthRouter);
app.use("/workflows", workflowRouter);
