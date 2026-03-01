/**
 * AntyGravity Instruction:
 * Apply rules from /docs/component_analysis_prompt.md
 */

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
          <Typography sx={{ color: "#64748b", fontSize: "0.72rem", mt: 0.5, fontWeight: 600 }}>
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
          fontSize: "0.65rem",
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
        background: "rgba(15, 23, 42, 0.03)",
        border: `1px solid ${GLASS_BORDER}`,
        borderRadius: "16px !important",
        mb: 2,
        "&:before": { display: "none" },
        overflow: "hidden",
        boxShadow: "none",
        transition: "all 0.3s ease",
        "&:hover": {
          background: "rgba(15, 23, 42, 0.05)",
          borderColor: "rgba(15, 23, 42, 0.15)",
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
                  fontSize: "0.65rem",
                  height: 18,
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
                  fontSize: "0.65rem",
                  height: 18,
                  fontWeight: 900,
                  textTransform: "uppercase"
                }}
              />
              {task.duedate && (
                <Typography sx={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600 }}>
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
              <Typography sx={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700 }}>
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
          <Box sx={{ overflow: "hidden", borderRadius: "12px", background: "rgba(255, 255, 255, 0.5)", p: 1 }}>
            <Box sx={{ px: 1.5, mb: 1.5, mt: 0.5 }}>
              <LinearProgress
                variant="determinate"
                value={todoProgress}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  bgcolor: "rgba(15, 23, 42, 0.05)",
                  "& .MuiLinearProgress-bar": {
                    background: "linear-gradient(90deg, #4ade80, #38bdf8)",
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
            <Divider sx={{ borderColor: "rgba(15, 23, 42, 0.05)", mb: 1 }} />
            {todos.map((todo, idx) => (
              <TodoItem key={todo._id ?? todo.todo_id ?? idx} todo={todo} />
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
            <Typography sx={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 700 }}>
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
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, alignItems: "center" }}>
            <Typography sx={{ color: "#475569", fontSize: "0.85rem", fontWeight: 800 }}>
              Workflow Saturation
            </Typography>
            <Typography sx={{ color: "#0f172a", fontSize: "0.85rem", fontWeight: 900 }}>
              {doneTodos} / {totalTodos} Complete
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={overallProgress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "rgba(15, 23, 42, 0.05)",
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(90deg, #38bdf8, #818cf8)",
                borderRadius: 4,
                boxShadow: "0 0 15px rgba(56, 189, 248, 0.3)",
              },
            }}
          />
        </Box>

        {/* Tasks Section */}
        <Box>
          <Typography sx={{ color: "#0f172a", fontSize: "0.9rem", fontWeight: 900, mb: 2, textTransform: "uppercase", letterSpacing: 1 }}>
            Assigned Intelligence
          </Typography>
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
    </GlassCard>
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
      Planning: "#f59e0b",
    }[project.status] ?? "#64748b";

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
              width: 50,
              height: 50,
              borderRadius: "16px",
              background: "rgba(15, 23, 42, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: sc,
              border: `1px solid ${alpha(sc, 0.2)}`,
            }}
          >
            <FolderIcon sx={{ fontSize: 28 }} />
          </Box>
          <Chip
            label={project.status ?? "Active"}
            size="small"
            sx={{
              bgcolor: alpha(sc, 0.1),
              color: sc,
              fontWeight: 800,
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: 1,
              borderRadius: "8px",
            }}
          />
        </Box>

        <Typography
          variant="caption"
          sx={{
            color: "#64748b",
            fontWeight: 800,
            letterSpacing: 2,
            textTransform: "uppercase",
            display: "block",
            mb: 1,
            fontSize: "0.65rem"
          }}
        >
          REF: {project._id?.substring(project._id.length - 6).toUpperCase()}
        </Typography>

        <Typography
          sx={{
            color: "#0f172a",
            fontWeight: 900,
            fontSize: "1.25rem",
            mb: 1,
            lineHeight: 1.2,
            letterSpacing: "-0.02em"
          }}
        >
          {project.title}
        </Typography>

        <Typography
          sx={{
            color: "#64748b",
            fontSize: "0.9rem",
            mb: 4,
            lineHeight: 1.6,
            minHeight: 44,
          }}
        >
          {project.description?.length > 80 ? `${project.description.substring(0, 80)}...` : project.description}
        </Typography>

        {/* Progress Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5, alignItems: "center" }}>
            <Typography sx={{ color: "#475569", fontSize: "0.85rem", fontWeight: 700 }}>
              Deployment Phase
            </Typography>
            <Typography sx={{ color: sc, fontWeight: 900, fontSize: "0.9rem" }}>
              {progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "rgba(15, 23, 42, 0.05)",
              "& .MuiLinearProgress-bar": {
                background: `linear-gradient(90deg, ${sc}, ${alpha(sc, 0.6)})`,
                borderRadius: 3,
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
            borderTop: `1px solid ${GLASS_BORDER}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                background: "rgba(15, 23, 42, 0.1)",
                color: "#475569",
                fontSize: "0.7rem",
                fontWeight: 800
              }}
            >
              <PersonIcon sx={{ fontSize: 14 }} />
            </Avatar>
            <Typography sx={{ color: "#64748b", fontSize: "0.8rem", fontWeight: 600 }}>
              {(project.teamMembers ?? []).length} Specialists
            </Typography>
          </Box>
          <Typography sx={{ color: "#64748b", fontSize: "0.8rem", fontWeight: 600 }}>
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
            width={50}
            height={50}
            sx={{ bgcolor: "rgba(15, 23, 42, 0.05)", borderRadius: "16px", mb: 2 }}
          />
          <Skeleton
            variant="text"
            width="40%"
            sx={{ bgcolor: "rgba(15, 23, 42, 0.03)", mb: 1, height: 20 }}
          />
          <Skeleton
            variant="text"
            width="80%"
            sx={{ bgcolor: "rgba(15, 23, 42, 0.05)", mb: 0.5, height: 32 }}
          />
          <Skeleton
            variant="text"
            width="60%"
            sx={{ bgcolor: "rgba(15, 23, 42, 0.03)", mb: 3 }}
          />
          <Skeleton
            variant="rounded"
            height={6}
            sx={{ bgcolor: "rgba(15, 23, 42, 0.05)", borderRadius: 3 }}
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

      // We need to group by employee and match sub_tasks to their corresponding tasks.
      const grouped = {};

      rawData.forEach((item) => {
        const empId = item.emp_datas?._id ? String(item.emp_datas._id) : null;
        const empName = item.emp_datas?.name || "Unknown Employee";

        if (!empId) return;

        if (!grouped[empId]) {
          // Find tasks assigned to this specific employee
          let empTasks = [];

          if (Array.isArray(item.employeeTasks)) {
            // employeeTasks is an array of objects like { employee: "id", tasks: { task_id, title... } }
            item.employeeTasks.forEach((et) => {
              if (String(et.employee) === empId || String(et.employee?._id) === empId) {
                // If it's the current employee's task, push the inner `.tasks` object
                if (et.tasks && typeof et.tasks === 'object' && !Array.isArray(et.tasks)) {
                  empTasks.push({ ...et.tasks, user_subTaks: [] });
                } else if (Array.isArray(et.tasks)) {
                  empTasks.push(...et.tasks.map((t) => ({ ...t, user_subTaks: [] })));
                }
              }
            });
          } else if (Array.isArray(item.tasks)) {
            empTasks = item.tasks.map((t) => ({ ...t, user_subTaks: [] }));
          }

          grouped[empId] = {
            employee: empName,
            tasks: empTasks,
          };
        }

        // Sub_tasks can be an object (if unwound) or an array
        const subTasks = Array.isArray(item.sub_tasks)
          ? item.sub_tasks
          : item.sub_tasks
            ? [item.sub_tasks]
            : [];

        // Match sub_tasks to their respective tasks
        subTasks.forEach((st) => {
          if (!st) return;
          const stTaskId = st.task_id?._id ? String(st.task_id._id) : String(st.task_id);

          const taskToUpdate = grouped[empId].tasks.find(
            (t) => String(t.task_id) === stTaskId || String(t._id) === stTaskId
          );

          if (taskToUpdate && Array.isArray(st.user_subTaks)) {
            st.user_subTaks.forEach((actualTodo) => {
              if (!actualTodo) return;
              // Avoid duplicate subtasks if the same one appears multiple times
              // Specifically check for _id OR todo_id to prevent "undefined === undefined" bug!
              const actualId = actualTodo._id || actualTodo.todo_id || actualTodo.title;
              const exists = taskToUpdate.user_subTaks.find((existing) => {
                const existingId = existing._id || existing.todo_id || existing.title;
                return String(existingId) === String(actualId);
              });

              if (!exists) {
                taskToUpdate.user_subTaks.push(actualTodo);
              }
            });
          }
        });
      });

      const formattedData = Object.values(grouped);

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
        bgcolor: "#f1f5f9",
        position: "relative",
        overflow: "hidden",
        p: { xs: 2, sm: 3, md: 5 },
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
            left: "-5%",
            width: "60vw",
            height: "60vw",
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-5%",
            width: "55vw",
            height: "55vw",
            background: "radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
      </Box>
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
              mb: 3,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
              borderRadius: "12px",
              px: 2,
              "&:hover": {
                color: "#1e293b",
                background: "rgba(15, 23, 42, 0.05)",
              },
            }}
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
                  fontSize: { xs: "2rem", md: "3.2rem" },
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
              <Typography sx={{ color: "#64748b", fontWeight: 500, fontSize: "0.95rem", letterSpacing: 0.2 }}>
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
                      background: "rgba(255, 255, 255, 0.7)",
                      backdropFilter: "blur(12px)",
                      px: 3,
                      py: 1.5,
                      borderRadius: "16px",
                      textAlign: "center",
                      border: `1px solid ${GLASS_BORDER}`,
                      boxShadow: "0 4px 12px rgba(10, 15, 25, 0.03)",
                    }}
                  >
                    <Typography
                      sx={{
                        color: stat.color,
                        fontWeight: 900,
                        fontSize: "1.4rem",
                        lineHeight: 1.2
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography sx={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>
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
          >
            {/* Search */}
            <Box sx={{ mb: 6, maxWidth: 500, position: "relative", zIndex: 1 }}>
              <TextField
                placeholder="Search Strategic Intelligence Projects..."
                variant="outlined"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#0f172a", fontSize: 22, ml: 1 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#0f172a",
                    background: "rgba(255, 255, 255, 0.6)",
                    backdropFilter: "blur(12px)",
                    borderRadius: "20px",
                    fontWeight: 600,
                    px: 1,
                    py: 0.5,
                    "& fieldset": {
                      border: `1px solid ${GLASS_BORDER}`,
                    },
                    "&:hover fieldset": { borderColor: "rgba(15, 23, 42, 0.2)" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#0f172a",
                      borderWidth: "1.5px",
                    },
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
                background: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(12px)",
                border: `1px solid ${GLASS_BORDER}`,
                borderRadius: "20px",
                p: 2,
                px: 3,
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
                <Typography sx={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 700 }}>
                  Priority Level:
                </Typography>
                <Chip
                  label={selectedProject.priority ?? "Medium"}
                  size="small"
                  sx={{
                    bgcolor: alpha(priorityColor(selectedProject.priority), 0.1),
                    color: priorityColor(selectedProject.priority),
                    fontWeight: 900,
                    borderRadius: "8px",
                    textTransform: "uppercase",
                    fontSize: "0.7rem"
                  }}
                />
              </Box>
              <Box sx={{ height: "20px", width: "1px", bgcolor: GLASS_BORDER, display: { xs: "none", md: "block" } }} />
              <Typography sx={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 700 }}>
                Deadline:{" "}
                <Box
                  component="span"
                  sx={{ color: "#0f172a", fontWeight: 900 }}
                >
                  {selectedProject.deadline ?? "Pending Clearance"}
                </Box>
              </Typography>
              <Box sx={{ height: "20px", width: "1px", bgcolor: GLASS_BORDER, display: { xs: "none", md: "block" } }} />
              <Typography sx={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 700 }}>
                Active Unit:{" "}
                <Box
                  component="span"
                  sx={{ color: "#0f172a", fontWeight: 900 }}
                >
                  {(selectedProject.teamMembers ?? []).length} Specialists
                </Box>
              </Typography>
            </Box>

            {/* Loading */}
            {overviewLoading && (
              <Box sx={{ mt: 4 }}>
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