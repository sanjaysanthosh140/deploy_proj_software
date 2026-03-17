
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Stack,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Fade,
  alpha,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import FolderIcon from "@mui/icons-material/Folder";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";

import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import CreateProjectDialog from "../../components/CreateProjectDialog";

// --- iOS Liquid Glass Design Constants ---
const PRIMARY_BG = "#e6edf5";
const SECONDARY_BG = "#d9e3ef";
const TERTIARY_BG = "#cfd8e5";

const glassEffect = {
  background: "rgba(255, 255, 255, 1)",
  backdropFilter: "blur(25px) saturate(160%)",
  border: "1px solid rgba(255, 255, 255, 0.7)",
  borderRadius: "28px",
  boxShadow: "0 15px 45px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 1)",
  transition: "all 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
  position: "relative",
  overflow: "hidden",
};

const iPhoneGlassButton = {
  background: "rgba(255, 255, 255, 1)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.7)",
  borderRadius: "20px",
  color: "#1e293b",
  fontWeight: 1000,
  textTransform: "none",
  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.04)",
  transition: "all 0.4s ease",
  "& .MuiButton-startIcon svg": { fontSize: 24 },
  "&:hover": {
    background: "rgba(255, 255, 255, 1)",
    transform: "translateY(-4px)",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.08)",
    border: "1px solid rgba(255, 255, 255, 1)",
  }
};

