
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
import AssignmentIcon from "@mui/icons-material/Assignment";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import BarChartIcon from "@mui/icons-material/BarChart";
import GridViewIcon from "@mui/icons-material/GridView";
import NotesIcon from "@mui/icons-material/Notes";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import CreateProjectDialog from "../../components/CreateProjectDialog";
import TeamChat from "../../components/TeamChat";

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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin");
  };

  // Sample tasks data
  const [tasks, setTasks] = useState([
    {
      id: 101,
      title: "Design Landing Page",
      priority: "High",
      deadline: "2 days left",
      status: "in_progress",
      desc: "Create high-fidelity mockups for main landing page.",
    },
    {
      id: 102,
      title: "Setup Database",
      priority: "High",
      deadline: "23/05/2026",
      status: "in_progress",
      desc: "Configure MongoDB and create necessary schemas.",
    },
    {
      id: 103,
      title: "API Documentation",
      priority: "High",
      deadline: "2 days left",
      status: "in_progress",
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
        "https://project-management-sodtware-backend-end.onrender.com/admin/add_task",
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
      const token = localStorage.getItem("adminToken");
      console.log("project data ", projectData);
      // TODO: Replace with actual API call
      const response = await axios.post(
        "https://project-management-sodtware-backend-end.onrender.com/admin/create_project",
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
    <>
      <Box
        sx={{
          height: "100%",
          minHeight: "100vh",
          backgroundColor: "#fcfcfc",
          p: 0,
          color: "#1a1a1a",
          position: "relative",
        }}
      >
        {/* Error and Success Alerts */}
        <Box sx={{ position: "fixed", top: 20, right: 20, zIndex: 2000, maxWidth: "400px" }}>
          {error && (
            <Alert
              severity="error"
              onClose={() => setError(null)}
              sx={{ mb: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              severity="success"
              onClose={() => setSuccess(null)}
              sx={{ mb: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            >
              {success}
            </Alert>
          )}
        </Box>

        {/* Header Section */}
        <Box
          sx={{
            py: 4,
            backgroundColor: "#fff",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Box
            sx={{
              width: "95%",
              maxWidth: "1800px",
              mx: "auto",
              px: { xs: 1, md: 2 },
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: "#444", mb: 0.5, fontSize: "2.2rem" }}>
                Head Operations
              </Typography>
              <Typography variant="body1" sx={{ color: "#777", fontWeight: 500, fontSize: "1rem" }}>
                Workspace Hub
              </Typography>
            </Box>
            <Button
              onClick={handleLogout}
              variant="outlined"
              sx={{
                color: "#555",
                borderColor: "#e0e0e0",
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                "&:hover": { backgroundColor: "#f5f5f5", borderColor: "#ccc" },
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>

        <Box sx={{ width: "95%", maxWidth: "1800px", mx: "auto", px: { xs: 1, md: 2 }, pt: 6, pb: 10 }}>
          {/* Status Cards Section */}
          <Grid container spacing={4} sx={{ mb: 6, width: "100%", justifyContent: "space-between" }}>
            {[
              { title: "Active Tasks", value: "03", icon: <AssignmentIcon /> },
              { title: "Processing", value: "01", icon: <NotesIcon /> },
              { title: "Approved", value: "01", icon: <CheckBoxIcon /> },
              { title: "Pending", value: "01", icon: <AccessTimeIcon /> },
            ].map((stat, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx} sx={{ display: "flex", flexGrow: 1 }}>
                <Box
                  sx={{
                    width: "100%",
                    flexGrow: 1,
                    background: "linear-gradient(90deg, #0d254a 0%, #1e4db7 100%)",
                    borderRadius: "8px",
                    p: 3,
                    color: "#fff",
                    minHeight: "150px", // Maintains landscape shape
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    position: "relative",
                    overflow: "hidden",
                    // Top Right Circle
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: "-20%",
                      right: "-10%",
                      width: "120px",
                      height: "120px",
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: "50%",
                    },
                    // Bottom Left Circle
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: "-20%",
                      left: "-10%",
                      width: "100px",
                      height: "100px",
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: "50%",
                    },
                  }}
                >
                  {/* Top Right Label & Icon */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, alignSelf: "flex-end", mt: 1, zIndex: 1 }}>
                    {React.cloneElement(stat.icon, { sx: { fontSize: 24, opacity: 0.95 } })}
                    <Typography sx={{ fontWeight: 600, fontSize: "1.1rem", opacity: 0.95 }}>
                      {stat.title}
                    </Typography>
                  </Box>
                  {/* Bottom Left Number */}
                  <Typography variant="h2" sx={{ fontWeight: 700, fontSize: "4.2rem", mb: -0.5, ml: 1, letterSpacing: -2, zIndex: 1 }}>
                    {stat.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Action Grid Buttons */}
          <Box sx={{ display: "flex", gap: 3, mb: 8, flexWrap: "wrap", justifyContent: "space-between", width: "100%" }}>
            {[
              { label: "New Project", icon: <FolderIcon />, onClick: () => setOpenProjectDialog(true) },
              { label: "Project Hub", icon: <BarChartIcon />, onClick: () => navigate("/head/projects") },
              { label: "Analytics Dashboard", icon: <GridViewIcon />, onClick: () => navigate("/head/project-overview") },
            ].map((action, idx) => (
              <Button
                key={idx}
                variant="outlined"
                startIcon={action.icon}
                onClick={action.onClick}
                sx={{
                  flex: 1,
                  minWidth: { xs: "100%", sm: "280px" },
                  color: "#555",
                  borderColor: "#e0e0e0",
                  borderRadius: "8px",
                  textTransform: "none",
                  px: 4,
                  py: 2,
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                  "&:hover": {
                    backgroundColor: "#f9f9f9",
                    borderColor: "#ccc",
                  },
                }}
              >
                {action.label}
              </Button>
            ))}
          </Box>

          {/* Task Overview Section */}
          <Typography
            variant="h4"
            sx={{ mb: 6, fontWeight: 700, color: "#444", letterSpacing: "-1px" }}
          >
            Task Overview
          </Typography>
          <Grid container spacing={4}>
            {tasks.map((task) => (
              <Grid item xs={12} sm={6} md={4} key={task.id}>
                <Box
                  sx={{
                    bgcolor: "#fff",
                    borderRadius: "12px",
                    p: 4,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                    border: "1px solid #eee",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "flex-start" }}>
                    <Typography sx={{ fontWeight: 700, color: "#333", fontSize: "1.4rem", lineHeight: 1.2 }}>{task.title}</Typography>
                    <Chip
                      label="High"
                      size="small"
                      sx={{
                        bgcolor: "#fff1f0",
                        color: "#ff4d4f",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        height: "24px",
                        borderRadius: "4px",
                      }}
                    />
                  </Box>
                  <Typography
                    sx={{
                      color: "#666",
                      fontSize: "1.1rem",
                      mb: 4,
                      lineHeight: 1.6,
                      flexGrow: 1,
                    }}
                  >
                    {task.desc}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography sx={{ color: "#aaa", fontSize: "1rem", fontWeight: 500 }}>
                      Deadline
                    </Typography>
                    <Typography sx={{ color: "#333", fontSize: "1rem", fontWeight: 700 }}>
                      {task.deadline}
                    </Typography>
                  </Box>
                  <Box>
                    <Chip
                      label={task.status.replace("_", " ")}
                      size="small"
                      sx={{
                        bgcolor: task.status === "in_progress" ? "#e6fffb" : "#fff7e6",
                        color: task.status === "in_progress" ? "#13c2c2" : "#faad14",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        borderRadius: "4px",
                        px: 1,
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* --- Dialogs --- */}
        <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
          <DialogTitle sx={{ fontWeight: 700 }}>{editingId ? "Update Task" : "Add Task"}</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField label="Title" name="title" value={formData.title} onChange={handleInputChange} fullWidth variant="outlined" />
              <TextField label="Description" name="desc" value={formData.desc} onChange={handleInputChange} fullWidth multiline rows={3} variant="outlined" />
              <TextField select label="Priority" name="priority" value={formData.priority} onChange={handleInputChange} fullWidth variant="outlined">
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Critical">Critical</MenuItem>
              </TextField>
              <TextField select label="Status" name="status" value={formData.status} onChange={handleInputChange} fullWidth variant="outlined">
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </TextField>
              <TextField label="Deadline" name="deadline" value={formData.deadline} onChange={handleInputChange} fullWidth variant="outlined" />
              <Button onClick={handleAddOrUpdateTask} disabled={loading} fullWidth variant="contained" sx={{ py: 1.5, fontWeight: 700, borderRadius: "8px" }}>
                {loading ? "Processing..." : (editingId ? "Update Task" : "Add Task")}
              </Button>
            </Stack>
          </DialogContent>
        </Dialog>

        <CreateProjectDialog open={openProjectDialog} onClose={() => setOpenProjectDialog(false)} onSubmit={handleCreateProject} />
      </Box>

      {/* Floating TeamChat Bubble */}
      <TeamChat />
    </>
  );
};

export default Head;
