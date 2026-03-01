/**
 * AntyGravity Instruction:
 * Apply rules from /docs/component_analysis_prompt.md
 */

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

// --- Styled Components & Theme Constants ---
const GLASS_BG = "rgba(255, 255, 255, 0.75)";
const GLASS_BORDER = "rgba(10, 15, 25, 0.08)";

const GlassCard = ({ children, sx = {}, hoverEffect = true }) => (
  <Card
    component={motion.div}
    whileHover={hoverEffect ? {
      translateY: -5,
      scale: 1.01,
      borderColor: "rgba(10, 15, 25, 0.15)",
      boxShadow: "0 20px 40px rgba(10, 15, 25, 0.08)",
    } : {}}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 150, damping: 20 }}
    sx={{
      background: GLASS_BG,
      backdropFilter: "blur(24px) saturate(160%)",
      WebkitBackdropFilter: "blur(24px) saturate(160%)",
      border: `1px solid ${GLASS_BORDER}`,
      borderRadius: "24px",
      boxShadow: "0 8px 32px 0 rgba(10, 15, 25, 0.04)",
      color: "#0f172a",
      overflow: "hidden",
      ...sx,
    }}
  >
    {children}
  </Card>
);

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
        minHeight: "100vh",
        bgcolor: "#f1f5f9",
        position: "relative",
        overflow: "hidden",
        p: { xs: 2, sm: 3, md: 4 },
        color: "#0f172a",
      }}
    >
      {/* Background Mesh Blobs */}
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: "none" }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{
            position: "absolute",
            top: "-10%",
            right: "10%",
            width: "50vw",
            height: "50vw",
            background: "radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "10%",
            width: "50vw",
            height: "50vw",
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)",
            filter: "blur(80px)",
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
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: 6, position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 2 }}>
            <Box
              sx={{
                width: { xs: 50, md: 70 },
                height: { xs: 50, md: 70 },
                borderRadius: "20px",
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                border: `1px solid ${GLASS_BORDER}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: { xs: "1.5rem", md: "2rem" },
                color: "#38bdf8",
                fontWeight: 900,
                boxShadow: "0 10px 20px rgba(10, 15, 25, 0.05)",
              }}
            >
              H
            </Box>
            <Box>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3rem" },
                  background: "linear-gradient(135deg, #0f172a 0%, #475569 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: -1,
                }}
              >
                Head Operations
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#64748b",
                  fontWeight: 500,
                  fontSize: { xs: "0.9rem", md: "1.1rem" },
                  letterSpacing: 0.5
                }}
              >
                Enterprise Management Command Console
              </Typography>
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: 6, position: "relative", zIndex: 1 }}>
        {[
          { title: "Total Tasks", value: tasks.length, color: "#4ade80" },
          { title: "In Progress", value: tasks.filter((t) => t.status === "in_progress").length, color: "#38bdf8" },
          { title: "Completed", value: tasks.filter((t) => t.status === "completed").length, color: "#4ade80" },
          { title: "Pending", value: tasks.filter((t) => t.status === "pending").length, color: "#f59e0b" },
        ].map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <GlassCard sx={{ py: 3, px: 2 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ color: "#64748b", fontWeight: 600, mb: 1, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {stat.title}
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 900,
                    background: `linear-gradient(135deg, #0f172a 0%, ${alpha(stat.color, 0.7)} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {stat.value}
                </Typography>
                <Box sx={{ mt: 2, height: "4px", width: "40px", bgcolor: stat.color, borderRadius: "2px", mx: "auto", boxShadow: `0 0 10px ${stat.color}` }} />
              </Box>
            </GlassCard>
          </Grid>
        ))}
      </Grid>

      {/* Add Task and Create Project Buttons */}
      <Box
        sx={{
          mb: 6,
          display: "flex",
          gap: 2,
          justifyContent: { xs: "center", md: "flex-start" },
          flexWrap: "wrap",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
            color: "#fff",
            fontWeight: 800,
            textTransform: "none",
            px: 4,
            py: 1.5,
            borderRadius: "14px",
            boxShadow: "0 10px 20px -5px rgba(15, 23, 42, 0.3)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 15px 30px -5px rgba(15, 23, 42, 0.4)",
            }
          }}
        >
          Add New Task
        </Button>
        <Button
          variant="contained"
          startIcon={<FolderIcon />}
          onClick={() => setOpenProjectDialog(true)}
          sx={{
            background: "linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)",
            color: "#fff",
            fontWeight: 800,
            textTransform: "none",
            px: 4,
            py: 1.5,
            borderRadius: "14px",
            boxShadow: "0 10px 20px -5px rgba(56, 189, 248, 0.3)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 15px 30px -5px rgba(56, 189, 248, 0.4)",
            }
          }}
        >
          Create Project
        </Button>
        <Button
          variant="contained"
          startIcon={<AssessmentIcon />}
          onClick={() => navigate("/head/projects")}
          sx={{
            background: "rgba(255, 255, 255, 0.8)",
            color: "#0f172a",
            fontWeight: 800,
            textTransform: "none",
            px: 4,
            py: 1.5,
            borderRadius: "14px",
            border: `1px solid ${GLASS_BORDER}`,
            boxShadow: "0 4px 12px rgba(10, 15, 25, 0.05)",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              background: "#fff",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 20px rgba(10, 15, 25, 0.08)",
            }
          }}
        >
          View Projects
        </Button>
        <Button
          variant="contained"
          startIcon={<DashboardCustomizeIcon />}
          onClick={() => navigate("/head/project-overview")}
          sx={{
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            color: "#fff",
            fontWeight: 800,
            textTransform: "none",
            px: 4,
            py: 1.5,
            borderRadius: "14px",
            boxShadow: "0 10px 20px -5px rgba(245, 158, 11, 0.3)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 15px 30px -5px rgba(245, 158, 11, 0.4)",
            }
          }}
        >
          Project Overview
        </Button>
      </Box>

      {/* Tasks Table - Desktop View */}
      <Box sx={{ display: { xs: "none", md: "block" }, position: "relative", zIndex: 1 }}>
        <GlassCard sx={{ p: 0, borderRadius: "24px" }}>
          <TableContainer component={Box}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: "rgba(15, 23, 42, 0.03)" }}>
                  {["ID", "Title", "Description", "Priority", "Status", "Deadline"].map((head) => (
                    <TableCell key={head} sx={{ color: "#475569", fontWeight: 800, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", py: 2.5 }}>
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow
                    key={task.id}
                    component={motion.tr}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    sx={{
                      borderBottom: `1px solid ${GLASS_BORDER}`,
                      "&:hover": { background: "rgba(0, 0, 0, 0.02)" },
                      transition: "background 0.3s ease",
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={task.id}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          background: "rgba(15, 23, 42, 0.05)",
                          color: "#475569",
                          borderRadius: "8px"
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "#0f172a", fontWeight: 700 }}>
                      {task.title}
                    </TableCell>
                    <TableCell sx={{ color: "#64748b", maxWidth: 300 }}>
                      {task.desc.substring(0, 60)}...
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.priority}
                        size="small"
                        sx={{
                          backgroundColor: alpha(priorityColors[task.priority], 0.1),
                          color: priorityColors[task.priority],
                          fontWeight: 800,
                          borderRadius: "8px",
                          textTransform: "uppercase",
                          fontSize: "0.7rem"
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.status.replace("_", " ")}
                        size="small"
                        sx={{
                          backgroundColor: alpha(statusColors[task.status], 0.1),
                          color: statusColors[task.status],
                          fontWeight: 800,
                          borderRadius: "8px",
                          textTransform: "uppercase",
                          fontSize: "0.7rem"
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "#64748b", fontWeight: 600 }}>
                      {task.deadline}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </GlassCard>
      </Box>

      {/* Tasks Cards - Mobile View */}
      <Box sx={{ display: { xs: "block", md: "none" }, position: "relative", zIndex: 1 }}>
        <Grid container spacing={2}>
          {tasks.map((task) => (
            <Grid item xs={12} key={task.id}>
              <GlassCard sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Chip
                    label={`ID: ${task.id}`}
                    size="small"
                    sx={{ background: "rgba(15, 23, 42, 0.05)", color: "#475569", fontWeight: 700, borderRadius: "8px" }}
                  />
                  <Typography sx={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>
                    {task.deadline}
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    color: "#0f172a",
                    fontWeight: 800,
                    mb: 1,
                    fontSize: "1.1rem",
                    letterSpacing: "-0.01em"
                  }}
                >
                  {task.title}
                </Typography>

                <Typography
                  sx={{ color: "#64748b", mb: 2.5, fontSize: "0.9rem", lineHeight: 1.6 }}
                >
                  {task.desc}
                </Typography>

                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                  <Chip
                    label={task.priority}
                    size="small"
                    sx={{
                      background: alpha(priorityColors[task.priority], 0.1),
                      color: priorityColors[task.priority],
                      fontWeight: 800,
                      borderRadius: "8px",
                      textTransform: "uppercase",
                      fontSize: "0.7rem"
                    }}
                  />
                  <Chip
                    label={task.status.replace("_", " ")}
                    size="small"
                    sx={{
                      background: alpha(statusColors[task.status], 0.1),
                      color: statusColors[task.status],
                      fontWeight: 800,
                      borderRadius: "8px",
                      textTransform: "uppercase",
                      fontSize: "0.7rem"
                    }}
                  />
                </Box>
              </GlassCard>
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
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            border: `1px solid ${GLASS_BORDER}`,
            borderRadius: "32px",
            boxShadow: "0 25px 50px -12px rgba(10, 15, 25, 0.1)",
            color: "#0f172a",
            overflow: "hidden"
          },
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${GLASS_BORDER}`, p: 4, fontWeight: 900, fontSize: "1.5rem" }}>
          {editingId ? "Edit Enterprise Task" : "Initialize Strategic Task"}
        </DialogTitle>

        <DialogContent sx={{ py: 4, px: { xs: 2, md: 3 } }}>
          <Stack spacing={3} mt={1}>
            <TextField
              label="Task Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
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
              sx={{
                mt: 1,
                py: 2,
                background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
                color: "#fff",
                fontWeight: 800,
                fontSize: "1rem",
                textTransform: "none",
                borderRadius: "16px",
                boxShadow: "0 10px 20px -5px rgba(15, 23, 42, 0.3)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 15px 30px -5px rgba(15, 23, 42, 0.4)",
                }
              }}
            >
              {loading ? "Processing..." : (editingId ? "Update Intelligence Task" : "Onboard Control Task")}
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
