/**
 * AntyGravity Instruction:
 * Apply rules from /docs/component_analysis_prompt.md
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
} from "@mui/material";
import { GlassContainer, GlowText } from "../../components/common/GlassComp";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import axios from "axios";
import { useToast } from "../../context/ToastContext";

const PRIMARY_SLATE = "#0f172a";
const SECONDARY_SLATE = "#475569";
const INDIGO_ACCENT = "#4f46e5";
const GLASS_BG = "rgba(255, 255, 255, 0.75)";
const GLASS_BORDER = "rgba(10, 15, 25, 0.08)";

const Login = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setformData] = useState({
    email: "",
    password: "",
  });

  const handleChnage = (e) => {
    try {
      const { name, value } = e.target;
      setformData((preve) => ({
        ...preve,
        [name]: value,
      }));
    } catch (error) {
      console.log(error);
    }
  };
  const handle_submit = async () => {
    try {
      if (formData.email && formData.password) {
        const res = await axios.post("http://localhost:8080/login", formData, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.status === 200) {
          showToast("Login successful!", "success");
          console.log(res.data);
          localStorage.setItem("token", res.data.token);
          // navigate to dashboard
          setTimeout(() => {
            navigate("/app/gateway");
          }, 1000);
        }
      } else {
        showToast("Please fill in all fields", "warning");
      }
    } catch (error) {
      console.log(error);
      showToast("Login failed. Please check your credentials.", "error");
    }
  };
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f8fafc",
        position: "relative",
        overflow: "hidden",
        p: 2,
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
            top: "-10%",
            left: "10%",
            width: "60vw",
            height: "60vw",
            background: "radial-gradient(circle, rgba(79, 70, 229, 0.05) 0%, rgba(255,255,255,0) 70%)",
            filter: "blur(80px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "0%",
            right: "5%",
            width: "50vw",
            height: "50vw",
            background: "radial-gradient(circle, rgba(15, 23, 42, 0.03) 0%, rgba(255,255,255,0) 70%)",
            filter: "blur(100px)",
          }}
        />
      </Box>

      <GlassContainer
        sx={{
          maxWidth: 450,
          width: "100%",
          p: { xs: 4, md: 6 },
          textAlign: "center",
          background: GLASS_BG,
          border: `1px solid ${GLASS_BORDER}`,
          backdropFilter: "blur(48px) saturate(180%)",
          boxShadow: "0 32px 64px -12px rgba(10, 15, 25, 0.08)",
          borderRadius: "32px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "16px",
              background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
              boxShadow: "0 8px 16px rgba(15, 23, 42, 0.15)",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 900, color: "#fff", letterSpacing: -1 }}>
              A
            </Typography>
          </Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 900, color: PRIMARY_SLATE, mb: 1.5, letterSpacing: "-0.02em" }}
          >
            Welcome Back
          </Typography>
          <Typography variant="body2" sx={{ color: SECONDARY_SLATE, fontWeight: 500, lineHeight: 1.6 }}>
            Initialize your credentials to access the Antigravity orchestration environment.
          </Typography>
        </Box>

        <TextField
          fullWidth
          required
          variant="outlined"
          placeholder="Email Address"
          name="email"
          value={formData.email}
          onChange={handleChnage}
          sx={{
            mb: 2.5,
            "& .MuiOutlinedInput-root": {
              bgcolor: "rgba(255,255,255,0.6)",
              borderRadius: "16px",
              transition: "all 0.3s ease",
              "& fieldset": { borderColor: GLASS_BORDER },
              "&:hover fieldset": { borderColor: alpha(PRIMARY_SLATE, 0.15) },
              "&.Mui-focused fieldset": { borderColor: INDIGO_ACCENT, borderWidth: "2px" },
            },
            "& input": {
              color: PRIMARY_SLATE,
              fontWeight: 600,
              fontSize: "0.95rem",
              "&::placeholder": { color: alpha(SECONDARY_SLATE, 0.5), opacity: 1 }
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon sx={{ color: alpha(SECONDARY_SLATE, 0.4), fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          required
          variant="outlined"
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleChnage}
          sx={{
            mb: 2.5,
            "& .MuiOutlinedInput-root": {
              bgcolor: "rgba(255,255,255,0.6)",
              borderRadius: "16px",
              transition: "all 0.3s ease",
              "& fieldset": { borderColor: GLASS_BORDER },
              "&:hover fieldset": { borderColor: alpha(PRIMARY_SLATE, 0.15) },
              "&.Mui-focused fieldset": { borderColor: INDIGO_ACCENT, borderWidth: "2px" },
            },
            "& input": {
              color: PRIMARY_SLATE,
              fontWeight: 600,
              fontSize: "0.95rem",
              "&::placeholder": { color: alpha(SECONDARY_SLATE, 0.5), opacity: 1 }
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: alpha(SECONDARY_SLATE, 0.4), fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            px: 0.5
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                sx={{
                  color: alpha(SECONDARY_SLATE, 0.3),
                  "&.Mui-checked": { color: INDIGO_ACCENT }
                }}
              />
            }
            label={
              <Typography variant="caption" sx={{ color: SECONDARY_SLATE, fontWeight: 600 }}>
                Remember device
              </Typography>
            }
          />
          <Typography
            variant="caption"
            sx={{
              color: INDIGO_ACCENT,
              fontWeight: 800,
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" }
            }}
          >
            Forgot Password?
          </Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth
          size="large"
          type="submit"
          onClick={handle_submit}
          sx={{
            py: 2,
            fontSize: "1rem",
            fontWeight: 900,
            borderRadius: "16px",
            textTransform: "none",
            background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
            boxShadow: "0 8px 20px rgba(15, 23, 42, 0.15)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
              transform: "translateY(-1px)",
              boxShadow: "0 12px 28px rgba(15, 23, 42, 0.25)",
            },
          }}
        >
          Authorize Session
        </Button>

        <Box sx={{ mt: 4, mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              mb: 3,
            }}
          >
            <Box
              sx={{ height: "1px", bgcolor: GLASS_BORDER, flex: 1 }}
            />
            <Typography variant="caption" sx={{ color: alpha(SECONDARY_SLATE, 0.5), fontWeight: 700, letterSpacing: 1 }}>
              OR CONTINUE WITH
            </Typography>
            <Box
              sx={{ height: "1px", bgcolor: GLASS_BORDER, flex: 1 }}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
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
                color: PRIMARY_SLATE,
                fontWeight: 800,
                borderRadius: "14px",
                textTransform: "none",
                borderColor: GLASS_BORDER,
                background: "rgba(255,255,255,0.4)",
                "&:hover": {
                  borderColor: alpha(PRIMARY_SLATE, 0.2),
                  bgcolor: "rgba(255, 255, 255, 0.8)",
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
                color: PRIMARY_SLATE,
                fontWeight: 800,
                borderRadius: "14px",
                textTransform: "none",
                borderColor: GLASS_BORDER,
                background: "rgba(255,255,255,0.4)",
                "&:hover": {
                  borderColor: alpha(PRIMARY_SLATE, 0.2),
                  bgcolor: "rgba(255, 255, 255, 0.8)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              GitHub
            </Button>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: SECONDARY_SLATE, fontWeight: 500 }}>
            Don't have an account?{" "}
            <span
              style={{ color: INDIGO_ACCENT, fontWeight: 800, cursor: "pointer" }}
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </span>
          </Typography>
        </Box>
      </GlassContainer>
    </Box>
  );
};

export default Login;
