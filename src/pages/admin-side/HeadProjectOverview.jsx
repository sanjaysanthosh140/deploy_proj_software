
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
  alpha,
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

// --- iOS Liquid Glass Design Constants ---
const PRIMARY_BG = "#e6edf5";
const SECONDARY_BG = "#d9e3ef";
const TERTIARY_BG = "#cfd8e5";

const glassEffect = {
  background: "#ffffff",
  border: "1px solid rgba(0, 0, 0, 0.06)",
  borderRadius: "20px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)",
  transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  position: "relative",
  overflow: "hidden",
};

const iPhoneGlassButton = {
  background: "rgba(255, 255, 255, 0.25)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.4)",
  borderRadius: "16px",
  color: "rgba(0, 0, 0, 0.8)",
  fontWeight: 900,
  textTransform: "none",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s ease",
  "& .MuiButton-startIcon svg": { fontSize: 22 },
  "&:hover": {
    background: "rgba(255, 255, 255, 0.4)",
    transform: "translateY(-2px)",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.6)",
  }
};

// More opaque glass background for error messages
const glassBg = {
  ...glassEffect,
  background: "rgba(255, 255, 255, 0.5)",
};

const GlassCard = ({ children, sx = {}, hoverEffect = true }) => (
  <Card
    component={motion.div}
    {...(hoverEffect ? {
      whileHover: {
        translateY: -5,
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.08)",
        background: "#ffffff",
        borderColor: "rgba(0, 0, 0, 0.12)",
      }
    } : {})}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 150, damping: 20 }}
    sx={{
      ...glassEffect,
      p: 0,
      m: 0,
      ...sx,
    }}
  >
    {children}
  </Card>
);

// ─── sub-components ──────────────────────────────────────────────────────────

const TodoItem = ({ todo }) => {
  const checked = todo.status === "completed";
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        py: 1.5,
        px: 2,
        borderRadius: "12px",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": { background: "rgba(15, 23, 42, 0.04)" },
      }}
    >
      <Box sx={{ mt: 0.3 }}>
        {checked ? (
          <CheckCircleIcon sx={{ color: "#4ade80", fontSize: 20 }} />
        ) : (
          <RadioButtonUncheckedIcon
            sx={{ color: alpha("#475569", 0.4), fontSize: 20 }}
          />
        )}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography
          sx={{
            color: checked ? "#94a3b8" : "#1e293b",
            fontSize: "0.88rem",
            fontWeight: checked ? 500 : 700,
            textDecoration: checked ? "line-through" : "none",
            lineHeight: 1.5,
          }}
        >
          {todo.title}
        </Typography>
        {todo.createdAt && (
          <Typography sx={{ color: "#64748b", fontSize: "0.76rem", mt: 0.5, fontWeight: 600 }}>
            Detected: {todo.createdAt}
          </Typography>
        )}
      </Box>
      <Chip
        label={todo.status ?? "pending"}
        size="small"
        sx={{
          bgcolor: alpha(statusColor(todo.status), 0.1),
          color: statusColor(todo.status),
          fontSize: "0.7rem",
          height: 20,
          fontWeight: 900,
          textTransform: "uppercase",
          border: `1px solid ${alpha(statusColor(todo.status), 0.2)}`,
          borderRadius: "6px"
        }}
      />
    </Box>
  );
};

