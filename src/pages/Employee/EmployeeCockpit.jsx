/**
 * AntyGravity Instruction:
 * Apply rules from /docs/component_analysis_prompt.md
 */
import React, { useState, useEffect } from "react";
import { Box, Grid, Typography, useTheme, alpha } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import ActiveProjectTracker from "../../components/dashboard/ActiveProjectTracker";
import ProjectBoard from "../../components/dashboard/ProjectBoard";
import WorkReportForm from "../../components/dashboard/WorkReportForm";
import AttendanceWidget from "../../components/AttendanceWidget";
import DeadlineNotifications from "../../components/dashboard/DeadlineNotifications";
import ProjectsPreview from "../../components/dashboard/ProjectsPreview";
import axios from "axios";

// Mock Data for Active Project
const mockActiveProject = {
  title: "AI-Powered Analytics Engine",
  description:
    "Developing a predictive analysis model for user behavior tracking using Python and TensorFlow.",
  progress: 78,
  deadline: "2024-11-30",
};

const PRIMARY_SLATE = "#0f172a";
const SECONDARY_SLATE = "#475569";
const INDIGO_ACCENT = "#4f46e5";
const GLASS_BORDER = "rgba(10, 15, 25, 0.08)";

const EmployeeCockpit = (props) => {
  const { deptId: paramDeptId } = useParams();
  const deptId = props.deptId || paramDeptId || "it"; // Default to IT
  const theme = useTheme();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock User ID for role logic (In real app, get from Auth Context)
  const currentUserId = localStorage.getItem("token");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Simulating API call or using real one if available
        // const res = await axios.get(`http://localhost:8080/admin/get_kanban_task?dept=${deptId}`);
        // setTasks(res.data);

        // Fallback Mock Data
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
          }, // Not assigned to user
          {
            _id: "t4",
            title: "Frontend Unit Tests",
            status: "pending",
            priority: "Low",
            assignedTo: "user_123",
            desc: "Jest setup",
          },
        ];

        // Simulate delay
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
        minHeight: "100vh",
        pb: 6,
        bgcolor: "#f8fafc",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Background Mesh Gradients */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "-5%",
            right: "5%",
            width: "50vw",
            height: "50vw",
            background: "radial-gradient(circle, rgba(79, 70, 229, 0.04) 0%, rgba(255,255,255,0) 70%)",
            filter: "blur(80px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "10%",
            left: "5%",
            width: "40vw",
            height: "40vw",
            background: "radial-gradient(circle, rgba(15, 23, 42, 0.03) 0%, rgba(255,255,255,0) 70%)",
            filter: "blur(100px)",
          }}
        />
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 125,
          damping: 22,
          mass: 1
        }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Typography
            variant="h4"
            sx={{
              mb: 1,
              fontWeight: 900,
              color: PRIMARY_SLATE,
              letterSpacing: "-0.03em",
            }}
          >
            Mission Control
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: SECONDARY_SLATE,
              fontWeight: 500,
              maxWidth: "600px"
            }}
          >
            Welcome back, Specialist. Systems are nominal. Resuming orchestration of active protocols.
          </Typography>

          {/* Deadline Notifications */}
          <DeadlineNotifications userId={currentUserId} />

          {/* Projects Preview with View/Enroll Options */}
          <ProjectsPreview userId={currentUserId} maxProjects={3} />

          {/* Top Row: Active Project & Quick Reporting */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <ActiveProjectTracker project={mockActiveProject} />
            </Grid>
            <Grid item xs={12} md={4}>
              <AttendanceWidget currentUserId={currentUserId} />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={12}>
              <WorkReportForm deptId={deptId} />
            </Grid>
          </Grid>

          {/* Middle Row: Kanban Board */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: 800,
                color: PRIMARY_SLATE,
                letterSpacing: "-0.02em"
              }}
            >
              Active Operations
            </Typography>
            <ProjectBoard
              tasks={tasks}
              setTasks={setTasks}
              currentUserId={currentUserId}
            />
          </Box>

          {/* Bottom Row: History */}
        </Box>
      </motion.div>
    </Box>
  );
};

export default EmployeeCockpit;
