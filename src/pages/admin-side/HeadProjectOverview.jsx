import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  Divider,
  TextField,
  InputAdornment,
  Skeleton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderIcon from "@mui/icons-material/Folder";
import PersonIcon from "@mui/icons-material/Person";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// ─── helpers ────────────────────────────────────────────────────────────────

const statusColor = (s) => {
  const m = {
    completed: "#4ade80",
    done: "#4ade80",
    in_progress: "#00d4ff",
    inprogress: "#00d4ff",
    pending: "#fbbf24",
  };
  return m[s?.toLowerCase()] ?? "#94a3b8";
};

const priorityColor = (p) => {
  const m = {
    Critical: "#f43f5e",
    High: "#fb7185",
    Medium: "#fbbf24",
    Low: "#4ade80",
  };
  return m[p] ?? "#94a3b8";
};

const getProjectProgress = (project) => {
  const todos = project.todos ?? [];
  if (!todos.length) return 0;
  const done = todos.filter((t) => t.status === "completed").length;
  return Math.round((done / todos.length) * 100);
};

// ─── shared card style ───────────────────────────────────────────────────────
const glassBg = {
  background: "rgba(15, 23, 42, 0.55)",
  backdropFilter: "blur(18px)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 4,
};

// ─── sub-components ──────────────────────────────────────────────────────────

const TodoItem = ({ todo }) => {
  const checked = todo.status === "done" || todo.status === "completed";
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        py: 1,
        px: 2,
        borderRadius: 2,
        transition: "background 0.2s",
        "&:hover": { background: "rgba(255,255,255,0.03)" },
      }}
    >
      {checked ? (
        <CheckCircleIcon sx={{ color: "#4ade80", fontSize: 20, mt: 0.2 }} />
      ) : (
        <RadioButtonUncheckedIcon
          sx={{ color: "#475569", fontSize: 20, mt: 0.2 }}
        />
      )}
      <Box sx={{ flex: 1 }}>
        <Typography
          sx={{
            color: checked ? "#64748b" : "#e2e8f0",
            fontSize: "0.85rem",
            textDecoration: checked ? "line-through" : "none",
            lineHeight: 1.4,
          }}
        >
          {todo.title}
        </Typography>
        {todo.createdAt && (
          <Typography sx={{ color: "#475569", fontSize: "0.72rem", mt: 0.3 }}>
            {todo.createdAt}
          </Typography>
        )}
      </Box>
      <Chip
        label={todo.status ?? "pending"}
        size="small"
        sx={{
          bgcolor: `${statusColor(todo.status)}18`,
          color: statusColor(todo.status),
          fontSize: "0.65rem",
          height: 20,
          fontWeight: 700,
          textTransform: "capitalize",
          border: `1px solid ${statusColor(todo.status)}30`,
        }}
      />
    </Box>
  );
};

