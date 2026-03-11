/**
 * DepartmentGateway — iOS Liquid Glass UI
 * Inspired by iPhone Control Center aesthetic
 * Soft blurred gradient background + floating liquid glass panels
 */
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

/* ─── iOS Liquid Glass Tokens ─── */
const CARD_H = 420;

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
      borderRadius: "22px",
      background: "rgba(255,255,255,0.22)",
      backdropFilter: "blur(30px)",
      WebkitBackdropFilter: "blur(30px)",
      border: "1px solid rgba(255,255,255,0.4)",
      boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
      p: 3,
    }}
  >
    <Skeleton variant="rounded" width={70} height={70} sx={{ borderRadius: "18px", mb: 3, bgcolor: "rgba(255,255,255,0.35)" }} />
    <Skeleton variant="text" width="55%" height={32} sx={{ mb: 1.5, bgcolor: "rgba(255,255,255,0.3)" }} />
    <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1, bgcolor: "rgba(255,255,255,0.25)" }} />
    <Skeleton variant="text" width="72%" height={20} sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
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
      style={{ height: "100%" }}
    >
      <Box
        onClick={onClick}
        sx={{
          height: CARD_H,
          borderRadius: "22px",
          overflow: "hidden",
          cursor: "pointer",
          position: "relative",

          /* ── iOS liquid glass panel ── */
          background: "rgba(255,255,255,0.22)",
          backdropFilter: "blur(40px) saturate(160%)",
          WebkitBackdropFilter: "blur(40px) saturate(160%)",
          border: "1px solid rgba(255,255,255,0.45)",

          /* Layered shadow: ambient + glow ring */
          boxShadow: [
            "0 8px 32px rgba(0,0,0,0.10)",
            "0 2px 8px rgba(0,0,0,0.06)",
            "inset 0 1px 0 rgba(255,255,255,0.7)",    // top inner edge highlight
            "inset 0 -1px 0 rgba(255,255,255,0.2)",   // bottom inner
          ].join(", "),

          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          p: "22px 22px 18px 22px",
          transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",

          "&:hover": {
            background: "rgba(255,255,255,0.35)",
            border: `1px solid rgba(255,255,255,0.65)`,
            boxShadow: [
              `0 20px 50px rgba(0,0,0,0.13)`,
              `0 0 0 1px ${alpha(cfg.color, 0.18)}`,
              `0 0 28px ${cfg.glow}`,
              "inset 0 1px 0 rgba(255,255,255,0.85)",
            ].join(", "),
            "& .liq-icon": {
              background: cfg.gradient,
              boxShadow: `0 6px 20px ${cfg.glow}`,
              "& svg": { color: "#fff !important" },
            },
            "& .liq-arrow": {
              background: cfg.gradient,
              "& svg": { color: "#fff !important", transform: "translateX(2px)" },
            },
            "& .liq-enter": { color: `${cfg.color} !important` },
          },
        }}
      >
        {/* ── Inner diagonal glass sheen ── */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "21px",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.03) 100%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        {/* ── Corner light refraction (top-right) ── */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 80,
            height: 80,
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.6) 0%, transparent 65%)",
            borderRadius: "0 22px 0 0",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        {/* ── Bottom-left ambient reflection ── */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 65,
            height: 65,
            background:
              "radial-gradient(circle at bottom left, rgba(255,255,255,0.35) 0%, transparent 65%)",
            borderRadius: "0 0 0 22px",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* ── Card content ── */}
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 3 }}>
            {/* Icon */}
            <Box
              className="liq-icon"
              sx={{
                width: 70,
                height: 70,
                borderRadius: "18px",
                background: alpha(cfg.color, 0.14),
                border: `1px solid ${alpha(cfg.color, 0.22)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: cfg.color,
                transition: "all 0.3s ease",
                boxShadow: `0 4px 12px rgba(0,0,0,0.06)`,
                flexShrink: 0,
              }}
            >
              <Box sx={{ fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {cfg.icon}
              </Box>
            </Box>

            {/* Glass label chip */}
            <Box
              sx={{
                px: 2,
                py: 0.75,
                borderRadius: "30px",
                background: "rgba(255,255,255,0.35)",
                border: "1px solid rgba(255,255,255,0.6)",
                backdropFilter: "blur(12px)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.85rem",
                  fontWeight: 900,
                  letterSpacing: 2.2,
                  color: "rgba(30,40,60,0.55)",
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
              color: "rgba(30,40,70,0.5)",
              fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.15rem" },
              lineHeight: 1.7,
              fontWeight: 500,
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

        {/* ── Footer action ── */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            pt: 1.8,
            borderTop: "1px solid rgba(255,255,255,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            className="liq-enter"
            sx={{
              fontSize: "0.95rem",
              fontWeight: 900,
              letterSpacing: 1.8,
              textTransform: "uppercase",
              color: "rgba(30,40,70,0.4)",
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
              borderRadius: "11px",
              background: "rgba(255,255,255,0.4)",
              border: "1px solid rgba(255,255,255,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 6px rgba(0,0,0,0.06)",
            }}
          >
            <ArrowIcon sx={{ fontSize: 22, color: "rgba(30,40,70,0.4)", transition: "all 0.3s ease" }} />
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

        /* ── iOS-style soft gradient background ── */
        background: "linear-gradient(160deg, #dde6f0 0%, #cfd9e8 35%, #c8d5e6 60%, #d4dff0 100%)",
        "&::-webkit-scrollbar": { width: "10px" },
        "&::-webkit-scrollbar-track": { background: "transparent" },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(0,0,0,0.2)",
          borderRadius: "5px",
        },
        "&::-webkit-scrollbar-thumb:hover": { background: "rgba(0,0,0,0.35)" },
      }}
    >
      {/* ── Blurred color orbs — depth behind panels ── */}
      <Box sx={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        {/* Primary orb — top left, blue */}
        <Box
          sx={{
            position: "absolute",
            top: "-8%",
            left: "-5%",
            width: "55vw",
            height: "55vw",
            background: "radial-gradient(circle, rgba(160,185,230,0.55) 0%, transparent 65%)",
            filter: "blur(70px)",
          }}
        />
        {/* Secondary orb — bottom right, cool lavender */}
        <Box
          sx={{
            position: "absolute",
            bottom: "-5%",
            right: "-5%",
            width: "50vw",
            height: "50vw",
            background: "radial-gradient(circle, rgba(180,195,235,0.5) 0%, transparent 65%)",
            filter: "blur(80px)",
          }}
        />
        {/* Centre large soft glow */}
        <Box
          sx={{
            position: "absolute",
            top: "30%",
            left: "30%",
            width: "45vw",
            height: "45vw",
            background: "radial-gradient(circle, rgba(200,215,245,0.35) 0%, transparent 65%)",
            filter: "blur(90px)",
          }}
        />
        {/* ── Very subtle noise texture ── */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
            backgroundSize: "256px 256px",
            opacity: 0.4,
          }}
        />
      </Box>

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
                background: "rgba(255,255,255,0.3)",
                border: "1px solid rgba(255,255,255,0.55)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow:
                  "0 4px 16px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.7)",
              }}
            >
              <BoltIcon sx={{ fontSize: 16, color: "rgba(30,50,100,0.5)" }} />
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  fontWeight: 900,
                  letterSpacing: 3,
                  color: "rgba(30,50,100,0.5)",
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
                color: "rgba(12,20,50,0.85)",
                letterSpacing: "-0.04em",
                lineHeight: 1.1,
                mb: 2.5,
                fontSize: { xs: "2.2rem", sm: "2.5rem", md: "3rem" },
                textShadow: "0 1px 2px rgba(255,255,255,0.4)",
              }}
            >
              Choose Your Division
            </Typography>

            <Typography
              sx={{
                color: "rgba(30,50,90,0.55)",
                maxWidth: 520,
                mx: "auto",
                lineHeight: 1.8,
                fontWeight: 500,
                fontSize: { xs: "1rem", sm: "1.05rem", md: "1.1rem" },
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
              <Grid item xs={12} sm={6} md={4} lg={4} key={dept.id}>
                <DeptCard dept={dept} onClick={() => handleEnter(dept.Dep_id)} index={i} />
              </Grid>
            ))}

          {!loading && departments.length === 0 && (
            <Grid item xs={12}>
              <Box
                sx={{
                  height: CARD_H,
                  borderRadius: "22px",
                  background: "rgba(255,255,255,0.22)",
                  backdropFilter: "blur(30px)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1.5,
                  maxWidth: 420,
                  mx: "auto",
                }}
              >
                <GeneralIcon sx={{ fontSize: 48, color: "rgba(30,50,100,0.2)" }} />
                <Typography sx={{ color: "rgba(30,50,100,0.4)", fontWeight: 700, fontSize: "1rem" }}>
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
