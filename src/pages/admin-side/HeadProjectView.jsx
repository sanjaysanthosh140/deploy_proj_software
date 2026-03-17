import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Chip,
  IconButton,
  Card,
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

// --- iOS Liquid Glass Design Constants ---
const PRIMARY_BG = "#ffffff";
const SECONDARY_BG = "#f8f9fa";
const TERTIARY_BG = "#f1f3f5";

const glassEffect = {
  background: "rgba(255, 255, 255, 1)",
  backdropFilter: "blur(25px) saturate(160%)",
  border: "1px solid rgba(0, 0, 0, 0.08)",
  borderRadius: "28px",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0,0,0,0.02)",
  transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
  position: "relative",
  overflow: "visible",
};

const iPhoneGlassButton = {
  background: "rgba(255, 255, 255, 1)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(0, 0, 0, 0.1)",
  borderRadius: "20px",
  color: "rgba(0, 0, 0, 0.9)",
  fontWeight: 1000,
  textTransform: "none",
  letterSpacing: "-0.02em",
  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.05)",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  "& .MuiButton-startIcon svg": { fontSize: 26 },
  "& .MuiButton-endIcon svg": { fontSize: 26 },
  "&:hover": {
    background: "rgba(255, 255, 255, 1)",
    transform: "translateY(-4px) scale(1.02)",
    boxShadow: "0 20px 45px rgba(0, 0, 0, 0.08)",
    border: "1px solid rgba(0, 0, 0, 0.15)",
  },
  "&:active": {
    transform: "translateY(-1px) scale(0.98)",
  }
};

