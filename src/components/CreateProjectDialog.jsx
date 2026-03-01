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
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupsIcon from "@mui/icons-material/Groups";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";

// --- Theme Constants ---
const GLASS_BG = "rgba(255, 255, 255, 0.75)";
const GLASS_BORDER = "rgba(10, 15, 25, 0.08)";
const PRIMARY_SLATE = "#0f172a";
const SECONDARY_SLATE = "#475569";
const INDIGO_ACCENT = "#4f46e5";

const CreateProjectDialog = ({ open, onClose, onSubmit }) => {
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

  useEffect(() => {
    if (open && activeStep == 2) {
      fetchEmployees();
    }
  }, [open, activeStep]);

  const fetchEmployees = async () => {
    try {
      let token = localStorage.getItem("token");
      // TODO: Replace with actual API call
      // const res = await axios.get('/api/employees/department');
      // setAvailableEmployees(res.data);
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
              userId: empIdStr, // Map _id to userId
              _id: empIdStr, // Keep _id for draggable key
              name: emp.name,
              role: emp.department, // Map department to role
              department: emp.department,
              email: emp.email,
              avatar: emp.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2), // Generate avatar initials
            };
          });
          setAvailableEmployees(mappedEmployees);
        });

      // Mock data
      // const mockEmployees = [
      //   { userId: "u1", name: "John Doe", role: "ML Engineer", avatar: "JD" },
      //   {
      //     userId: "u2",
      //     name: "Jane Smith",
      //     role: "Data Scientist",
      //     avatar: "JS",
      //   },
      //   {
      //     userId: "u3",
      //     name: "Mike Johnson",
      //     role: "DevOps Engineer",
      //     avatar: "MJ",
      //   },
      //   {
      //     userId: "u4",
      //     name: "Sarah Williams",
      //     role: "QA Engineer",
      //     avatar: "SW",
      //   },
      //   {
      //     userId: "u5",
      //     name: "Alex Brown",
      //     role: "Backend Developer",
      //     avatar: "AB",
      //   },
      //   {
      //     userId: "u6",
      //     name: "Emily Davis",
      //     role: "Frontend Developer",
      //     avatar: "ED",
      //   },
      // ];
      // setAvailableEmployees(mockEmployees);
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
          background: GLASS_BG,
          backdropFilter: "blur(48px) saturate(160%)",
          WebkitBackdropFilter: "blur(48px) saturate(160%)",
          borderRadius: "32px",
          border: `1px solid ${GLASS_BORDER}`,
          boxShadow: "0 40px 80px -20px rgba(10, 15, 25, 0.12)",
          minHeight: "650px",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        component="div"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.4), transparent)",
          borderBottom: `1px solid ${GLASS_BORDER}`,
          py: 3,
          px: 4
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: PRIMARY_SLATE,
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            gap: 2,
            letterSpacing: "-0.02em"
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 16px rgba(10, 15, 25, 0.08)"
            }}
          >
            <AddIcon sx={{ color: "#fff", fontSize: 28 }} />
          </Box>
          Create New Project
        </Typography>
        <IconButton
          onClick={handleClose}
          sx={{
            color: alpha(PRIMARY_SLATE, 0.2),
            "&:hover": { color: PRIMARY_SLATE, background: "rgba(15, 23, 42, 0.05)" }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 4, px: 3, overflow: "visible" }}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 5, px: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  "& .MuiStepLabel-label": {
                    color: SECONDARY_SLATE,
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    letterSpacing: 1
                  },
                  "& .MuiStepLabel-label.Mui-active": {
                    color: INDIGO_ACCENT,
                  },
                  "& .MuiStepLabel-label.Mui-completed": {
                    color: "#10b981",
                  },
                  "& .MuiStepIcon-root": {
                    color: alpha(SECONDARY_SLATE, 0.1),
                    "&.Mui-active": { color: INDIGO_ACCENT },
                    "&.Mui-completed": { color: "#10b981" }
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
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <TextField
                  label="Project Title"
                  name="title"
                  value={projectData.title}
                  onChange={handleProjectChange}
                  fullWidth
                  required
                  placeholder="e.g., Quantum Edge Infrastructure"
                  InputLabelProps={{ sx: { color: SECONDARY_SLATE, fontWeight: 700 } }}
                  sx={{
                    input: { color: PRIMARY_SLATE, fontWeight: 600 },
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "rgba(15, 23, 42, 0.02)",
                      "& fieldset": { borderColor: GLASS_BORDER },
                      "&:hover fieldset": { borderColor: alpha(PRIMARY_SLATE, 0.2) },
                      "&.Mui-focused fieldset": { borderColor: INDIGO_ACCENT },
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
                  InputLabelProps={{ sx: { color: SECONDARY_SLATE, fontWeight: 700 } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: PRIMARY_SLATE,
                      bgcolor: "rgba(15, 23, 42, 0.02)",
                      fontWeight: 500,
                      "& fieldset": { borderColor: GLASS_BORDER },
                      "&:hover fieldset": { borderColor: alpha(PRIMARY_SLATE, 0.2) },
                      "&.Mui-focused fieldset": { borderColor: INDIGO_ACCENT },
                    },
                  }}
                />

                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    label="Deadline"
                    name="deadline"
                    type="date"
                    value={projectData.deadline}
                    onChange={handleProjectChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true, sx: { color: SECONDARY_SLATE, fontWeight: 700 } }}
                    sx={{
                      input: {
                        color: PRIMARY_SLATE,
                        fontWeight: 600,
                        colorScheme: "light"
                      },
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "rgba(15, 23, 42, 0.02)",
                        "& fieldset": { borderColor: GLASS_BORDER },
                        "&:hover fieldset": { borderColor: alpha(PRIMARY_SLATE, 0.2) },
                        "&.Mui-focused fieldset": { borderColor: INDIGO_ACCENT },
                      },
                      "& .MuiInputBase-input::-webkit-calendar-picker-indicator": {
                        cursor: "pointer",
                        filter: "contrast(0.8) brightness(0.4)",
                      },
                    }}
                  />

                  <TextField
                    select
                    label="Priority"
                    name="priority"
                    value={projectData.priority}
                    onChange={handleProjectChange}
                    fullWidth
                    InputLabelProps={{ sx: { color: SECONDARY_SLATE, fontWeight: 700 } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: PRIMARY_SLATE,
                        bgcolor: "rgba(15, 23, 42, 0.02)",
                        fontWeight: 700,
                        "& fieldset": { borderColor: GLASS_BORDER },
                        "&:hover fieldset": { borderColor: alpha(PRIMARY_SLATE, 0.2) },
                        "&.Mui-focused fieldset": { borderColor: INDIGO_ACCENT },
                      },
                    }}
                  >
                    <MenuItem value="Low" sx={{ color: PRIMARY_SLATE, fontWeight: 600 }}>Low</MenuItem>
                    <MenuItem value="Medium" sx={{ color: PRIMARY_SLATE, fontWeight: 600 }}>Medium</MenuItem>
                    <MenuItem value="High" sx={{ color: PRIMARY_SLATE, fontWeight: 600 }}>High</MenuItem>
                    <MenuItem value="Critical" sx={{ color: PRIMARY_SLATE, fontWeight: 600 }}>Critical</MenuItem>
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
                    p: 3,
                    mb: 4,
                    background: "rgba(15, 23, 42, 0.02)",
                    border: `1px solid ${GLASS_BORDER}`,
                    borderRadius: "24px",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ color: PRIMARY_SLATE, mb: 3, fontWeight: 900, letterSpacing: "-0.01em" }}
                  >
                    Add Task Intelligence
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <TextField
                      label="Task Title"
                      name="title"
                      value={newTodo.title}
                      onChange={handleTodoChange}
                      fullWidth
                      size="small"
                      placeholder="e.g., Define System Architecture"
                      InputLabelProps={{ sx: { color: SECONDARY_SLATE, fontWeight: 700 } }}
                      sx={{
                        input: { color: PRIMARY_SLATE, fontWeight: 600 },
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#fff",
                          "& fieldset": { borderColor: GLASS_BORDER },
                          "&:hover fieldset": { borderColor: alpha(PRIMARY_SLATE, 0.2) },
                        },
                      }}
                    />
                    <Box sx={{ display: "flex", gap: 2 }}>
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
                            color: PRIMARY_SLATE,
                            bgcolor: "#fff",
                            fontWeight: 700,
                            "& fieldset": { borderColor: GLASS_BORDER },
                            "&:hover fieldset": { borderColor: alpha(PRIMARY_SLATE, 0.2) },
                          },
                        }}
                        InputLabelProps={{ sx: { color: SECONDARY_SLATE, fontWeight: 700 } }}
                      >
                        <MenuItem value="Low">Low</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="High">High</MenuItem>
                        <MenuItem value="Critical">Critical</MenuItem>
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
                            color: PRIMARY_SLATE,
                            fontWeight: 600,
                            colorScheme: "light"
                          },
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "#fff",
                            "& fieldset": { borderColor: GLASS_BORDER },
                            "&:hover fieldset": { borderColor: alpha(PRIMARY_SLATE, 0.2) },
                          },
                          "& .MuiInputBase-input::-webkit-calendar-picker-indicator": {
                            cursor: "pointer",
                            filter: "contrast(0.8) brightness(0.4)",
                          },
                        }}
                        InputLabelProps={{
                          shrink: true,
                          sx: { color: SECONDARY_SLATE, fontWeight: 700 },
                        }}
                      />
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddTodo}
                      sx={{
                        background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
                        color: "#fff",
                        fontWeight: 900,
                        py: 1,
                        borderRadius: "12px",
                        boxShadow: "0 8px 16px rgba(10, 15, 25, 0.12)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: "0 12px 20px rgba(10, 15, 25, 0.2)",
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
                  sx={{ color: PRIMARY_SLATE, mb: 2, fontWeight: 800 }}
                >
                  Project Backlog ({todos.length} units)
                </Typography>
                <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
                  {todos.length === 0 ? (
                    <Typography
                      variant="body2"
                      sx={{ color: SECONDARY_SLATE, textAlign: "center", py: 6, fontWeight: 600 }}
                    >
                      The project backlog is currently void. Add task units to begin.
                    </Typography>
                  ) : (
                    todos.map((todo) => (
                      <Paper
                        key={todo._id}
                        sx={{
                          p: 2,
                          mb: 2,
                          background: "rgba(255, 255, 255, 0.6)",
                          backdropFilter: "blur(12px)",
                          border: `1px solid ${GLASS_BORDER}`,
                          borderRadius: "16px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          boxShadow: "0 4px 12px rgba(10, 15, 25, 0.02)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            background: "rgba(255, 255, 255, 0.8)",
                            transform: "translateY(-1px)"
                          }
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{ color: PRIMARY_SLATE, fontWeight: 800, mb: 0.5 }}
                          >
                            {todo.title}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Chip
                              label={todo.priority}
                              size="small"
                              sx={{
                                bgcolor: alpha(getPriorityColor(todo.priority), 0.1),
                                color: getPriorityColor(todo.priority),
                                fontWeight: 800,
                                fontSize: "0.65rem",
                                borderRadius: "6px"
                              }}
                            />
                            {todo.dueDate && (
                              <Chip
                                label={`Due: ${new Date(todo.dueDate).toLocaleDateString()}`}
                                size="small"
                                sx={{
                                  bgcolor: "rgba(15, 23, 42, 0.05)",
                                  color: SECONDARY_SLATE,
                                  fontSize: "0.65rem",
                                  fontWeight: 700,
                                  borderRadius: "6px"
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
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <PersonAddIcon sx={{ color: SECONDARY_SLATE }} />
                      <Typography
                        variant="subtitle1"
                        sx={{ color: PRIMARY_SLATE, fontWeight: 900, letterSpacing: "-0.01em" }}
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
                            p: 2,
                            minHeight: 350,
                            background: snapshot.isDraggingOver
                              ? "rgba(79, 70, 229, 0.04)"
                              : "rgba(15, 23, 42, 0.02)",
                            border: `2px dashed ${snapshot.isDraggingOver ? INDIGO_ACCENT : GLASS_BORDER}`,
                            borderRadius: "24px",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
                                      p: 1.5,
                                      mb: 1.5,
                                      background: snapshot.isDragging
                                        ? "rgba(255, 255, 255, 0.95)"
                                        : "rgba(255, 255, 255, 0.7)",
                                      backdropFilter: "blur(8px)",
                                      border: snapshot.isDragging
                                        ? `2px solid ${INDIGO_ACCENT}`
                                        : `1px solid ${GLASS_BORDER}`,
                                      borderRadius: "16px",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 2,
                                      cursor: snapshot.isDragging
                                        ? "grabbing"
                                        : "grab",
                                      transition: "all 0.2s ease",
                                      boxShadow: snapshot.isDragging
                                        ? "0 20px 40px -12px rgba(10, 15, 25, 0.15)"
                                        : "0 4px 12px rgba(10, 15, 25, 0.02)",
                                      transform: snapshot.isDragging
                                        ? "rotate(1deg) scale(1.02)"
                                        : "none",
                                      "&:hover": {
                                        background: "rgba(255, 255, 255, 0.9)",
                                        borderColor: alpha(PRIMARY_SLATE, 0.1)
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
                                          color: PRIMARY_SLATE,
                                          fontWeight: 800,
                                        }}
                                      >
                                        {employee.name}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: SECONDARY_SLATE, fontWeight: 700 }}
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
                                color: SECONDARY_SLATE,
                                textAlign: "center",
                                py: 6,
                                fontWeight: 700
                              }}
                            >
                              All intelligence nodes assigned.
                            </Typography>
                          )}
                        </Paper>
                      )}
                    </Droppable>
                  </Box>

                  {/* Selected Team */}
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <GroupsIcon sx={{ color: "#10b981" }} />
                      <Typography
                        variant="subtitle1"
                        sx={{ color: PRIMARY_SLATE, fontWeight: 900, letterSpacing: "-0.01em" }}
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
                            p: 2,
                            minHeight: 350,
                            background: snapshot.isDraggingOver
                              ? "rgba(16, 185, 129, 0.04)"
                              : "rgba(16, 185, 129, 0.01)",
                            border: `2px dashed ${snapshot.isDraggingOver ? "#10b981" : alpha("#10b981", 0.1)}`,
                            borderRadius: "24px",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
                                      p: 1.5,
                                      mb: 1.5,
                                      background: snapshot.isDragging
                                        ? "rgba(255, 255, 255, 0.95)"
                                        : "rgba(255, 255, 255, 0.8)",
                                      backdropFilter: "blur(12px)",
                                      border: snapshot.isDragging
                                        ? "2px solid #10b981"
                                        : `1px solid ${alpha("#10b981", 0.2)}`,
                                      borderRadius: "16px",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 2,
                                      cursor: snapshot.isDragging
                                        ? "grabbing"
                                        : "grab",
                                      transition: "all 0.2s ease",
                                      boxShadow: snapshot.isDragging
                                        ? "0 20px 40px -12px rgba(10, 15, 25, 0.15)"
                                        : "0 4px 12px rgba(16, 185, 129, 0.04)",
                                      transform: snapshot.isDragging
                                        ? "rotate(-1deg) scale(1.02)"
                                        : "none",
                                      "&:hover": {
                                        background: "rgba(255, 255, 255, 0.95)",
                                        borderColor: "#10b981"
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
                                          color: PRIMARY_SLATE,
                                          fontWeight: 800,
                                        }}
                                      >
                                        {employee.name}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: SECONDARY_SLATE, fontWeight: 700 }}
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
                                color: SECONDARY_SLATE,
                                textAlign: "center",
                                py: 6,
                                fontWeight: 700
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
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{
              color: SECONDARY_SLATE,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 1,
              px: 4,
              "&:disabled": { opacity: 0.2 },
              "&:hover": { background: "rgba(15, 23, 42, 0.05)" }
            }}
          >
            Back
          </Button>
          <Box sx={{ display: "flex", gap: 2 }}>
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{
                  background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
                  color: "#fff",
                  fontWeight: 900,
                  px: 6,
                  py: 1.2,
                  borderRadius: "14px",
                  boxShadow: "0 12px 24px rgba(10, 15, 25, 0.15)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 16px 32px rgba(10, 15, 25, 0.2)",
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
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#fff",
                  fontWeight: 900,
                  px: 6,
                  py: 1.2,
                  borderRadius: "14px",
                  boxShadow: "0 12px 24px rgba(16, 185, 129, 0.2)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 16px 32px rgba(16, 185, 129, 0.3)",
                  },
                  "&:disabled": { opacity: 0.6 },
                }}
              >
                {loading ? "Initializing..." : "Protocol Deployment"}
              </Button>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
