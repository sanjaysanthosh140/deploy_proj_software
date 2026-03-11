/**
 * ProjectDetailView.jsx
 * Final iOS Liquid Glass Redesign v2.5.
 * Strictly preserves provided API logic while overhauling UI.
 */
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
  Stack,
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

// --- iOS Liquid Glass Design Constants ---
const PRIMARY_BG = "#e6edf5";
const SECONDARY_BG = "#d9e3ef";
const TERTIARY_BG = "#cfd8e5";

const glassEffect = {
  background: "rgba(255, 255, 255, 0.25)",
  backdropFilter: "blur(30px)",
  border: "1px solid rgba(255, 255, 255, 0.45)",
  borderRadius: "22px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
  position: "relative",
  overflow: "hidden",
  transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
};

const liquidProgressSx = {
  height: 12,
  borderRadius: 6,
  bgcolor: "rgba(0, 0, 0, 0.08)",
  "& .MuiLinearProgress-bar": {
    borderRadius: 6,
    backgroundImage: "linear-gradient(90deg, #00d4ff, #0099cc, #00d4ff)",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 0 15px rgba(0, 212, 255, 0.35)",
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
      animation: "liquidMove 2s infinite linear",
    },
  },
  "@keyframes liquidMove": {
    "0%": { transform: "translateX(-100%)" },
    "100%": { transform: "translateX(100%)" },
  },
};

