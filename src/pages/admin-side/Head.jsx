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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import FolderIcon from "@mui/icons-material/Folder";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";

import axios from "axios";
import CreateProjectDialog from "../../components/CreateProjectDialog";

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
        p: { xs: 2, sm: 3, md: 4 },
        background: "radial-gradient(circle at top, #0f172a 0%, #020617 70%)",
      }}
    >
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
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: { xs: 50, md: 70 },
              height: { xs: 50, md: 70 },
              borderRadius: "50%",
              background: "linear-gradient(135deg, #00d4ff20, #00d4ff05)",
              border: "3px solid #00d4ff40",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: { xs: "1.5rem", md: "2rem" },
              color: "#00d4ff",
              fontWeight: 700,
            }}
          >
            H
          </Box>
          <Box>
            <Typography
              variant="h3"
              sx={{
                color: "#e5e7eb",
                fontWeight: 700,
                fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3rem" },
                background: "linear-gradient(135deg, #00d4ff, #4ade80)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: 1,
              }}
            >
              Head Operations
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "#94a3b8", fontSize: { xs: "0.9rem", md: "1rem" } }}
            >
              Manage and track all team tasks and assignments
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #020617, #1a1f3a)",
              border: "2px solid #1e293b",
              borderRadius: { xs: 2, md: 3 },
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography sx={{ color: "#94a3b8", mb: 1 }}>
                Total Tasks
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: "#4ade80", fontWeight: 700 }}
              >
                {tasks.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #020617, #1a1f3a)",
              border: "2px solid #1e293b",
              borderRadius: { xs: 2, md: 3 },
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography sx={{ color: "#94a3b8", mb: 1 }}>
                In Progress
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: "#00d4ff", fontWeight: 700 }}
              >
                {tasks.filter((t) => t.status === "in_progress").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #020617, #1a1f3a)",
              border: "2px solid #1e293b",
              borderRadius: { xs: 2, md: 3 },
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography sx={{ color: "#94a3b8", mb: 1 }}>
                Completed
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: "#4ade80", fontWeight: 700 }}
              >
                {tasks.filter((t) => t.status === "completed").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #020617, #1a1f3a)",
              border: "2px solid #1e293b",
              borderRadius: { xs: 2, md: 3 },
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography sx={{ color: "#94a3b8", mb: 1 }}>Pending</Typography>
              <Typography
                variant="h4"
                sx={{ color: "#ff9c6e", fontWeight: 700 }}
              >
                {tasks.filter((t) => t.status === "pending").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Task and Create Project Buttons */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          gap: 2,
          justifyContent: { xs: "center", md: "flex-start" },
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            background: "linear-gradient(135deg, #4ade80, #4ade80cc)",
            color: "#020617",
            fontWeight: 700,
            fontSize: { xs: "0.9rem", md: "1rem" },
            textTransform: "uppercase",
            letterSpacing: 1,
            py: { xs: 1.2, md: 1.5 },
            px: { xs: 2, md: 3 },
            borderRadius: 2,
            transition: "all 0.3s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #4ade80dd, #4ade80)",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 25px #4ade8040",
            },
          }}
        >
          Add New Task
        </Button>
        <Button
          variant="contained"
          startIcon={<FolderIcon />}
          onClick={() => setOpenProjectDialog(true)}
          sx={{
            background: "linear-gradient(135deg, #00d4ff, #0099cc)",
            color: "#fff",
            fontWeight: 700,
            fontSize: { xs: "0.9rem", md: "1rem" },
            textTransform: "uppercase",
            letterSpacing: 1,
            py: { xs: 1.2, md: 1.5 },
            px: { xs: 2, md: 3 },
            borderRadius: 2,
            transition: "all 0.3s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #00bbee, #0088bb)",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 25px #00d4ff40",
            },
          }}
        >
          Create Project
        </Button>
        <Button
          variant="contained"
          startIcon={<AssessmentIcon />}
          onClick={() => navigate("/head/projects")}
          sx={{
            background: "linear-gradient(135deg, #b721ff, #7f00ff)",
            color: "#fff",
            fontWeight: 700,
            fontSize: { xs: "0.9rem", md: "1rem" },
            textTransform: "uppercase",
            letterSpacing: 1,
            py: { xs: 1.2, md: 1.5 },
            px: { xs: 2, md: 3 },
            borderRadius: 2,
            transition: "all 0.3s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #a61ef0, #6e00f0)",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 25px #b721ff40",
            },
          }}
        >
          View Projects
        </Button>
        <Button
          variant="contained"
          startIcon={<DashboardCustomizeIcon />}
          onClick={() => navigate("/head/project-overview")}
          sx={{
            background: "linear-gradient(135deg, #f59e0b, #f97316)",
            color: "#020617",
            fontWeight: 700,
            fontSize: { xs: "0.9rem", md: "1rem" },
            textTransform: "uppercase",
            letterSpacing: 1,
            py: { xs: 1.2, md: 1.5 },
            px: { xs: 2, md: 3 },
            borderRadius: 2,
            transition: "all 0.3s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #f59e0bdd, #f97316dd)",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 25px #f59e0b40",
            },
          }}
        >
          Project Overview
        </Button>
      </Box>

      {/* Tasks Table - Desktop View */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <TableContainer
          component={Paper}
          sx={{
            background: "linear-gradient(135deg, #020617, #1a1f3a)",
            border: "2px solid #1e293b",
            borderRadius: 3,
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ background: "#1e293b" }}>
                <TableCell sx={{ color: "#94a3b8", fontWeight: 700 }}>
                  ID
                </TableCell>
                <TableCell sx={{ color: "#94a3b8", fontWeight: 700 }}>
                  Title
                </TableCell>
                <TableCell sx={{ color: "#94a3b8", fontWeight: 700 }}>
                  Description
                </TableCell>
                <TableCell sx={{ color: "#94a3b8", fontWeight: 700 }}>
                  Priority
                </TableCell>
                <TableCell sx={{ color: "#94a3b8", fontWeight: 700 }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: "#94a3b8", fontWeight: 700 }}>
                  Deadline
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow
                  key={task.id}
                  sx={{
                    borderBottom: "1px solid #1e293b",
                    "&:hover": {
                      background: "#1a1f3a",
                    },
                  }}
                >
                  <TableCell sx={{ color: "#e5e7eb" }}>
                    <Chip label={task.id} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell sx={{ color: "#e5e7eb", fontWeight: 600 }}>
                    {task.title}
                  </TableCell>
                  <TableCell sx={{ color: "#94a3b8", maxWidth: 300 }}>
                    {task.desc.substring(0, 50)}...
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.priority}
                      size="small"
                      sx={{
                        backgroundColor: `${priorityColors[task.priority]}20`,
                        color: priorityColors[task.priority],
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.status.replace("_", " ")}
                      size="small"
                      sx={{
                        backgroundColor: `${statusColors[task.status]}20`,
                        color: statusColors[task.status],
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "#94a3b8" }}>
                    {task.deadline}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Tasks Cards - Mobile View */}
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <Grid container spacing={2}>
          {tasks.map((task) => (
            <Grid item xs={12} key={task.id}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #020617, #1a1f3a)",
                  border: "2px solid #1e293b",
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={`ID: ${task.id}`}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Typography
                  sx={{
                    color: "#e5e7eb",
                    fontWeight: 700,
                    mb: 1,
                    fontSize: "1.1rem",
                  }}
                >
                  {task.title}
                </Typography>

                <Typography
                  sx={{ color: "#94a3b8", mb: 2, fontSize: "0.9rem" }}
                >
                  {task.desc}
                </Typography>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  <Chip
                    label={task.priority}
                    size="small"
                    sx={{
                      backgroundColor: `${priorityColors[task.priority]}20`,
                      color: priorityColors[task.priority],
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label={task.status.replace("_", " ")}
                    size="small"
                    sx={{
                      backgroundColor: `${statusColors[task.status]}20`,
                      color: statusColors[task.status],
                      fontWeight: 600,
                    }}
                  />
                </Box>

                <Typography sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                  Deadline: {task.deadline}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Add/Edit Task Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: "linear-gradient(135deg, #020617, #1a1f3a)",
            borderRadius: { xs: 2, md: 3 },
            border: "2px solid #4ade8040",
            boxShadow: "0 12px 50px #4ade8030",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#e5e7eb",
            fontSize: { xs: "1.25rem", md: "1.5rem" },
            fontWeight: 700,
            textAlign: "center",
            background: "linear-gradient(135deg, #4ade8020, transparent)",
            paddingY: 3,
          }}
        >
          Create New Task
        </DialogTitle>

        <DialogContent sx={{ py: 4, px: { xs: 2, md: 3 } }}>
          <Stack spacing={3} mt={1}>
            <TextField
              label="Task Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              fullWidth
              placeholder="Enter task title"
              InputLabelProps={{ sx: { color: "#94a3b8" } }}
              sx={{
                input: {
                  color: "#e5e7eb",
                  fontSize: { xs: "0.95rem", md: "1rem" },
                },
                "& .MuiOutlinedInput-root": {
                  borderColor: "#1e293b",
                  "& fieldset": {
                    borderColor: "#1e293b",
                  },
                  "&:hover fieldset": {
                    borderColor: "#4ade80",
                  },
                },
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
              placeholder="Enter task description"
              InputLabelProps={{ sx: { color: "#94a3b8" } }}
              sx={{
                input: { color: "#e5e7eb" },
                "& .MuiOutlinedInput-root": {
                  borderColor: "#1e293b",
                  "& fieldset": {
                    borderColor: "#1e293b",
                  },
                  "&:hover fieldset": {
                    borderColor: "#4ade80",
                  },
                },
              }}
            />

            <TextField
              select
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{ sx: { color: "#94a3b8" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderColor: "#1e293b",
                  color: "#e5e7eb",
                  "& fieldset": {
                    borderColor: "#1e293b",
                  },
                  "&:hover fieldset": {
                    borderColor: "#4ade80",
                  },
                },
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
              InputLabelProps={{ sx: { color: "#94a3b8" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderColor: "#1e293b",
                  color: "#e5e7eb",
                  "& fieldset": {
                    borderColor: "#1e293b",
                  },
                  "&:hover fieldset": {
                    borderColor: "#4ade80",
                  },
                },
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
              placeholder="e.g., Today, Tomorrow, 2025-01-20"
              InputLabelProps={{ sx: { color: "#94a3b8" } }}
              sx={{
                input: {
                  color: "#e5e7eb",
                  fontSize: { xs: "0.95rem", md: "1rem" },
                },
                "& .MuiOutlinedInput-root": {
                  borderColor: "#1e293b",
                  "& fieldset": {
                    borderColor: "#1e293b",
                  },
                  "&:hover fieldset": {
                    borderColor: "#4ade80",
                  },
                },
              }}
            />

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                onClick={handleAddOrUpdateTask}
                disabled={loading}
                fullWidth
                sx={{
                  py: { xs: 1.5, md: 2 },
                  background: "linear-gradient(135deg, #4ade80, #4ade80cc)",
                  color: "#020617",
                  fontWeight: 700,
                  fontSize: { xs: "0.95rem", md: "1rem" },
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #4ade80dd, #4ade80)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px #4ade8040",
                  },
                  "&:disabled": {
                    opacity: 0.6,
                    cursor: "not-allowed",
                  },
                }}
              >
                {loading ? "Creating..." : "Create Task"}
              </Button>

              <Button
                onClick={handleCloseDialog}
                disabled={loading}
                fullWidth
                sx={{
                  py: { xs: 1.5, md: 2 },
                  background: "#1e293b",
                  color: "#e5e7eb",
                  fontWeight: 700,
                  fontSize: { xs: "0.95rem", md: "1rem" },
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "#334155",
                  },
                  "&:disabled": {
                    opacity: 0.6,
                    cursor: "not-allowed",
                  },
                }}
              >
                Cancel
              </Button>
            </Stack>
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
