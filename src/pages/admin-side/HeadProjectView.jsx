
/**
 * AntyGravity Instruction:
 * Apply rules from /docs/component_analysis_prompt.md
 */
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Chip,
  IconButton,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  AvatarGroup,
  LinearProgress,
  Tooltip,
  alpha,
  Skeleton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FolderIcon from "@mui/icons-material/Folder";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import TaskAssignmentModal from "./TaskAssignmentModal";
import CreateProjectDialog from "../../components/CreateProjectDialog";

// --- Styled Components & Theme Constants ---
const GLASS_BG = "rgba(255, 255, 255, 0.75)";
const GLASS_BORDER = "rgba(10, 15, 25, 0.08)";

const GlassCard = ({ children, sx = {}, hoverEffect = true }) => (
  <Card
    component={motion.div}
    whileHover={hoverEffect ? {
      translateY: -8,
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
      overflow: "visible",
      ...sx,
    }}
  >
    {children}
  </Card>
);

const HeadProjectView = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assignment Modal State
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Creation/Edit Dialog State
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProjectData, setEditingProjectData] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/admin/headProj",
          {
            headers: {
              Authorization: `${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        console.log(response.data);
        setProjectsList(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProjects();
    }
  }, [token]);

  const handleDelete = (e, id) => {
    if (e) e.stopPropagation();
    try {
      console.log(id);
    } catch (error) {
      console.log(error);
    }

  }
  const handleEdit = async (e, id) => {
    if (e) e.stopPropagation();
    try {
      // The user specified using .delete for fetching edit data
      let res = await axios.delete(`http://localhost:8080/admin/edit_project/${id}`, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("from edit", res.data);
      setEditingProjectData(res.data);
      setIsCreateDialogOpen(true);
    } catch (error) {
      console.error("Error fetching project for edit:", error);
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "#38bdf8";
      case "Completed":
        return "#4ade80";
      case "Critical":
        return "#f43f5e";
      case "Planning":
        return "#fbbf24";
      default:
        return "#94a3b8";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "#f43f5e";
      case "High":
        return "#fb7185";
      case "Medium":
        return "#fbbf24";
      case "Low":
        return "#4ade80";
      default:
        return "#94a3b8";
    }
  };

  const filteredProjects = projectsList.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f1f5f9",
        position: "relative",
        overflow: "hidden",
        p: { xs: 2, sm: 3, md: 6 },
        color: "#0f172a",
      }}
    >
      {/* Background Mesh Blobs */}
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: "none" }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 22, repeat: Infinity }}
          style={{
            position: "absolute",
            top: "-15%",
            right: "-10%",
            width: "65vw",
            height: "65vw",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
          transition={{ duration: 28, repeat: Infinity }}
          style={{
            position: "absolute",
            bottom: "-15%",
            left: "-5%",
            width: "60vw",
            height: "60vw",
            background: "radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)",
            filter: "blur(110px)",
          }}
        />
      </Box>
      {/* Header Section */}
      <Box
        sx={{
          mb: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 4,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/head")}
              sx={{
                color: "#64748b",
                mb: 3,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.95rem",
                borderRadius: "14px",
                px: 2,
                "&:hover": {
                  color: "#0f172a",
                  background: "rgba(15, 23, 42, 0.05)",
                },
              }}
            >
              Back to Command Center
            </Button>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                fontSize: { xs: "2.5rem", md: "4rem" },
                letterSpacing: "-0.03em",
                mb: 1,
                background: "linear-gradient(135deg, #0f172a 0%, #475569 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.1,
              }}
            >
              Projects
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "#64748b", fontWeight: 500, maxWidth: 700, lineHeight: 1.6, letterSpacing: 0.2 }}
            >
              Strategic departmental oversight and high-fidelity resource orchestration for organization-wide intelligence.
            </Typography>
          </motion.div>
        </Box>

        <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
          <TextField
            placeholder="Search Project Streams..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#0f172a", fontSize: 24, ml: 1 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: "100%", sm: 450 },
              "& .MuiOutlinedInput-root": {
                color: "#0f172a",
                background: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(12px)",
                borderRadius: "20px",
                fontWeight: 600,
                px: 1,
                py: 0.5,
                border: `1px solid ${GLASS_BORDER}`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "& fieldset": { border: "none" },
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.8)",
                  borderColor: "rgba(15, 23, 42, 0.15)",
                },
                "&.Mui-focused": {
                  background: "#fff",
                  boxShadow: "0 4px 24px rgba(15, 23, 42, 0.06)",
                },
              },
            }}
          />
        </Box>
      </Box>

      {/* Projects Grid */}
      {loading ? (
        <Grid container spacing={5}>
          {[1, 2].map((i) => (
            <Grid item xs={12} key={i}>
              <GlassCard sx={{ p: 3 }}>
                <Skeleton
                  variant="rounded"
                  width={56}
                  height={56}
                  sx={{ bgcolor: "rgba(15, 23, 42, 0.05)", borderRadius: "16px", mb: 2.5 }}
                />
                <Skeleton
                  variant="text"
                  width="40%"
                  sx={{ bgcolor: "rgba(15, 23, 42, 0.03)", mb: 1, height: 20 }}
                />
                <Skeleton
                  variant="text"
                  width="80%"
                  sx={{ bgcolor: "rgba(15, 23, 42, 0.05)", mb: 2.5, height: 32 }}
                />
                <Skeleton
                  variant="rounded"
                  height={60}
                  sx={{ bgcolor: "rgba(15, 23, 42, 0.02)", borderRadius: "16px", mb: 2.5 }}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: "rgba(15, 23, 42, 0.05)" }} />
                  <Skeleton variant="rounded" width={80} height={32} sx={{ bgcolor: "rgba(15, 23, 42, 0.05)", borderRadius: "8px" }} />
                </Box>
              </GlassCard>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={5} sx={{ position: "relative", zIndex: 1 }}>
          {filteredProjects.map((project, index) => {
            const teamMembers = project.teamMembers || [];
            const tasks = project.todos || [];
            const completedTasks = tasks.filter(
              (t) => t.status === "completed",
            ).length;
            const progress =
              tasks.length > 0
                ? Math.round((completedTasks / tasks.length) * 100)
                : 0;
            const statusColor = getStatusColor(project.status || "Active");

            return (
              <Grid item xs={12} key={project._id}>
                <GlassCard
                  sx={{ cursor: "pointer", p: 0, height: "100%" }}
                  onSelect={() => {
                    setSelectedProject(project);
                    setIsModalOpen(true);
                  }}
                >
                  <Box
                    sx={{
                      p: 3,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    onClick={() => {
                      setSelectedProject(project);
                      setIsModalOpen(true);
                    }}
                  >
                    {/* Top Row */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: "16px",
                          background: "rgba(15, 23, 42, 0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: statusColor,
                          border: `1px solid ${alpha(statusColor, 0.2)}`,
                        }}
                      >
                        <FolderIcon sx={{ fontSize: 32 }} />
                      </Box>

                      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Chip
                          label={project.status || "Active"}
                          size="small"
                          sx={{
                            bgcolor: alpha(statusColor, 0.1),
                            color: statusColor,
                            fontWeight: 900,
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            borderRadius: "8px",
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            color: "rgba(15, 23, 42, 0.2)",
                            "&:hover": { color: "#0f172a" },
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Title & Info */}
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        fontWeight: 800,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        mb: 1,
                        display: "block",
                        fontSize: "0.7rem"
                      }}
                    >
                      ID:{" "}
                      {project._id
                        .substring(project._id.length - 6)
                        .toUpperCase()}
                    </Typography>

                    <Typography
                      sx={{
                        color: "#0f172a",
                        fontWeight: 900,
                        fontSize: "1.5rem",
                        mb: 1.5,
                        lineHeight: 1.2,
                        letterSpacing: "-0.02em"
                      }}
                    >
                      {project.title}
                    </Typography>

                    <Typography
                      sx={{
                        color: "#475569",
                        mb: 2.5,
                        lineHeight: 1.5,
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        minHeight: 48,
                      }}
                    >
                      {project.description}
                    </Typography>

                    {/* Progress Section */}
                    <Box
                      sx={{
                        mb: 2.5,
                        bgcolor: "rgba(15, 23, 42, 0.03)",
                        p: 2,
                        borderRadius: "16px",
                        border: `1px solid ${GLASS_BORDER}`,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: "#64748b", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}
                        >
                          Execution Velocity
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: statusColor, fontWeight: 900, fontSize: "0.85rem" }}
                        >
                          {progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "rgba(15, 23, 42, 0.05)",
                          "& .MuiLinearProgress-bar": {
                            background: `linear-gradient(90deg, ${statusColor}, ${alpha(statusColor, 0.6)})`,
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>

                    {/* Metadata Grid */}
                    <Grid container spacing={3} sx={{ mb: 2.5 }}>
                      <Grid item xs={6}>
                        <Box sx={{ borderLeft: `3px solid ${getPriorityColor(project.priority)}`, pl: 2 }}>
                          <Typography
                            sx={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", mb: 0.5 }}
                          >
                            Priority
                          </Typography>
                          <Typography
                            sx={{ color: "#0f172a", fontWeight: 800, fontSize: "0.95rem" }}
                          >
                            {project.priority || "Medium"}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ borderLeft: "3px solid rgba(15, 23, 42, 0.05)", pl: 2 }}>
                          <Typography
                            sx={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", mb: 0.5 }}
                          >
                            Deadline
                          </Typography>
                          <Typography
                            sx={{ color: "#0f172a", fontWeight: 800, fontSize: "0.95rem" }}
                          >
                            {project.deadline || "TBD"}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Footer Actions */}
                    <Box
                      sx={{
                        mt: "auto",
                        pt: 3,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: `1px solid ${GLASS_BORDER}`,
                      }}
                    >
                      <AvatarGroup
                        max={4}
                        sx={{
                          "& .MuiAvatar-root": {
                            width: 36,
                            height: 36,
                            fontSize: "0.85rem",
                            border: `2px solid ${GLASS_BG}`,
                            background: "linear-gradient(135deg, #0f172a, #334155)",
                            color: "#fff",
                            fontWeight: 800
                          },
                        }}
                      >
                        {teamMembers.map((m, i) => (
                          <Tooltip key={i} title={m.name || "Specialist"}>
                            <Avatar>
                              {m.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "S"}
                            </Avatar>
                          </Tooltip>
                        ))}
                      </AvatarGroup>

                      <Box sx={{ display: "flex", gap: 1.5 }}>
                        <IconButton
                          size="small"
                          sx={{
                            color: "#64748b",
                            bgcolor: "rgba(15, 23, 42, 0.03)",
                            borderRadius: "10px",
                            "&:hover": {
                              color: "#0f172a",
                              bgcolor: "rgba(15, 23, 42, 0.06)",
                            },
                          }}
                          onClick={(e) => { handleEdit(e, project._id) }}
                        >
                          <EditIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{
                            color: "#64748b",
                            bgcolor: "rgba(15, 23, 42, 0.03)",
                            borderRadius: "10px",
                            "&:hover": {
                              color: "#f43f5e",
                              bgcolor: alpha("#f43f5e", 0.1),
                            },
                          }}
                          onClick={(e) => { handleDelete(e, project._id) }}
                        >
                          <DeleteIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </GlassCard>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Empty State */}
      {!loading && filteredProjects.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Box sx={{ textAlign: "center", mt: 15 }}>
            <Box
              sx={{
                width: 140,
                height: 140,
                borderRadius: "40px",
                background: "rgba(15, 23, 42, 0.03)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 32px",
                border: `1px solid ${GLASS_BORDER}`,
                color: alpha("#0f172a", 0.1),
              }}
            >
              <SearchIcon sx={{ fontSize: 64 }} />
            </Box>
            <Typography
              variant="h4"
              sx={{ color: "#0f172a", fontWeight: 900, mb: 1.5, letterSpacing: "-0.02em" }}
            >
              Zero Stream Matches
            </Typography>
            <Typography sx={{ color: "#64748b", fontWeight: 600, maxWidth: 400, mx: "auto" }}>
              The system was unable to identify any project intelligence matching your current query parameters.
            </Typography>
          </Box>
        </motion.div>
      )}

      {/* Assignment Modal */}
      <TaskAssignmentModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectData={selectedProject}
        onSave={(data) => {
          console.log("Saving Assignments in HeadProjectView:", data);
          // Here the user will integrate with backend
        }}
      />

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingProjectData(null);
        }}
        initialData={editingProjectData}
        onSubmit={async (finalData) => {
          try {
            if (editingProjectData?._id) {
              // Update existing
              let id = editingProjectData._id;
              await axios.put(
                `http://localhost:8080/admin/updateProj/${id}`,
                finalData,
                { headers: { Authorization: `${token}` } }
              );
            } else {
              // Create new
              await axios.post(
                "http://localhost:8080/admin/createProj",
                finalData,
                { headers: { Authorization: `${token}` } }
              );
            }
            // Refresh
            const response = await axios.get("http://localhost:8080/admin/headProj", {
              headers: { Authorization: `${token}` }
            });
            setProjectsList(response.data);
          } catch (error) {
            console.error("Submission error:", error);
          }
        }}
      />
    </Box>
  );
};

export default HeadProjectView;
