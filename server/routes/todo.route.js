import express from "express";
import {
  addTodo,
  deleteTodo,
  getTodo,
  updateTodo,
} from "../controllers/todo.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { todoSchema, validateTodo } from "../validators/todoValidate.js";
import upload from "../middleware/multer.js"; // ✅ make sure this uses os.tmpdir()

const router = express.Router();

// ✅ Create Todo (with Cloudinary image upload)
router.post(
  "/create",
  isAuthenticated,
  upload.single("image"), // multer handles temp upload
  validateTodo(todoSchema),
  addTodo
);

// ✅ Get all Todos
router.get("/get", isAuthenticated, getTodo);

// ✅ Delete Todo (Cloudinary image deleted in controller)
router.delete("/delete/:todoId", isAuthenticated, deleteTodo);

// ✅ Update Todo (with new image upload to Cloudinary)
router.put(
  "/update/:todoId",
  isAuthenticated,
  upload.single("image"),
  updateTodo
);

export default router;