const ProjectDetailView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [newSubTaskInputs, setNewSubTaskInputs] = useState({});
  const [modifiedTasks, setModifiedTasks] = useState({});
  const token = localStorage.getItem("token");

  // --- LOGIC PRESERVATION (FROM USER SNIPPET) ---
  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `${token}`, "Content-Type": "application/json" };
      const [projectsRes, tasksRes, todosRes] = await Promise.all([
        axios.get("http://localhost:8080/employee_included_proj", { headers }),
        axios.get(`http://localhost:8080/emp_proj-tasks/${projectId}`, { headers }),
        axios.get("http://localhost:8080/achive_created_todo_list", { headers }),
      ]);

      const projectMetadata = projectsRes.data.find((p) => p._id === projectId);
      if (projectMetadata) {
        const normalizedTasks = tasksRes.data.map((item, index) => {
          const rawId = item.employeeTasks._id || item._id;
          const backendTaskId = typeof rawId === "object" ? rawId.$oid || rawId.toString() : rawId;
          const staticTodoList = item.employeeTasks.todolist || item.employeeTasks.tasks?.todolist || item.employeeTasks.tasks?.subTasks || [];
          const currentTaskId = item.employeeTasks.tasks?.task_id;

          let fetchedTodos = [];
          let todoMetadata = {};
          let hasMatchedTodo = false;
          if (Array.isArray(todosRes.data)) {
            const matchedTodoEntry = todosRes.data.find(
              (todo) => todo.task_id === currentTaskId && todo.project_id === projectId
            );
            if (matchedTodoEntry) {
              hasMatchedTodo = true;
              todoMetadata = { group_id: matchedTodoEntry._id, user_id: matchedTodoEntry.user_id };
              if (Array.isArray(matchedTodoEntry.user_subTaks)) {
                fetchedTodos = matchedTodoEntry.user_subTaks.map((st) => ({
                  todo_id: st.todo_id, title: st.title, status: st.status || "pending", createdAt: st.createdAt,
                }));
              }
            }
          }
          const combinedSubTasks = hasMatchedTodo ? fetchedTodos : staticTodoList;
          return {
            ...item.employeeTasks.tasks,
            ...todoMetadata,
            _id: todoMetadata.group_id || backendTaskId || `task-${index}-${Date.now()}`,
            originalTaskId: currentTaskId,
            subTasks: combinedSubTasks,
          };
        });
        setProject({ ...projectMetadata, todos: normalizedTasks });
      } else {
        setProject(null);
      }
      setTimeout(() => setLoading(false), 600);
    } catch (error) {
      console.error("Error fetching project details:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && projectId) {
      fetchProjectDetails();
    }
  }, [projectId, token]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical": return "#ff5b5b";
      case "High": return "#ffab00";
      case "Medium": return "#00d4ff";
      default: return "#00e676";
    }
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleToggleTodo = (todoId) => {
    if (!todoId || !project || !project.todos) return;
    setProject((prevProject) => ({
      ...prevProject,
      todos: prevProject.todos.map((todo) => {
        if (todo._id === todoId) return { ...todo, status: todo.status === "completed" ? "pending" : "completed" };
        return todo;
      }),
    }));
  };

  const handleToggleExpand = (taskId) => {
    setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleSubTaskInputChange = (taskId, value) => {
    setNewSubTaskInputs((prev) => ({ ...prev, [taskId]: value }));
  };

  const handleAddSubTask = async (taskId) => {
    const content = newSubTaskInputs[taskId];
    if (!content || !content.trim()) return;
    const subId = `sub-${Date.now()}`;
    const newSubTask = { todo_id: subId, title: content, status: "pending", createdAt: new Date().toISOString(), isNew: true };
    setProject((prev) => ({
      ...prev,
      todos: prev.todos.map((todo) => {
        if (todo._id === taskId) return { ...todo, subTasks: [...(todo.subTasks || []), newSubTask] };
        return todo;
      }),
    }));
    setModifiedTasks((prev) => ({ ...prev, [taskId]: true }));
    setNewSubTaskInputs((prev) => ({ ...prev, [taskId]: "" }));
  };

  const handleSaveAllSubTasks = async (taskId) => {
    const todo = project.todos.find((t) => t._id === taskId);
    if (!todo) return;
    try {
      const headers = { Authorization: `${token}`, "Content-Type": "application/json" };
      const subTaskList = (todo.subTasks || []).map((st) => ({
        createdAt: st.createdAt.includes("T") ? st.createdAt.split("T")[0] : st.createdAt,
        status: st.status, title: st.title, todo_id: st.todo_id,
      }));
      const payload = {
        user_id: todo.user_id, task_id: todo.task_id, project_id: projectId, user_subTaks: subTaskList, todolist: subTaskList,
      };
      await axios.post("http://localhost:8080/add_multiple_todos", payload, { headers });
      setModifiedTasks((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
      await fetchProjectDetails();
    } catch (error) { console.error("Failed to save subtasks", error); }
  };

  const handleDeleteSubTask = async (taskId, subTaskId) => {
    setProject((prev) => ({
      ...prev,
      todos: prev.todos.map((t) => {
        if (t._id === taskId) return { ...t, subTasks: t.subTasks.filter((st) => st.todo_id !== subTaskId) };
        return t;
      }),
    }));
    setModifiedTasks((prev) => ({ ...prev, [taskId]: true }));
  };

  const handleToggleSubTaskStatus = (taskId, subTaskId) => {
    setProject((prev) => ({
      ...prev,
      todos: prev.todos.map((t) => {
        if (t._id === taskId) {
          return {
            ...t,
            subTasks: t.subTasks.map((st) => st.todo_id === subTaskId ? { ...st, status: st.status === "completed" ? "pending" : "completed" } : st),
          };
        }
        return t;
      }),
    }));
    setModifiedTasks((prev) => ({ ...prev, [taskId]: true }));
  };

  if (loading) return (
    <Box sx={{ p: 4, minHeight: "100vh", bgcolor: PRIMARY_BG }}>
      <Skeleton variant="rectangular" height={100} sx={{ borderRadius: "22px", mb: 3 }} />
      <Skeleton variant="rectangular" height={400} sx={{ borderRadius: "22px" }} />
    </Box>
  );

  if (!project) return null;

  const daysRemaining = getDaysRemaining(project.deadline);
  const calculatedProgress = project.todos && project.todos.length > 0
    ? Math.round((project.todos.reduce((acc, todo) => {
      if (todo.status === "completed") return acc + 1;
      if (todo.subTasks && todo.subTasks.length > 0) {
        return acc + todo.subTasks.filter((st) => st.status === "completed").length / todo.subTasks.length;
      }
      return acc;
    }, 0) / project.todos.length) * 100)
    : 0;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        background: `linear-gradient(135deg, ${PRIMARY_BG} 0%, ${SECONDARY_BG} 50%, ${TERTIARY_BG} 100%)`,
        p: { xs: 2, md: 3 },
        position: "relative",
        overflowX: "hidden",
        overflowY: "auto",
        "&::-webkit-scrollbar": { width: "10px" },
        "&::-webkit-scrollbar-track": { background: "transparent" },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(0,0,0,0.25)",
          borderRadius: "5px",
        },
        "&::-webkit-scrollbar-thumb:hover": { background: "rgba(0,0,0,0.4)" },
      }}
    >
      <Fade in={true} timeout={500}>
        <Stack spacing={3}>
          {/* Project Header Panel */}
          <Box sx={{ ...glassEffect, p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <IconButton onClick={() => navigate("/app/projects")} sx={{ bgcolor: "rgba(0,0,0,0.05)", "&:hover": { bgcolor: "rgba(0,0,0,0.1)" } }}>
                <ArrowBackIcon fontSize="small" sx={{ color: "rgba(0,0,0,0.6)" }} />
              </IconButton>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: "rgba(0,0,0,0.8)", letterSpacing: "-0.5px", mb: 0.5 }}>
                  {project.title}
                </Typography>
                <Typography variant="body1" sx={{ color: "rgba(0,0,0,0.5)", fontWeight: 650 }}>
                  Operation Protocol System
                </Typography>
              </Box>
            </Box>

            <Box sx={{ textAlign: "right" }}>
              <Typography variant="h3" sx={{ color: daysRemaining <= 7 ? "#ff5b5b" : "#00d4ff", fontWeight: 950, lineHeight: 0.9 }}>
                {daysRemaining}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(0,0,0,0.4)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>
                Days Remaining
              </Typography>
            </Box>
          </Box>

          {/* Operation Velocity (Progress Dashboard) */}
          <Box sx={{ ...glassEffect, p: 4, bgcolor: "rgba(255,255,255,0.4)" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 3 }}>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                  <TrendingUpIcon sx={{ color: getPriorityColor(project.priority), fontSize: 32 }} />
                  <Typography variant="h4" sx={{ fontWeight: 900, color: "rgba(0,0,0,0.75)" }}>Operation Velocity</Typography>
                </Box>
                <Typography variant="body1" sx={{ color: "rgba(0,0,0,0.45)", fontWeight: 700 }}>Synchronized with active protocol sequences</Typography>
              </Box>
              <Typography variant="h2" sx={{ fontWeight: 1000, color: getPriorityColor(project.priority), lineHeight: 0.8 }}>
                {calculatedProgress}%
              </Typography>
            </Box>

            {/* Restored Custom Liquid Progress Bar */}
            <Box sx={{ position: "relative", height: 20, borderRadius: 10, bgcolor: "rgba(0, 0, 0, 0.05)", overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${calculatedProgress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{
                  height: "100%",
                  background: `linear-gradient(90deg, ${getPriorityColor(project.priority)} 0%, ${getPriorityColor(project.priority)}cc 100%)`,
                  borderRadius: 10,
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: `0 0 20px ${getPriorityColor(project.priority)}40`,
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
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                    animation: "liquidFlow 2s infinite linear",
                    "@keyframes liquidFlow": {
                      "0%": { transform: "translateX(-100%)" },
                      "100%": { transform: "translateX(100%)" },
                    },
                  }}
                />
                {/* Bubbles effect */}
                {[...Array(3)].map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: `${20 + i * 30}%`,
                      width: i % 2 === 0 ? "4px" : "6px",
                      height: i % 2 === 0 ? "4px" : "6px",
                      borderRadius: "50%",
                      bgcolor: "rgba(255, 255, 255, 0.4)",
                      animation: `bubbleUp ${2 + i}s infinite ease-in-out`,
                      "@keyframes bubbleUp": {
                        "0%, 100%": { transform: "translateY(0) scale(1)", opacity: 0.4 },
                        "50%": { transform: "translateY(-6px) scale(1.2)", opacity: 0.8 },
                      },
                    }}
                  />
                ))}
              </motion.div>
            </Box>
          </Box>

          {/* Active Protocols Stack */}
          <Box sx={{ ...glassEffect, p: 3, maxHeight: "55vh", overflowY: "auto", "&::-webkit-scrollbar": { width: "8px" }, "&::-webkit-scrollbar-track": { background: "transparent" }, "&::-webkit-scrollbar-thumb": { background: "rgba(0,0,0,0.2)", borderRadius: "4px" }, "&::-webkit-scrollbar-thumb:hover": { background: "rgba(0,0,0,0.35)" } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3, position: "sticky", top: 0, bgcolor: "rgba(255, 255, 255, 0.25)", p: 1.5, borderRadius: "16px", zIndex: 10 }}>
              <AssignmentTurnedInIcon sx={{ color: "#00d4ff", fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "rgba(0,0,0,0.8)" }}>Active Protocols</Typography>
              <Box sx={{ flex: 1, height: "1px", bgcolor: "rgba(0,0,0,0.1)", ml: 2 }} />
            </Box>

            <Stack spacing={2}>
              <AnimatePresence>
                {project.todos?.map((todo, index) => (
                  <motion.div key={todo._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                    <Box sx={{ p: 2, borderRadius: "20px", bgcolor: todo.status === "completed" ? "rgba(0, 230, 118, 0.04)" : "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.5)", transition: "all 0.3s ease" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Checkbox
                          checked={todo.status === "completed"}
                          onChange={() => handleToggleTodo(todo._id)}
                          icon={<RadioButtonUncheckedIcon sx={{ fontSize: 28 }} />}
                          checkedIcon={<CheckCircleIcon sx={{ fontSize: 28 }} />}
                          sx={{ p: 0.5, color: "rgba(0,0,0,0.15)", "&.Mui-checked": { color: "#00e676" } }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: todo.status === "completed" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.85)", textDecoration: todo.status === "completed" ? "line-through" : "none", lineHeight: 1.2, fontSize: { xs: "1.3rem", sm: "1.5rem", md: "1.7rem" } }}>
                            {todo.title}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 3, mt: 1.5 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                              <PersonIcon sx={{ fontSize: 22, color: "rgba(0,0,0,0.35)" }} />
                              <Typography variant="body1" sx={{ color: "rgba(0,0,0,0.4)", fontWeight: 750, fontSize: { xs: "0.95rem", sm: "1.1rem" } }}>{todo.employee === "You" ? "Primary Operator" : "Assigned Unit"}</Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                              <AccessTimeIcon sx={{ fontSize: 22, color: "rgba(0,0,0,0.35)" }} />
                              <Typography variant="body1" sx={{ color: "rgba(0,0,0,0.4)", fontWeight: 750, fontSize: { xs: "0.95rem", sm: "1.1rem" } }}>Due {new Date(todo.duedate).toLocaleDateString()}</Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Chip label={todo.priority} size="medium" sx={{ fontWeight: 850, fontSize: "0.95rem", bgcolor: `${getPriorityColor(todo.priority)}15`, color: getPriorityColor(todo.priority), height: 36, padding: "8px 12px", border: `1px solid ${getPriorityColor(todo.priority)}30` }} />
                        <IconButton size="large" onClick={() => handleToggleExpand(todo._id)} sx={{ bgcolor: "rgba(0,0,0,0.03)", width: 50, height: 50 }}>
                          {expandedTasks[todo._id] ? <KeyboardArrowUpIcon sx={{ fontSize: 32 }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 32 }} />}
                        </IconButton>
                      </Box>

                      <Collapse in={expandedTasks[todo._id]}>
                        <Box sx={{ pt: 2.5, mt: 2, borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                          <Box sx={{ mb: 2.5 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5, alignItems: "center" }}>
                              <Typography variant="body1" sx={{ fontWeight: 900, color: "rgba(0,0,0,0.45)", textTransform: "uppercase", letterSpacing: "0.5px", fontSize: { xs: "0.9rem", sm: "1.05rem" } }}>Sequence Integrity</Typography>
                              <Typography variant="h5" sx={{ fontWeight: 1000, color: getPriorityColor(todo.priority), fontSize: { xs: "1.4rem", sm: "1.6rem" } }}>
                                {todo.subTasks?.length > 0 ? Math.round((todo.subTasks.filter(s => s.status === "completed").length / todo.subTasks.length) * 100) : 0}%
                              </Typography>
                            </Box>
                            <Box sx={{ height: 8, borderRadius: 4, bgcolor: "rgba(0,0,0,0.05)", overflow: "hidden", position: "relative" }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${todo.subTasks?.length > 0 ? (todo.subTasks.filter(s => s.status === "completed").length / todo.subTasks.length) * 100 : 0}%` }}
                                style={{
                                  height: "100%",
                                  background: getPriorityColor(todo.priority),
                                  borderRadius: 4,
                                  position: "relative",
                                  overflow: "hidden"
                                }}
                              >
                                <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)", animation: "liquidFlow 2s infinite linear" }} />
                              </motion.div>
                            </Box>
                          </Box>

                          <Stack spacing={1.5} sx={{ mb: 2.5 }}>
                            {todo.subTasks?.map((subTask) => (
                              <Box key={subTask.todo_id} sx={{ p: 2, borderRadius: "14px", bgcolor: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid rgba(255,255,255,0.6)" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                  <Checkbox
                                    size="medium"
                                    checked={subTask.status === "completed"}
                                    onChange={() => handleToggleSubTaskStatus(todo._id, subTask.todo_id)}
                                    sx={{ p: 0.5, "&.Mui-checked": { color: "#00d4ff" } }}
                                  />
                                  <Typography variant="body1" sx={{ fontWeight: 700, color: subTask.status === "completed" ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.75)", textDecoration: subTask.status === "completed" ? "line-through" : "none", fontSize: { xs: "1rem", sm: "1.15rem" } }}>
                                    {subTask.title}
                                  </Typography>
                                  {subTask.isNew && <Chip label="Unsynchronized" size="small" sx={{ height: 24, fontSize: "0.8rem", bgcolor: "rgba(255, 171, 0, 0.12)", color: "#ffab00", fontWeight: 900 }} />}
                                </Box>
                                <IconButton size="medium" onClick={() => handleDeleteSubTask(todo._id, subTask.todo_id)} sx={{ color: "rgba(0,0,0,0.15)", "&:hover": { color: "#ff5b5b" } }}>
                                  <DeleteOutlineIcon sx={{ fontSize: 24 }} />
                                </IconButton>
                              </Box>
                            ))}
                          </Stack>

                          <Box sx={{ display: "flex", gap: 1.5 }}>
                            <TextField
                              size="small"
                              fullWidth
                              type="text"
                              autoComplete="off"
                              placeholder="Add protocol sequence..."
                              value={newSubTaskInputs[todo._id] || ""}
                              onChange={(e) => handleSubTaskInputChange(todo._id, e.target.value)}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "12px",
                                  bgcolor: "rgba(255,255,255,0.6)",
                                  fontSize: "1rem",
                                  fontWeight: 700,
                                  "& input": { color: "rgba(0,0,0,0.8)", py: 1.5 }
                                }
                              }}
                            />
                            <Button variant="contained" size="small" onClick={() => handleAddSubTask(todo._id)} sx={{ borderRadius: "12px", bgcolor: "#00d4ff", minWidth: 48, boxShadow: "0 4px 12px rgba(0, 212, 255, 0.3)" }}><AddIcon fontSize="small" /></Button>
                          </Box>

                          {(todo.subTasks?.some(st => st.isNew) || modifiedTasks[todo._id]) && (
                            <Button fullWidth onClick={() => handleSaveAllSubTasks(todo._id)} variant="contained" sx={{ mt: 2, borderRadius: "14px", bgcolor: "#00e676", color: "#fff", fontWeight: 850, textTransform: "none", fontSize: "0.9rem", boxShadow: "0 6px 18px rgba(0, 230, 118, 0.3)", "&:hover": { bgcolor: "#00c853" } }}>
                              Authorize Protocol Changes
                            </Button>
                          )}
                        </Box>
                      </Collapse>
                    </Box>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Stack>
          </Box>
        </Stack>
      </Fade>
    </Box>
  );
};

export default ProjectDetailView;