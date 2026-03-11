import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  IconButton,
  Chip,
  Avatar,
  Paper,
  Fade,
  Alert,
  alpha,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupsIcon from "@mui/icons-material/Groups";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";

// --- iOS Liquid Glass Design Constants ---
const PRIMARY_BG = "#e6edf5";
const SECONDARY_BG = "#d9e3ef";
const TERTIARY_BG = "#cfd8e5";

const glassEffect = {
  background: "rgba(255, 255, 255, 0.25)",
  backdropFilter: "blur(30px) saturate(160%)",
  border: "1px solid rgba(255, 255, 255, 0.45)",
  borderRadius: "22px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.5)",
  transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  position: "relative",
  overflow: "visible",
};

const iPhoneGlassButton = {
  background: "rgba(255, 255, 255, 0.3)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.45)",
  borderRadius: "16px",
  color: "rgba(0, 0, 0, 0.8)",
  fontWeight: 1000,
  textTransform: "none",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "rgba(255, 255, 255, 0.45)",
    transform: "translateY(-2px)",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
  }
};

const CreateProjectDialog = ({ open, onClose, onSubmit, initialData }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    deadline: "",
    priority: "Medium",
  });
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({
    title: "",
    priority: "Medium",
    dueDate: "",
  });
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const steps = ["Project Details", "Add Tasks", "Assign Team"];

  // Reset or Popoulate state based on initialData
  useEffect(() => {
    if (open) {
      if (initialData) {
        // Edit mode
        setProjectData({
          title: initialData.projectName || initialData.title || "",
          description: initialData.projectDesc || initialData.description || "",
          deadline: initialData.projectDeadline ? initialData.projectDeadline.split("T")[0] : (initialData.deadline ? initialData.deadline.split("T")[0] : ""),
          priority: initialData.priority || "Medium",
        });
        setTodos(initialData.tasks || initialData.todos || []);

        // Map existing team members
        const team = (initialData.specialists || initialData.teamMembers || []).map(member => {
          const id = member.userId || member._id;
          const idStr = typeof id === 'object' ? id.$oid || id.toString() : String(id);
          return {
            ...member,
            userId: idStr,
            _id: idStr,
            avatar: member.name ? member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "S"
          };
        });
        setSelectedTeam(team);
      } else {
        // Create mode - reset everything
        setProjectData({ title: "", description: "", deadline: "", priority: "Medium" });
        setTodos([]);
        setSelectedTeam([]);
        setActiveStep(0);
      }
    }
  }, [open, initialData]);

  useEffect(() => {
    if (open && activeStep == 2) {
      fetchEmployees();
    }
  }, [open, activeStep]);

  const fetchEmployees = async () => {
    try {
      let token = localStorage.getItem("token");
      axios
        .get("http://localhost:8080/admin/employes", {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        })
        .then((data) => {
          // Map backend data to expected format
          const mappedEmployees = data.data.map((emp) => {
            const empIdStr = typeof emp._id === 'object' ? emp._id.$oid || emp._id.toString() : String(emp._id);
            return {
              userId: empIdStr,
              _id: empIdStr,
              name: emp.name,
              role: emp.department,
              department: emp.department,
              email: emp.email,
              avatar: emp.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2),
            };
          });

          // Filter out employees already in the team
          const filteredEmployees = mappedEmployees.filter(
            (emp) => !selectedTeam.some((member) => member.userId === emp.userId)
          );
          setAvailableEmployees(filteredEmployees);
        });
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError("Failed to load employees");
    }
  };

  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setProjectData({ ...projectData, [name]: value });
  };

  const handleTodoChange = (e) => {
    const { name, value } = e.target;
    setNewTodo({ ...newTodo, [name]: value });
  };

  const handleAddTodo = () => {
    if (!newTodo.title.trim()) return;

    setTodos([
      ...todos,
      {
        _id: `t${Date.now()}`,
        ...newTodo,
        status: "pending",
      },
    ]);
    setNewTodo({ title: "", priority: "Medium", dueDate: "" });
  };

  const handleDeleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo._id !== id));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // If dropped in the same position, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Moving from available to team
    if (
      source.droppableId === "available" &&
      destination.droppableId === "team"
    ) {
      const employee = availableEmployees[source.index];
      const newAvailable = Array.from(availableEmployees);
      newAvailable.splice(source.index, 1);

      const newTeam = Array.from(selectedTeam);
      newTeam.splice(destination.index, 0, employee);

      setAvailableEmployees(newAvailable);
      setSelectedTeam(newTeam);
    }
    // Moving from team to available
    else if (
      source.droppableId === "team" &&
      destination.droppableId === "available"
    ) {
      const employee = selectedTeam[source.index];
      const newTeam = Array.from(selectedTeam);
      newTeam.splice(source.index, 1);

      const newAvailable = Array.from(availableEmployees);
      newAvailable.splice(destination.index, 0, employee);

      setSelectedTeam(newTeam);
      setAvailableEmployees(newAvailable);
    }
    // Reordering within available list
    else if (
      source.droppableId === "available" &&
      destination.droppableId === "available"
    ) {
      const newAvailable = Array.from(availableEmployees);
      const [removed] = newAvailable.splice(source.index, 1);
      newAvailable.splice(destination.index, 0, removed);
      setAvailableEmployees(newAvailable);
    }
    // Reordering within team list
    else if (
      source.droppableId === "team" &&
      destination.droppableId === "team"
    ) {
      const newTeam = Array.from(selectedTeam);
      const [removed] = newTeam.splice(source.index, 1);
      newTeam.splice(destination.index, 0, removed);
      setSelectedTeam(newTeam);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (
        !projectData.title.trim() ||
        !projectData.description.trim() ||
        !projectData.deadline
      ) {
        setError("Please fill in all project details");
        return;
      }
    }
    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (selectedTeam.length === 0) {
      setError("Please assign at least one team member");
      return;
    }

    setLoading(true);
    setError(null);

    const finalData = {
      ...projectData,
      todos,
      teamMembers: selectedTeam.map((emp) => ({
        userId: emp.userId,
        name: emp.name,
        role: emp.role,
      })),
    };

    try {
      // TODO: Replace with actual API call
      // await axios.post('/api/projects/create', finalData);

      console.log("Project Data:", finalData);
      await onSubmit(finalData);
      handleClose();
    } catch (error) {
      console.error("Error creating project:", error);
      setError("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setProjectData({
      title: "",
      description: "",
      deadline: "",
      priority: "Medium",
    });
    setTodos([]);
    setNewTodo({ title: "", priority: "Medium", dueDate: "" });
    setSelectedTeam([]);
    setAvailableEmployees([]);
    setError(null);
    onClose();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "#ff5b5b";
      case "High":
        return "#ffab00";
      case "Medium":
        return "#00d4ff";
      default:
        return "#00e676";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: `linear-gradient(135deg, ${PRIMARY_BG} 60%, ${SECONDARY_BG} 100%)`,
          backdropFilter: "blur(50px) saturate(180%)",
          borderRadius: "32px",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          boxShadow: "0 40px 100px -20px rgba(0, 0, 0, 0.15)",
          minHeight: "680px",
          overflow: "hidden",
          position: "relative",
        },
      }}
    >
      {/* Background Mesh Blobs Internal */}
      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: "none", opacity: 0.6 }}>
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{
            position: "absolute",
            top: "-10%",
            right: "-10%",
            width: "50%",
            height: "50%",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], rotate: [0, -45, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "-10%",
            width: "50%",
            height: "50%",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </Box>
      {/* Header */}
      <DialogTitle
        component="div"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(255, 255, 255, 0.45)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
          py: 3,
          px: 4,
          zIndex: 1,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "rgba(0,0,0,0.85)",
            fontWeight: 1000,
            display: "flex",
            alignItems: "center",
            gap: 2.5,
            letterSpacing: "-0.04em",
            fontSize: "1.75rem",
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "18px",
              background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {initialData ? (
              <EditIcon sx={{ color: "#fff", fontSize: 26 }} />
            ) : (
              <AddIcon sx={{ color: "#fff", fontSize: 32 }} />
            )}
          </Box>
          {initialData ? "Update Project System" : "Create New Project"}
        </Typography>
        <IconButton
          onClick={handleClose}
          sx={{
            ...iPhoneGlassButton,
            p: 1.5,
            bgcolor: "rgba(255,255,255,0.5)",
          }}
        >
          <CloseIcon sx={{ color: "rgba(0,0,0,0.6)" }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 4, px: 3, overflow: "visible" }}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 6, px: 2, zIndex: 1, position: "relative" }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  "& .MuiStepLabel-label": {
                    color: "rgba(0,0,0,0.45)",
                    fontWeight: 900,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    mt: 1,
                  },
                  "& .MuiStepLabel-label.Mui-active": {
                    color: "rgba(0,0,0,0.85)",
                  },
                  "& .MuiStepLabel-label.Mui-completed": {
                    color: "#4ade80",
                  },
                  "& .MuiStepIcon-root": {
                    width: 28,
                    height: 28,
                    color: "rgba(0,0,0,0.06)",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderRadius: "50%",
                    "&.Mui-active": { color: "#00d4ff" },
                    "&.Mui-completed": { color: "#4ade80" },
                    "& .MuiStepIcon-text": { fontWeight: 1000, fill: "rgba(0,0,0,0.3)" }
                  }
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{
              mb: 3,
              background: "rgba(239, 68, 68, 0.08)",
              color: "#ef4444",
              fontWeight: 700,
              borderRadius: "12px",
              border: "1px solid rgba(239, 68, 68, 0.1)"
            }}
          >
            {error}
          </Alert>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {activeStep === 0 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5, position: "relative", zIndex: 1 }}>
                <TextField
                  label="Project Title"
                  name="title"
                  value={projectData.title}
                  onChange={handleProjectChange}
                  fullWidth
                  required
                  placeholder="e.g., Quantum Edge Infrastructure"
                  InputLabelProps={{ sx: { color: "rgba(0,0,0,0.5)", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.75rem" } }}
                  sx={{
                    input: { color: "rgba(0,0,0,0.85)", fontWeight: 800, fontSize: "1.1rem" },
                    "& .MuiOutlinedInput-root": {
                      background: "rgba(255,255,255,0.4)",
                      backdropFilter: "blur(10px)",
                      borderRadius: "18px",
                      px: 1,
                      "& fieldset": { borderColor: "rgba(255,255,255,0.6)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.8)" },
                      "&.Mui-focused fieldset": { borderColor: "#00d4ff", borderWidth: "2px" },
                    },
                  }}
                />

                <TextField
                  label="Description"
                  name="description"
                  value={projectData.description}
                  onChange={handleProjectChange}
                  fullWidth
                  required
                  multiline
                  rows={4}
                  placeholder="Describe the operational scope..."
                  InputLabelProps={{ sx: { color: "rgba(0,0,0,0.5)", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.75rem" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "rgba(0,0,0,0.8)",
                      background: "rgba(255,255,255,0.4)",
                      backdropFilter: "blur(10px)",
                      borderRadius: "18px",
                      fontWeight: 700,
                      "& fieldset": { borderColor: "rgba(255,255,255,0.6)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.8)" },
                      "&.Mui-focused fieldset": { borderColor: "#00d4ff", borderWidth: "2px" },
                    },
                  }}
                />

                <Box sx={{ display: "flex", gap: 3 }}>
                  <TextField
                    label="Deadline"
                    name="deadline"
                    type="date"
                    value={projectData.deadline}
                    onChange={handleProjectChange}
                    sx={{
                      flex: 1.2,
                      input: {
                        color: "rgba(0,0,0,0.85)",
                        fontWeight: 800,
                        colorScheme: "light"
                      },
                      "& .MuiOutlinedInput-root": {
                        background: "rgba(255,255,255,0.4)",
                        borderRadius: "18px",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.6)" },
                        "&:hover fieldset": { borderColor: "rgba(255,255,255,0.8)" },
                        "&.Mui-focused fieldset": { borderColor: "#00d4ff", borderWidth: "2px" },
                      },
                      "& .MuiInputBase-input::-webkit-calendar-picker-indicator": { filter: "invert(0.2)" },
                    }}
                    InputLabelProps={{ shrink: true, sx: { color: "rgba(0,0,0,0.5)", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.75rem" } }}
                  />

                  <TextField
                    select
                    label="Priority"
                    name="priority"
                    value={projectData.priority}
                    onChange={handleProjectChange}
                    sx={{
                      flex: 1,
                      "& .MuiOutlinedInput-root": {
                        color: getPriorityColor(projectData.priority),
                        background: "rgba(255,255,255,0.4)",
                        borderRadius: "18px",
                        fontWeight: 1000,
                        "& fieldset": { borderColor: "rgba(255,255,255,0.6)" },
                        "&:hover fieldset": { borderColor: "rgba(255,255,255,0.8)" },
                        "&.Mui-focused fieldset": { borderColor: "#00d4ff", borderWidth: "2px" },
                      },
                    }}
                    InputLabelProps={{ sx: { color: "rgba(0,0,0,0.5)", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.75rem" } }}
                  >
                    {["Low", "Medium", "High", "Critical"].map(p => (
                      <MenuItem key={p} value={p} sx={{ fontWeight: 800, color: getPriorityColor(p) }}>{p}</MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Box>
            </motion.div>
          )}

          {activeStep === 1 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Box>
                {/* Add Todo Form */}
                <Paper
                  sx={{
                    p: 4,
                    mb: 5,
                    background: "rgba(255, 255, 255, 0.3)",
                    backdropFilter: "blur(15px)",
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                    borderRadius: "24px",
                    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.05)",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ color: "rgba(0,0,0,0.85)", mb: 3.5, fontWeight: 1000, letterSpacing: "-0.03em", fontSize: "1.25rem" }}
                  >
                    Add Task Intelligence
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    <TextField
                      label="Task Title"
                      name="title"
                      value={newTodo.title}
                      onChange={handleTodoChange}
                      fullWidth
                      size="small"
                      placeholder="e.g., Define System Architecture"
                      InputLabelProps={{ sx: { color: "rgba(0,0,0,0.5)", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.75rem" } }}
                      sx={{
                        input: { color: "rgba(0,0,0,0.8)", fontWeight: 700 },
                        "& .MuiOutlinedInput-root": {
                          background: "rgba(255,255,255,0.45)",
                          borderRadius: "14px",
                          "& fieldset": { borderColor: "rgba(255,255,255,0.6)" },
                          "&:hover fieldset": { borderColor: "rgba(255,255,255,0.8)" },
                        },
                      }}
                    />
                    <Box sx={{ display: "flex", gap: 2.5 }}>
                      <TextField
                        select
                        label="Priority"
                        name="priority"
                        value={newTodo.priority}
                        onChange={handleTodoChange}
                        size="small"
                        sx={{
                          flex: 1,
                          "& .MuiOutlinedInput-root": {
                            color: getPriorityColor(newTodo.priority),
                            background: "rgba(255,255,255,0.45)",
                            borderRadius: "14px",
                            fontWeight: 1000,
                            "& fieldset": { borderColor: "rgba(255,255,255,0.6)" },
                            "&:hover fieldset": { borderColor: "rgba(255,255,255,0.8)" },
                          },
                        }}
                        InputLabelProps={{ sx: { color: "rgba(0,0,0,0.5)", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.75rem" } }}
                      >
                        <MenuItem value="Low" sx={{ fontWeight: 800, color: getPriorityColor("Low") }}>Low</MenuItem>
                        <MenuItem value="Medium" sx={{ fontWeight: 800, color: getPriorityColor("Medium") }}>Medium</MenuItem>
                        <MenuItem value="High" sx={{ fontWeight: 800, color: getPriorityColor("High") }}>High</MenuItem>
                        <MenuItem value="Critical" sx={{ fontWeight: 800, color: getPriorityColor("Critical") }}>Critical</MenuItem>
                      </TextField>
                      <TextField
                        label="Due Date"
                        name="dueDate"
                        type="date"
                        value={newTodo.dueDate}
                        onChange={handleTodoChange}
                        size="small"
                        sx={{
                          flex: 1,
                          input: {
                            color: "rgba(0,0,0,0.8)",
                            fontWeight: 800,
                            colorScheme: "light"
                          },
                          "& .MuiOutlinedInput-root": {
                            background: "rgba(255,255,255,0.45)",
                            borderRadius: "14px",
                            "& fieldset": { borderColor: "rgba(255,255,255,0.6)" },
                            "&:hover fieldset": { borderColor: "rgba(255,255,255,0.8)" },
                          },
                          "& .MuiInputBase-input::-webkit-calendar-picker-indicator": { filter: "invert(0.2)" },
                        }}
                        InputLabelProps={{
                          shrink: true,
                          sx: { color: "rgba(0,0,0,0.5)", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.75rem" }
                        }}
                      />
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddTodo}
                      sx={{
                        ...iPhoneGlassButton,
                        background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
                        color: "#fff",
                        py: 1.5,
                        mt: 1,
                        "&:hover": {
                          background: "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      Capture Task
                    </Button>
                  </Box>
                </Paper>

                {/* Todos List */}
                <Typography
                  variant="subtitle1"
                  sx={{ color: "rgba(0,0,0,0.85)", mb: 2.5, fontWeight: 1000, fontSize: "1.1rem", position: "relative", zIndex: 1 }}
                >
                  Project Backlog ({todos.length} units)
                </Typography>
                <Box sx={{ maxHeight: 320, overflowY: "auto", pr: 1, zIndex: 1, position: "relative" }}>
                  {todos.length === 0 ? (
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(0,0,0,0.4)", textAlign: "center", py: 8, fontWeight: 700, fontStyle: "italic" }}
                    >
                      The project backlog is currently void. Add task units above.
                    </Typography>
                  ) : (
                    todos.map((todo) => (
                      <Paper
                        key={todo._id}
                        sx={{
                          p: 2.5,
                          mb: 2,
                          background: "rgba(255, 255, 255, 0.35)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(255, 255, 255, 0.5)",
                          borderRadius: "20px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.03)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            background: "rgba(255, 255, 255, 0.5)",
                            transform: "scale(1.01)",
                            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.06)",
                          }
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{ color: "rgba(0,0,0,0.85)", fontWeight: 1000, mb: 1, fontSize: "1rem" }}
                          >
                            {todo.title}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 1.5 }}>
                            <Chip
                              label={todo.priority}
                              size="small"
                              sx={{
                                background: `rgba(${todo.priority === "Critical" ? "255, 77, 79" : "0, 212, 255"}, 0.12)`,
                                color: getPriorityColor(todo.priority),
                                fontWeight: 1000,
                                fontSize: "0.7rem",
                                borderRadius: "8px",
                                border: `1px solid ${getPriorityColor(todo.priority)}30`,
                                textTransform: "uppercase",
                              }}
                            />
                            {todo.dueDate && (
                              <Chip
                                label={`Protocol Due: ${new Date(todo.dueDate).toLocaleDateString()}`}
                                size="small"
                                sx={{
                                  background: "rgba(255, 255, 255, 0.4)",
                                  color: "rgba(0,0,0,0.5)",
                                  fontSize: "0.7rem",
                                  fontWeight: 900,
                                  borderRadius: "8px",
                                  border: "1px solid rgba(0,0,0,0.05)",
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                        <IconButton
                          onClick={() => handleDeleteTodo(todo._id)}
                          sx={{
                            color: alpha("#ff5b5b", 0.4),
                            "&:hover": { color: "#ff5b5b", background: "rgba(255, 91, 91, 0.1)" }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Paper>
                    ))
                  )}
                </Box>
              </Box>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DragDropContext onDragEnd={handleDragEnd}>
                <Box sx={{ display: "flex", gap: 3, minHeight: 400 }}>
                  {/* Available Employees */}
                  <Box sx={{ flex: 1, position: "relative", zIndex: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        mb: 2.5,
                      }}
                    >
                      <PersonAddIcon sx={{ color: "rgba(0,0,0,0.45)", fontSize: 28 }} />
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "rgba(0,0,0,0.85)", fontWeight: 1000, letterSpacing: "-0.02em", fontSize: "1.2rem" }}
                      >
                        Global Talent Pool ({availableEmployees.length})
                      </Typography>
                    </Box>
                    <Droppable droppableId="available">
                      {(provided, snapshot) => (
                        <Paper
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          sx={{
                            p: 2.5,
                            minHeight: 400,
                            background: snapshot.isDraggingOver
                              ? "rgba(0, 212, 255, 0.08)"
                              : "rgba(255, 255, 255, 0.2)",
                            border: snapshot.isDraggingOver
                              ? "2px dashed #00d4ff"
                              : "2px dashed rgba(255, 255, 255, 0.5)",
                            borderRadius: "28px",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            backdropFilter: "blur(10px)",
                          }}
                        >
                          {availableEmployees.map((employee, index) => (
                            <Draggable
                              key={employee._id}
                              draggableId={employee._id}
                              index={index}
                            >
                              {(provided, snapshot) => {
                                const child = (
                                  <Paper
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    sx={{
                                      p: 2,
                                      mb: 2,
                                      background: snapshot.isDragging
                                        ? "rgba(255, 255, 255, 0.95)"
                                        : "rgba(255, 255, 255, 0.45)",
                                      backdropFilter: "blur(15px)",
                                      border: "1px solid rgba(255,255,255,0.6)",
                                      borderRadius: "18px",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 2,
                                      cursor: snapshot.isDragging ? "grabbing" : "grab",
                                      transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
                                      boxShadow: snapshot.isDragging
                                        ? "0 30px 60px -12px rgba(0, 0, 0, 0.25)"
                                        : "0 4px 15px rgba(0, 0, 0, 0.02)",
                                      transform: snapshot.isDragging ? "scale(1.05) rotate(2deg)" : "none",
                                      "&:hover": {
                                        background: "rgba(255, 255, 255, 0.6)",
                                        transform: snapshot.isDragging ? "scale(1.05) rotate(2deg)" : "translateY(-2px)",
                                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
                                      },
                                    }}
                                  >
                                    <Avatar
                                      sx={{
                                        background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
                                        width: 40,
                                        height: 40,
                                        fontSize: "0.85rem",
                                        fontWeight: 900,
                                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                                      }}
                                    >
                                      {employee.avatar}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: "rgba(0,0,0,0.85)",
                                          fontWeight: 1000,
                                          fontSize: "0.95rem"
                                        }}
                                      >
                                        {employee.name}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "rgba(0,0,0,0.45)", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}
                                      >
                                        {employee.department}
                                      </Typography>
                                    </Box>
                                  </Paper>
                                );

                                if (snapshot.isDragging) {
                                  return ReactDOM.createPortal(
                                    child,
                                    document.body,
                                  );
                                }
                                return child;
                              }}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          {availableEmployees.length === 0 && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: "rgba(0,0,0,0.35)",
                                textAlign: "center",
                                py: 8,
                                fontWeight: 800,
                                fontStyle: "italic"
                              }}
                            >
                              All intelligence nodes deployed.
                            </Typography>
                          )}
                        </Paper>
                      )}
                    </Droppable>
                  </Box>

                  {/* Selected Team */}
                  <Box sx={{ flex: 1, position: "relative", zIndex: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        mb: 2.5,
                      }}
                    >
                      <GroupsIcon sx={{ color: "#4ade80", fontSize: 28 }} />
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "rgba(0,0,0,0.85)", fontWeight: 1000, letterSpacing: "-0.02em", fontSize: "1.2rem" }}
                      >
                        Project Consortium ({selectedTeam.length})
                      </Typography>
                    </Box>
                    <Droppable droppableId="team">
                      {(provided, snapshot) => (
                        <Paper
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          sx={{
                            p: 2.5,
                            minHeight: 400,
                            background: snapshot.isDraggingOver
                              ? "rgba(74, 222, 128, 0.08)"
                              : "rgba(74, 222, 128, 0.03)",
                            border: snapshot.isDraggingOver
                              ? "2px dashed #4ade80"
                              : "2px dashed rgba(74, 222, 128, 0.2)",
                            borderRadius: "28px",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            backdropFilter: "blur(10px)",
                          }}
                        >
                          {selectedTeam.map((employee, index) => (
                            <Draggable
                              key={employee._id}
                              draggableId={employee._id}
                              index={index}
                            >
                              {(provided, snapshot) => {
                                const child = (
                                  <Paper
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    sx={{
                                      p: 2,
                                      mb: 2,
                                      background: snapshot.isDragging
                                        ? "rgba(255, 255, 255, 0.95)"
                                        : "rgba(255, 255, 255, 0.55)",
                                      backdropFilter: "blur(15px)",
                                      border: snapshot.isDragging
                                        ? "2px solid #4ade80"
                                        : "1px solid rgba(255,255,255,0.7)",
                                      borderRadius: "18px",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 2,
                                      cursor: snapshot.isDragging ? "grabbing" : "grab",
                                      transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
                                      boxShadow: snapshot.isDragging
                                        ? "0 30px 60px -12px rgba(16, 185, 129, 0.25)"
                                        : "0 4px 15px rgba(16, 185, 129, 0.02)",
                                      transform: snapshot.isDragging ? "scale(1.05) rotate(-2deg)" : "none",
                                      "&:hover": {
                                        background: "rgba(255, 255, 255, 0.7)",
                                        borderColor: "#4ade80",
                                        transform: snapshot.isDragging ? "scale(1.05) rotate(-2deg)" : "translateY(-2px)",
                                      },
                                    }}
                                  >
                                    <Avatar
                                      sx={{
                                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                        width: 40,
                                        height: 40,
                                        fontSize: "0.85rem",
                                        fontWeight: 900,
                                        boxShadow: "0 4px 8px rgba(16, 185, 129, 0.2)"
                                      }}
                                    >
                                      {employee.avatar}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: "rgba(0,0,0,0.85)",
                                          fontWeight: 1000,
                                          fontSize: "0.95rem"
                                        }}
                                      >
                                        {employee.name}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "rgba(0,0,0,0.45)", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}
                                      >
                                        {employee.department}
                                      </Typography>
                                    </Box>
                                    <CheckCircleIcon
                                      sx={{ color: "#10b981", fontSize: 22 }}
                                    />
                                  </Paper>
                                );

                                if (snapshot.isDragging) {
                                  return ReactDOM.createPortal(
                                    child,
                                    document.body,
                                  );
                                }
                                return child;
                              }}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          {selectedTeam.length === 0 && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: "rgba(0,0,0,0.35)",
                                textAlign: "center",
                                py: 8,
                                fontWeight: 800,
                                fontStyle: "italic"
                              }}
                            >
                              Consortium is empty. Deploy intelligence units here.
                            </Typography>
                          )}
                        </Paper>
                      )}
                    </Droppable>
                  </Box>
                </Box>
              </DragDropContext>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, pt: 3, borderTop: "1px solid rgba(255,255,255,0.4)", zIndex: 1, position: "relative" }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{
              ...iPhoneGlassButton,
              px: 5,
              opacity: activeStep === 0 ? 0 : 1,
              bgcolor: "rgba(255,255,255,0.4)",
            }}
          >
            Back
          </Button>
          <Box sx={{ display: "flex", gap: 2.5 }}>
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{
                  ...iPhoneGlassButton,
                  background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
                  color: "#fff",
                  px: 6,
                  py: 1.5,
                  borderRadius: "18px",
                  "&:hover": {
                    background: "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                sx={{
                  ...iPhoneGlassButton,
                  background: "linear-gradient(135deg, #4ade80 0%, #10b981 100%)",
                  color: "#fff",
                  px: 6,
                  py: 1.5,
                  borderRadius: "18px",
                  fontSize: "1rem",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5ee490 0%, #11c287 100%)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 15px 35px rgba(16, 185, 129, 0.3)",
                  },
                  "&:disabled": { opacity: 0.6 },
                }}
              >
                {loading ? "Initializing..." : (initialData ? "Commit Changes" : "Protocol Deployment")}
              </Button>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
