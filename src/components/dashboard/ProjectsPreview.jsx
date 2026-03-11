
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
    <Box sx={{ mb: 4 }}>
      {/* Section Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <FolderIcon sx={{ color: INDIGO_ACCENT, fontSize: 24 }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: PRIMARY_SLATE,
              letterSpacing: "-0.01em",
              fontSize: "1.6rem"
            }}
          >
            Assigned Protocols
          </Typography>
        </Box>
        <Button
          variant="text"
          onClick={() => navigate("/app/projects")}
          sx={{
            color: INDIGO_ACCENT,
            textTransform: "none",
            fontWeight: 800,
            fontSize: "1.35rem",
            "&:hover": {
              bgcolor: alpha(INDIGO_ACCENT, 0.05),
            },
          }}
        >
          View Portfolio →
        </Button>
      </Box>

      {/* Projects Grid */}
      <Grid container spacing={6}>
        {projects.map((project, index) => {
          const daysRemaining = getDaysRemaining(project.deadline);
          const isUrgent = daysRemaining <= 7;

          return (
            <Grid size={{ xs: 12, md: 12 }} key={project._id}>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Paper
                  sx={{
                    p: 4,
                    borderRadius: "24px",
                    background: GLASS_BG,
                    backdropFilter: "blur(48px) saturate(180%)",
                    border: `1px solid ${isUrgent ? alpha(getPriorityColor(project.priority), 0.3) : GLASS_BORDER}`,
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 8px 32px -4px rgba(10, 15, 25, 0.04)",
                    minHeight: "480px",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      borderColor: alpha(getPriorityColor(project.priority), 0.4),
                      boxShadow: `0 12px 40px ${alpha(getPriorityColor(project.priority), 0.1)}`,
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
                    {/* Priority Badge */}
                    <Chip
                      label={project.priority}
                      size="small"
                      sx={{
                        alignSelf: "flex-start",
                        mb: 2.5,
                        bgcolor: `${getPriorityColor(project.priority)}20`,
                        color: getPriorityColor(project.priority),
                        fontWeight: 700,
                        border: `1px solid ${getPriorityColor(project.priority)}40`,
                        fontSize: "1.2rem",
                        padding: "10px 18px"
                      }}
                    />

                    {/* Title */}
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 800,
                        color: PRIMARY_SLATE,
                        mb: 3,
                        lineHeight: 1.3,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: "2.6em",
                        letterSpacing: "-0.01em",
                        fontSize: "1.5rem"
                      }}
                    >
                      {project.title}
                    </Typography>

                    {/* Progress */}
                    <Box sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.8,
                          }}
                        >
                          <TrendingUpIcon
                            sx={{ fontSize: 18, color: alpha(SECONDARY_SLATE, 0.6) }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ color: SECONDARY_SLATE, fontWeight: 600, fontSize: "1.25rem" }}
                          >
                            Progress
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{ color: INDIGO_ACCENT, fontWeight: 800, fontSize: "1.25rem" }}
                        >
                          {project.progress}%
                        </Typography>
                      </Box>

                      {/* Liquid Progress Bar */}
                      <Box
                        sx={{
                          position: "relative",
                          height: 12,
                          borderRadius: 3,
                          bgcolor: "rgba(255, 255, 255, 0.05)",
                          overflow: "hidden",
                        }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${project.description}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          style={{
                            height: "100%",
                            background: `linear-gradient(90deg, ${getPriorityColor(project.priority)} 0%, ${getPriorityColor(project.priority)}70 100%)`,
                            borderRadius: 3,
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: `linear-gradient(90deg, transparent, ${getPriorityColor(project.priority)}40, transparent)`,
                              animation: "wave 2s infinite linear",
                              "@keyframes wave": {
                                "0%": { transform: "translateX(-100%)" },
                                "100%": { transform: "translateX(100%)" },
                              },
                            }}
                          />
                        </motion.div>
                      </Box>
                    </Box>

                    {/* Deadline */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.8,
                        mb: 3,
                      }}
                    >
                      <AccessTimeIcon
                        sx={{
                          fontSize: 20,
                          color: isUrgent ? "#ffab00" : "#a0aec0",
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: isUrgent ? "#ffab00" : "#a0aec0",
                          fontWeight: isUrgent ? 700 : 500,
                          fontSize: "1.25rem"
                        }}
                      >
                        {daysRemaining} days left
                      </Typography>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: "flex", gap: 2, mt: "auto" }}>
                      <Button
                        variant="contained"
                        size="small"
                        disableElevation
                        startIcon={<VisibilityIcon sx={{ fontSize: 22 }} />}
                        onClick={() => navigate(`/app/projects/${project._id}`)}
                        sx={{
                          flex: 1,
                          borderRadius: "12px",
                          textTransform: "none",
                          fontWeight: 800,
                          fontSize: "1.35rem",
                          py: 2,
                          background: INDIGO_ACCENT,
                          "&:hover": {
                            background: "#3730a3",
                          },
                        }}
                      >
                        Details
                      </Button>
                      {!project.isEnrolled && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PersonAddIcon sx={{ fontSize: 22 }} />}
                          onClick={() => handleEnroll(project._id)}
                          sx={{
                            flex: 1,
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: "1.35rem",
                            py: 1.8,
                            borderColor: "rgba(0, 230, 118, 0.5)",
                            color: "#00e676",
                            "&:hover": {
                              borderColor: "#00e676",
                              bgcolor: "rgba(0, 230, 118, 0.1)",
                            },
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
