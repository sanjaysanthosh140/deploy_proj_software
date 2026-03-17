import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Container,
  alpha,
  Stack,
  Skeleton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { useToast } from "../../context/ToastContext";
import {
  Code as CodeIcon,
  Campaign as MarketingIcon,
  Groups as HRIcon,
  AccountBalance as FinanceIcon,
  DesignServices as DesignIcon,
  Business as GeneralIcon,
  ArrowForward as ArrowIcon,
  Bolt as BoltIcon,
} from "@mui/icons-material";

/* ─── Standard White Theme Tokens ─── */
const CARD_H = 440;
const PRIMARY_BG = "#fcfcfc";
const SECONDARY_BG = "#ffffff";
const TERTIARY_BG = "#f5f5f5";

/* ─── Department accent map ─── */
const getDeptConfig = (id = "") => {
  const map = {
    it: {
      color: "#5e6ad2",
      gradient: "linear-gradient(145deg, #6366f1, #4338ca)",
      glow: "rgba(99,102,241,0.22)",
      icon: <CodeIcon sx={{ fontSize: 24 }} />,
      label: "IT",
    },
    marketing: {
      color: "#e0578a",
      gradient: "linear-gradient(145deg, #ec4899, #be185d)",
      glow: "rgba(236,72,153,0.2)",
      icon: <MarketingIcon sx={{ fontSize: 24 }} />,
      label: "MKT",
    },
    hr: {
      color: "#7c5cbf",
      gradient: "linear-gradient(145deg, #8b5cf6, #6d28d9)",
      glow: "rgba(139,92,246,0.2)",
      icon: <HRIcon sx={{ fontSize: 24 }} />,
      label: "HR",
    },
    finance: {
      color: "#0e9f6e",
      gradient: "linear-gradient(145deg, #10b981, #047857)",
      glow: "rgba(16,185,129,0.2)",
      icon: <FinanceIcon sx={{ fontSize: 24 }} />,
      label: "FIN",
    },
    design: {
      color: "#d18b10",
      gradient: "linear-gradient(145deg, #f59e0b, #b45309)",
      glow: "rgba(245,158,11,0.2)",
      icon: <DesignIcon sx={{ fontSize: 24 }} />,
      label: "DES",
    },
  };
  return map[id.toLowerCase()] || {
    color: "#64748b",
    gradient: "linear-gradient(145deg, #64748b, #334155)",
    glow: "rgba(100,116,139,0.2)",
    icon: <GeneralIcon sx={{ fontSize: 24 }} />,
    label: "GEN",
  };
};

/* ─── Skeleton while loading ─── */
const SkeletonCard = () => (
  <Box
    sx={{
      height: CARD_H,
      borderRadius: "20px",
      background: "#ffffff",
      border: "1px solid #eaeaea",
      boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
      p: 3,
    }}
  >
    <Skeleton variant="rounded" width={70} height={70} sx={{ borderRadius: "16px", mb: 3 }} />
    <Skeleton variant="text" width="55%" height={32} sx={{ mb: 1.5 }} />
    <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
    <Skeleton variant="text" width="72%" height={20} />
  </Box>
);

