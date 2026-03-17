/**
 * AdminRoleManager.jsx
 * iOS Liquid Glass Redesign v1.0.
 */

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Stack,
  IconButton,
  Fade,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import SecurityIcon from "@mui/icons-material/Security";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

// --- iOS Liquid Glass Design Constants ---
const PRIMARY_BG = "#e6edf5";
const SECONDARY_BG = "#d9e3ef";
const TERTIARY_BG = "#cfd8e5";

const glassEffect = {
  background: "rgba(255, 255, 255, 0.25)",
  backdropFilter: "blur(30px) saturate(160%)",
  border: "1px solid rgba(255, 255, 255, 0.45)",
  borderRadius: "28px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.5)",
  position: "relative",
  overflow: "hidden",
  transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
};

const roles = [
  {
    title: "Super Admin",
    level: "Critical",
    color: "#ff4d4f",
    icon: <SecurityIcon />,
    description: "Full system control & infrastructure oversight",
    route: "/super-admin",
  },
  {
    title: "HR",
    level: "High",
    color: "#00d4ff",
    icon: <SupervisorAccountIcon />,
    description: "Personnel management & operational routing",
    route: "/hr-dashboard"
  },
  {
    title: "Head",
    level: "Medium",
    color: "#4ade80",
    icon: <AdminPanelSettingsIcon />,
    description: "Departmental leadership & protocol verification",
    route: "/head"
  },
];

