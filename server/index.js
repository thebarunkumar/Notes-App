import express from "express"
import 'dotenv/config'
import connectDB from "./config/database.js"
import userRoute from "./routes/user.route.js"
import todoRoute from "./routes/todo.route.js"
import cors from 'cors'
import "./config/passport.js";
import authRoutes from "./routes/auth.route.js"
// import cookieParser from "cookie-parser"


const app = express()
const PORT = process.env.PORT || 3000

// middleware
app.use(express.json())
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}))

// app.use('/uploads', express.static('uploads'));
// app.use(cookieParser())

app.use("/auth", authRoutes);
app.use("/api/v1/user", userRoute)
app.use("/api/v1/todo", todoRoute)

app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File size too large. Max allowed is 5MB.",
    });
  }
  next(err);
});


app.listen(PORT, ()=>{
    console.log(`Server is running successfully on port ${PORT}`);
    connectDB()
})

app.get("/", (req, res) => {
  res.send("Notes App Server is running successfully 🚀");
});

