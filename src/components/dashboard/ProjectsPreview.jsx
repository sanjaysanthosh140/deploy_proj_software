
/**
 * AntyGravity Instruction:
 * Apply rules from /docs/component_analysis_prompt.md
 */import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Button, Chip, Paper, alpha } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FolderIcon from "@mui/icons-material/Folder";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import axios from "axios";

const PRIMARY_SLATE = "#0f172a";
const SECONDARY_SLATE = "#475569";
const INDIGO_ACCENT = "#4f46e5";
const GLASS_BG = "rgba(255, 255, 255, 0.75)";
const GLASS_BORDER = "rgba(10, 15, 25, 0.08)";

const ProjectsPreview = ({ userId }) => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // TODO: Replace with actual API call
        // const res = await axios.get(`/api/projects/assigned?userId=${userId}&limit=${maxProjects}`);
        // setProjects(res.data);
        axios
          .get("http://localhost:8080/employee_included_proj", {
            headers: {
              Authorization: `${userId}`,
              "Content-Type": "application/json",
            },
          })
          .then((res) => {
            console.log(res.data);
            setProjects(res.data);
          });

        // Mock data
        const mockProjects = [
          {
            _id: "p1",
            title: "AI-Powered Analytics Engine",
            progress: 78,
            deadline: "2026-02-05",
            isEnrolled: true,
            priority: "High",
          },
          {
            _id: "p2",
            title: "Cloud Migration Phase 2",
            progress: 45,
            deadline: "2026-02-15",
            isEnrolled: true,
            priority: "Critical",
          },
          {
            _id: "p3",
            title: "Mobile App Redesign",
            progress: 92,
            deadline: "2026-02-02",
            isEnrolled: false,
            priority: "Medium",
          },
        ];
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, [userId]);

  const handleEnroll = async (projectId) => {
    try {
      // TODO: Replace with actual API call
      // await axios.post('/api/projects/enroll', { projectId, userId });

      setProjects(
        projects.map((p) =>
          p._id === projectId ? { ...p, isEnrolled: true } : p,
        ),
      );
    } catch (error) {
      console.error("Error enrolling in project:", error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "#ef4444"; // Red
      case "High":
        return "#f59e0b"; // Amber
      case "Medium":
        return "#6366f1"; // Indigo
      default:
        return "#10b981"; // Emerald
    }
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (projects.length === 0) return null;

  return (
    <Box sx={{ mb: 2 }}>
      {/* Section Header */}
      <Typography sx={{ fontWeight: 700, color: PRIMARY_SLATE, fontSize: { xs: "0.9rem", sm: "0.95rem" }, mb: { xs: 1.2, sm: 1.5 }, letterSpacing: "-0.01em" }}>
        My Projects
      </Typography>
      {/* Projects Grid — 1 col xs, 2 col sm, 3 col md, 4 col lg */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
        {projects.map((project, index) => {
          const daysRemaining = getDaysRemaining(project.deadline);
          const isUrgent = daysRemaining <= 7;

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={project._id}>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Paper
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: "16px",
                    background: GLASS_BG,
                    backdropFilter: "blur(24px) saturate(160%)",
                    border: `1px solid ${isUrgent ? alpha(getPriorityColor(project.priority), 0.3) : GLASS_BORDER}`,
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 4px 16px -4px rgba(10,15,25,0.06)",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      borderColor: alpha(getPriorityColor(project.priority), 0.4),
                      boxShadow: `0 8px 24px ${alpha(getPriorityColor(project.priority), 0.1)}`,
                    },
                  }}
                >
                  {/* Background Glow */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: "-30%",
                      right: "-20%",
                      width: "120px",
                      height: "120px",
                      background: `radial-gradient(circle, ${getPriorityColor(project.priority)}15 0%, transparent 70%)`,
                      filter: "blur(30px)",
                      zIndex: 0,
                    }}
                  />

                  <Box
                    sx={{
                      position: "relative",
                      zIndex: 1,
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Priority badge + days on same compact row */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Chip
                        label={project.priority}
                        size="small"
                        sx={{
                          bgcolor: `${getPriorityColor(project.priority)}18`,
                          color: getPriorityColor(project.priority),
                          fontWeight: 700,
                          border: `1px solid ${getPriorityColor(project.priority)}35`,
                          fontSize: { xs: "0.65rem", sm: "0.7rem" },
                          height: { xs: 20, sm: 22 },
                          "& .MuiChip-label": { px: 0.8 },
                        }}
                      />
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                        <AccessTimeIcon sx={{ fontSize: { xs: 11, sm: 12 }, color: isUrgent ? "#ffab00" : alpha(SECONDARY_SLATE, 0.5) }} />
                        <Typography sx={{ fontSize: { xs: "0.65rem", sm: "0.7rem" }, color: isUrgent ? "#ffab00" : alpha(SECONDARY_SLATE, 0.55), fontWeight: isUrgent ? 700 : 500 }}>
                          {daysRemaining}d left
                        </Typography>
                      </Box>
                    </Box>

                    {/* Title */}
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: PRIMARY_SLATE,
                        mb: 1,
                        lineHeight: 1.35,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        fontSize: { xs: "0.85rem", sm: "0.92rem", md: "0.95rem" },
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {project.title}
                    </Typography>

                    {/* Progress */}
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5, alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                          <TrendingUpIcon sx={{ fontSize: { xs: 11, sm: 12 }, color: alpha(SECONDARY_SLATE, 0.5) }} />
                          <Typography sx={{ color: SECONDARY_SLATE, fontWeight: 600, fontSize: { xs: "0.65rem", sm: "0.7rem" } }}>
                            Progress
                          </Typography>
                        </Box>
                        <Typography sx={{ color: INDIGO_ACCENT, fontWeight: 800, fontSize: { xs: "0.68rem", sm: "0.72rem" } }}>
                          {project.progress ?? 0}%
                        </Typography>
                      </Box>

                      <Box sx={{ position: "relative", height: 5, borderRadius: 3, bgcolor: "rgba(15,23,42,0.06)", overflow: "hidden" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress ?? 0}%` }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          style={{ height: "100%", background: `linear-gradient(90deg, ${getPriorityColor(project.priority)}, ${getPriorityColor(project.priority)}80)`, borderRadius: 3 }}
                        />
                      </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: "flex", gap: 1, mt: "auto", pt: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        disableElevation
                        startIcon={<VisibilityIcon sx={{ fontSize: { xs: 13, sm: 14 } }} />}
                        onClick={() => navigate(`/app/projects/${project._id}`)}
                        sx={{
                          flex: 1,
                          borderRadius: "10px",
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: { xs: "0.7rem", sm: "0.75rem" },
                          py: { xs: 0.6, sm: 0.75 },
                          minHeight: { xs: 28, sm: 30 },
                          background: INDIGO_ACCENT,
                          "&:hover": { background: "#3730a3" },
                        }}
                      >
                        Details
                      </Button>
                      {!project.isEnrolled && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PersonAddIcon sx={{ fontSize: { xs: 13, sm: 14 } }} />}
                          onClick={() => handleEnroll(project._id)}
                          sx={{
                            flex: 1,
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: { xs: "0.7rem", sm: "0.75rem" },
                            py: { xs: 0.6, sm: 0.75 },
                            minHeight: { xs: 28, sm: 30 },
                            borderColor: "rgba(0,230,118,0.5)",
                            color: "#00e676",
                            "&:hover": { borderColor: "#00e676", bgcolor: "rgba(0,230,118,0.08)" },
                          }}
                        >
                          Enroll
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};


export default ProjectsPreview;
