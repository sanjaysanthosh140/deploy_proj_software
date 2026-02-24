import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  Checkbox,
  Avatar,
  AvatarGroup,
  IconButton,
  Divider,
  Fade,
  Skeleton,
  Button,
  TextField,
  Collapse,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FlagIcon from "@mui/icons-material/Flag";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import axios from "axios";

const ProjectDetailView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [newSubTaskInputs, setNewSubTaskInputs] = useState({});
  console.log(projectId);
  let token = localStorage.getItem("token");
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const headers = {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        };

        // Fetch both project details and specific tasks for this employee
        const [projectsRes, tasksRes] = await Promise.all([
          axios.get("http://localhost:8080/employee_included_proj", {
            headers,
          }),
          axios.get(`http://localhost:8080/emp_proj-tasks/${projectId}`, {
            headers,
          }),
        ]);
        console.log("fetch takss", tasksRes);
        // Find the specific project this page is for
        const projectMetadata = projectsRes.data.find(
          (p) => p._id === projectId,
        );

        if (projectMetadata) {
          // Flatten the aggregated tasks from backend
          // Structure: [{ employeeTasks: { tasks: { ... }, _id: "..." } }, ...]
          const normalizedTasks = tasksRes.data.map((item, index) => {
            const rawId = item.employeeTasks._id || item._id;
            const backendTaskId =
              typeof rawId === "object"
                ? rawId.$oid || rawId.toString()
                : rawId;
            const backendTodoList =
              item.employeeTasks.todolist ||
              item.employeeTasks.tasks?.todolist ||
              item.employeeTasks.tasks?.subTasks ||
              [];

            return {
              ...item.employeeTasks.tasks,
              _id: backendTaskId || `task-${index}-${Date.now()}`,
              originalTaskId:
                backendTaskId || item.employeeTasks.tasks?.task_id,
              subTasks: backendTodoList, // map the db todolist to our local subTasks array
            };
          });

          setProject({
            ...projectMetadata,
            todos: normalizedTasks,
          });
        } else {
          setProject(null);
        }

        setTimeout(() => {
          setLoading(false);
        }, 600);
      } catch (error) {
        console.error("Error fetching project details:", error);
        setLoading(false);
      }
    };

    if (token && projectId) {
      fetchProjectDetails();
    }
  }, [projectId, token]);

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

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#00e676";
      case "in_progress":
        return "#00d4ff";
      default:
        return "#718096";
    }
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleToggleTodo = (todoId) => {
    // TODO: Implement API call to update todo status
    if (!todoId || !project || !project.todos) {
      console.error("Invalid todoId or project state");
      return;
    }

    setProject((prevProject) => {
      if (!prevProject || !prevProject.todos) {
        return prevProject;
      }

      return {
        ...prevProject,
        todos: prevProject.todos.map((todo) => {
          // Use strict equality and ensure _id exists
          if (todo._id && todo._id === todoId) {
            return {
              ...todo,
              status: todo.status === "completed" ? "pending" : "completed",
            };
          }
          return todo;
        }),
      };
    });
  };

  // Sub-task Handlers
  const handleToggleExpand = (taskId) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleSubTaskInputChange = (taskId, value) => {
    setNewSubTaskInputs((prev) => ({
      ...prev,
      [taskId]: value,
    }));
  };

  const handleAddSubTask = async (taskId) => {
    const content = newSubTaskInputs[taskId];
    if (!content || !content.trim()) return;

    // Optimistic update local
    const newSubTask = {
      _id: `sub-${Date.now()}`,
      title: content,
      status: "pending",
      createdAt: new Date().toISOString(),
      isNew: true, // flag for new subtasks
    };

    setProject((prev) => ({
      ...prev,
      todos: prev.todos.map((todo) => {
        if (todo._id === taskId) {
          return {
            ...todo,
            subTasks: [...(todo.subTasks || []), newSubTask],
          };
        }
        return todo;
      }),
    }));

    setNewSubTaskInputs((prev) => ({ ...prev, [taskId]: "" }));
  };

  const handleSaveAllSubTasks = async (taskId) => {
    const todo = project.todos.find((t) => t._id === taskId);
    if (!todo) return;
    const newSubTasks = todo.subTasks.filter((st) => st.isNew);
    if (newSubTasks.length === 0) return;

    try {
      const headers = {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      };

      const payload = {
        task_id: todo.originalTaskId || todo._id,
        proj_id: projectId,
        todolist: newSubTasks.map((st) => ({
          todo_id: st._id,
          title: st.title,
          status: st.status,
          createdAt: st.createdAt.split("T")[0],
        })),
      };
      console.log("payload", payload);
      await axios.post("http://localhost:8080/add_multiple_todos", payload, {
        headers,
      });

      // remove isNew flag on success
      setProject((prev) => ({
        ...prev,
        todos: prev.todos.map((t) => {
          if (t._id === taskId) {
            return {
              ...t,
              subTasks: t.subTasks.map((st) => {
                if (st.isNew) {
                  const { isNew, ...rest } = st;
                  return rest;
                }
                return st;
              }),
            };
          }
          return t;
        }),
      }));
    } catch (error) {
      console.error("Failed to save subtasks", error);
    }
  };

  const handleDeleteSubTask = async (taskId, subTaskId) => {
    const todo = project.todos.find((t) => t._id === taskId);
    const subTask = todo?.subTasks.find((st) => st._id === subTaskId);

    setProject((prev) => ({
      ...prev,
      todos: prev.todos.map((t) => {
        if (t._id === taskId) {
          return {
            ...t,
            subTasks: t.subTasks.filter((st) => st._id !== subTaskId),
          };
        }
        return t;
      }),
    }));

    if (subTask && !subTask.isNew) {
      try {
        const headers = { Authorization: `${token}` };
        const payload = {
          _id: subTaskId,
          task_id: todo.originalTaskId || todo._id,
          proj_id: projectId,
        };
        console.log("delete payload", payload);
        await axios.post(`http://localhost:8080/delete_todo`, payload, {
          headers,
        });
      } catch (error) {
        console.error("Failed to delete subtask from server", error);
      }
    }
  };

  const handleToggleSubTaskStatus = async (taskId, subTaskId) => {
    const todo = project.todos.find((t) => t._id === taskId);
    const subTask = todo?.subTasks.find((st) => st._id === subTaskId);
    if (!subTask) return;

    const newStatus = subTask.status === "completed" ? "pending" : "completed";
    const newChecked = newStatus === "completed";

    setProject((prev) => ({
      ...prev,
      todos: prev.todos.map((t) => {
        if (t._id === taskId) {
          return {
            ...t,
            subTasks: t.subTasks.map((st) =>
              st._id === subTaskId
                ? {
                  ...st,
                  status: newStatus,
                }
                : st,
            ),
          };
        }
        return t;
      }),
    }));

    if (!subTask.isNew) {
      try {
        const headers = { Authorization: `${token}` };
        const payload = {
          _id: subTaskId,
          status: newStatus,
          task_id: todo.originalTaskId || todo._id,
          proj_id: projectId,
        };
        console.log("update status payload", payload);
        await axios.post(`http://localhost:8080/update_todo_status`, payload, {
          headers,
        });
      } catch (error) {
        console.error("Failed to update status on server", error);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%", p: 3 }}>
        <Skeleton variant="text" width={200} height={60} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={300} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={400} />
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" sx={{ color: "#a0aec0" }}>
          Project not found
        </Typography>
      </Box>
    );
  }

  const completedTodos = project.todos
    ? project.todos.filter((t) => t.status === "completed").length
    : 0;
  const totalTodos = project.todos ? project.todos.length : 0;
  const calculatedProgress =
    project.todos && project.todos.length > 0
      ? Math.round(
        (project.todos.reduce((acc, todo) => {
          if (todo.status === "completed") return acc + 1;
          if (todo.subTasks && todo.subTasks.length > 0) {
            return (
              acc +
              todo.subTasks.filter((st) => st.status === "completed").length /
              todo.subTasks.length
            );
          }
          return acc;
        }, 0) /
          project.todos.length) *
        100,
      )
      : 0;
  const daysRemaining = getDaysRemaining(project.deadline);
  const isUrgent = daysRemaining <= 7;

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      <Fade in={true} timeout={800}>
        <Box>
          {/* Back Button */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/app/projects")}
            sx={{
              mb: 3,
              color: "#a0aec0",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                color: "#00d4ff",
                bgcolor: "rgba(11, 28, 32, 0.1)",
              },
            }}
          >
            Back to Projects
          </Button>

          {/* Project Header */}
          <Paper
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{
              p: 4,
              mb: 3,
              background: "rgba(20, 25, 40, 0.7)",
              backdropFilter: "blur(16px)",
              borderRadius: "20px",
              border: `1px solid ${isUrgent ? "rgba(255, 171, 0, 0.3)" : "rgba(255, 255, 255, 0.08)"}`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background Glow */}
            <Box
              sx={{
                position: "absolute",
                top: "-50%",
                right: "-10%",
                width: "400px",
                height: "400px",
                background: `radial-gradient(circle, ${getPriorityColor(project.priority)}15 0%, transparent 70%)`,
                filter: "blur(60px)",
                zIndex: 0,
              }}
            />

            <Box sx={{ position: "relative", zIndex: 1 }}>
              {/* Tags */}
              <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
                <Chip
                  label={project.priority}
                  size="small"
                  sx={{
                    bgcolor: `${getPriorityColor(project.priority)}20`,
                    color: getPriorityColor(project.priority),
                    fontWeight: 700,
                    border: `1px solid ${getPriorityColor(project.priority)}40`,
                  }}
                />
                <Chip
                  icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
                  label={`${daysRemaining} days remaining`}
                  size="small"
                  sx={{
                    bgcolor: isUrgent
                      ? "rgba(255, 171, 0, 0.1)"
                      : "rgba(255, 255, 255, 0.05)",
                    color: isUrgent ? "#ffab00" : "#a0aec0",
                    fontWeight: 600,
                    border: `1px solid ${isUrgent ? "rgba(255, 171, 0, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
                  }}
                />
              </Box>

              {/* Title & Description */}
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: "#fff",
                  mb: 2,
                  letterSpacing: "-0.5px",
                }}
              >
                {project.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#a0aec0",
                  mb: 4,
                  lineHeight: 1.8,
                  maxWidth: "80%",
                }}
              >
                {project.description}
              </Typography>

              {/* Progress Section */}
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TrendingUpIcon sx={{ color: "#00d4ff", fontSize: 20 }} />
                    <Typography
                      variant="h6"
                      sx={{ color: "#fff", fontWeight: 700 }}
                    >
                      Overall Progress
                    </Typography>
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ color: "#00d4ff", fontWeight: 700 }}
                  >
                    {calculatedProgress}%
                  </Typography>
                </Box>

                {/* Liquid Progress Bar */}
                <Box
                  sx={{
                    position: "relative",
                    height: 12,
                    borderRadius: 6,
                    bgcolor: "rgba(255, 255, 255, 0.05)",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${calculatedProgress}%` }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    style={{
                      height: "100%",
                      background: `linear-gradient(90deg, ${getPriorityColor(project.priority)} 0%, ${getPriorityColor(project.priority)}60 100%)`,
                      borderRadius: 6,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Liquid wave effect */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(90deg, transparent, ${getPriorityColor(project.priority)}60, transparent)`,
                        animation: "liquidFlow 2.5s infinite linear",
                        "@keyframes liquidFlow": {
                          "0%": { transform: "translateX(-100%)" },
                          "100%": { transform: "translateX(100%)" },
                        },
                      }}
                    />
                    {/* Bubbles effect */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "20%",
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        bgcolor: "rgba(255, 255, 255, 0.4)",
                        animation: "bubble1 3s infinite ease-in-out",
                        "@keyframes bubble1": {
                          "0%, 100%": {
                            transform: "translateY(0) scale(1)",
                            opacity: 0.4,
                          },
                          "50%": {
                            transform: "translateY(-3px) scale(1.2)",
                            opacity: 0.8,
                          },
                        },
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "60%",
                        width: "3px",
                        height: "3px",
                        borderRadius: "50%",
                        bgcolor: "rgba(255, 255, 255, 0.3)",
                        animation: "bubble2 2.5s infinite ease-in-out",
                        "@keyframes bubble2": {
                          "0%, 100%": {
                            transform: "translateY(0) scale(1)",
                            opacity: 0.3,
                          },
                          "50%": {
                            transform: "translateY(-4px) scale(1.3)",
                            opacity: 0.7,
                          },
                        },
                      }}
                    />
                  </motion.div>
                </Box>

                <Typography
                  variant="caption"
                  sx={{ color: "#a0aec0", mt: 1, display: "block" }}
                >
                  {completedTodos} of {totalTodos} tasks completed
                </Typography>
              </Box>

              {/* Team Members */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ color: "#a0aec0", fontWeight: 600 }}
                >
                  Team:
                </Typography>
                <AvatarGroup
                  max={5}
                  sx={{
                    "& .MuiAvatar-root": {
                      width: 32,
                      height: 32,
                      fontSize: "0.875rem",
                    },
                  }}
                >
                  {project.teamMembers &&
                    project.teamMembers.map((member) => (
                      <Avatar
                        key={member.userId}
                        sx={{
                          bgcolor: getPriorityColor(project.priority),
                          border: "2px solid rgba(20, 25, 40, 0.9)",
                          fontSize: "0.8rem",
                        }}
                      >
                        {member.name.charAt(0)}
                      </Avatar>
                    ))}
                </AvatarGroup>
              </Box>
            </Box>
          </Paper>

          {/* To-Do List */}
          <Paper
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            sx={{
              p: 4,
              background: "rgba(20, 25, 40, 0.7)",
              backdropFilter: "blur(16px)",
              borderRadius: "20px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}
            >
              <AssignmentTurnedInIcon sx={{ color: "#00d4ff", fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#fff" }}>
                Project Tasks
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <AnimatePresence>
                {project.todos &&
                  project.todos.map((todo, index) => (
                    <motion.div
                      key={todo._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: "16px",
                          background:
                            todo.status === "completed"
                              ? "rgba(0, 230, 118, 0.05)"
                              : "rgba(255, 255, 255, 0.02)",
                          border: `1px solid ${todo.status === "completed"
                              ? "rgba(0, 230, 118, 0.2)"
                              : "rgba(255, 255, 255, 0.05)"
                            }`,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          transition: "all 0.3s ease",
                          "&:hover": {
                            background:
                              todo.status === "completed"
                                ? "rgba(0, 230, 118, 0.08)"
                                : "rgba(255, 255, 255, 0.04)",
                            transform: "translateX(4px)",
                          },
                        }}
                      >
                        {/* Checkbox */}
                        <Checkbox
                          checked={todo.status === "completed"}
                          onChange={() => handleToggleTodo(todo._id)}
                          icon={<RadioButtonUncheckedIcon />}
                          checkedIcon={<CheckCircleIcon />}
                          sx={{
                            color: "#718096",
                            "&.Mui-checked": {
                              color: "#00e676",
                            },
                          }}
                        />

                        {/* Task Info */}
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              color:
                                todo.status === "completed"
                                  ? "#a0aec0"
                                  : "#fff",
                              textDecoration:
                                todo.status === "completed"
                                  ? "line-through"
                                  : "none",
                              mb: 0.5,
                            }}
                          >
                            {todo.title}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              flexWrap: "wrap",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <PersonIcon
                                sx={{ fontSize: 14, color: "#718096" }}
                              />
                              <Typography
                                variant="caption"
                                sx={{ color: "#718096" }}
                              >
                                Assigned:{" "}
                                {todo.employee === "You" ? "You" : "Assigned"}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <AccessTimeIcon
                                sx={{ fontSize: 14, color: "#718096" }}
                              />
                              <Typography
                                variant="caption"
                                sx={{ color: "#718096" }}
                              >
                                Due:{" "}
                                {new Date(todo.duedate).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                  },
                                )}
                              </Typography>
                            </Box>
                            {/* Sub-task Summary */}
                            {todo.subTasks && todo.subTasks.length > 0 && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <PlaylistAddCheckIcon
                                  sx={{ fontSize: 14, color: "#00d4ff" }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#00d4ff" }}
                                >
                                  {
                                    todo.subTasks.filter(
                                      (st) => st.status === "completed",
                                    ).length
                                  }
                                  /{todo.subTasks.length} Sub-tasks
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>

                        {/* Priority & Status & Expand */}
                        <Box
                          sx={{ display: "flex", gap: 1, alignItems: "center" }}
                        >
                          <Chip
                            label={todo.priority}
                            size="small"
                            sx={{
                              bgcolor: `${getPriorityColor(todo.priority)}15`,
                              color: getPriorityColor(todo.priority),
                              fontWeight: 600,
                              fontSize: "0.7rem",
                              border: `1px solid ${getPriorityColor(todo.priority)}30`,
                            }}
                          />
                          <IconButton
                            onClick={() => handleToggleExpand(todo._id)}
                            sx={{
                              color: "#a0aec0",
                              bgcolor: "rgba(255,255,255,0.05)",
                              transition: "all 0.3s",
                              transform: expandedTasks[todo._id]
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                              "&:hover": {
                                bgcolor: "rgba(255,255,255,0.1)",
                                color: "#fff",
                              },
                            }}
                            size="small"
                          >
                            <KeyboardArrowDownIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Sub-tasks Section */}
                      <Collapse
                        in={expandedTasks[todo._id]}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box
                          sx={{
                            p: 2,
                            mt: 1,
                            mr: 2,
                            ml: 6,
                            borderRadius: "12px",
                            bgcolor: "rgba(0, 0, 0, 0.2)",
                            border: "1px solid rgba(255, 255, 255, 0.05)",
                          }}
                        >
                          {/* Progress Bar */}
                          {todo.subTasks && todo.subTasks.length > 0 && (
                            <Box
                              sx={{
                                mb: 2,
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <LinearProgress
                                variant="determinate"
                                value={
                                  (todo.subTasks.filter(
                                    (st) => st.status === "completed",
                                  ).length /
                                    todo.subTasks.length) *
                                  100
                                }
                                sx={{
                                  flex: 1,
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: "rgba(255, 255, 255, 0.1)",
                                  "& .MuiLinearProgress-bar": {
                                    bgcolor: "#00d4ff",
                                    borderRadius: 3,
                                  },
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{ color: "#00d4ff", fontWeight: 600 }}
                              >
                                {Math.round(
                                  (todo.subTasks.filter(
                                    (st) => st.status === "completed",
                                  ).length /
                                    todo.subTasks.length) *
                                  100,
                                )}
                                %
                              </Typography>
                            </Box>
                          )}

                          {/* Add Sub-task Input */}
                          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                            <TextField
                              fullWidth
                              placeholder="Add a sub-task..."
                              variant="outlined"
                              size="small"
                              value={newSubTaskInputs[todo._id] || ""}
                              onChange={(e) =>
                                handleSubTaskInputChange(
                                  todo._id,
                                  e.target.value,
                                )
                              }
                              onKeyPress={(e) =>
                                e.key === "Enter" && handleAddSubTask(todo._id)
                              }
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  color: "#fff",
                                  fontSize: "0.9rem",
                                  bgcolor: "rgba(255, 255, 255, 0.05)",
                                  "& fieldset": { borderColor: "transparent" },
                                  "&:hover fieldset": {
                                    borderColor: "rgba(255, 255, 255, 0.1)",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: "#00d4ff",
                                  },
                                },
                              }}
                            />
                            <IconButton
                              onClick={() => handleAddSubTask(todo._id)}
                              sx={{
                                bgcolor: "#00d4ff",
                                color: "#000",
                                "&:hover": { bgcolor: "#00b7dd" },
                                borderRadius: "8px",
                                width: 40,
                                height: 40,
                              }}
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>

                          {todo.subTasks &&
                            todo.subTasks.some((st) => st.isNew) && (
                              <Button
                                variant="contained"
                                onClick={() => handleSaveAllSubTasks(todo._id)}
                                sx={{
                                  mb: 2,
                                  bgcolor: "#00e676",
                                  color: "#000",
                                  fontWeight: 600,
                                  borderRadius: "8px",
                                  textTransform: "none",
                                  "&:hover": { bgcolor: "#00c853" },
                                }}
                              >
                                Save All New To-dos
                              </Button>
                            )}

                          {/* Sub-tasks List */}
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                            }}
                          >
                            {todo.subTasks && todo.subTasks.length > 0 ? (
                              todo.subTasks.map((subTask) => (
                                <Box
                                  key={subTask._id}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    p: 1,
                                    borderRadius: "8px",
                                    bgcolor: "rgba(255, 255, 255, 0.03)",
                                    "&:hover": {
                                      bgcolor: "rgba(255, 255, 255, 0.06)",
                                    },
                                    transition: "all 0.2s",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <Checkbox
                                      size="small"
                                      checked={subTask.status === "completed"}
                                      onChange={() =>
                                        handleToggleSubTaskStatus(
                                          todo._id,
                                          subTask._id,
                                        )
                                      }
                                      sx={{
                                        color: "#718096",
                                        p: 0.5,
                                        "&.Mui-checked": { color: "#00d4ff" },
                                      }}
                                    />
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color:
                                          subTask.status === "completed"
                                            ? "#718096"
                                            : "#e2e8f0",
                                        textDecoration:
                                          subTask.status === "completed"
                                            ? "line-through"
                                            : "none",
                                      }}
                                    >
                                      {subTask.title}
                                    </Typography>
                                    {subTask.isNew && (
                                      <Chip
                                        label="Unsaved"
                                        size="small"
                                        sx={{
                                          height: 20,
                                          fontSize: "0.65rem",
                                          bgcolor: "rgba(255, 171, 0, 0.2)",
                                          color: "#ffab00",
                                          ml: 1,
                                        }}
                                      />
                                    )}
                                  </Box>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleDeleteSubTask(todo._id, subTask._id)
                                    }
                                    sx={{
                                      color: "#a0aec0",
                                      opacity: 0,
                                      transition: "opacity 0.2s",
                                      "&:hover": { color: "#ff5b5b" },
                                      ".MuiBox-root:hover &": { opacity: 1 },
                                    }}
                                  >
                                    <DeleteOutlineIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              ))
                            ) : (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#718096",
                                  textAlign: "center",
                                  py: 2,
                                }}
                              >
                                No sub-tasks yet.
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Collapse>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </Box>
          </Paper>
        </Box>
      </Fade>
    </Box>
  );
};

export default ProjectDetailView;