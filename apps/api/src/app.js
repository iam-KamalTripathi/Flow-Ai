import express from "express";
import healthRouter from "./routes/health.js";
import workflowRouter from "./routes/workflows.js";
import executionRouter from "./routes/executions.js";
export const app = express();
app.use(express.json());
app.use("/health", healthRouter);
app.use("/workflows", workflowRouter);
app.use("/executions", executionRouter);