const TaskCard = ({ task }) => {
  const todos = task.todos ?? task.user_subTaks ?? [];
  const doneTodos = todos.filter(
    (t) => t.status === "done" || t.status === "completed",
  ).length;
  const todoProgress = todos.length
    ? Math.round((doneTodos / todos.length) * 100)
    : 0;
  const pc = priorityColor(task.priority);
  const sc = statusColor(task.status);

  return (
    <Accordion
      disableGutters
      sx={{
        background: "rgba(15,23,42,0.4)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: "12px !important",
        mb: 1.5,
        "&:before": { display: "none" },
        overflow: "hidden",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: "#64748b" }} />}
        sx={{ px: 2, py: 1 }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}
        >
          <AssignmentIcon sx={{ color: sc, fontSize: 18 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                color: "#f1f5f9",
                fontWeight: 700,
                fontSize: "0.9rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {task.title}
            </Typography>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.5 }}
            >
              <Chip
                label={task.status?.replace("_", " ") ?? "pending"}
                size="small"
                sx={{
                  bgcolor: `${sc}18`,
                  color: sc,
                  fontSize: "0.65rem",
                  height: 18,
                  fontWeight: 700,
                  border: `1px solid ${sc}30`,
                  textTransform: "capitalize",
                }}
              />
              <Chip
                label={task.priority ?? "Medium"}
                size="small"
                sx={{
                  bgcolor: `${pc}18`,
                  color: pc,
                  fontSize: "0.65rem",
                  height: 18,
                  fontWeight: 700,
                  border: `1px solid ${pc}30`,
                }}
              />
              {task.duedate && (
                <Typography sx={{ color: "#475569", fontSize: "0.72rem" }}>
                  Due: {task.duedate}
                </Typography>
              )}
            </Box>
          </Box>
          {todos.length > 0 && (
            <Box sx={{ textAlign: "right", minWidth: 60 }}>
              <Typography
                sx={{ color: "#4ade80", fontSize: "0.75rem", fontWeight: 700 }}
              >
                {todoProgress}%
              </Typography>
              <Typography sx={{ color: "#475569", fontSize: "0.68rem" }}>
                {doneTodos}/{todos.length} todos
              </Typography>
            </Box>
          )}
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 1, pb: 1.5 }}>
        {todos.length === 0 ? (
          <Typography
            sx={{
              color: "#475569",
              fontSize: "0.82rem",
              textAlign: "center",
              py: 2,
            }}
          >
            No daily todos for this task yet.
          </Typography>
        ) : (
          <>
            {/* todo progress bar */}
            <Box sx={{ px: 2, mb: 1.5 }}>
              <LinearProgress
                variant="determinate"
                value={todoProgress}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.05)",
                  "& .MuiLinearProgress-bar": {
                    background: "linear-gradient(90deg, #4ade80, #22d3ee)",
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.05)", mb: 1 }} />
            {todos.map((todo, idx) => (
              <TodoItem key={todo._id ?? todo.todo_id ?? idx} todo={todo} />
            ))}
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

const EmployeeCard = ({ entry, index }) => {
  const tasks = entry.tasks ?? [];
  const totalTodos = tasks.reduce(
    (sum, t) => sum + (t.todos ?? t.user_subTaks ?? []).length,
    0,
  );
  const doneTodos = tasks.reduce((sum, t) => {
    const td = t.todos ?? t.user_subTaks ?? [];
    return (
      sum +
      td.filter((x) => x.status === "done" || x.status === "completed").length
    );
  }, 0);
  const overallProgress = totalTodos
    ? Math.round((doneTodos / totalTodos) * 100)
    : 0;

  const initials = (entry.employee ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card sx={{ ...glassBg, mb: 3, overflow: "visible" }}>
        <CardContent sx={{ p: 3 }}>
          {/* Employee header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                background: "linear-gradient(135deg, #38bdf8, #818cf8)",
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{ color: "#f1f5f9", fontWeight: 700, fontSize: "1rem" }}
              >
                {entry.employee}
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: "0.8rem" }}>
                {tasks.length} task{tasks.length !== 1 ? "s" : ""} assigned •{" "}
                {totalTodos} todo item{totalTodos !== 1 ? "s" : ""}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography
                sx={{
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #4ade80, #22d3ee)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {overallProgress}%
              </Typography>
              <Typography sx={{ color: "#475569", fontSize: "0.7rem" }}>
                overall
              </Typography>
            </Box>
          </Box>

          {/* Overall progress bar */}
          <LinearProgress
            variant="determinate"
            value={overallProgress}
            sx={{
              height: 5,
              borderRadius: 3,
              mb: 3,
              bgcolor: "rgba(255,255,255,0.05)",
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(90deg, #4ade80, #22d3ee)",
                borderRadius: 3,
                boxShadow: "0 0 10px #4ade8040",
              },
            }}
          />

          {/* Tasks */}
          {tasks.length === 0 ? (
            <Typography
              sx={{
                color: "#475569",
                fontSize: "0.85rem",
                textAlign: "center",
                py: 2,
              }}
            >
              No tasks assigned to this employee yet.
            </Typography>
          ) : (
            tasks.map((task, ti) => (
              <TaskCard key={task.task_id ?? task._id ?? ti} task={task} />
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ─── project list card ───────────────────────────────────────────────────────

const ProjectListCard = ({ project, index, onSelect }) => {
  const progress = getProjectProgress(project);
  const sc =
    {
      Active: "#38bdf8",
      Completed: "#4ade80",
      Critical: "#f43f5e",
      Planning: "#fbbf24",
    }[project.status] ?? "#94a3b8";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      onClick={() => onSelect(project)}
    >
      <Card
        sx={{
          ...glassBg,
          cursor: "pointer",
          transition: "all 0.3s ease",
          "&:hover": {
            borderColor: `${sc}40`,
            boxShadow: `0 20px 40px -15px ${sc}30`,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Avatar
              variant="rounded"
              sx={{
                width: 44,
                height: 44,
                bgcolor: "rgba(15,23,42,0.8)",
                border: `1px solid ${sc}30`,
                color: "#94a3b8",
                borderRadius: 2,
              }}
            >
              <FolderIcon />
            </Avatar>
            <Chip
              label={project.status ?? "Active"}
              size="small"
              sx={{
                bgcolor: `${sc}12`,
                color: sc,
                fontWeight: 700,
                fontSize: "0.65rem",
                textTransform: "uppercase",
                letterSpacing: 1,
                border: `1px solid ${sc}25`,
              }}
            />
          </Box>

          <Typography
            variant="caption"
            sx={{
              color: "#38bdf8",
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              display: "block",
              mb: 0.5,
            }}
          >
            {project._id?.substring(project._id.length - 6).toUpperCase()}
          </Typography>

          <Typography
            sx={{
              color: "#f1f5f9",
              fontWeight: 700,
              fontSize: "1rem",
              mb: 0.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {project.title}
          </Typography>

          <Typography
            sx={{
              color: "#64748b",
              fontSize: "0.8rem",
              mb: 2.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              minHeight: 36,
            }}
          >
            {project.description}
          </Typography>

          {/* Progress */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography sx={{ color: "#94a3b8", fontSize: "0.75rem" }}>
              Completion
            </Typography>
            <Typography
              sx={{ color: sc, fontWeight: 800, fontSize: "0.75rem" }}
            >
              {progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 5,
              borderRadius: 3,
              bgcolor: "rgba(255,255,255,0.05)",
              "& .MuiLinearProgress-bar": {
                background: `linear-gradient(90deg, ${sc}, ${sc}cc)`,
                borderRadius: 3,
              },
            }}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 2.5,
              pt: 2,
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <Typography sx={{ color: "#475569", fontSize: "0.75rem" }}>
              <PersonIcon
                sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }}
              />
              {(project.teamMembers ?? []).length} member
              {(project.teamMembers ?? []).length !== 1 ? "s" : ""}
            </Typography>
            <Typography sx={{ color: "#475569", fontSize: "0.75rem" }}>
              Due: {project.deadline ?? "n/a"}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ─── loading skeleton ─────────────────────────────────────────────────────────

const LoadingSkeleton = ({ count = 3 }) => (
  <Grid container spacing={3}>
    {Array.from({ length: count }).map((_, i) => (
      <Grid item xs={12} sm={6} md={4} key={i}>
        <Card sx={glassBg}>
          <CardContent sx={{ p: 3 }}>
            <Skeleton
              variant="rounded"
              width={44}
              height={44}
              sx={{ bgcolor: "rgba(255,255,255,0.05)", mb: 2 }}
            />
            <Skeleton
              variant="text"
              width="40%"
              sx={{ bgcolor: "rgba(255,255,255,0.05)", mb: 1 }}
            />
            <Skeleton
              variant="text"
              width="80%"
              sx={{ bgcolor: "rgba(255,255,255,0.05)", mb: 0.5 }}
            />
            <Skeleton
              variant="text"
              width="60%"
              sx={{ bgcolor: "rgba(255,255,255,0.05)", mb: 2 }}
            />
            <Skeleton
              variant="rounded"
              height={5}
              sx={{ bgcolor: "rgba(255,255,255,0.05)" }}
            />
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

// ─── main page ────────────────────────────────────────────────────────────────

const HeadProjectOverview = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // --- project list state ---
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- selected project state ---
  const [selectedProject, setSelectedProject] = useState(null);
  const [overviewData, setOverviewData] = useState([]); // [{employee, tasks:[{...todos:[]}]}]
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState(null);

  // fetch project list on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("http://localhost:8080/admin/headProj", {
          headers: { Authorization: token, "Content-Type": "application/json" },
        });
        console.log(res.data);
        setProjects(res.data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setProjectsLoading(false);
      }
    };
    if (token) fetchProjects();
  }, [token]);

  // fetch overview when a project is selected
  const handleSelectProject = async (project) => {
    setSelectedProject(project);
    setOverviewData([]);
    setOverviewError(null);
    setOverviewLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8080/admin/project-overview/${project._id}`,
        {
          headers: { Authorization: token, "Content-Type": "application/json" },
        },
      );

      const rawData = res.data;

      const formattedData = rawData.map(item => {
        const empId = item.emp_datas?._id;
        const empName = item.emp_datas?.name || "Unknown Employee";

        // Filter tasks to only include those assigned to this employee
        const empTasksRaw = (item.employeeTasks || []).filter(t => t.employee === empId);

        // Map tasks and attach subtasks
        const tasks = empTasksRaw.map(taskObj => {
          const actualTask = taskObj.tasks || {};
          const taskId = taskObj._id;

          // Find the subtask grouping for this task
          const subtaskGroup = (item.sub_tasks || []).find(st => st.task_id === taskId);
          const userSubTaks = subtaskGroup ? subtaskGroup.user_subTaks : [];

          return {
            _id: taskId,
            task_id: actualTask.task_id,
            title: actualTask.title,
            priority: actualTask.priority,
            duedate: actualTask.duedate,
            status: actualTask.status,
            user_subTaks: userSubTaks
          };
        });

        return {
          employee: empName,
          tasks: tasks
        };
      });

      setOverviewData(formattedData);
      console.log("Formatted Overview Data:", formattedData);
    } catch (err) {
      console.error("Error fetching overview:", err);
      setOverviewError(
        err.response?.data?.message ?? "Failed to load project overview.",
      );
    } finally {
      setOverviewLoading(false);
    }
  };

  const handleBack = () => {
    if (selectedProject) {
      setSelectedProject(null);
      setOverviewData([]);
      setOverviewError(null);
    } else {
      navigate("/head");
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ── PAGE root ──
  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 2, sm: 3, md: 5 },
        background:
          "radial-gradient(ellipse at top left, #0f172a 0%, #020617 60%)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "fixed",
          top: "-15%",
          left: "-10%",
          width: "50%",
          height: "50%",
          background:
            "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          position: "fixed",
          bottom: "-10%",
          right: "-10%",
          width: "45%",
          height: "45%",
          background:
            "radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        },
      }}
    >
      {/* ── HEADER ── */}
      <Box
        sx={{ mb: selectedProject ? 4 : 6, position: "relative", zIndex: 1 }}
      >
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{
              color: "#64748b",
              mb: 2,
              textTransform: "none",
              fontSize: "0.9rem",
              "&:hover": {
                color: "#f59e0b",
                background: "rgba(245,158,11,0.07)",
              },
            }}
          >
            {selectedProject ? "Back to Projects" : "Back to Dashboard"}
          </Button>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "2rem", md: "2.8rem" },
                  background:
                    "linear-gradient(135deg, #f59e0b, #fbbf24, #f97316)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  mb: 0.5,
                }}
              >
                {selectedProject ? selectedProject.title : "Project Overview"}
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: "0.9rem" }}>
                {selectedProject
                  ? `Viewing employee progress & daily todos`
                  : "Select a project to monitor its team progress"}
              </Typography>
            </Box>

            {/* Stats pill when a project is selected */}
            {selectedProject && !overviewLoading && (
              <Box
                sx={{
                  ml: "auto",
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Box
                  sx={{
                    ...glassBg,
                    px: 2.5,
                    py: 1.2,
                    borderRadius: 3,
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{
                      color: "#f59e0b",
                      fontWeight: 800,
                      fontSize: "1.3rem",
                    }}
                  >
                    {overviewData.length}
                  </Typography>
                  <Typography sx={{ color: "#64748b", fontSize: "0.72rem" }}>
                    Employees
                  </Typography>
                </Box>
                <Box
                  sx={{
                    ...glassBg,
                    px: 2.5,
                    py: 1.2,
                    borderRadius: 3,
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{
                      color: "#38bdf8",
                      fontWeight: 800,
                      fontSize: "1.3rem",
                    }}
                  >
                    {overviewData.reduce(
                      (s, e) => s + (e.tasks?.length ?? 0),
                      0,
                    )}
                  </Typography>
                  <Typography sx={{ color: "#64748b", fontSize: "0.72rem" }}>
                    Tasks
                  </Typography>
                </Box>
                <Box
                  sx={{
                    ...glassBg,
                    px: 2.5,
                    py: 1.2,
                    borderRadius: 3,
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{
                      color: "#4ade80",
                      fontWeight: 800,
                      fontSize: "1.3rem",
                    }}
                  >
                    {getProjectProgress(selectedProject)}%
                  </Typography>
                  <Typography sx={{ color: "#64748b", fontSize: "0.72rem" }}>
                    Progress
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </motion.div>
      </Box>

      {/* ── VIEW: PROJECT LIST ── */}
      <AnimatePresence mode="wait">
        {!selectedProject && (
          <motion.div
            key="project-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -30 }}
          >
            {/* Search */}
            <Box sx={{ mb: 4, maxWidth: 400 }}>
              <TextField
                placeholder="Search projects..."
                variant="outlined"
                size="small"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#f59e0b", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#f1f5f9",
                    bgcolor: "rgba(15,23,42,0.5)",
                    backdropFilter: "blur(12px)",
                    borderRadius: 2,
                    "& fieldset": {
                      border: "1px solid rgba(255,255,255,0.08)",
                    },
                    "&:hover fieldset": { borderColor: "rgba(245,158,11,0.4)" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#f59e0b",
                      boxShadow: "0 0 20px rgba(245,158,11,0.1)",
                    },
                  },
                }}
              />
            </Box>

            {projectsLoading ? (
              <LoadingSkeleton count={3} />
            ) : filteredProjects.length === 0 ? (
              <Box sx={{ textAlign: "center", mt: 10 }}>
                <FolderIcon sx={{ fontSize: 60, color: "#1e293b", mb: 2 }} />
                <Typography sx={{ color: "#475569", fontSize: "1rem" }}>
                  No projects found.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredProjects.map((project, i) => (
                  <Grid item xs={12} sm={6} md={4} key={project._id}>
                    <ProjectListCard
                      project={project}
                      index={i}
                      onSelect={handleSelectProject}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </motion.div>
        )}

        {/* ── VIEW: PROJECT DETAIL (employees + tasks + todos) ── */}
        {selectedProject && (
          <motion.div
            key="project-detail"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
          >
            {/* Project meta bar */}
            <Box
              sx={{
                ...glassBg,
                p: 2.5,
                mb: 4,
                display: "flex",
                alignItems: "center",
                gap: 3,
                flexWrap: "wrap",
              }}
            >
              <Chip
                label={selectedProject.priority ?? "Medium"}
                size="small"
                sx={{
                  bgcolor: `${priorityColor(selectedProject.priority)}18`,
                  color: priorityColor(selectedProject.priority),
                  fontWeight: 700,
                  border: `1px solid ${priorityColor(selectedProject.priority)}30`,
                }}
              />
              <Typography sx={{ color: "#94a3b8", fontSize: "0.82rem" }}>
                Deadline:{" "}
                <Box
                  component="span"
                  sx={{ color: "#f1f5f9", fontWeight: 600 }}
                >
                  {selectedProject.deadline ?? "Not set"}
                </Box>
              </Typography>
              <Typography sx={{ color: "#94a3b8", fontSize: "0.82rem" }}>
                Team:{" "}
                <Box
                  component="span"
                  sx={{ color: "#f1f5f9", fontWeight: 600 }}
                >
                  {(selectedProject.teamMembers ?? []).length} members
                </Box>
              </Typography>
            </Box>

            {/* Loading */}
            {overviewLoading && (
              <Box sx={{ mt: 4 }}>
                {[1, 2].map((i) => (
                  <Card key={i} sx={{ ...glassBg, mb: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <Skeleton
                          variant="circular"
                          width={48}
                          height={48}
                          sx={{ bgcolor: "rgba(255,255,255,0.05)" }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton
                            variant="text"
                            width="30%"
                            sx={{ bgcolor: "rgba(255,255,255,0.05)" }}
                          />
                          <Skeleton
                            variant="text"
                            width="50%"
                            sx={{ bgcolor: "rgba(255,255,255,0.05)" }}
                          />
                        </Box>
                      </Box>
                      <Skeleton
                        variant="rounded"
                        height={5}
                        sx={{ bgcolor: "rgba(255,255,255,0.05)", mb: 2 }}
                      />
                      <Skeleton
                        variant="rounded"
                        height={64}
                        sx={{ bgcolor: "rgba(255,255,255,0.05)" }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            {/* Error */}
            {overviewError && !overviewLoading && (
              <Box
                sx={{
                  ...glassBg,
                  p: 4,
                  textAlign: "center",
                  borderColor: "rgba(244,63,94,0.2)",
                }}
              >
                <Typography sx={{ color: "#f43f5e", fontWeight: 600 }}>
                  {overviewError}
                </Typography>
              </Box>
            )}

            {/* Empty state */}
            {!overviewLoading &&
              !overviewError &&
              overviewData.length === 0 && (
                <Box sx={{ textAlign: "center", mt: 8 }}>
                  <TaskAltIcon sx={{ fontSize: 60, color: "#1e293b", mb: 2 }} />
                  <Typography
                    sx={{ color: "#475569", fontSize: "1rem", mb: 1 }}
                  >
                    No employee task data found for this project yet.
                  </Typography>
                  <Typography sx={{ color: "#334155", fontSize: "0.85rem" }}>
                    Assign tasks to team members from the "View Projects" page.
                  </Typography>
                </Box>
              )}

            {/* Employee cards */}
            {!overviewLoading &&
              !overviewError &&
              overviewData.map((entry, i) => (
                <EmployeeCard
                  key={entry.employee ?? i}
                  entry={entry}
                  index={i}
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default HeadProjectOverview;