const TaskCard = ({ task }) => {
  const todos = task.user_subTaks ?? [];
  const doneTodos = todos.filter(
    (t) => t.status === "completed",
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
        background: "rgba(0, 0, 0, 0.03)",
        border: "1px solid rgba(0,0,0,0.04)",
        borderRadius: "16px !important",
        mb: 2,
        "&:before": { display: "none" },
        overflow: "hidden",
        boxShadow: "none",
        transition: "all 0.3s ease",
        "&:hover": {
          background: "rgba(0, 0, 0, 0.05)",
          borderColor: "rgba(0, 0, 0, 0.08)",
        }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: "#475569" }} />}
        sx={{ px: 2.5, py: 1 }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}
        >
          <AssignmentIcon sx={{ color: sc, fontSize: 20 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                color: "#0f172a",
                fontWeight: 800,
                fontSize: "0.95rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                letterSpacing: "-0.01em"
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
                  bgcolor: alpha(sc, 0.1),
                  color: sc,
                  fontSize: "0.75rem",
                  height: 20,
                  fontWeight: 900,
                  textTransform: "uppercase",
                }}
              />
              <Chip
                label={task.priority ?? "Medium"}
                size="small"
                sx={{
                  bgcolor: alpha(pc, 0.1),
                  color: pc,
                  fontSize: "0.75rem",
                  height: 20,
                  fontWeight: 900,
                  textTransform: "uppercase"
                }}
              />
              {task.duedate && (
                <Typography sx={{ color: "#64748b", fontSize: "0.8rem", fontWeight: 600 }}>
                  Due: {task.duedate}
                </Typography>
              )}
            </Box>
          </Box>
          {todos.length > 0 && (
            <Box sx={{ textAlign: "right", minWidth: 60 }}>
              <Typography
                sx={{ color: "#0f172a", fontSize: "0.85rem", fontWeight: 900 }}
              >
                {todoProgress}%
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 700 }}>
                {doneTodos}/{todos.length} items
              </Typography>
            </Box>
          )}
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 2, pb: 2 }}>
        {todos.length === 0 ? (
          <Typography
            sx={{
              color: "#64748b",
              fontSize: "0.85rem",
              textAlign: "center",
              py: 2,
              fontWeight: 500,
              fontStyle: "italic"
            }}
          >
            No active directives for this task.
          </Typography>
        ) : (
          <Box
            sx={{
              overflowY: "auto",
              maxHeight: { xs: "250px", md: "350px" },
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.5)",
              p: 1,
              pr: 1.5,
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-track": { background: "rgba(0,0,0,0.03)", borderRadius: "10px" },
              "&::-webkit-scrollbar-thumb": { background: "rgba(0,0,0,0.15)", borderRadius: "10px" },
            }}
          >
            <Box sx={{ px: 1.5, mb: 1.5, mt: 0.5 }}>
              <LinearProgress
                variant="determinate"
                value={todoProgress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: "rgba(0, 0, 0, 0.05)",
                  "& .MuiLinearProgress-bar": {
                    background: "linear-gradient(90deg, #00d4ff, #0072ff)",
                    borderRadius: 3,
                    boxShadow: "0 0 10px rgba(0, 212, 255, 0.3)",
                  },
                }}
              />
            </Box>
            <Divider sx={{ borderColor: "rgba(15, 23, 42, 0.05)", mb: 1 }} />
            {todos.map((todo, idx) => (
              <TodoItem key={todo.todo_id ?? idx} todo={todo} />
            ))}
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