const Head = () => {
  const navigate = useNavigate();

  // Sample tasks data
  const [tasks, setTasks] = useState([
    {
      id: 101,
      title: "Design Landing Page",
      priority: "High",
      deadline: "Today",
      status: "in_progress",
      desc: "Create high-fidelity mockups for main landing page.",
    },
    {
      id: 102,
      title: "Setup Database",
      priority: "Critical",
      deadline: "Tomorrow",
      status: "pending",
      desc: "Configure MongoDB and create necessary schemas.",
    },
    {
      id: 103,
      title: "API Documentation",
      priority: "Medium",
      deadline: "2025-01-20",
      status: "completed",
      desc: "Document all REST endpoints with examples.",
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [openProjectDialog, setOpenProjectDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    priority: "Medium",
    deadline: "",
    status: "pending",
    desc: "",
  });

  // Status colors
  const statusColors = {
    pending: "#ff9c6e",
    in_progress: "#00d4ff",
    completed: "#4ade80",
  };

  // Priority colors
  const priorityColors = {
    Low: "#4ade80",
    Medium: "#fbbf24",
    High: "#ff7875",
    Critical: "#ff4d4f",
  };

  const handleOpenDialog = (task = null) => {
    if (task) {
      setEditingId(task.id);
      setFormData({
        title: task.title,
        priority: task.priority,
        deadline: task.deadline,
        status: task.status,
        desc: task.desc,
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        priority: "Medium",
        deadline: "",
        status: "pending",
        desc: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddOrUpdateTask = async () => {
    if (!formData.title.trim()) {
      setError("Title is required!");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Add new task via API (POST only)

      console.log("form data", formData);
      const response = await axios.post(
        "http://localhost:8080/admin/add_task",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Task created:", response.data);
      const newTask = {
        id: response.data.id || Math.max(...tasks.map((t) => t.id), 100) + 1,
        ...formData,
      };
      setTasks([newTask, ...tasks]);
      setSuccess("Task created successfully!");

      setTimeout(() => {
        handleCloseDialog();
        setSuccess(null);
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      setError(
        error.response?.data?.message ||
        error.message ||
        "Failed to create task",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      const token = localStorage.getItem("token");
      console.log("project data ", projectData);
      // TODO: Replace with actual API call
      const response = await axios.post(
        "http://localhost:8080/admin/create_project",
        projectData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Project created:", projectData);
      setSuccess("Project created successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error creating project:", error);
      setError("Failed to create project");
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${PRIMARY_BG} 0%, ${SECONDARY_BG} 50%, ${TERTIARY_BG} 100%)`,
        position: "relative",
        overflow: "hidden",
        p: { xs: 2, sm: 3, md: 4 },
        color: "#1a1a1a",
      }}
    >
      {/* Background Mesh Blobs */}
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: "none" }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{
            position: "absolute",
            top: "-5%",
            right: "5%",
            width: "60vw",
            maxWidth: "100%",
            height: "60vw",
            maxHeight: "100%",
            background: "radial-gradient(circle, rgba(255, 255, 255, 1) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
      </Box>
      {/* Error and Success Alerts */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ mb: 3, background: "#ff4d4f20", color: "#ff4d4f" }}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess(null)}
          sx={{ mb: 3, background: "#4ade8020", color: "#4ade80" }}
        >
          {success}
        </Alert>
      )}

      {/* Header Section */}
      <Fade in={true} timeout={1000}>
        <Box sx={{ mb: 6, position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "22px",
                background: "rgba(255, 255, 255, 0.3)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
              }}
            >
              <DashboardCustomizeIcon sx={{ fontSize: 40, color: "rgba(0,0,0,0.7)" }} />
            </Box>
            <Box>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                  color: "#1a1a1a",
                  letterSpacing: "-2px",
                  lineHeight: 1,
                }}
              >
                Head Operations
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(0,0,0,0.4)",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "4px",
                  fontSize: "0.9rem",
                  mt: 1
                }}
              >
                Command Center Intelligence Suite
              </Typography>
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Stats Cards (Control Center Widgets) */}
      <Grid container spacing={{ xs: 3, md: 5 }} sx={{ mb: 8, position: "relative", zIndex: 1 }}>
        {[
          { title: "Active Protocols", value: tasks.length, color: "#4ade80", icon: <AssessmentIcon /> },
          { title: "Processing", value: tasks.filter((t) => t.status === "in_progress").length, color: "#38bdf8", icon: <FolderIcon /> },
          { title: "Validated", value: tasks.filter((t) => t.status === "completed").length, color: "#4ade80", icon: <AssessmentIcon /> },
          { title: "Queued", value: tasks.filter((t) => t.status === "pending").length, color: "#f59e0b", icon: <AddIcon /> },
        ].map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Box sx={{
              ...glassEffect,
              p: { xs: 3.5, md: 4.5 },
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              "&:hover": {
                background: "rgba(255, 255, 255, 1)",
                transform: "translateY(-10px)",
                boxShadow: "0 30px 60px rgba(0,0,0,0.08)"
              }
            }}>
              <Box sx={{
                width: 64,
                height: 64,
                borderRadius: "20px",
                background: alpha(stat.color, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2.5,
                color: stat.color,
                "& svg": { fontSize: 32 }
              }}>
                {stat.icon}
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 1000, color: "#1e293b", lineHeight: 1, mb: 1, fontSize: "2.5rem" }}>
                {stat.value}
              </Typography>
              <Typography sx={{ color: "rgba(30,40,70,0.45)", fontWeight: 900, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "2px" }}>
                {stat.title}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Action Suite (Edge Mirror Buttons) */}
      <Box
        sx={{
          mb: 8,
          display: "flex",
          gap: 3,
          justifyContent: "center",
          flexWrap: "wrap",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ ...iPhoneGlassButton, px: 5, py: 2.2, minWidth: "220px" }}
        >
          Initialize Task
        </Button>
        <Button
          variant="contained"
          startIcon={<FolderIcon />}
          onClick={() => setOpenProjectDialog(true)}
          sx={{ ...iPhoneGlassButton, px: 5, py: 2.2, minWidth: "220px" }}
        >
          New Project
        </Button>
        <Button
          variant="contained"
          startIcon={<AssessmentIcon />}
          onClick={() => navigate("/head/projects")}
          sx={{ ...iPhoneGlassButton, px: 5, py: 2.2, minWidth: "220px" }}
        >
          Project Hub
        </Button>
        <Button
          variant="contained"
          startIcon={<DashboardCustomizeIcon />}
          onClick={() => navigate("/head/project-overview")}
          sx={{ ...iPhoneGlassButton, px: 5, py: 2.2, minWidth: "220px" }}
        >
          Analytics Map
        </Button>
      </Box>

      {/* Protocols Intelligence (Tasks Table) */}
      {/* table removed  */}
      {/* Protocols Intelligence (Tasks Cards) */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 1000, color: "#1e293b", letterSpacing: "-1px" }}>
          Active Protocols Registry
        </Typography>
        <Grid container spacing={3}>
          {tasks.map((task) => (
            <Grid item xs={12} sm={6} md={4} key={task.id}>
              <Box sx={{
                ...glassEffect,
                p: 4,
                "&:hover": {
                  background: "rgba(255, 255, 255, 1)",
                  transform: "scale(1.02)",
                  boxShadow: "0 25px 55px rgba(0,0,0,0.12)"
                }
              }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
                  <Chip
                    label={`ID: ${task.id}`}
                    size="small"
                    sx={{ bgcolor: "rgba(30,40,70,0.06)", color: "rgba(30,40,70,0.5)", fontWeight: 1000, borderRadius: "10px" }}
                  />
                  <Typography sx={{ color: "rgba(30,40,70,0.4)", fontSize: "0.85rem", fontWeight: 800 }}>
                    {task.deadline}
                  </Typography>
                </Box>
                <Typography sx={{ color: "#1e293b", fontWeight: 1000, mb: 1.5, fontSize: "1.35rem", letterSpacing: "-0.5px" }}>
                  {task.title}
                </Typography>
                <Typography sx={{ color: "rgba(30,40,70,0.5)", mb: 4, fontSize: "0.95rem", lineHeight: 1.6, fontWeight: 600, height: "3.2em", overflow: "hidden" }}>
                  {task.desc}
                </Typography>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Chip
                    label={task.priority}
                    size="small"
                    sx={{
                      bgcolor: alpha(priorityColors[task.priority], 0.1),
                      color: priorityColors[task.priority],
                      fontWeight: 1000,
                      borderRadius: "10px",
                      px: 1
                    }}
                  />
                  <Chip
                    label={task.status.replace("_", " ")}
                    size="small"
                    sx={{
                      bgcolor: alpha(statusColors[task.status], 0.1),
                      color: statusColors[task.status],
                      fontWeight: 1000,
                      borderRadius: "10px",
                      px: 1
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        TransitionComponent={Fade}
        transitionDuration={400}
        PaperProps={{
          sx: {
            ...glassEffect,
            background: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(50px) saturate(180%)",
            p: 1.5,
          },
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ p: 4, pb: 1, textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 950, color: "rgba(0,0,0,0.85)", letterSpacing: "-1px" }}>
            {editingId ? "Update Intelligence" : "Initialize Protocol"}
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(0,0,0,0.35)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px" }}>
            Tactical Operation Parameters
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ py: 4, px: { xs: 2, md: 3 } }}>
          <Stack spacing={3} mt={1}>
            <TextField
              label="Protocol Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  bgcolor: "rgba(255, 255, 255, 0.45)",
                  fontWeight: 700,
                  "& fieldset": { borderColor: "rgba(0,0,0,0.05)" },
                  "&.Mui-focused fieldset": { borderColor: "rgba(0,0,0,0.8)" },
                },
                "& .MuiInputLabel-root": { color: "rgba(0,0,0,0.35)", fontWeight: 700 },
              }}
            />

            <TextField
              label="Description"
              name="desc"
              value={formData.desc}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  color: "#0f172a",
                  "& fieldset": { borderColor: "rgba(10, 15, 25, 0.1)" },
                  "&.Mui-focused fieldset": { borderColor: "#38bdf8" },
                },
                "& .MuiInputLabel-root": { color: "#475569" },
              }}
            />

            <TextField
              select
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  color: "#0f172a",
                  "& fieldset": { borderColor: "rgba(10, 15, 25, 0.1)" },
                },
                "& .MuiInputLabel-root": { color: "#475569" },
              }}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Critical">Critical</MenuItem>
            </TextField>

            <TextField
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  color: "#0f172a",
                  "& fieldset": { borderColor: "rgba(10, 15, 25, 0.1)" },
                },
                "& .MuiInputLabel-root": { color: "#475569" },
              }}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>

            <TextField
              label="Deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleInputChange}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  color: "#0f172a",
                  "& fieldset": { borderColor: "rgba(10, 15, 25, 0.1)" },
                  "&.Mui-focused fieldset": { borderColor: "#38bdf8" },
                },
                "& .MuiInputLabel-root": { color: "#475569" },
              }}
            />

            <Button
              onClick={handleAddOrUpdateTask}
              disabled={loading}
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                py: 2.2,
                borderRadius: "18px",
                bgcolor: "rgba(0,0,0,0.9)",
                color: "#fff",
                fontWeight: 900,
                fontSize: "1rem",
                textTransform: "none",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                "&:hover": {
                  bgcolor: "#000",
                  transform: "translateY(-2px)",
                  boxShadow: "0 15px 35px rgba(0,0,0,0.3)",
                },
              }}
            >
              {loading ? "Processing..." : (editingId ? "Commit Changes" : "Initialize Strategic Asset")}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={openProjectDialog}
        onClose={() => setOpenProjectDialog(false)}
        onSubmit={handleCreateProject}
      />
    </Box>
  );
};

export default Head;