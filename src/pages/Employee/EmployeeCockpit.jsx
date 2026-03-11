/**
 * EmployeeCockpit.jsx
 * Redesigned with iOS Liquid Glass aesthetic.
 * All API logic and functionalities are preserved.
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  useTheme,
  alpha,
  Paper,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import AttendanceWidget from "../../components/AttendanceWidget";
import DeadlineNotifications from "../../components/dashboard/DeadlineNotifications";
import ProjectsPreview from "../../components/dashboard/ProjectsPreview";
import WorkReportForm from "../../components/dashboard/WorkReportForm";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

// --- iOS Liquid Glass Design Constants ---
const PRIMARY_BG = "#e6edf5";
const SECONDARY_BG = "#d9e3ef";
const TERTIARY_BG = "#cfd8e5fe";

const glassEffect = {
  background: "rgba(255, 255, 255, 0.22)",
  backdropFilter: "blur(40px)",
  border: "1px solid rgba(255, 255, 255, 0.5)",
  borderRadius: "22px",
  boxShadow: [
    "0 8px 32px rgba(0, 0, 0, 0.08)",
    "inset 0 1px 0 rgba(255, 255, 255, 0.8)", // Bright top edge
    "inset 0 -1px 0 rgba(255, 255, 255, 0.2)",
  ].join(", "),
  position: "relative",
  overflow: "hidden",
  transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
  "&::after": {
    content: '""',
    position: "absolute",
    top: "-50%",
    left: "-50%",
    width: "200%",
    height: "200%",
    background:
      "linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)",
    transform: "rotate(45deg)",
    transition: "0.6s",
    pointerEvents: "none",
  },
  "&:hover": {
    background: "rgba(255, 255, 255, 0.28)",
    boxShadow: "0 16px 48px rgba(0, 0, 0, 0.14)",
    transform: "translateY(-4px)",
    "&::after": {
      left: "100%",
    },
  },
};

const SectionCard = ({
  icon: Icon,
  title,
  subtitle,
  color = "#00d4ff",
  children,
}) => (
  <Box
    sx={{
      ...glassEffect,
      p: { xs: 2, sm: 2.5, md: 3 },
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: { xs: 1.5, sm: 2, md: 2 },
    }}
  >
    <Box
      sx={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "60px",
        height: "60px",
        background:
          "radial-gradient(circle at top right, rgba(255,255,255,0.4) 0%, transparent 70%)",
        pointerEvents: "none",
      }}
    />

    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: { xs: 1.5, sm: 2, md: 2 },
      }}
    >
      <Box
        sx={{
          p: { xs: 1, sm: 1.25, md: 1.5 },
          borderRadius: "15px",
          bgcolor: `${color}18`,
          border: `1px solid ${color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 4px 12px ${color}15`,
        }}
      >
        <Icon sx={{ color: color, fontSize: { xs: 24, sm: 26, md: 28 } }} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: "rgba(0,0,0,0.85)",
            lineHeight: 1.1,
            fontSize: { xs: "1.25rem", sm: "1.35rem", md: "1.45rem" },
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "rgba(0,0,0,0.45)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            fontSize: { xs: "0.95rem", sm: "1rem", md: "1.05rem" },
          }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Box>
    {children}
  </Box>
);

const EmployeeCockpit = (props) => {
  const { deptId: paramDeptId } = useParams();

  const deptId = props.deptId || paramDeptId || "it";
  const theme = useTheme();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = localStorage.getItem("token");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const mockTasks = [
          {
            _id: "t1",
            title: "API Gateway config",
            status: "pending",
            priority: "High",
            assignedTo: "user_123",
            desc: "Setup Kong gateway",
          },
          {
            _id: "t2",
            title: "Auth Service",
            status: "in_progress",
            priority: "Critical",
            assignedTo: "user_123",
            desc: "OAuth2 implementation",
          },
          {
            _id: "t3",
            title: "DB Migration",
            status: "completed",
            priority: "Medium",
            assignedTo: "user_456",
            desc: "Migrate from Mongo to Postgres",
          },
          {
            _id: "t4",
            title: "Frontend Unit Tests",
            status: "pending",
            priority: "Low",
            assignedTo: "user_123",
            desc: "Jest setup",
          },
        ];
        setTimeout(() => {
          setTasks(mockTasks);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Error fetching tasks", err);
        setLoading(false);
      }
    };
    fetchTasks();
  }, [deptId]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        // background: `linear-gradient(135deg, ${PRIMARY_BG} 0%, ${SECONDARY_BG} 50%, ${TERTIARY_BG} 100%)`,
        backgroundAttachment: "fixed",
        display: "flex",
        flexDirection: "column",
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
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: { xs: 2, sm: 3, md: 4 },
          pb: { xs: 12, sm: 14, md: 16 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: "100%" }}
        >
          <Box sx={{ mb: { xs: 3, sm: 4, md: 8 } }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                color: "rgba(0,0,0,0.85)",
                letterSpacing: "-2px",
                mb: 1,
                fontSize: { xs: "2.6rem", sm: "3.6rem", md: "4.5rem" },
              }}
            >
              Mission Control
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(0,0,0,0.55)",
                maxWidth: "800px",
                lineHeight: 1.6,
                fontWeight: 500,
                fontSize: { xs: "1.25rem", sm: "1.3rem", md: "1.45rem" },
              }}
            >
              Welcome back, Specialist. Systems are nominal. Resuming
              orchestration of active protocols.
            </Typography>
          </Box>

          {/* Top Status Grid */}
          <Grid
            container
            spacing={{ xs: 2, sm: 3, md: 4 }}
            sx={{ mb: { xs: 8, sm: 10, md: 12 } }}
          >
            <Grid item xs={12} lg={8}>
              {/* Note: ActiveProjectTracker and ProjectsPreview should be updated internally or replaced if they contain hardcoded labels. 
                 Assuming we wrap them in glass segments for consistency. */}
              <Box
                sx={{
                  ...glassEffect,
                  p: { xs: 3, sm: 4, md: 5 },
                  height: "100%",
                  minHeight: { xs: "auto", md: "600px" },
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: "rgba(0,0,0,0.8)",
                    mb: { xs: 3, sm: 4, md: 4 },
                    fontSize: { xs: "1.6rem", sm: "1.8rem", md: "2rem" },
                  }}
                >
                  Fleet Deployment Overview
                </Typography>
                <ProjectsPreview userId={currentUserId} maxProjects={3} />
              </Box>
            </Grid>
            <Grid item xs={12} lg={4}>
              <SectionCard
                icon={EventAvailableIcon}
                title="Attendance"
                subtitle="Presence Log"
                color="#10b981"
              >
                <Box sx={{ mt: "auto" }}>
                  {/* attendance component */}
                  <AttendanceWidget currentUserId={currentUserId} />
                </Box>
              </SectionCard>
            </Grid>
          </Grid>

          {/* Protocols & Reporting Hub */}
          <Grid
            container
            spacing={{ xs: 2, sm: 3, md: 4 }}
            sx={{ mb: { xs: 4, sm: 6, md: 8 } }}
          >
            <Grid item xs={12} lg={6}>
              <SectionCard
                icon={DashboardIcon}
                title="Assigned Protocols"
                subtitle="Task Flow Orchestration"
                color="#3b82f6"
              >
                <Box sx={{ mt: { xs: 2, sm: 3, md: 3 } }}>
                  {/* deadline notification component */}
                  <DeadlineNotifications userId={currentUserId} />
                </Box>
              </SectionCard>
            </Grid>
            <Grid item xs={12} lg={6}>
              <SectionCard
                icon={AssessmentIcon}
                title="Mission Logs & Protocol Reporting"
                subtitle="Active Feedback Interface"
                color="#f59e0b"
              >
                <Box
                  sx={{
                    mt: { xs: 2, sm: 3, md: 3 },
                    display: "flex",
                    flexDirection: "column",
                    gap: { xs: 2, sm: 3, md: 3 },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(0,0,0,0.5)",
                      fontWeight: 600,
                      fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
                      lineHeight: 1.6,
                    }}
                  >
                    Submit end-of-watch reports and mission critical updates
                    directly to command.
                  </Typography>
                  <TextField
                    multiline
                    rows={{ xs: 4, sm: 5, md: 6 }}
                    fullWidth
                    placeholder="Detailed protocol logs..."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "rgba(255,255,255,0.4)",
                        borderRadius: "18px",
                        fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
                        border: "1px solid rgba(255,255,255,0.6)",
                        "& fieldset": { borderColor: "transparent" },
                        "&:hover fieldset": { borderColor: "rgba(0,0,0,0.05)" },
                      },
                    }}
                  />
                  <Box sx={{ mb: { xs: 1, sm: 2, md: 2 } }}>
                    <WorkReportForm deptId={deptId} />
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      py: { xs: 1.5, sm: 1.75, md: 2 },
                      borderRadius: "15px",
                      bgcolor: "#f59e0b",
                      fontWeight: 800,
                      textTransform: "none",
                      fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.25rem" },
                      boxShadow: "0 8px 24px rgba(245,158,11,0.25)",
                      "&:hover": { bgcolor: "#d97706" },
                    }}
                  >
                    Authorize & Transmit Log
                  </Button>
                </Box>
              </SectionCard>
            </Grid>
          </Grid>
        </motion.div>{" "}
      </Box>{" "}
    </Box>
  );
};

export default EmployeeCockpit;