const AdminRoleManager = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    position: "",
  });

  const handleOpen = (role) => {
    setSelectedRole(role);
    setFormData({
      email: "",
      password: "",
      position: role.title,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRole(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8080/admin/verify_authorization",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data && res.data.position) {
        const position = res.data.position.toLowerCase().trim();
        let token = res.data.token;
        localStorage.setItem("token", token);
        localStorage.setItem("adminRole", position);

        const matchedRole = roles.find(
          (role) => role.title.toLowerCase() === position
        );

        if (matchedRole) {
          handleClose();
          navigate(matchedRole.route);
        } else {
          alert("Invalid role position");
        }
      } else {
        alert("Response doesn't contain position information");
      }
    } catch (error) {
      alert("Failed to verify authorization");
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, sm: 3, md: 4 },
        background: `linear-gradient(135deg, ${PRIMARY_BG} 0%, ${SECONDARY_BG} 50%, ${TERTIARY_BG} 100%)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Decorative Bloom */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "50vw",
          maxWidth: "100%",
          height: "50vw",
          maxHeight: "100%",
          background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 60%)",
          filter: "blur(80px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <Fade in={true} timeout={1000}>
        <Box sx={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 1200 }}>
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                color: "rgba(0,0,0,0.85)",
                letterSpacing: { xs: "-1px", md: "-2px" },
                mb: 1,
                fontSize: { xs: "1.8rem", sm: "2.5rem", md: "4rem" },
              }}
            >
              Command Center
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(0,0,0,0.4)",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: { xs: "2px", md: "4px" },
                fontSize: { xs: "0.7rem", md: "0.85rem" },
              }}
            >
              Authorization Required
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {roles.map((role, index) => (
              <Grid item xs={12} sm={6} md={4} key={role.title}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    onClick={() => handleOpen(role)}
                    sx={{
                      ...glassEffect,
                      cursor: "pointer",
                      height: "100%",
                      p: 4,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      gap: 3,
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.4)",
                        boxShadow: `0 20px 40px ${role.color}15`,
                        border: `1px solid ${role.color}40`,
                        "& .icon-wrapper": {
                          transform: "scale(1.1)",
                          background: `${role.color}20`,
                          color: role.color,
                        },
                        "& .arrow-icon": {
                          transform: "translateX(4px)",
                          opacity: 1,
                        }
                      },
                    }}
                  >
                    <Box
                      className="icon-wrapper"
                      sx={{
                        width: { xs: 60, sm: 70, md: 80 },
                        height: { xs: 60, sm: 70, md: 80 },
                        borderRadius: "20px",
                        bgcolor: "rgba(0,0,0,0.04)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.3s ease",
                        color: "rgba(0,0,0,0.25)",
                        "& svg": { fontSize: { xs: 28, md: 40 } },
                      }}
                    >
                      {role.icon}
                    </Box>

                    <Box>
                      <Chip
                        label={role.level}
                        size="small"
                        sx={{
                          bgcolor: `${role.color}15`,
                          color: role.color,
                          fontWeight: 900,
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                          mb: 2,
                          border: `1px solid ${role.color}20`
                        }}
                      />
                      <Typography variant="h5" sx={{ fontWeight: 900, color: "rgba(0,0,0,0.8)", mb: 1 }}>
                        {role.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "rgba(0,0,0,0.45)", fontWeight: 600, px: 2 }}>
                        {role.description}
                      </Typography>
                    </Box>

                    <IconButton
                      className="arrow-icon"
                      sx={{
                        mt: "auto",
                        opacity: 0.3,
                        transition: "all 0.3s ease",
                        bgcolor: "rgba(0,0,0,0.03)"
                      }}
                    >
                      <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Fade>

      {/* Modern Glass Login Dialog */}
      <AnimatePresence>
        {open && (
          <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                ...glassEffect,
                background: "rgba(255, 255, 255, 0.45)",
                backdropFilter: "blur(50px) saturate(180%)",
                p: 2,
              },
            }}
          >
            <DialogTitle sx={{ textAlign: "center", pt: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 950, color: "rgba(0,0,0,0.85)", letterSpacing: "-1px" }}>
                {selectedRole?.title} Access
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(0,0,0,0.35)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px" }}>
                Enter Security Credentials
              </Typography>
            </DialogTitle>

            <DialogContent sx={{ pb: 6 }}>
              <Stack spacing={3} sx={{ mt: 4 }}>
                <TextField
                  fullWidth
                  name="email"
                  label="Network Identifier"
                  placeholder="admin@protocol.sec"
                  value={formData.email}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "18px",
                      bgcolor: "rgba(255,255,255,0.4)",
                      fontSize: "1rem",
                      fontWeight: 700,
                      "& fieldset": { borderColor: "rgba(0,0,0,0.05)" },
                      "&:hover fieldset": { borderColor: selectedRole?.color },
                      "&.Mui-focused fieldset": { borderColor: selectedRole?.color },
                      "& input": { color: "rgba(0,0,0,0.8)" }
                    },
                    "& .MuiInputLabel-root": { color: "rgba(0,0,0,0.35)", fontWeight: 700 },
                  }}
                />
                <TextField
                  fullWidth
                  name="password"
                  label="Security Key"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "18px",
                      bgcolor: "rgba(255,255,255,0.4)",
                      fontSize: "1rem",
                      fontWeight: 700,
                      "& fieldset": { borderColor: "rgba(0,0,0,0.05)" },
                      "&:hover fieldset": { borderColor: selectedRole?.color },
                      "&.Mui-focused fieldset": { borderColor: selectedRole?.color },
                      "& input": { color: "rgba(0,0,0,0.8)" }
                    },
                    "& .MuiInputLabel-root": { color: "rgba(0,0,0,0.35)", fontWeight: 700 },
                  }}
                />

                <Button
                  onClick={handleSubmit}
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 2,
                    py: 2.2,
                    borderRadius: "18px",
                    bgcolor: "rgba(0,0,0,0.9)",
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: "1rem",
                    textTransform: "none",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                    "&:hover": {
                      bgcolor: "#000",
                      transform: "translateY(-2px)",
                      boxShadow: "0 15px 35px rgba(0,0,0,0.3)",
                    },
                  }}
                >
                  Verify Authorization
                </Button>
              </Stack>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default AdminRoleManager;
