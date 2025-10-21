/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { toast } from "sonner";
const API_URL = import.meta.env.VITE_API_URL;

const CreateTodo = () => {
  const [todos, setTodos] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [refreshPage, setRefreshPage] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  const accessToken = localStorage.getItem("accessToken");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
  });

  {
    /* Download Function */
  }
  const downloadImage = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = url.split("/").pop(); // Use the file name from URL
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  // Handle text inputs
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Submit new todo
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      if (formData.image) data.append("image", formData.image);

      const res = await axios.post(`${API_URL}/api/v1/todo/create`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setTodos([...todos, res.data.data]);
        setOpenDialog(false);
        resetForm();
      }
    } catch (error) {
      toast.error("Failed to create todo");
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", image: null });
    setPreviewImage(null);
  };

  // Fetch all todos
  const getAllTodo = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/todo/get`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.data.success) {
        setTodos(res.data.todos);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Delete todo
  const onDeleteHandler = async (noteId) => {
    try {
      const res = await axios.delete(
        `${API_URL}/api/v1/todo/delete/${noteId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setRefreshPage((prev) => !prev);
      }
    } catch (error) {
      toast.error("Error deleting todo");
      console.error(error);
    }
  };

  // Update todo
  const onUpdateHandler = async () => {
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      if (formData.image instanceof File) data.append("image", formData.image);

      const res = await axios.put(
        `${API_URL}/api/v1/todo/update/${selectedTodoId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        toast.success("Todo updated successfully");
        setRefreshPage((prev) => !prev);
        setUpdateDialog(false);
        resetForm();
      }
    } catch (error) {
      toast.error("Error updating todo");
      console.error(error);
    }
  };

  useEffect(() => {
    getAllTodo();
  }, [refreshPage]);

  return (
    <div className="min-h-screen bg-lightGray p-6 relative">
      {todos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {todos.map((note, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow p-5 relative hover:shadow-lg transition cursor-pointer"
              onClick={() => setSelectedNote(note)}
            >
              {note.image && (
                <div className="relative mb-3">
                  <img
                    src={
                      note.image?.startsWith("http")
                        ? note.image
                        : `${API_URL}/${note.image}`
                    }
                    alt="todo"
                    className="w-full h-40 object-cover rounded-lg mb-3"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  {/* Inline Download Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // prevent opening modal
                      downloadImage(
                        note.image?.startsWith("http")
                          ? note.image
                          : `${API_URL}/${note.image}`
                      );
                    }}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-800 text-xs px-2 py-1 rounded-md shadow"
                  >
                    Download
                  </button>
                </div>
              )}

              <h1 className="font-semibold text-gray-800 text-lg mb-2">
                {note.title}
              </h1>
              <p className="text-gray-700 text-sm line-clamp-4">
                {note.description}
              </p>

              <div className="flex gap-3 mt-4 absolute right-3 bottom-3">
                <Edit
                  onClick={(e) => {
                    e.stopPropagation();
                    setUpdateDialog(true);
                    setFormData({
                      title: note.title,
                      description: note.description,
                      image: null,
                    });
                    setSelectedTodoId(note._id);
                    setPreviewImage(note.image);
                  }}
                  className="text-primaryBlue cursor-pointer hover:scale-110 transition"
                />
                <Trash2
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteHandler(note._id);
                  }}
                  className="text-red-500 cursor-pointer hover:scale-110 transition"
                />
              </div>
            </div>
          ))}

          {/* Modal */}
          {selectedNote && (
            <div
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
              onClick={() => setSelectedNote(null)} // close modal when clicking overlay
            >
              <div
                className="relative bg-white rounded-lg max-w-4xl w-full p-4 shadow-lg mx-4"
                onClick={(e) => e.stopPropagation()} // prevent closing modal
              >
                {selectedNote.image && (
                  <div className="relative mb-4">
                    <img
                      src={
                        selectedNote.image?.startsWith("http")
                          ? selectedNote.image
                          : `${API_URL}/${selectedNote.image}`
                      }
                      alt="Full Note"
                      className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                      onError={(e) => (e.target.style.display = "none")}
                    />

                    {/* Download Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(
                          selectedNote.image?.startsWith("http")
                            ? selectedNote.image
                            : `${API_URL}/${selectedNote.image}`
                        );
                      }}
                      className="absolute top-3 right-3 bg-white text-gray-800 px-3 py-1 text-sm rounded-md shadow hover:bg-gray-100"
                    >
                      Download
                    </button>
                  </div>
                )}

                <h2 className="text-xl font-semibold mb-2 text-gray-800">
                  {selectedNote.title}
                </h2>
                <p className="text-gray-700 mb-4">{selectedNote.description}</p>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedNote(null)}
                    className="bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-600 mt-20">
          There are no todos to show
        </div>
      )}

      {/* Floating Add Button */}
      <div
        onClick={() => setOpenDialog(true)}
        className="bg-gray-800 hover:bg-gray-900 w-12 h-12 flex items-center justify-center rounded-full fixed bottom-10 right-10 cursor-pointer shadow-lg"
      >
        <Plus className="text-white" />
      </div>

      {/* Add Todo Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center">Add Todo</DialogTitle>
            <DialogDescription className="text-center">
              Enter details below to create a new todo.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6">
            <div>
              <Label htmlFor="title" className="mb-2 block">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Read a book"
              />
            </div>
            <div className="relative grid gap-2">
              <Label htmlFor="description" className="mb-1 block">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                maxLength={200}
                value={formData.description}
                onChange={handleChange}
                placeholder="Write something here..."
              />
              <p className="text-xs text-muted-foreground mt-1 absolute right-3 bottom-1">
                {formData?.description?.length || 0}/200
              </p>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="image" className="mb-1 block">
                Image (optional)
              </Label>
              <div className="flex items-center gap-1">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="preview"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" onClick={onSubmitHandler}>
              Add Todo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Todo Dialog */}
      <Dialog open={updateDialog} onOpenChange={setUpdateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center">Update Todo</DialogTitle>
            <DialogDescription className="text-center">
              Edit the details below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6">
            {/* Title Field */}
            <div>
              <Label htmlFor="title" className="mb-2 block">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            {/* Description Field */}
            <div className="relative grid gap-1">
              <Label htmlFor="description" className="mb-1 block">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                maxLength={200}
                value={formData.description}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground mt-1 absolute right-3 bottom-1">
                {formData?.description?.length || 0}/200
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <Label htmlFor="image" className="mb-1 block">
                Image (optional)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="preview"
                    className="w-14 h-14 rounded-lg object-cover border"
                  />
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" onClick={onUpdateHandler}>
              Update Todo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateTodo;
