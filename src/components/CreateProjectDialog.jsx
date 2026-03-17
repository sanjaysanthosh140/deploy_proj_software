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
  useTheme,
  useMediaQuery,
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

const PRIMARY_BG = "#e6edf5";
const SECONDARY_BG = "#d9e3ef";
const TERTIARY_BG = "#cfd8e5";

const glassEffect = {
  background: "rgba(255, 255, 255, 0.45)",
  backdropFilter: "blur(40px) saturate(200%)",
  border: "1px solid rgba(255, 255, 255, 0.55)",
  borderRadius: "28px",
  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.6)",
  transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  position: "relative",
  overflow: "visible",
};

const iPhoneGlassButton = {
  background: "rgba(255, 255, 255, 0.5)",
  backdropFilter: "blur(25px)",
  border: "1px solid rgba(255, 255, 255, 0.6)",
  borderRadius: "18px",
  color: "rgba(0, 0, 0, 0.9)",
  fontWeight: 1000,
  textTransform: "none",
  letterSpacing: "-0.02em",
  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    background: "rgba(255, 255, 255, 0.7)",
    transform: "translateY(-3px) scale(1.02)",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.1)",
  },
  "&:active": {
    transform: "translateY(-1px) scale(0.98)",
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

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
          backdropFilter: "blur(60px) saturate(200%)",
          borderRadius: isMobile ? "0px" : "40px",
          border: isMobile ? "none" : "1px solid rgba(255, 255, 255, 0.6)",
          boxShadow: "0 60px 140px -40px rgba(0, 0, 0, 0.2)",
          minHeight: isMobile ? "100vh" : "720px",
          maxHeight: isMobile ? "100vh" : "90vh",
          overflow: "hidden",
          position: "relative",
          margin: isMobile ? 0 : 2,
        },
      }}
      fullScreen={isMobile}
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
          background: "rgba(255, 255, 255, 0.55)",
          backdropFilter: "blur(30px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.6)",
          py: { xs: 2.5, md: 4 },
          px: { xs: 3, md: 5 },
          zIndex: 1,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "rgba(0,0,0,0.9)",
            fontWeight: 1000,
            display: "flex",
            alignItems: "center",
            gap: { xs: 2, md: 3 },
            letterSpacing: "-0.05em",
            fontSize: { xs: "1.4rem", md: "2rem" },
          }}
        >
          <Box
            sx={{
              width: { xs: 44, md: 56 },
              height: { xs: 44, md: 56 },
              borderRadius: "20px",
              background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            {initialData ? (
              <EditIcon sx={{ color: "#fff", fontSize: { xs: 22, md: 28 } }} />
            ) : (
              <AddIcon sx={{ color: "#fff", fontSize: { xs: 28, md: 36 } }} />
            )}
          </Box>
          {initialData ? "Refine Project Intelligence" : "Project Genesis"}
        </Typography>
        <IconButton
          onClick={handleClose}
          sx={{
            ...iPhoneGlassButton,
            p: 1.5,
            bgcolor: "rgba(255,255,255,0.6)",
            borderRadius: "14px",
          }}
        >
          <CloseIcon sx={{ color: "rgba(0,0,0,0.7)", fontSize: { xs: 20, md: 24 } }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: { xs: 3, md: 5 }, px: { xs: 2.5, md: 5 }, overflowY: "auto", overflowX: "hidden" }}>
        {/* Stepper */}
        <Stepper
          activeStep={activeStep}
          orientation={isMobile ? "vertical" : "horizontal"}
          sx={{
            mb: { xs: 4, md: 7 },
            zIndex: 1,
            position: "relative",
            "& .MuiStepConnector-line": {
              borderColor: "rgba(0,0,0,0.1)",
              borderWidth: "2px",
            }
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  "& .MuiStepLabel-label": {
                    color: "rgba(0,0,0,0.5)",
                    fontWeight: 1000,
                    fontSize: { xs: "0.7rem", md: "0.85rem" },
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    mt: { xs: 0, md: 1.5 },
                  },
                  "& .MuiStepLabel-label.Mui-active": {
                    color: "rgba(0,0,0,0.9)",
                  },
                  "& .MuiStepLabel-label.Mui-completed": {
                    color: "#10b981",
                  },
                  "& .MuiStepIcon-root": {
                    width: { xs: 26, md: 32 },
                    height: { xs: 26, md: 32 },
                    color: "rgba(0,0,0,0.08)",
                    border: "2px solid rgba(255,255,255,0.5)",
                    borderRadius: "50%",
                    "&.Mui-active": { color: "#00d4ff", boxShadow: "0 0 20px rgba(0, 212, 255, 0.4)" },
                    "&.Mui-completed": { color: "#10b981" },
                    "& .MuiStepIcon-text": { fontWeight: 1000, fill: "rgba(0,0,0,0.4)" }
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
              <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 3, md: 5 }, position: "relative", zIndex: 1 }}>
                <TextField
                  label="Project Title"
                  name="title"
                  value={projectData.title}
                  onChange={handleProjectChange}
                  fullWidth
                  required
                  placeholder="e.g., Quantum Edge Infrastructure"
                  InputLabelProps={{ sx: { color: "rgba(0,0,0,0.6)", fontWeight: 1000, textTransform: "uppercase", letterSpacing: 2, fontSize: { xs: "0.65rem", md: "0.8rem" } } }}
                  sx={{
                    input: { color: "rgba(0,0,0,0.9)", fontWeight: 800, fontSize: { xs: "1rem", md: "1.25rem" }, py: 2 },
                    "& .MuiOutlinedInput-root": {
                      background: "rgba(255,255,255,0.45)",
                      backdropFilter: "blur(20px)",
                      borderRadius: "22px",
                      px: 1.5,
                      "& fieldset": { borderColor: "rgba(255,255,255,0.7)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,1)" },
                      "&.Mui-focused fieldset": { borderColor: "#00d4ff", borderWidth: "2.5px" },
                    },
                  }}
                />

                <TextField
                  label="Strategic Narrative (Description)"
                  name="description"
                  value={projectData.description}
                  onChange={handleProjectChange}
                  fullWidth
                  required
                  multiline
                  rows={isMobile ? 3 : 5}
                  placeholder="Describe the operational scope and long-term vision..."
                  InputLabelProps={{ sx: { color: "rgba(0,0,0,0.6)", fontWeight: 1000, textTransform: "uppercase", letterSpacing: 2, fontSize: { xs: "0.65rem", md: "0.8rem" } } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "rgba(0,0,0,0.85)",
                      background: "rgba(255,255,255,0.45)",
                      backdropFilter: "blur(20px)",
                      borderRadius: "24px",
                      fontWeight: 800,
                      p: 2,
                      "& fieldset": { borderColor: "rgba(255,255,255,0.7)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,1)" },
                      "&.Mui-focused fieldset": { borderColor: "#00d4ff", borderWidth: "2.5px" },
                    },
                  }}
                />

                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: { xs: 3, md: 4 } }}>
                  <TextField
                    label="Temporal Limit (Deadline)"
                    name="deadline"
                    type="date"
                    value={projectData.deadline}
                    onChange={handleProjectChange}
                    sx={{
                      flex: 1.2,
                      input: {
                        color: "rgba(0,0,0,0.9)",
                        fontWeight: 900,
                        fontSize: "1.1rem",
                        colorScheme: "light"
                      },
                      "& .MuiOutlinedInput-root": {
                        background: "rgba(255,255,255,0.45)",
                        borderRadius: "20px",
                        p: 0.5,
                        "& fieldset": { borderColor: "rgba(255,255,255,0.7)" },
                        "&:hover fieldset": { borderColor: "rgba(255,255,255,1)" },
                        "&.Mui-focused fieldset": { borderColor: "#00d4ff", borderWidth: "2.5px" },
                      },
                      "& .MuiInputBase-input::-webkit-calendar-picker-indicator": { filter: "invert(0.1)", transform: "scale(1.2)", cursor: "pointer" },
                    }}
                    InputLabelProps={{ shrink: true, sx: { color: "rgba(0,0,0,0.6)", fontWeight: 1000, textTransform: "uppercase", letterSpacing: 2, fontSize: { xs: "0.65rem", md: "0.8rem" } } }}
                  />

                  <TextField
                    select
                    label="Priority Vector"
                    name="priority"
                    value={projectData.priority}
                    onChange={handleProjectChange}
                    sx={{
                      flex: 1,
                      "& .MuiOutlinedInput-root": {
                        color: getPriorityColor(projectData.priority),
                        background: "rgba(255,255,255,0.45)",
                        borderRadius: "20px",
                        fontWeight: 1000,
                        fontSize: "1.1rem",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.7)" },
                        "&:hover fieldset": { borderColor: "rgba(255,255,255,1)" },
                        "&.Mui-focused fieldset": { borderColor: "#00d4ff", borderWidth: "2.5px" },
                      },
                    }}
                    InputLabelProps={{ sx: { color: "rgba(0,0,0,0.6)", fontWeight: 1000, textTransform: "uppercase", letterSpacing: 2, fontSize: { xs: "0.65rem", md: "0.8rem" } } }}
                  >
                    {["Low", "Medium", "High", "Critical"].map(p => (
                      <MenuItem key={p} value={p} sx={{ fontWeight: 1000, color: getPriorityColor(p), py: 2 }}>{p}</MenuItem>
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
                    p: { xs: 3, md: 5 },
                    mb: 4,
                    background: "rgba(255, 255, 255, 0.55)",
                    backdropFilter: "blur(30px)",
                    border: "1px solid rgba(255, 255, 255, 0.7)",
                    borderRadius: "32px",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ color: "rgba(0,0,0,0.9)", mb: 4, fontWeight: 1000, letterSpacing: "-0.05em", fontSize: { xs: "1.2rem", md: "1.5rem" } }}
                  >
                    Task Intelligence Architect
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: { xs: 3, md: 4 } }}
                  >
                    <TextField
                      label="Protocol Title"
                      name="title"
                      value={newTodo.title}
                      onChange={handleTodoChange}
                      fullWidth
                      size="medium"
                      placeholder="e.g., Deploy Neural Gateway"
                      InputLabelProps={{ sx: { color: "rgba(0,0,0,0.6)", fontWeight: 1000, textTransform: "uppercase", letterSpacing: 2, fontSize: "0.75rem" } }}
                      sx={{
                        input: { color: "rgba(0,0,0,0.9)", fontWeight: 800, fontSize: "1rem" },
                        "& .MuiOutlinedInput-root": {
                          background: "rgba(255,255,255,0.4)",
                          borderRadius: "18px",
                          "& fieldset": { borderColor: "rgba(255,255,255,0.7)" },
                          "&:hover fieldset": { borderColor: "rgba(255,255,255,1)" },
                        },
                      }}
                    />
                    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 3 }}>
                      <TextField
                        select
                        label="Priority Vector"
                        name="priority"
                        value={newTodo.priority}
                        onChange={handleTodoChange}
                        size="medium"
                        sx={{
                          flex: 1,
                          "& .MuiOutlinedInput-root": {
                            color: getPriorityColor(newTodo.priority),
                            background: "rgba(255,255,255,0.4)",
                            borderRadius: "18px",
                            fontWeight: 1000,
                            "& fieldset": { borderColor: "rgba(255,255,255,0.7)" },
                            "&:hover fieldset": { borderColor: "rgba(255,255,255,1)" },
                          },
                        }}
                        InputLabelProps={{ sx: { color: "rgba(0,0,0,0.6)", fontWeight: 1000, textTransform: "uppercase", letterSpacing: 2, fontSize: "0.75rem" } }}
                      >
                        <MenuItem value="Low" sx={{ fontWeight: 1000, color: getPriorityColor("Low") }}>Low</MenuItem>
                        <MenuItem value="Medium" sx={{ fontWeight: 1000, color: getPriorityColor("Medium") }}>Medium</MenuItem>
                        <MenuItem value="High" sx={{ fontWeight: 1000, color: getPriorityColor("High") }}>High</MenuItem>
                        <MenuItem value="Critical" sx={{ fontWeight: 1000, color: getPriorityColor("Critical") }}>Critical</MenuItem>
                      </TextField>
                      <TextField
                        label="Temporal Limit"
                        name="dueDate"
                        type="date"
                        value={newTodo.dueDate}
                        onChange={handleTodoChange}
                        size="medium"
                        sx={{
                          flex: 1,
                          input: {
                            color: "rgba(0,0,0,0.9)",
                            fontWeight: 900,
                            colorScheme: "light"
                          },
                          "& .MuiOutlinedInput-root": {
                            background: "rgba(255,255,255,0.4)",
                            borderRadius: "18px",
                            "& fieldset": { borderColor: "rgba(255,255,255,0.7)" },
                            "&:hover fieldset": { borderColor: "rgba(255,255,255,1)" },
                          },
                          "& .MuiInputBase-input::-webkit-calendar-picker-indicator": { filter: "invert(0.1)" },
                        }}
                        InputLabelProps={{
                          shrink: true,
                          sx: { color: "rgba(0,0,0,0.6)", fontWeight: 1000, textTransform: "uppercase", letterSpacing: 2, fontSize: "0.75rem" }
                        }}
                      />
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon sx={{ fontSize: 24 }} />}
                      onClick={handleAddTodo}
                      sx={{
                        ...iPhoneGlassButton,
                        background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
                        color: "#fff",
                        py: 2.5,
                        mt: 1,
                        fontSize: "1rem",
                        "&:hover": {
                          background: "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
                          transform: "translateY(-4px)",
                          boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
                        },
                      }}
                    >
                      Capture Protocol
                    </Button>
                  </Box>
                </Paper>

                {/* Todos List */}
                <Typography
                  variant="subtitle1"
                  sx={{ color: "rgba(0,0,0,0.9)", mb: 3, fontWeight: 1000, fontSize: "1.25rem", position: "relative", zIndex: 1, letterSpacing: "-0.04em" }}
                >
                  Registry Backlog <Box component="span" sx={{ color: "rgba(0,0,0,0.4)", fontWeight: 800, ml: 1, fontSize: "0.9rem" }}>| {todos.length} Protocols</Box>
                </Typography>
                <Box sx={{
                  maxHeight: isMobile ? 400 : 500,
                  overflowY: "auto",
                  pr: 1.5,
                  zIndex: 1,
                  position: "relative",
                  "&::-webkit-scrollbar": { width: "6px" },
                  "&::-webkit-scrollbar-thumb": { background: "rgba(0,0,0,0.1)", borderRadius: "10px" }
                }}>
                  {todos.length === 0 ? (
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(0,0,0,0.4)", textAlign: "center", py: 10, fontWeight: 800, fontStyle: "italic", fontSize: "1rem" }}
                    >
                      The registry is currently optimized. Define protocols above.
                    </Typography>
                  ) : (
                    todos.map((todo) => (
                      <Paper
                        key={todo._id}
                        sx={{
                          p: 3,
                          mb: 2.5,
                          background: "rgba(255, 255, 255, 0.45)",
                          backdropFilter: "blur(15px)",
                          border: "1px solid rgba(255, 255, 255, 0.6)",
                          borderRadius: "24px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
                          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            background: "rgba(255, 255, 255, 0.75)",
                            transform: "scale(1.02) translateX(10px)",
                            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.12)",
                            borderColor: "#00d4ff",
                          }
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{ color: "rgba(0,0,0,0.9)", fontWeight: 1000, mb: 1.5, fontSize: "1.1rem", letterSpacing: "-0.02em" }}
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
                <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: { xs: 4, md: 5 }, minHeight: 450 }}>
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
                            p: { xs: 2.5, md: 4 },
                            minHeight: 400,
                            background: snapshot.isDraggingOver
                              ? "rgba(0, 212, 255, 0.08)"
                              : "rgba(255, 255, 255, 0.25)",
                            border: snapshot.isDraggingOver
                              ? "2px dashed #00d4ff"
                              : "2px dashed rgba(255, 255, 255, 0.6)",
                            borderRadius: "32px",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            backdropFilter: "blur(20px)",
                            boxShadow: snapshot.isDraggingOver ? "inset 0 0 40px rgba(0, 212, 255, 0.1)" : "none"
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
                            p: { xs: 2.5, md: 4 },
                            minHeight: 400,
                            background: snapshot.isDraggingOver
                              ? "rgba(16, 185, 129, 0.1)"
                              : "rgba(16, 185, 129, 0.04)",
                            border: snapshot.isDraggingOver
                              ? "2px dashed #10b981"
                              : "2px dashed rgba(16, 185, 129, 0.3)",
                            borderRadius: "32px",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            backdropFilter: "blur(20px)",
                            boxShadow: snapshot.isDraggingOver ? "inset 0 0 40px rgba(16, 185, 129, 0.1)" : "none"
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
                                        width: 44,
                                        height: 44,
                                        fontSize: "0.9rem",
                                        fontWeight: 1000,
                                        boxShadow: "0 6px 15px rgba(16, 185, 129, 0.25)"
                                      }}
                                    >
                                      {employee.avatar}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: "rgba(0,0,0,0.9)",
                                          fontWeight: 1000,
                                          fontSize: "1rem"
                                        }}
                                      >
                                        {employee.name}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "rgba(0,0,0,0.5)", fontWeight: 1000, textTransform: "uppercase", letterSpacing: 1 }}
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
        <Box sx={{
          display: "flex",
          flexDirection: { xs: "column-reverse", sm: "row" },
          justifyContent: "space-between",
          gap: 3,
          mt: 4,
          pt: 4,
          borderTop: "1px solid rgba(255,255,255,0.5)",
          zIndex: 1,
          position: "relative"
        }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{
              ...iPhoneGlassButton,
              px: { xs: 3, md: 5 },
              py: 2,
              opacity: activeStep === 0 ? 0 : 1,
              bgcolor: "rgba(255,255,255,0.5)",
              fontSize: "0.9rem",
              width: { xs: "100%", sm: "auto" }
            }}
          >
            Tactical Regression (Back)
          </Button>
          <Box sx={{ display: "flex", gap: 3, width: { xs: "100%", sm: "auto" } }}>
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                fullWidth={isMobile}
                sx={{
                  ...iPhoneGlassButton,
                  background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
                  color: "#fff",
                  px: { xs: 4, md: 7 },
                  py: 2,
                  fontSize: "1rem",
                  width: { xs: "100%", sm: "auto" },
                  "&:hover": {
                    background: "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
                    transform: "translateY(-4px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
                  },
                }}
              >
                Advance Protocol
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                fullWidth={isMobile}
                sx={{
                  ...iPhoneGlassButton,
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#fff",
                  px: { xs: 4, md: 7 },
                  py: 2,
                  fontSize: "1rem",
                  width: { xs: "100%", sm: "auto" },
                  "&:hover": {
                    background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
                    transform: "translateY(-4px)",
                    boxShadow: "0 20px 40px rgba(16, 185, 129, 0.4)",
                  },
                  "&:disabled": { opacity: 0.6 },
                }}
              >
                {loading ? "Initializing..." : (initialData ? "Refine Synthesis" : "Finalize Protocol")}
              </Button>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;