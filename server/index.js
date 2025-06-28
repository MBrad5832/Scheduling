import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());

// app.use(express.static(path.join(__dirname, '../client/build')));  // you can enable later if you build react

// Database
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Models
const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  start_date: String,
  end_date: String,
});
const Project = mongoose.model("Project", projectSchema);

const taskSchema = new mongoose.Schema({
  title: String,
  due_date: String,
});
const Task = mongoose.model("Task", taskSchema);

const reportSchema = new mongoose.Schema({
  title: String,
  photo: String,
  created_at: { type: Date, default: Date.now },
});
const Report = mongoose.model("Report", reportSchema);

// Multer for photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// CRUD Routes

// Projects 
app.get("/api/projects", async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});

app.post("/api/projects", async (req, res) => {
  const project = new Project(req.body);
  await project.save();
  res.json(project);
});

app.put("/api/projects/:id", async (req, res) => {
  const updated = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
});

app.delete("/api/projects/:id", async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: "Project deleted" });
});

// Tasks
app.get("/api/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

app.post("/api/tasks", async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.json(task);
});

app.put("/api/tasks/:id", async (req, res) => {
  const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
});

app.delete("/api/tasks/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task deleted" });
});

// Reports
app.get("/api/reports", async (req, res) => {
  const reports = await Report.find();
  res.json(reports);
});

app.post("/api/reports", upload.single("photo"), async (req, res) => {
  const report = new Report({
    title: req.body.title,
    photo: req.file?.filename || "",
  });
  await report.save();
  res.json(report);
});

app.put("/api/reports/:id", async (req, res) => {
  const updated = await Report.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
});

app.delete("/api/reports/:id", async (req, res) => {
  await Report.findByIdAndDelete(req.params.id);
  res.json({ message: "Report deleted" });
});

// catch-all for React app — disable for now since you don’t have build
/*
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});
*/

// 404 fallback
app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));