const GlassCard = ({ children, sx = {}, hoverEffect = true, onClick }) => (
  <Card
    component={motion.div}
    {...(hoverEffect ? {
      whileHover: {
        translateY: -10,
        boxShadow: "0 30px 60px rgba(0, 0, 0, 0.08)",
        background: "rgba(255, 255, 255, 1)",
        borderColor: "rgba(0, 0, 0, 0.12)",
      }
    } : {})}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 200, damping: 25 }}
    onClick={onClick}
    sx={{
      ...glassEffect,
      p: 0,
      m: 0,
      display: "flex",
      flexDirection: "column",
      border: "1px solid rgba(0, 0, 0, 0.08)",
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
      console.log("Delete triggered for project:", id);
      // Integration point for delete API
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleEdit = async (e, id) => {
    if (e) e.stopPropagation();
    try {
      let res = await axios.delete(`http://localhost:8080/admin/edit_project/${id}`, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      });
      setEditingProjectData(res.data);
      setIsCreateDialogOpen(true);
    } catch (error) {
      console.error("Error fetching project for edit:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "#00d4ff";
      case "Completed": return "#4ade80";
      case "Critical": return "#ff4d4f";
      case "Planning": return "#f59e0b";
      default: return "#94a3b8";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical": return "#ff4d4f";
      case "High": return "#fb7185";
      case "Medium": return "#f59e0b";
      case "Low": return "#4ade80";
      default: return "#94a3b8";
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
        height: "100%",
        minHeight: "100vh",
        background: `#ffffff`,
        position: "relative",
        overflowX: "hidden",
        p: { xs: 2.5, sm: 4, md: 6 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: "rgba(0,0,0,0.9)",
      }}
    >
      <Box
        sx={{
          mb: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: { xs: 2, sm: 4 },
          position: "relative",
          zIndex: 1,
          width: "95%",
          maxWidth: "1800px",
        }}
      >
        <Box>
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Button
              startIcon={<ArrowBackIcon sx={{ fontSize: 24 }} />}
              onClick={() => navigate("/head")}
              sx={{
                ...iPhoneGlassButton,
                mb: { xs: 3, md: 6 },
                px: 4,
                py: 2,
                fontSize: "1rem",
                borderRadius: "22px"
              }}
            >
              Tactical Retreat (Back)
            </Button>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 1000,
                fontSize: { xs: "2.2rem", sm: "3rem", md: "4.5rem" },
                letterSpacing: { xs: "-0.04em", md: "-0.06em" },
                mb: 2,
                color: "rgba(0,0,0,0.95)",
                lineHeight: 0.95,
              }}
            >
              Intelligence Registry
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(0,0,0,0.5)",
                fontWeight: 800,
                maxWidth: 800,
                lineHeight: 1.5,
                letterSpacing: "-0.01em",
                fontSize: { xs: "0.95rem", md: "1.1rem" }
              }}
            >
              Strategic departmental oversight and high-fidelity resource orchestration for organization-wide intelligence synthesis.
            </Typography>
          </motion.div>
        </Box>

        <Box sx={{ display: "flex", gap: 3, alignItems: "center", width: { xs: "100%", sm: "auto" }, mt: { xs: 2, sm: 0 } }}>
          <TextField
            placeholder="Search Intelligence Registry..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "rgba(0,0,0,0.5)", fontSize: 28, ml: 1.5 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: "100%", sm: 600 },
              "& .MuiOutlinedInput-root": {
                background: "rgba(255, 255, 255, 1)",
                backdropFilter: "blur(20px)",
                borderRadius: "24px",
                fontWeight: 800,
                color: "rgba(0,0,0,0.9)",
                px: 1.5,
                py: 0.8,
                fontSize: "1rem",
                "& input": { color: "rgba(0,0,0,0.9)" },
                "& fieldset": { border: "1px solid rgba(0,0,0,0.08)" },
                "&:hover": {
                  background: "rgba(255, 255, 255, 1)",
                  "& fieldset": { border: "1px solid rgba(0,0,0,0.15)" }
                },
                "&.Mui-focused": {
                  background: "rgba(255, 255, 255, 1)",
                  boxShadow: "0 15px 45px rgba(0,0,0,0.05)",
                  "& fieldset": { border: "2px solid #000" }
                },
              },
            }}
          />
        </Box>
      </Box>

      <Box sx={{ width: "95%", maxWidth: "1800px", position: "relative", zIndex: 1 }}>
        {loading ? (
          <Grid container spacing={4}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <GlassCard sx={{ p: 4, height: 420 }}>
                  <Skeleton
                    variant="rounded"
                    width={72}
                    height={72}
                    sx={{ bgcolor: "rgba(0, 0, 0, 0.05)", borderRadius: "22px", mb: 4 }}
                  />
                  <Skeleton variant="text" width="60%" height={50} sx={{ bgcolor: "rgba(0,0,0,0.05)", mb: 2.5 }} />
                  <Skeleton variant="text" width="90%" height={28} sx={{ bgcolor: "rgba(0,0,0,0.03)", mb: 1.5 }} />
                  <Skeleton variant="text" width="85%" height={28} sx={{ bgcolor: "rgba(0,0,0,0.03)", mb: 5 }} />
                  <Box sx={{ mt: "auto", background: "rgba(0,0,0,0.02)", p: 3, borderRadius: "24px" }}>
                    <Skeleton variant="rounded" height={12} sx={{ bgcolor: "rgba(0,0,0,0.05)", borderRadius: 6 }} />
                  </Box>
                </GlassCard>
              </Grid>
            ))}
          </Grid>
        ) : filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Box sx={{ textAlign: "center", mt: { xs: 10, md: 15 } }}>
              <Box
                sx={{
                  width: { xs: 140, md: 180 },
                  height: { xs: 140, md: 180 },
                  borderRadius: "48px",
                  background: "rgba(0, 0, 0, 0.03)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 40px",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                  color: "rgba(0, 0, 0, 0.1)",
                }}
              >
                <SearchIcon sx={{ fontSize: { xs: 64, md: 84 } }} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  color: "rgba(0,0,0,0.95)",
                  fontWeight: 1000,
                  mb: 2.5,
                  fontSize: { xs: "2rem", md: "3rem" }
                }}
              >
                Zero Stream Matches
              </Typography>
              <Typography sx={{
                color: "rgba(0,0,0,0.5)",
                fontWeight: 800,
                maxWidth: 500,
                mx: "auto",
                lineHeight: 1.6,
                fontSize: { xs: "1rem", md: "1.2rem" }
              }}>
                The system was unable to identify any project intelligence archives matching your current operational parameters.
              </Typography>
            </Box>
          </motion.div>
        ) : (
          <Grid container spacing={4} sx={{ alignItems: "stretch" }}>
            {filteredProjects.map((project) => {
              const teamMembers = project.teamMembers || [];
              const tasks = project.todos || [];
              const completedTasks = tasks.filter((t) => t.status === "completed").length;
              const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
              const sc = getStatusColor(project.status || "Active");

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={project._id} sx={{ display: "flex" }}>
                  <GlassCard
                    sx={{
                      cursor: "pointer",
                      p: 0,
                      height: "100%",
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    onClick={() => {
                      setSelectedProject(project);
                      setIsModalOpen(true);
                    }}
                  >
                    <Box sx={{ p: { xs: 3, md: 4 }, height: "100%", display: "flex", flexDirection: "column" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3.5 }}>
                        <Box
                          sx={{
                            width: { xs: 48, md: 60 },
                            height: { xs: 48, md: 60 },
                            borderRadius: "18px",
                            background: "rgba(0, 0, 0, 0.03)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: sc,
                            border: "1px solid rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          <FolderIcon sx={{ fontSize: { xs: 26, md: 34 } }} />
                        </Box>

                        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                          <Chip
                            label={project.status || "Active"}
                            sx={{
                              bgcolor: `${sc}12`,
                              color: sc,
                              fontWeight: 1000,
                              borderRadius: "12px",
                              px: 1.5,
                              py: 0.5,
                              border: `1px solid ${alpha(sc, 0.2)}`
                            }}
                          />
                          <IconButton
                            sx={{
                              color: "rgba(0, 0, 0, 0.4)",
                              bgcolor: "rgba(0, 0, 0, 0.03)",
                              borderRadius: "14px",
                              "&:hover": { color: "#000", background: "rgba(0, 0, 0, 0.07)" },
                            }}
                          >
                            <MoreVertIcon sx={{ fontSize: 24 }} />
                          </IconButton>
                        </Box>
                      </Box>

                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(0,0,0,0.4)",
                          fontWeight: 1000,
                          letterSpacing: 3,
                          textTransform: "uppercase",
                          mb: 1.5,
                          display: "block",
                          fontSize: "0.75rem"
                        }}
                      >
                        GENESIS_ID: {project._id.substring(project._id.length - 8).toUpperCase()}
                      </Typography>

                      <Typography
                        sx={{
                          color: "rgba(0,0,0,0.95)",
                          fontWeight: 1000,
                          fontSize: { xs: "1.5rem", md: "1.85rem" },
                          mb: 2,
                          lineHeight: 1.1,
                          letterSpacing: "-1px"
                        }}
                      >
                        {project.title}
                      </Typography>

                      <Typography
                        sx={{
                          color: "rgba(0,0,0,0.55)",
                          mb: 4,
                          lineHeight: 1.4,
                          fontWeight: 700,
                          fontSize: "1rem",
                          minHeight: 70,
                        }}
                      >
                        {project.description}
                      </Typography>

                      <Box
                        sx={{
                          mb: 4,
                          background: "rgba(0, 0, 0, 0.02)",
                          p: 3,
                          borderRadius: "20px",
                          border: "1px solid rgba(0, 0, 0, 0.04)",
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
                          <Typography variant="caption" sx={{ color: "rgba(0,0,0,0.4)", fontWeight: 1000 }}>
                            Deployment Velocity
                          </Typography>
                          <Typography variant="caption" sx={{ color: sc, fontWeight: 1000, fontSize: "1.1rem" }}>
                            {progress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{
                            height: 12,
                            borderRadius: 6,
                            bgcolor: "rgba(0, 0, 0, 0.05)",
                            "& .MuiLinearProgress-bar": {
                              background: `linear-gradient(90deg, ${sc}, ${alpha(sc, 0.6)})`,
                              borderRadius: 6,
                            },
                          }}
                        />
                      </Box>

                      <Grid container spacing={4} sx={{ mb: 5 }}>
                        <Grid item xs={6}>
                          <Box sx={{ borderLeft: `4px solid ${getPriorityColor(project.priority)}`, pl: 2.5 }}>
                            <Typography sx={{ color: "rgba(0,0,0,0.45)", fontSize: "0.75rem", fontWeight: 1000, mb: 0.5 }}>
                              Priority
                            </Typography>
                            <Typography sx={{ color: "rgba(0,0,0,0.9)", fontWeight: 1000, fontSize: "1.1rem" }}>
                              {project.priority || "Medium"}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ borderLeft: "4px solid rgba(0, 0, 0, 0.08)", pl: 2.5 }}>
                            <Typography sx={{ color: "rgba(0,0,0,0.45)", fontSize: "0.75rem", fontWeight: 1000, mb: 0.5 }}>
                              Temporal Limit
                            </Typography>
                            <Typography sx={{ color: "rgba(0,0,0,0.9)", fontWeight: 1000, fontSize: "1.1rem" }}>
                              {project.deadline || "TBD"}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Box
                        sx={{
                          mt: "auto",
                          pt: 4,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderTop: "1px solid rgba(0,0,0,0.04)",
                        }}
                      >
                        <AvatarGroup
                          max={4}
                          sx={{
                            "& .MuiAvatar-root": {
                              width: 40,
                              height: 40,
                              border: "2px solid #fff",
                              background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
                              color: "#fff",
                              fontWeight: 1000,
                              fontSize: "0.9rem"
                            },
                          }}
                        >
                          {teamMembers.map((m, i) => (
                            <Tooltip key={i} title={m.name || "Specialist"}>
                              <Avatar>{m.name?.[0] || "S"}</Avatar>
                            </Tooltip>
                          ))}
                        </AvatarGroup>

                        <Box sx={{ display: "flex", gap: 2.5 }}>
                          <IconButton
                            sx={{
                              color: "rgba(0,0,0,0.5)",
                              bgcolor: "rgba(0,0,0,0.03)",
                              borderRadius: "16px",
                              p: 1.5,
                              "&:hover": { color: "#00d4ff", bgcolor: "rgba(0,0,0,0.07)" },
                            }}
                            onClick={(e) => handleEdit(e, project._id)}
                          >
                            <EditIcon sx={{ fontSize: 26 }} />
                          </IconButton>
                          <IconButton
                            sx={{
                              color: "rgba(0,0,0,0.5)",
                              bgcolor: "rgba(0,0,0,0.03)",
                              borderRadius: "16px",
                              p: 1.5,
                              "&:hover": { color: "#ff4d4f", bgcolor: alpha("#ff4d4f", 0.05) },
                            }}
                            onClick={(e) => handleDelete(e, project._id)}
                          >
                            <DeleteIcon sx={{ fontSize: 26 }} />
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
      </Box>

      <TaskAssignmentModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectData={selectedProject}
        onSave={(data) => console.log("Saving Assignments:", data)}
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
              await axios.put(`http://localhost:8080/admin/updateProj/${editingProjectData._id}`, finalData, {
                headers: { Authorization: `${token}` }
              });
            } else {
              await axios.post("http://localhost:8080/admin/createProj", finalData, {
                headers: { Authorization: `${token}` }
              });
            }
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