/* ─── Liquid Glass Card ─── */
const DeptCard = ({ dept, onClick, index }) => {
  const cfg = getDeptConfig(dept.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -7, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      style={{ height: "100%", width: "100%" }}
    >
      <Box
        onClick={onClick}
        sx={{
          height: CARD_H,
          width: "100%",
          borderRadius: "20px",
          overflow: "hidden",
          cursor: "pointer",
          position: "relative",
          bgcolor: "#ffffff",
          border: "1px solid #eaeaea",
          boxShadow: "0 15px 35px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          p: { xs: 4, md: 5 },
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",

          "&:hover": {
            transform: "translateY(-10px)",
            boxShadow: `0 30px 60px rgba(0,0,0,0.08)`,
            borderColor: cfg.color,
            "& .liq-icon": {
              background: cfg.color,
              color: "#fff",
              boxShadow: `0 8px 20px ${alpha(cfg.color, 0.3)}`,
            },
            "& .liq-arrow": {
              background: "#1a1a1a",
              color: "#fff",
              borderColor: "#1a1a1a",
              "& svg": { color: "#fff", transform: "translateX(3px)" },
            },
            "& .liq-enter": { color: "#1a1a1a" },
          },
        }}
      >

        {/* ── Card content ── */}
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Stack direction="column" alignItems="center" justifyContent="center" sx={{ mb: 4 }}>
            {/* Icon */}
            <Box
              className="liq-icon"
              sx={{
                width: 85,
                height: 85,
                borderRadius: "22px",
                background: alpha(cfg.color, 0.08),
                border: `1px solid ${alpha(cfg.color, 0.15)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: cfg.color,
                transition: "all 0.3s ease",
                boxShadow: `0 8px 20px rgba(0,0,0,0.04)`,
                flexShrink: 0,
                mb: 3,
              }}
            >
              <Box sx={{ fontSize: 45, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {cfg.icon}
              </Box>
            </Box>

            {/* Label chip */}
            <Box
              sx={{
                px: 2.5,
                py: 0.8,
                borderRadius: "30px",
                background: "#f8f9fa",
                border: "1px solid #efefef",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.85rem",
                  fontWeight: 900,
                  letterSpacing: 2.2,
                  color: "#757575",
                  textTransform: "uppercase",
                }}
              >
                {cfg.label}
              </Typography>
            </Box>
          </Stack>

          <Typography
            sx={{
              fontWeight: 800,
              color: "rgba(15,20,40,0.88)",
              mb: 1.5,
              letterSpacing: "-0.03em",
              fontSize: { xs: "1.4rem", sm: "1.7rem", md: "1.9rem" },
              lineHeight: 1.3,
            }}
          >
            {dept.title}
          </Typography>

          <Typography
            sx={{
              color: "#6b7280",
              fontSize: { xs: "0.95rem", sm: "1rem" },
              lineHeight: 1.6,
              fontWeight: 500,
              maxWidth: "90%",
              mx: "auto",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {dept.description ||
              "Access departmental tools, track progress, and manage team workflows."}
          </Typography>
        </Box>

        {/* ── Footer Action (Centered) ── */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            pt: 3,
            borderTop: "1px solid #f0f0f0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            className="liq-enter"
            sx={{
              fontSize: "0.95rem",
              fontWeight: 900,
              letterSpacing: 1.8,
              textTransform: "uppercase",
              color: "#9e9e9e",
              transition: "color 0.3s ease",
            }}
          >
            Enter Department
          </Typography>

            <Box
              className="liq-arrow"
              sx={{
                width: 42,
                height: 42,
                borderRadius: "12px",
                background: "#f5f5f5",
                border: "1px solid #eaeaea",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
              }}
            >
              <ArrowIcon sx={{ fontSize: 22, color: "#9e9e9e", transition: "all 0.3s ease" }} />
            </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

/* ─── Main Page ─── */
const DepartmentGateway = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:8080/admin/departments")
      .then((res) => { setDepartments(res.data); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
  }, []);

  const handleEnter = async (deptId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("Authentication required. Please log in.", "warning");
        navigate("/login");
        return;
      }

      const res = await axios.get("http://localhost:8080/employee_profile", {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log(res.data);
      const employeeData = res.data;

      const employeeDept = employeeData[0].department;
      const employeeName = employeeData[0].name;

      // Ensure friendly capitalization
      const deptDisplay = departments.find(d => d.Dep_id === deptId)?.title || deptId.toUpperCase();
      const userDeptDisplay = departments.find(d => d.Dep_id === employeeDept)?.title || employeeDept.toUpperCase();

      if (employeeDept === deptId) {
        showToast(`Welcome back, ${employeeName}! Entering ${deptDisplay}.`, "success");
        navigate(`/employee/cockpit/${deptId}`);
      } else {
        showToast(`Hi ${employeeName}, you currently only have access to the ${userDeptDisplay} department.`, "warning");
      }
    } catch (error) {
      console.error("Authorization check failed:", error);
      showToast("Failed to verify authorization. Please check your connection.", "error");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        overflowY: "auto",
        pt: { xs: 8, md: 10 },
        pb: 10,

        /* ── Modern Slate Background ── */
        bgcolor: "#fcfcfc",
        "&::-webkit-scrollbar": { width: "10px" },
        "&::-webkit-scrollbar-track": { background: "transparent" },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(0,0,0,0.1)",
          borderRadius: "5px",
        },
        "&::-webkit-scrollbar-thumb:hover": { background: "rgba(0,0,0,0.2)" },
      }}
    >
      {/* ── Blurred color orbs — depth behind panels ── */}

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>

        {/* ── Header — also liquid glass ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Box sx={{ textAlign: "center", mb: 8 }}>
            {/* Pill label */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                mb: 3,
                px: 3,
                py: 1.2,
                borderRadius: "30px",
                background: "#ffffff",
                border: "1px solid #eaeaea",
                boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
              }}
            >
              <BoltIcon sx={{ fontSize: 16, color: "rgba(30,50,100,0.5)" }} />
              <Typography
                sx={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  letterSpacing: 2,
                  color: "#9e9e9e",
                  textTransform: "uppercase",
                }}
              >
                Department Portal
              </Typography>
            </Box>

            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                color: "#1a1a1a",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                mb: 2.5,
                fontSize: { xs: "2.4rem", sm: "2.8rem", md: "3.2rem" },
              }}
            >
              Choose Your Division
            </Typography>

            <Typography
              sx={{
                color: "#6b7280",
                maxWidth: 520,
                mx: "auto",
                lineHeight: 1.6,
                fontWeight: 500,
                fontSize: { xs: "1rem", sm: "1.05rem" },
              }}
            >
              Select your department to access your workspace, track tasks,
              and collaborate with your team.
            </Typography>
          </Box>
        </motion.div>

        {/* ── Cards Grid ── */}
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3.5 }} justifyContent="center">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={`sk-${i}`}>
                <SkeletonCard />
              </Grid>
            ))
            : departments.map((dept, i) => (
              <Grid item xs={12} sm={6} md={6} lg={4} key={dept.id} sx={{ display: "flex" }}>
                <DeptCard dept={dept} onClick={() => handleEnter(dept.Dep_id)} index={i} />
              </Grid>
            ))}

          {!loading && departments.length === 0 && (
            <Grid item xs={12}>
              <Box
                sx={{
                  height: CARD_H,
                  width: "100%",
                  borderRadius: "20px",
                  background: "#ffffff",
                  border: "1px solid #eaeaea",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  maxWidth: 420,
                  mx: "auto",
                }}
              >
                <GeneralIcon sx={{ fontSize: 48, color: "#9e9e9e", opacity: 0.5 }} />
                <Typography sx={{ color: "#9e9e9e", fontWeight: 700, fontSize: "1rem" }}>
                  No departments available
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default DepartmentGateway;
