import { Todo } from "../models/todo.model.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

// =============================
// ✅ Add Todo
// =============================
export const addTodo = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Check for existing todo
    const existing = await Todo.findOne({ title, description, userId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Title already exists",
      });
    }

    let imageUrl = "";

    // ✅ Upload to Cloudinary if image exists
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "todos",
      });
      imageUrl = result.secure_url;

      // ✅ Delete local temp file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete temp file:", err);
      });
    }

    const data = await Todo.create({
      title,
      description,
      userId,
      image: imageUrl,
    });

    return res.status(200).json({
      success: true,
      message: "Todo created successfully",
      data,
    });
  } catch (error) {
    console.error("Add Todo Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================
// ✅ Get Todos
// =============================
export const getTodo = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is required",
      });
    }

    const todos = await Todo.find({ userId });
    if (!todos.length) {
      return res.status(404).json({
        success: false,
        message: "No todo found",
        todos: [],
      });
    }

    return res.status(200).json({ todos, success: true });
  } catch (error) {
    console.error("Get Todo Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching todos",
      error: error.message,
    });
  }
};

// =============================
// ✅ Delete Todo
// =============================
export const deleteTodo = async (req, res) => {
  try {
    const todoId = req.params.todoId;
    const userId = req.user?._id;

    const todo = await Todo.findById(todoId);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    if (todo.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "User unauthorized to delete this todo",
      });
    }

    // ✅ Delete Cloudinary image if it exists
    if (todo.image) {
      const publicId = todo.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`todos/${publicId}`);
    }

    await Todo.findByIdAndDelete(todoId);

    return res.status(200).json({
      success: true,
      message: "Todo deleted successfully",
    });
  } catch (error) {
    console.error("Delete Todo Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================
// ✅ Update Todo
// =============================
export const updateTodo = async (req, res) => {
  try {
    const { title, description } = req.body;
    const todoId = req.params.todoId;

    const todo = await Todo.findById(todoId);
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    const updateData = { title, description };

    // ✅ Replace Cloudinary image if new one uploaded
    if (req.file) {
      if (todo.image) {
        const publicId = todo.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`todos/${publicId}`);
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "todos",
      });
      updateData.image = result.secure_url;

      // ✅ Delete local file after upload
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete temp file:", err);
      });
    }

    const updatedTodo = await Todo.findByIdAndUpdate(todoId, updateData, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: "Todo updated successfully",
      data: updatedTodo,
    });
  } catch (error) {
    console.error("Update Todo Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