const EmployeeCard = ({ entry, index }) => {
  const tasks = entry.tasks ?? [];
  const totalTodos = tasks.reduce(
    (sum, t) => sum + (t.user_subTaks ?? []).length,
    0,
  );
  const doneTodos = tasks.reduce((sum, t) => {
    const td = t.user_subTaks ?? [];
    return (
      sum +
      td.filter((x) => x.status === "completed").length
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
    <GlassCard sx={{ p: 0, mb: 4 }} hoverEffect={false}>
      <Box sx={{ p: 4 }}>
        {/* Employee header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 4 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
              fontWeight: 900,
              fontSize: "1.1rem",
              boxShadow: "0 8px 16px rgba(10, 15, 25, 0.1)"
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{ color: "#0f172a", fontWeight: 900, fontSize: "1.2rem", mb: 0.5 }}
            >
              {entry.employee}
            </Typography>
            <Typography sx={{ color: "#64748b", fontSize: "0.9rem", fontWeight: 700 }}>
              {tasks.length} Operational Tasks •{" "}
              <Box component="span" sx={{ color: "#0f172a" }}>{totalTodos} Directives</Box>
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography
              sx={{
                fontSize: "1.8rem",
                fontWeight: 900,
                background: "linear-gradient(135deg, #0f172a 0%, #38bdf8 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1
              }}
            >
              {overallProgress}%
            </Typography>
            <Typography sx={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase" }}>
              Capacity
            </Typography>
          </Box>
        </Box>

        {/* Overall progress bar */}
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5, alignItems: "center" }}>
            <Typography sx={{ color: "rgba(0,0,0,0.4)", fontSize: "0.85rem", fontWeight: 800 }}>
              Tactical Saturation
            </Typography>
            <Typography sx={{ color: "rgba(0,0,0,0.8)", fontSize: "0.85rem", fontWeight: 1000 }}>
              {doneTodos} / {totalTodos} Integrated
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={overallProgress}
            sx={{
              height: 10,
              borderRadius: 5,
              bgcolor: "rgba(0, 0, 0, 0.05)",
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(90deg, #38bdf8, #0072ff)",
                borderRadius: 5,
                boxShadow: "0 0 20px rgba(56, 189, 248, 0.4)",
              },
            }}
          />
        </Box>

        {/* Tasks Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography sx={{ color: "#0f172a", fontSize: "0.9rem", fontWeight: 900, mb: 2, textTransform: "uppercase", letterSpacing: 1 }}>
            Assigned Intelligence
          </Typography>

          <Box
            sx={{
              maxHeight: { xs: "350px", md: "500px" },
              overflowY: "auto",
              pr: 1.5,
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-track": { background: "rgba(0,0,0,0.03)", borderRadius: "10px" },
              "&::-webkit-scrollbar-thumb": { background: "rgba(0,0,0,0.15)", borderRadius: "10px" },
            }}
          >
            {tasks.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center", background: "rgba(15, 23, 42, 0.02)", borderRadius: "16px" }}>
                <Typography sx={{ color: "#64748b", fontSize: "0.9rem", fontWeight: 600, fontStyle: "italic" }}>
                  No active task streams detected for this specialist.
                </Typography>
              </Box>
            ) : (
              tasks.map((task, ti) => (
                <TaskCard key={task.task_id ?? task._id ?? ti} task={task} />
              ))
            )}
          </Box>
        </Box>
      </Box>
    </GlassCard>
  );
};

// ─── project list card ───────────────────────────────────────────────────────

const ProjectListCard = ({ project, index, onSelect }) => {
  const progress = getProjectProgress(project);
  const sc =
    {
      Active: "#00d4ff",
      Completed: "#4ade80",
      Critical: "#ff4d4f",
      Planning: "#f59e0b",
    }[project.status] ?? "#94a3b8";

  return (
    <GlassCard
      sx={{ p: 0, cursor: "pointer" }}
      onSelect={() => onSelect(project)}
    >
      <Box sx={{ p: 4 }} onClick={() => onSelect(project)}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: "18px",
              background: "rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: sc,
              border: "1px solid rgba(255, 255, 255, 0.6)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <FolderIcon sx={{ fontSize: 30 }} />
          </Box>
          <Chip
            label={project.status ?? "Active"}
            size="small"
            sx={{
              bgcolor: `${sc}15`,
              color: sc,
              fontWeight: 900,
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: 1,
              borderRadius: "8px",
            }}
          />
        </Box>

        <Typography
          variant="caption"
          sx={{
            color: "rgba(0,0,0,0.35)",
            fontWeight: 800,
            letterSpacing: 2,
            textTransform: "uppercase",
            display: "block",
            mb: 1.5,
            fontSize: "0.75rem"
          }}
        >
          REF: {project._id?.substring(project._id.length - 6).toUpperCase()}
        </Typography>

        <Typography
          sx={{
            color: "rgba(0,0,0,0.85)",
            fontWeight: 1000,
            fontSize: "1.35rem",
            mb: 1.5,
            lineHeight: 1.1,
            letterSpacing: "-0.8px"
          }}
        >
          {project.title}
        </Typography>

        <Typography
          sx={{
            color: "rgba(0,0,0,0.45)",
            fontSize: "0.95rem",
            mb: 4,
            lineHeight: 1.6,
            minHeight: 48,
            fontWeight: 600,
          }}
        >
          {project.description?.length > 85 ? `${project.description.substring(0, 85)}...` : project.description}
        </Typography>

        {/* Progress Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, alignItems: "center" }}>
            <Typography sx={{ color: "rgba(0,0,0,0.4)", fontSize: "0.85rem", fontWeight: 800 }}>
              Deployment
            </Typography>
            <Typography sx={{ color: sc, fontWeight: 1000, fontSize: "1rem" }}>
              {progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "rgba(0, 0, 0, 0.05)",
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(90deg, #00d4ff, #0072ff)",
                borderRadius: 4,
                boxShadow: `0 0 15px ${alpha("#00d4ff", 0.3)}`,
              },
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 3,
            borderTop: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                background: "rgba(0,0,0,0.05)",
                color: "rgba(0,0,0,0.4)",
                fontSize: "0.8rem",
                fontWeight: 800
              }}
            >
              <PersonIcon sx={{ fontSize: 16 }} />
            </Avatar>
            <Typography sx={{ color: "rgba(0,0,0,0.45)", fontSize: "0.85rem", fontWeight: 700 }}>
              {(project.teamMembers ?? []).length} Units
            </Typography>
          </Box>
          <Typography sx={{ color: "rgba(0,0,0,0.45)", fontSize: "0.85rem", fontWeight: 700 }}>
            {project.deadline ?? "TBD"}
          </Typography>
        </Box>
      </Box>
    </GlassCard>
  );
};

// ─── loading skeleton ─────────────────────────────────────────────────────────

const LoadingSkeleton = ({ count = 3 }) => (
  <Grid container spacing={3}>
    {Array.from({ length: count }).map((_, i) => (
      <Grid item xs={12} sm={6} md={4} key={i}>
        <GlassCard sx={{ p: 4 }}>
          <Skeleton
            variant="rounded"
            width={54}
            height={54}
            sx={{ bgcolor: "rgba(0, 0, 0, 0.05)", borderRadius: "18px", mb: 2 }}
          />
          <Skeleton
            variant="text"
            width="40%"
            sx={{ bgcolor: "rgba(0, 0, 0, 0.03)", mb: 1, height: 20 }}
          />
          <Skeleton
            variant="text"
            width="80%"
            sx={{ bgcolor: "rgba(0, 0, 0, 0.05)", mb: 0.5, height: 32 }}
          />
          <Skeleton
            variant="text"
            width="60%"
            sx={{ bgcolor: "rgba(0, 0, 0, 0.03)", mb: 3 }}
          />
          <Skeleton
            variant="rounded"
            height={8}
            sx={{ bgcolor: "rgba(0, 0, 0, 0.05)", borderRadius: 4 }}
          />
        </GlassCard>
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
      console.log("Raw Backend Data:", rawData);

      const employeeMap = new Map(); // empId -> { name, taskMap: Map(taskId -> task) }

      // Pass 1: Build Employee and Task Structure
      rawData.forEach((item) => {
        const empId = item.emp_datas?._id ? String(item.emp_datas._id) : null;
        const empName = item.emp_datas?.name;

        if (empId) {
          if (!employeeMap.has(empId)) {
            employeeMap.set(empId, { name: empName || "Unknown Employee", taskMap: new Map() });
          } else if (empName && employeeMap.get(empId).name === "Unknown Employee") {
            // Update name if we previously set it to "Unknown Employee" but now found a real name
            employeeMap.get(empId).name = empName;
          }
        }

        const taskSource = Array.isArray(item.employeeTasks)
          ? item.employeeTasks
          : Array.isArray(item.tasks)
            ? item.tasks.map(t => ({ tasks: t, employee: empId }))
            : [];

        taskSource.forEach((et) => {
          const taskObj = et.tasks || et;
          if (!taskObj || typeof taskObj !== "object") return;

          const currentEmpId = et.employee ? String(et.employee._id || et.employee) : empId;
          const currentEmpName = et.employee?.name || (currentEmpId === empId ? empName : null);

          if (!currentEmpId) return;

          if (!employeeMap.has(currentEmpId)) {
            employeeMap.set(currentEmpId, { name: currentEmpName || "Unknown Employee", taskMap: new Map() });
          } else if (currentEmpName && employeeMap.get(currentEmpId).name === "Unknown Employee") {
            employeeMap.get(currentEmpId).name = currentEmpName;
          }

          const taskId = String(taskObj.task_id || taskObj._id);
          const empRecord = employeeMap.get(currentEmpId);

          if (!empRecord.taskMap.has(taskId)) {
            empRecord.taskMap.set(taskId, {
              ...taskObj,
              task_id: taskId,
              user_subTaks: [],
              subTaskMap: new Map()
            });
          }
        });
      });

      // Pass 2: Link Subtasks Globably using user_id and task_id
      rawData.forEach((item) => {
        const subTasksContainer = Array.isArray(item.sub_tasks)
          ? item.sub_tasks
          : item.sub_tasks ? [item.sub_tasks] : [];

        subTasksContainer.forEach((st) => {
          if (!st) return;
          const stUserId = st.user_id ? String(st.user_id) : null;
          const stTaskId = st.task_id?._id ? String(st.task_id._id) : String(st.task_id);

          if (stUserId && employeeMap.has(stUserId)) {
            const empRecord = employeeMap.get(stUserId);
            const taskToUpdate = empRecord.taskMap.get(stTaskId);

            if (taskToUpdate && Array.isArray(st.user_subTaks)) {
              st.user_subTaks.forEach((todo) => {
                if (!todo || !todo.todo_id) return;
                taskToUpdate.subTaskMap.set(todo.todo_id, {
                  todo_id: todo.todo_id,
                  title: todo.title,
                  status: todo.status || "pending",
                  createdAt: todo.createdAt,
                });
              });
            }
          }
        });
      });

      // Convert to UI format
      const formattedData = Array.from(employeeMap.values()).map(emp => ({
        employee: emp.name,
        tasks: Array.from(emp.taskMap.values()).map(task => {
          const { subTaskMap, ...taskData } = task;
          return {
            ...taskData,
            user_subTaks: Array.from(subTaskMap.values())
          };
        })
      }))
        .filter(emp => emp.tasks.length > 0); // Only show employees with tasks

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
        height: "100vh",
        width: "100vw",
        background: `linear-gradient(135deg, ${PRIMARY_BG} 0%, ${SECONDARY_BG} 50%, ${TERTIARY_BG} 100%)`,
        position: "fixed",
        top: 0,
        left: 0,
        overflowX: "hidden",
        overflowY: "auto",
        color: "rgba(0,0,0,0.85)",
        zIndex: 1,
      }}
    >
      {/* Background Mesh Blobs */}
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{
            position: "absolute",
            top: "-15%",
            left: "-10%",
            width: "50vw",
            height: "50vw",
            maxWidth: "800px",
            maxHeight: "800px",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          style={{
            position: "absolute",
            bottom: "-15%",
            right: "-10%",
            width: "50vw",
            height: "50vw",
            maxWidth: "800px",
            maxHeight: "800px",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)",
            filter: "blur(120px)",
          }}
        />
      </Box>
      {/* ── HEADER ── */}
      <Box
        sx={{ mb: selectedProject ? 4 : 6, position: "relative", zIndex: 1, p: { xs: 2, sm: 3, md: 5 } }}
      >
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ ...iPhoneGlassButton, mb: 3, px: 2, py: 1 }}
          >
            {selectedProject ? "Back to Projects" : "Back to Dashboard"}
          </Button>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "1.8rem", sm: "2.4rem", md: "2.8rem" },
                  background: "linear-gradient(135deg, #0f172a 0%, #475569 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  mb: 1,
                }}
              >
                {selectedProject ? selectedProject.title : "Project Intelligence"}
              </Typography>
              <Typography sx={{ color: "#64748b", fontWeight: 500, fontSize: "1rem", letterSpacing: 0.2 }}>
                {selectedProject
                  ? `Strategic employee progression and tactical daily insights`
                  : "Select a high-value enterprise project to monitor operational efficiency"}
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
                {[
                  { label: "Specialists", value: overviewData.length, color: "#f59e0b" },
                  { label: "Directives", value: overviewData.reduce((s, e) => s + (e.tasks?.length ?? 0), 0), color: "#38bdf8" },
                  { label: "Efficiency", value: `${getProjectProgress(selectedProject)}%`, color: "#4ade80" },
                ].map((stat, i) => (
                  <Box
                    key={i}
                    sx={{
                      ...glassEffect,
                      px: 3,
                      py: 1.5,
                      borderRadius: "18px",
                      textAlign: "center",
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.35)",
                        transform: "translateY(-4px)",
                      }
                    }}
                  >
                    <Typography
                      sx={{
                        color: stat.color,
                        fontWeight: 1000,
                        fontSize: "1.5rem",
                        lineHeight: 1.2
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography sx={{ color: "rgba(0,0,0,0.4)", fontSize: "0.7rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
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
            style={{ padding: "0 var(--px)" }}
          >
            {/* Search */}
            <Box sx={{ mb: 6, maxWidth: 500, position: "relative", zIndex: 1, px: { xs: 2, sm: 3, md: 5 } }}>
              <TextField
                placeholder="Search Intelligence Protocols..."
                variant="outlined"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "rgba(0,0,0,0.4)", fontSize: 24, ml: 1 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    ...glassEffect,
                    borderRadius: "20px",
                    fontWeight: 800,
                    color: "rgba(0,0,0,0.9)",
                    px: 1,
                    py: 0.5,
                    "& input": { color: "rgba(0,0,0,0.9)" },
                    "& fieldset": { border: "none" },
                    "&:hover": { background: "rgba(255,255,255,0.35)" },
                    "&.Mui-focused": { background: "rgba(255,255,255,0.4)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" },
                  },
                }}
              />
            </Box>

            {projectsLoading ? (
              <LoadingSkeleton count={3} />
            ) : filteredProjects.length === 0 ? (
              <Box sx={{ textAlign: "center", mt: 10 }}>
                <FolderIcon sx={{ fontSize: 60, color: alpha("#0f172a", 0.1), mb: 2 }} />
                <Typography sx={{ color: "#64748b", fontWeight: 700, fontSize: "1rem" }}>
                  No active intelligence archives detected.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ px: { xs: 2, sm: 3, md: 5 } }}>
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
              </Box>
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
            style={{ padding: "0 var(--px)" }}
          >
            {/* Project meta bar */}
            <Box
              sx={{
                ...glassEffect,
                background: "rgba(255, 255, 255, 0.4)",
                p: 2,
                px: { xs: 2, sm: 3, md: 5 },
                mb: 4,
                display: "flex",
                alignItems: "center",
                gap: 4,
                flexWrap: "wrap",
                position: "relative",
                zIndex: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography sx={{ color: "rgba(0,0,0,0.4)", fontSize: "0.85rem", fontWeight: 700 }}>
                  Priority Level:
                </Typography>
                <Chip
                  label={selectedProject.priority ?? "Medium"}
                  size="small"
                  sx={{
                    bgcolor: `${priorityColor(selectedProject.priority)}15`,
                    color: priorityColor(selectedProject.priority),
                    fontWeight: 900,
                    borderRadius: "8px",
                    textTransform: "uppercase",
                    fontSize: "0.7rem"
                  }}
                />
              </Box>
              <Box sx={{ height: "20px", width: "1px", bgcolor: "rgba(0,0,0,0.05)", display: { xs: "none", md: "block" } }} />
              <Typography sx={{ color: "rgba(0,0,0,0.4)", fontSize: "0.85rem", fontWeight: 700 }}>
                Deadline:{" "}
                <Box
                  component="span"
                  sx={{ color: "rgba(0,0,0,0.7)", fontWeight: 900 }}
                >
                  {selectedProject.deadline ?? "Pending Clearance"}
                </Box>
              </Typography>
              <Box sx={{ height: "20px", width: "1px", bgcolor: "rgba(0,0,0,0.05)", display: { xs: "none", md: "block" } }} />
              <Typography sx={{ color: "rgba(0,0,0,0.4)", fontSize: "0.85rem", fontWeight: 700 }}>
                Active Unit:{" "}
                <Box
                  component="span"
                  sx={{ color: "rgba(0,0,0,0.7)", fontWeight: 900 }}
                >
                  {(selectedProject.teamMembers ?? []).length} Specialists
                </Box>
              </Typography>
            </Box>

            {/* Loading */}
            {overviewLoading && (
              <Box sx={{ mt: 4, px: { xs: 2, sm: 3, md: 5 } }}>
                {[1, 2].map((i) => (
                  <GlassCard key={i} sx={{ p: 4, mb: 4 }} hoverEffect={false}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        mb: 3,
                      }}
                    >
                      <Skeleton
                        variant="circular"
                        width={56}
                        height={56}
                        sx={{ bgcolor: "rgba(15, 23, 42, 0.05)" }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton
                          variant="text"
                          width="30%"
                          sx={{ bgcolor: "rgba(15, 23, 42, 0.05)", height: 24 }}
                        />
                        <Skeleton
                          variant="text"
                          width="50%"
                          sx={{ bgcolor: "rgba(15, 23, 42, 0.03)", height: 18 }}
                        />
                      </Box>
                    </Box>
                    <Skeleton
                      variant="rounded"
                      height={8}
                      sx={{ bgcolor: "rgba(15, 23, 42, 0.05)", borderRadius: 4, mb: 4 }}
                    />
                    <Skeleton
                      variant="rounded"
                      height={80}
                      sx={{ bgcolor: "rgba(15, 23, 42, 0.02)", borderRadius: "16px" }}
                    />
                  </GlassCard>
                ))}
              </Box>
            )}

            {/* Error */}
            {overviewError && !overviewLoading && (
              <Box
                sx={{
                  ...glassBg,
                  p: 4,
                  mx: { xs: 2, sm: 3, md: 5 },
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
                <Box sx={{ textAlign: "center", mt: 8, px: { xs: 2, sm: 3, md: 5 } }}>
                  <TaskAltIcon sx={{ fontSize: 60, color: alpha("#0f172a", 0.1), mb: 2 }} />
                  <Typography
                    sx={{ color: "#0f172a", fontSize: "1.1rem", fontWeight: 800, mb: 1 }}
                  >
                    Zero intelligence stream throughput.
                  </Typography>
                  <Typography sx={{ color: "#64748b", fontSize: "0.9rem", fontWeight: 600 }}>
                    Delegate operational tasks to specialists from the master control console.
                  </Typography>
                </Box>
              )}

            {/* Employee cards */}
            {!overviewLoading &&
              !overviewError &&
              (
                <Box sx={{ px: { xs: 2, sm: 3, md: 5 } }}>
                  {overviewData.map((entry, i) => (
                    <EmployeeCard
                      key={entry.employee ?? i}
                      entry={entry}
                      index={i}
                    />
                  ))}
                </Box>
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default HeadProjectOverview;