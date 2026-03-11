
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

// --- iOS Liquid Glass Design Constants ---
const PRIMARY_BG = "#ffffff";
const SECONDARY_BG = "#eff2f5";
const TERTIARY_BG = "#e9eef5";

const glassEffect = {
  background: "rgba(255, 255, 255, 0.25)",
  backdropFilter: "blur(30px) saturate(160%)",
  border: "1px solid rgba(255, 255, 255, 0.45)",
  borderRadius: "22px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.5)",
  transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  position: "relative",
  overflow: "visible",
};

const iPhoneGlassButton = {
  background: "rgba(255, 255, 255, 0.3)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.45)",
  borderRadius: "16px",
  color: "rgba(0, 0, 0, 0.8)",
  fontWeight: 1000,
  textTransform: "none",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s ease",
  "& .MuiButton-startIcon svg": { fontSize: 24 },
  "& .MuiButton-endIcon svg": { fontSize: 24 },
  "&:hover": {
    background: "rgba(255, 255, 255, 0.45)",
    transform: "translateY(-2px)",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.65)",
  }
};

const GlassCard = ({ children, sx = {}, hoverEffect = true, onClick }) => (
  <Card
    component={motion.div}
    {...(hoverEffect ? {
      whileHover: {
        translateY: -8,
        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.12)",
        background: "rgba(255, 255, 255, 0.35)",
        borderColor: "rgba(255, 255, 255, 0.6)",
      }
    } : {})}
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 150, damping: 20 }}
    onClick={onClick}
    sx={{
      ...glassEffect,
      p: 0,
      m: 0,
      display: "flex",
      flexDirection: "column",
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
        background: `linear-gradient(135deg, ${PRIMARY_BG} 0%, ${SECONDARY_BG} 50%, ${TERTIARY_BG} 100%)`,
        position: "relative",
        overflow: "hidden",
        p: { xs: 2, sm: 3, md: 4 },
        color: "rgba(0,0,0,0.85)",
      }}
    >
      {/* Background Mesh Blobs */}
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: "none" }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          style={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: "65vw",
            maxWidth: "100%",
            height: "65vw",
            maxHeight: "100%",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
          transition={{ duration: 30, repeat: Infinity }}
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "-5%",
            width: "60vw",
            maxWidth: "100%",
            height: "60vw",
            maxHeight: "100%",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)",
            filter: "blur(120px)",
          }}
        />
      </Box>
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
              sx={{ ...iPhoneGlassButton, mb: 4, px: 3, py: 1.2 }}
            >
              Back to Command Center
            </Button>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 1000,
                fontSize: { xs: "2rem", sm: "2.8rem", md: "4.5rem" },
                letterSpacing: { xs: "-0.02em", md: "-0.04em" },
                mb: 1.5,
                color: "rgba(0,0,0,0.85)",
                lineHeight: 1.05,
              }}
            >
              Projects
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "rgba(0,0,0,0.45)", fontWeight: 700, maxWidth: 700, lineHeight: 1.6, letterSpacing: 0.2 }}
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
                  <SearchIcon sx={{ color: "rgba(0,0,0,0.4)", fontSize: 26, ml: 1 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: "100%", sm: 480 },
              "& .MuiOutlinedInput-root": {
                ...glassEffect,
                borderRadius: "20px",
                fontWeight: 800,
                px: 1,
                py: 0.8,
                "& fieldset": { border: "none" },
                "&:hover": { background: "rgba(255, 255, 255, 0.4)" },
                "&.Mui-focused": {
                  background: "rgba(255, 255, 255, 0.5)",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                },
              },
            }}
          />
        </Box>
      </Box>

      {/* Projects Grid */}
      {loading ? (
        <Grid container spacing={6}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} key={i}>
              <GlassCard sx={{ p: 4, height: 450 }}>
                <Skeleton
                  variant="rounded"
                  width={64}
                  height={64}
                  sx={{ bgcolor: "rgba(0, 0, 0, 0.05)", borderRadius: "18px", mb: 3 }}
                />
                <Skeleton variant="text" width="60%" height={40} sx={{ bgcolor: "rgba(0,0,0,0.05)", mb: 2 }} />
                <Skeleton variant="text" width="90%" height={24} sx={{ bgcolor: "rgba(0,0,0,0.03)", mb: 1 }} />
                <Skeleton variant="text" width="80%" height={24} sx={{ bgcolor: "rgba(0,0,0,0.03)", mb: 3 }} />
                <Box sx={{ mt: "auto" }}>
                  <Skeleton variant="rounded" height={10} sx={{ bgcolor: "rgba(0,0,0,0.05)", borderRadius: 5 }} />
                </Box>
              </GlassCard>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={6} sx={{ position: "relative", zIndex: 1, alignItems: "stretch" }}>
          {filteredProjects.map((project, index) => {
            const teamMembers = project.teamMembers || [];
            const tasks = project.todos || [];
            const completedTasks = tasks.filter((t) => t.status === "completed").length;
            const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
            const sc = getStatusColor(project.status || "Active");

            return (
              <Grid item xs={12} sm={6} key={project._id} sx={{ display: "flex" }}>
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
                  <Box
                    sx={{
                      p: 4.5,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Top Row */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 4,
                      }}
                    >
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: "20px",
                          background: "rgba(255, 255, 255, 0.4)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: sc,
                          border: "1px solid rgba(255, 255, 255, 0.6)",
                          boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
                        }}
                      >
                        <FolderIcon sx={{ fontSize: 36 }} />
                      </Box>

                      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                        <Chip
                          label={project.status || "Active"}
                          size="small"
                          sx={{
                            bgcolor: `${sc}15`,
                            color: sc,
                            fontWeight: 1000,
                            fontSize: "0.8rem",
                            textTransform: "uppercase",
                            letterSpacing: 1.2,
                            borderRadius: "10px",
                            px: 1
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            color: "rgba(0, 0, 0, 0.3)",
                            bgcolor: "rgba(0, 0, 0, 0.03)",
                            "&:hover": { color: "#000", background: "rgba(0, 0, 0, 0.06)" },
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Meta Reference */}
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(0,0,0,0.35)",
                        fontWeight: 900,
                        letterSpacing: 3,
                        textTransform: "uppercase",
                        mb: 2,
                        display: "block",
                        fontSize: "0.75rem"
                      }}
                    >
                      REF_ID: {project._id.substring(project._id.length - 8).toUpperCase()}
                    </Typography>

                    <Typography
                      sx={{
                        color: "rgba(0,0,0,0.85)",
                        fontWeight: 1000,
                        fontSize: "1.85rem",
                        mb: 2,
                        lineHeight: 1.1,
                        letterSpacing: "-1px"
                      }}
                    >
                      {project.title}
                    </Typography>

                    <Typography
                      sx={{
                        color: "rgba(0,0,0,0.45)",
                        mb: 5,
                        lineHeight: 1.6,
                        fontWeight: 600,
                        fontSize: "1.05rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        minHeight: 72,
                      }}
                    >
                      {project.description}
                    </Typography>

                    {/* Progress Section */}
                    <Box
                      sx={{
                        mb: 5,
                        background: "rgba(0, 0, 0, 0.03)",
                        p: 3,
                        borderRadius: "20px",
                        border: "1px solid rgba(0,0,0,0.04)",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: "rgba(0,0,0,0.35)", fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.8 }}
                        >
                          Deployment Velocity
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: sc, fontWeight: 1000, fontSize: "1rem" }}
                        >
                          {progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          bgcolor: "rgba(0, 0, 0, 0.06)",
                          "& .MuiLinearProgress-bar": {
                            background: `linear-gradient(90deg, ${sc}, ${alpha(sc, 0.7)})`,
                            borderRadius: 5,
                            boxShadow: `0 0 15px ${alpha(sc, 0.4)}`,
                          },
                        }}
                      />
                    </Box>

                    {/* Metadata Grid */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      <Grid item xs={6}>
                        <Box sx={{ borderLeft: `4px solid ${getPriorityColor(project.priority)}`, pl: 2.5 }}>
                          <Typography
                            sx={{ color: "rgba(0,0,0,0.35)", fontSize: "0.75rem", fontWeight: 900, textTransform: "uppercase", mb: 0.5 }}
                          >
                            Priority
                          </Typography>
                          <Typography
                            sx={{ color: "rgba(0,0,0,0.8)", fontWeight: 1000, fontSize: "1.1rem" }}
                          >
                            {project.priority || "Medium"}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ borderLeft: "4px solid rgba(0, 0, 0, 0.06)", pl: 2.5 }}>
                          <Typography
                            sx={{ color: "rgba(0,0,0,0.35)", fontSize: "0.75rem", fontWeight: 900, textTransform: "uppercase", mb: 0.5 }}
                          >
                            Deadline
                          </Typography>
                          <Typography
                            sx={{ color: "rgba(0,0,0,0.8)", fontWeight: 1000, fontSize: "1.1rem" }}
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
                        pt: 4,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid rgba(0,0,0,0.06)",
                      }}
                    >
                      <AvatarGroup
                        max={4}
                        sx={{
                          "& .MuiAvatar-root": {
                            width: 44,
                            height: 44,
                            fontSize: "1rem",
                            border: "3px solid rgba(255,255,255,0.8)",
                            background: "linear-gradient(135deg, #000, #333)",
                            color: "#fff",
                            fontWeight: 900,
                            boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
                          },
                        }}
                      >
                        {teamMembers.map((m, i) => (
                          <Tooltip key={i} title={m.name || "Specialist"}>
                            <Avatar>
                              {m.name?.split(" ").map((n) => n[0]).join("") || "S"}
                            </Avatar>
                          </Tooltip>
                        ))}
                      </AvatarGroup>

                      <Box sx={{ display: "flex", gap: 2 }}>
                        <IconButton
                          size="small"
                          sx={{
                            color: "rgba(0,0,0,0.4)",
                            bgcolor: "rgba(0,0,0,0.03)",
                            borderRadius: "12px",
                            p: 1.2,
                            "&:hover": { color: "#000", bgcolor: "rgba(0,0,0,0.06)" },
                          }}
                          onClick={(e) => { handleEdit(e, project._id) }}
                        >
                          <EditIcon sx={{ fontSize: 24 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{
                            color: "rgba(0,0,0,0.4)",
                            bgcolor: "rgba(0,0,0,0.03)",
                            borderRadius: "12px",
                            p: 1.2,
                            "&:hover": { color: "#ff4d4f", bgcolor: alpha("#ff4d4f", 0.1) },
                          }}
                          onClick={(e) => { handleDelete(e, project._id) }}
                        >
                          <DeleteIcon sx={{ fontSize: 24 }} />
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
                width: 160,
                height: 160,
                borderRadius: "44px",
                background: "rgba(255, 255, 255, 0.3)",
                backdropFilter: "blur(20px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 36px",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                color: "rgba(0, 0, 0, 0.15)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
              }}
            >
              <SearchIcon sx={{ fontSize: 72 }} />
            </Box>
            <Typography
              variant="h4"
              sx={{ color: "rgba(0,0,0,0.85)", fontWeight: 1000, mb: 2, letterSpacing: "-0.03em" }}
            >
              Zero Stream Matches
            </Typography>
            <Typography sx={{ color: "rgba(0,0,0,0.45)", fontWeight: 700, maxWidth: 450, mx: "auto", lineHeight: 1.6 }}>
              The system was unable to identify any project intelligence archives matching your current query parameters.
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
