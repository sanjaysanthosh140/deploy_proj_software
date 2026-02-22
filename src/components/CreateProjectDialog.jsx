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
          background: "linear-gradient(135deg, #020617, #1a1f3a)",
          borderRadius: 3,
          border: "2px solid #00d4ff40",
          boxShadow: "0 12px 50px #00d4ff30",
          minHeight: "600px",
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
          background: "linear-gradient(135deg, #00d4ff20, transparent)",
          borderBottom: "1px solid #1e293b",
          py: 2.5,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "#e5e7eb",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #00d4ff, #0099cc)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AddIcon sx={{ color: "#fff" }} />
          </Box>
          Create New Project
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: "#94a3b8" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 4, px: 3, overflow: "visible" }}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  "& .MuiStepLabel-label": {
                    color: "#94a3b8",
                    fontWeight: 600,
                  },
                  "& .MuiStepLabel-label.Mui-active": {
                    color: "#00d4ff",
                  },
                  "& .MuiStepLabel-label.Mui-completed": {
                    color: "#4ade80",
                  },
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
            sx={{ mb: 3, background: "#ff4d4f20", color: "#ff4d4f" }}
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
                  placeholder="Enter project title"
                  InputLabelProps={{ sx: { color: "#94a3b8" } }}
                  sx={{
                    input: { color: "#e5e7eb" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#1e293b" },
                      "&:hover fieldset": { borderColor: "#00d4ff" },
                      "&.Mui-focused fieldset": { borderColor: "#00d4ff" },
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
                  placeholder="Enter project description"
                  InputLabelProps={{ sx: { color: "#94a3b8" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#e5e7eb",
                      "& fieldset": { borderColor: "#1e293b" },
                      "&:hover fieldset": { borderColor: "#00d4ff" },
                      "&.Mui-focused fieldset": { borderColor: "#00d4ff" },
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
                    InputLabelProps={{ shrink: true, sx: { color: "#94a3b8" } }}
                    sx={{
                      input: { color: "#e5e7eb" },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#1e293b" },
                        "&:hover fieldset": { borderColor: "#00d4ff" },
                        "&.Mui-focused fieldset": { borderColor: "#00d4ff" },
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
                    InputLabelProps={{ sx: { color: "#94a3b8" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "#e5e7eb",
                        "& fieldset": { borderColor: "#1e293b" },
                        "&:hover fieldset": { borderColor: "#00d4ff" },
                        "&.Mui-focused fieldset": { borderColor: "#00d4ff" },
                      },
                    }}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Critical">Critical</MenuItem>
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
                    p: 2.5,
                    mb: 3,
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid #1e293b",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ color: "#e5e7eb", mb: 2, fontWeight: 600 }}
                  >
                    Add Task
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
                      placeholder="Enter task title"
                      InputLabelProps={{ sx: { color: "#94a3b8" } }}
                      sx={{
                        input: { color: "#e5e7eb" },
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: "#1e293b" },
                          "&:hover fieldset": { borderColor: "#00d4ff" },
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
                            color: "#e5e7eb",
                            "& fieldset": { borderColor: "#1e293b" },
                            "&:hover fieldset": { borderColor: "#00d4ff" },
                          },
                        }}
                        InputLabelProps={{ sx: { color: "#94a3b8" } }}
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
                          input: { color: "#e5e7eb" },
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": { borderColor: "#1e293b" },
                            "&:hover fieldset": { borderColor: "#00d4ff" },
                          },
                        }}
                        InputLabelProps={{
                          shrink: true,
                          sx: { color: "#94a3b8" },
                        }}
                      />
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddTodo}
                      sx={{
                        background: "linear-gradient(135deg, #00d4ff, #0099cc)",
                        color: "#fff",
                        fontWeight: 600,
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #00bbee, #0088bb)",
                        },
                      }}
                    >
                      Add Task
                    </Button>
                  </Box>
                </Paper>

                {/* Todos List */}
                <Typography
                  variant="subtitle1"
                  sx={{ color: "#e5e7eb", mb: 2, fontWeight: 600 }}
                >
                  Tasks ({todos.length})
                </Typography>
                <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
                  {todos.length === 0 ? (
                    <Typography
                      variant="body2"
                      sx={{ color: "#94a3b8", textAlign: "center", py: 4 }}
                    >
                      No tasks added yet. Add your first task above.
                    </Typography>
                  ) : (
                    todos.map((todo) => (
                      <Paper
                        key={todo._id}
                        sx={{
                          p: 2,
                          mb: 1.5,
                          background: "rgba(255, 255, 255, 0.02)",
                          border: "1px solid #1e293b",
                          borderRadius: 2,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{ color: "#e5e7eb", fontWeight: 600, mb: 0.5 }}
                          >
                            {todo.title}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Chip
                              label={todo.priority}
                              size="small"
                              sx={{
                                bgcolor: `${getPriorityColor(todo.priority)}20`,
                                color: getPriorityColor(todo.priority),
                                fontWeight: 600,
                                fontSize: "0.7rem",
                              }}
                            />
                            {todo.dueDate && (
                              <Chip
                                label={`Due: ${new Date(todo.dueDate).toLocaleDateString()}`}
                                size="small"
                                sx={{
                                  bgcolor: "rgba(255, 255, 255, 0.05)",
                                  color: "#94a3b8",
                                  fontSize: "0.7rem",
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                        <IconButton
                          onClick={() => handleDeleteTodo(todo._id)}
                          sx={{ color: "#ff5b5b" }}
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
                      <PersonAddIcon sx={{ color: "#94a3b8" }} />
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "#e5e7eb", fontWeight: 600 }}
                      >
                        Available Employees ({availableEmployees.length})
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
                              ? "rgba(0, 212, 255, 0.05)"
                              : "rgba(255, 255, 255, 0.02)",
                            border: `2px dashed ${snapshot.isDraggingOver ? "#00d4ff" : "#1e293b"}`,
                            borderRadius: 2,
                            transition: "all 0.3s ease",
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
                                        ? "linear-gradient(135deg, #00d4ff40, #00d4ff20)"
                                        : "rgba(255, 255, 255, 0.05)",
                                      border: snapshot.isDragging
                                        ? "2px solid #00d4ff"
                                        : "1px solid #1e293b",
                                      borderRadius: 2,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1.5,
                                      cursor: snapshot.isDragging
                                        ? "grabbing"
                                        : "grab",
                                      transition: "all 0.2s ease",
                                      boxShadow: snapshot.isDragging
                                        ? "0 8px 24px rgba(0, 212, 255, 0.3)"
                                        : "none",
                                      transform: snapshot.isDragging
                                        ? "rotate(2deg) scale(1.05)"
                                        : "none",
                                      "&:hover": {
                                        background: "rgba(255, 255, 255, 0.08)",
                                      },
                                    }}
                                  >
                                    <Avatar
                                      sx={{
                                        bgcolor: "#00d4ff",
                                        width: 36,
                                        height: 36,
                                        fontSize: "0.9rem",
                                      }}
                                    >
                                      {employee.avatar}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: "#e5e7eb",
                                          fontWeight: 600,
                                        }}
                                      >
                                        {employee.name}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "#94a3b8" }}
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
                                color: "#94a3b8",
                                textAlign: "center",
                                py: 4,
                              }}
                            >
                              All employees assigned
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
                      <GroupsIcon sx={{ color: "#4ade80" }} />
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "#e5e7eb", fontWeight: 600 }}
                      >
                        Project Team ({selectedTeam.length})
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
                              ? "rgba(74, 222, 128, 0.05)"
                              : "rgba(74, 222, 128, 0.02)",
                            border: `2px dashed ${snapshot.isDraggingOver ? "#4ade80" : "#1e293b"}`,
                            borderRadius: 2,
                            transition: "all 0.3s ease",
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
                                        ? "linear-gradient(135deg, #4ade8040, #4ade8020)"
                                        : "rgba(74, 222, 128, 0.05)",
                                      border: snapshot.isDragging
                                        ? "2px solid #4ade80"
                                        : "1px solid rgba(74, 222, 128, 0.2)",
                                      borderRadius: 2,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1.5,
                                      cursor: snapshot.isDragging
                                        ? "grabbing"
                                        : "grab",
                                      transition: "all 0.2s ease",
                                      boxShadow: snapshot.isDragging
                                        ? "0 8px 24px rgba(74, 222, 128, 0.3)"
                                        : "none",
                                      transform: snapshot.isDragging
                                        ? "rotate(-2deg) scale(1.05)"
                                        : "none",
                                      "&:hover": {
                                        background: "rgba(74, 222, 128, 0.1)",
                                      },
                                    }}
                                  >
                                    <Avatar
                                      sx={{
                                        bgcolor: "#4ade80",
                                        width: 36,
                                        height: 36,
                                        fontSize: "0.9rem",
                                      }}
                                    >
                                      {employee.avatar}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: "#e5e7eb",
                                          fontWeight: 600,
                                        }}
                                      >
                                        {employee.name}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "#94a3b8" }}
                                      >
                                        {employee.department}
                                      </Typography>
                                    </Box>
                                    <CheckCircleIcon
                                      sx={{ color: "#4ade80", fontSize: 20 }}
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
                                color: "#94a3b8",
                                textAlign: "center",
                                py: 4,
                              }}
                            >
                              Drag employees here to assign them
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
              color: "#94a3b8",
              fontWeight: 600,
              "&:disabled": { opacity: 0.3 },
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
                  background: "linear-gradient(135deg, #00d4ff, #0099cc)",
                  color: "#fff",
                  fontWeight: 600,
                  px: 4,
                  "&:hover": {
                    background: "linear-gradient(135deg, #00bbee, #0088bb)",
                  },
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                sx={{
                  background: "linear-gradient(135deg, #4ade80, #4ade80cc)",
                  color: "#020617",
                  fontWeight: 700,
                  px: 4,
                  "&:hover": {
                    background: "linear-gradient(135deg, #4ade80dd, #4ade80)",
                  },
                  "&:disabled": { opacity: 0.6 },
                }}
              >
                {loading ? "Creating..." : "Create Project"}
              </Button>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
