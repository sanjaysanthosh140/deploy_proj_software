/**
 * Login — iOS Liquid Glass UI
 * All API logic preserved exactly.
 * Design: frosted glass panel over soft blurred gradient background.
 */
import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  alpha,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Stack,
  Alert,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import { motion } from "framer-motion";
import { Bolt as BoltIcon } from "@mui/icons-material";

/* ─── All original API logic untouched below ─── */
const Login = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setformData] = useState({ email: "", password: "" });
  const [alertStatus, setAlertStatus] = useState(null); // "error" or "success"
  const [alertMessage, setAlertMessage] = useState("");

  const handleChnage = (e) => {
    try {
      const { name, value } = e.target;
      setformData((preve) => ({ ...preve, [name]: value }));
    } catch (error) {
      console.log(error);
    }
  };

  const handle_submit = async () => {
    try {
      if (formData.email && formData.password) {
        const res = await axios.post("http://localhost:8080/login", formData, {
          headers: { "Content-Type": "application/json" },
        });
        if (res.status === 200) {
          setAlertStatus("success");
          setAlertMessage("Login successful! Redirecting...");
          showToast("Login successful!", "success");
          console.log(res.data);
          localStorage.setItem("token", res.data.token);
          setTimeout(() => { navigate("/app/gateway"); }, 1000);
        }
      } else {
        setAlertStatus("error");
        setAlertMessage("Please fill in all fields");
        showToast("Please fill in all fields", "warning");
      }
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        // Invalid email or password
        setAlertStatus("error");
        setAlertMessage(error.response?.data?.message || "Invalid email or password. Please try again.");
      } else if (error.response?.status >= 500) {
        // Server error
        setAlertStatus("error");
        setAlertMessage("Server error. Please try again later.");
      } else {
        setAlertStatus("error");
        setAlertMessage(error.response?.data?.message || "Login failed. Please check your credentials.");
      }
      showToast("Login failed", "error");
    }
  };

  /* ── Shared glass input style ── */
  const inputSx = {
    mb: 2,
    "& .MuiOutlinedInput-root": {
      borderRadius: "14px",
      background: "rgba(255,255,255,0.28)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      transition: "all 0.25s ease",
      "& fieldset": {
        borderColor: "rgba(255,255,255,0.5)",
        borderWidth: "1px",
      },
      "&:hover fieldset": {
        borderColor: "rgba(255,255,255,0.75)",
      },
      "&.Mui-focused": {
        background: "rgba(255,255,255,0.38)",
        "& fieldset": {
          borderColor: "rgba(255,255,255,0.9)",
          borderWidth: "1.5px",
        },
      },
    },
    "& input": {
      color: "rgba(12,20,50,0.85)",
      fontWeight: 600,
      fontSize: "0.92rem",
      "&::placeholder": { color: "rgba(30,50,100,0.38)", opacity: 1 },
    },
    "& .MuiInputAdornment-root svg": {
      color: "rgba(30,50,100,0.35)",
      fontSize: "19px",
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        p: 2,
        /* iOS-style soft gradient background */
        background: "linear-gradient(160deg, #dde6f0 0%, #cfd9e8 35%, #c8d5e6 60%, #d4dff0 100%)",
      }}
    >
      {/* ── Blurred background orbs ── */}
      <Box sx={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <Box sx={{
          position: "absolute", top: "-10%", left: "-5%",
          width: "55vw", height: "55vw",
          background: "radial-gradient(circle, rgba(160,185,230,0.6) 0%, transparent 65%)",
          filter: "blur(70px)",
        }} />
        <Box sx={{
          position: "absolute", bottom: "-5%", right: "-5%",
          width: "50vw", height: "50vw",
          background: "radial-gradient(circle, rgba(180,195,235,0.55) 0%, transparent 65%)",
          filter: "blur(80px)",
        }} />
        <Box sx={{
          position: "absolute", top: "40%", left: "35%",
          width: "40vw", height: "40vw",
          background: "radial-gradient(circle, rgba(200,215,245,0.4) 0%, transparent 65%)",
          filter: "blur(90px)",
        }} />
      </Box>

      {/* ── Liquid Glass Login Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}
      >
        <Box
          sx={{
            width: "100%",
            p: { xs: 4, md: 5 },
            borderRadius: "28px",
            overflow: "hidden",
            position: "relative",

            /* Liquid glass surface */
            background: "rgba(255,255,255,0.22)",
            backdropFilter: "blur(40px) saturate(160%)",
            WebkitBackdropFilter: "blur(40px) saturate(160%)",
            border: "1px solid rgba(255,255,255,0.50)",
            boxShadow: [
              "0 24px 64px rgba(0,0,0,0.12)",
              "0 8px 24px rgba(0,0,0,0.06)",
              "inset 0 1.5px 0 rgba(255,255,255,0.75)",
              "inset 0 -1px 0 rgba(255,255,255,0.2)",
            ].join(", "),
          }}
        >
          {/* Inner diagonal sheen */}
          <Box sx={{
            position: "absolute", inset: 0, borderRadius: "27px",
            background: "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.02) 100%)",
            pointerEvents: "none", zIndex: 0,
          }} />
          {/* Top-right corner sparkle */}
          <Box sx={{
            position: "absolute", top: 0, right: 0, width: 90, height: 90,
            background: "radial-gradient(circle at top right, rgba(255,255,255,0.65) 0%, transparent 65%)",
            borderRadius: "0 28px 0 0", pointerEvents: "none", zIndex: 0,
          }} />
          {/* Bottom-left reflection */}
          <Box sx={{
            position: "absolute", bottom: 0, left: 0, width: 70, height: 70,
            background: "radial-gradient(circle at bottom left, rgba(255,255,255,0.35) 0%, transparent 65%)",
            borderRadius: "0 0 0 28px", pointerEvents: "none", zIndex: 0,
          }} />

          {/* ── Card content ── */}
          <Box sx={{ position: "relative", zIndex: 1 }}>

            {/* Alert Messages */}
            {alertStatus === "error" && (
              <Alert
                severity="error"
                onClose={() => setAlertStatus(null)}
                sx={{
                  mb: 3,
                  background: "rgba(244, 63, 94, 0.12)",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  color: "rgba(192, 30, 60, 0.9)",
                  borderRadius: "12px",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  "& .MuiAlert-icon": { color: "rgba(244, 63, 94, 0.8)" },
                }}
              >
                {alertMessage}
              </Alert>
            )}
            {alertStatus === "success" && (
              <Alert
                severity="success"
                onClose={() => setAlertStatus(null)}
                sx={{
                  mb: 3,
                  background: "rgba(74, 222, 128, 0.12)",
                  border: "1px solid rgba(74, 222, 128, 0.3)",
                  color: "rgba(22, 140, 60, 0.9)",
                  borderRadius: "12px",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  "& .MuiAlert-icon": { color: "rgba(74, 222, 128, 0.8)" },
                }}
              >
                {alertMessage}
              </Alert>
            )}

            {/* Header */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              {/* Logo mark */}
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.35)",
                  border: "1px solid rgba(255,255,255,0.7)",
                  backdropFilter: "blur(16px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2.5,
                  boxShadow: [
                    "0 8px 20px rgba(0,0,0,0.08)",
                    "inset 0 1px 0 rgba(255,255,255,0.9)",
                  ].join(", "),
                }}
              >
                <BoltIcon sx={{ fontSize: 24, color: "rgba(30,50,100,0.6)" }} />
              </Box>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  color: "rgba(12,20,50,0.88)",
                  mb: 1,
                  letterSpacing: "-0.03em",
                  textShadow: "0 1px 2px rgba(255,255,255,0.5)",
                }}
              >
                Welcome Back
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(30,50,100,0.5)", fontWeight: 500, lineHeight: 1.6, fontSize: "0.84rem" }}
              >
                Sign in to access your project workspace
              </Typography>
            </Box>

            {/* Email */}
            <TextField
              fullWidth
              required
              variant="outlined"
              placeholder="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChnage}
              sx={inputSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />

            {/* Password */}
            <TextField
              fullWidth
              required
              variant="outlined"
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChnage}
              sx={inputSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
              }}
            />

            {/* Remember / Forgot row */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                px: 0.25,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    sx={{
                      color: "rgba(30,50,100,0.25)",
                      padding: "4px",
                      "&.Mui-checked": { color: "rgba(80,100,200,0.7)" },
                    }}
                  />
                }
                label={
                  <Typography variant="caption" sx={{ color: "rgba(30,50,100,0.5)", fontWeight: 600 }}>
                    Remember me
                  </Typography>
                }
              />
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(60,80,200,0.65)",
                  fontWeight: 800,
                  cursor: "pointer",
                  "&:hover": { color: "rgba(60,80,200,0.9)" },
                }}
              >
                Forgot Password?
              </Typography>
            </Box>

            {/* Sign In Button */}
            <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handle_submit}
                sx={{
                  py: 1.8,
                  fontSize: "0.95rem",
                  fontWeight: 900,
                  borderRadius: "14px",
                  textTransform: "none",
                  letterSpacing: 0.2,
                  /* Liquid glass dark pill */
                  background: "rgba(20,30,60,0.7)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  boxShadow: [
                    "0 8px 24px rgba(0,0,0,0.18)",
                    "inset 0 1px 0 rgba(255,255,255,0.15)",
                  ].join(", "),
                  "&:hover": {
                    background: "rgba(20,30,60,0.85)",
                    boxShadow: [
                      "0 12px 32px rgba(0,0,0,0.22)",
                      "inset 0 1px 0 rgba(255,255,255,0.18)",
                    ].join(", "),
                  },
                }}
              >
                Sign In
              </Button>
            </motion.div>

            {/* Divider */}
            <Box sx={{ mt: 3.5, mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ flex: 1, height: "1px", bgcolor: "rgba(255,255,255,0.45)" }} />
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(30,50,100,0.4)", fontWeight: 700, letterSpacing: 1, whiteSpace: "nowrap" }}
                >
                  OR CONTINUE WITH
                </Typography>
                <Box sx={{ flex: 1, height: "1px", bgcolor: "rgba(255,255,255,0.45)" }} />
              </Stack>
            </Box>

            {/* OAuth Buttons */}
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<GoogleIcon />}
                onClick={async () => {
                  try {
                    window.location.href = "http://localhost:8080/auth/google";
                  } catch (error) {
                    console.log(error);
                    showToast("Google Login Failed", "error");
                  }
                }}
                sx={{
                  borderRadius: "13px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "rgba(12,20,50,0.75)",
                  border: "1px solid rgba(255,255,255,0.55)",
                  background: "rgba(255,255,255,0.28)",
                  backdropFilter: "blur(16px)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
                  "&:hover": {
                    background: "rgba(255,255,255,0.42)",
                    border: "1px solid rgba(255,255,255,0.75)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Google
              </Button>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<GitHubIcon />}
                onClick={async () => {
                  try {
                    window.location.href = "http://localhost:8080/auth/github";
                  } catch (error) {
                    console.log(error);
                    showToast("GitHub Login Failed", "error");
                  }
                }}
                sx={{
                  borderRadius: "13px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "rgba(12,20,50,0.75)",
                  border: "1px solid rgba(255,255,255,0.55)",
                  background: "rgba(255,255,255,0.28)",
                  backdropFilter: "blur(16px)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
                  "&:hover": {
                    background: "rgba(255,255,255,0.42)",
                    border: "1px solid rgba(255,255,255,0.75)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                GitHub
              </Button>
            </Stack>

            {/* Sign up link */}
            <Box sx={{ mt: 3.5, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "rgba(30,50,100,0.45)", fontWeight: 500, fontSize: "0.83rem" }}>
                Don't have an account?{" "}
                <span
                  style={{ color: "rgba(60,80,200,0.75)", fontWeight: 800, cursor: "pointer" }}
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </span>
              </Typography>
            </Box>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
};

export default Login;
