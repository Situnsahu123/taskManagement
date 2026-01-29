import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import userRoute from "./routes/user.route.js"
import taskRouer from './routes/task.route.js'

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(userRoute)
app.use('/api/tasks',taskRouer)

app.get("/", (req, res) => {
  res.json({ message: "Task Manager API is running 🚀" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  connectDB();
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

export default app;
