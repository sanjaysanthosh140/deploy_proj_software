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
      borderRadius: "12px",
      background: "#fff",
      transition: "all 0.2s ease",
      "& fieldset": {
        borderColor: "#e0e0e0",
        borderWidth: "1px",
      },
      "&:hover fieldset": {
        borderColor: "#bdbdbd",
      },
      "&.Mui-focused": {
        "& fieldset": {
          borderColor: "#1a1a1a",
          borderWidth: "1.5px",
        },
      },
    },
    "& input": {
      color: "#1a1a1a",
      fontWeight: 500,
      fontSize: "0.95rem",
      "&::placeholder": { color: "#9e9e9e", opacity: 1 },
    },
    "& .MuiInputAdornment-root svg": {
      color: "#757575",
      fontSize: "20px",
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#fcfcfc",
        p: { xs: 2.5, sm: 4 },
      }}
    >

      {/* ── Login Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}
      >
        <Box
          sx={{
            width: "100%",
            p: { xs: 4, md: 6 },
            borderRadius: "24px",
            bgcolor: "#ffffff",
            border: "1px solid #eaeaea",
            boxShadow: "0 20px 50px rgba(0,0,0,0.05)",
          }}
        >


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
                  borderRadius: "14px",
                  background: "#1a1a1a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2.5,
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                }}
              >
                <BoltIcon sx={{ fontSize: 24, color: "#fff" }} />
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
                sx={{ color: "#757575", fontWeight: 500, lineHeight: 1.6, fontSize: "0.85rem" }}
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
                  background: "#1a1a1a",
                  color: "#fff",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
                  "&:hover": {
                    background: "#333",
                    boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
                  },
                }}
              >
                Sign In
              </Button>
            </motion.div>

            {/* Divider */}
            <Box sx={{ mt: 3.5, mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ flex: 1, height: "1px", bgcolor: "#efefef" }} />
                <Typography
                  variant="caption"
                  sx={{ color: "#9e9e9e", fontWeight: 700, letterSpacing: 1, whiteSpace: "nowrap" }}
                >
                  OR CONTINUE WITH
                </Typography>
                <Box sx={{ flex: 1, height: "1px", bgcolor: "#efefef" }} />
              </Stack>
            </Box>

            {/* OAuth Buttons */}
            <Stack direction="row" spacing={1.5}>


            </Stack>



            {/* Sign up link */}
            <Box sx={{ mt: 3.5, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#757575", fontWeight: 500, fontSize: "0.85rem" }}>
                Don't have an account?{" "}
                <span
                  style={{ color: "#1a1a1a", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                // onClick={() => navigate("/signup")}
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
