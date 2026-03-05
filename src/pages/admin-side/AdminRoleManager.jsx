/**
 * AntyGravity Instruction:
 * Apply rules from /docs/component_analysis_prompt.md
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const roles = [
  {
    title: "Super Admin",
    level: "Critical",
    color: "#ff4d4f",
    route: "/super-admin",
  },
  { title: "HR", level: "High", color: "#00d4ff", route: "/hr-dashboard" },
  { title: "Head", level: "Medium", color: "#4ade80", route: "/head" },
];

const AdminRoleManager = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    position: "", // Position is still needed for routing but derived from role card
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
      console.log("submitted form data", formData);
      const res = await axios.post(
        "http://localhost:8080/admin/verify_authorization",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Response:", res.data);

      // Check position from response and navigate accordingly
      if (res.data && res.data.position) {
        const position = res.data.position.toLowerCase().trim();
        let token = res.data.token;
        localStorage.setItem("token", token);

        // Find matching role and navigate to its route
        const matchedRole = roles.find(
          (role) => role.title.toLowerCase() === position,
        );

        if (matchedRole) {
          console.log(`Navigating to ${matchedRole.route}`);
          handleClose();
          navigate(matchedRole.route);
        } else {
          console.error(`Unknown position: ${position}`);
          alert("Invalid role position");
        }
      } else {
        console.error("No position in response");
        alert("Response doesn't contain position information");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to verify authorization");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 2, sm: 3, md: 4 },
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Decorative Blobs */}
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          right: "-10%",
          width: "40vw",
          height: "40vw",
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-10%",
          left: "-10%",
          width: "40vw",
          height: "40vw",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
          zIndex: 0,
        }}
      />
      <Box sx={{ width: "100%", textAlign: "center", mb: 8, position: "relative", zIndex: 1 }}>
        <Typography
          variant="h3"
          sx={{
            color: "#0f172a",
            fontWeight: 800,
            mb: 2,
            fontSize: { xs: "2rem", sm: "2.8rem", md: "3.5rem" },
            background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: -1,
          }}
        >
          Administrator Portal
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "#64748b", mb: 4, fontWeight: 500, letterSpacing: 1 }}
        >
          SELECT YOUR ADMINISTRATIVE ROLE TO ACCESS THE COMMAND CENTER
        </Typography>
        <Box
          sx={{
            height: 4,
            width: "80px",
            background: "linear-gradient(90deg, #38bdf8, #818cf8)",
            borderRadius: 2,
            mx: "auto",
            boxShadow: "0 4px 12px rgba(56, 189, 248, 0.2)",
          }}
        />
      </Box>

      <Grid
        container
        spacing={{ xs: 2, sm: 3, md: 4 }}
        sx={{
          maxWidth: 1400,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {roles.map((role) => (
          <Grid item xs={12} sm={6} md={5} lg={4} key={role.title}>
            <Card
              onClick={() => handleOpen(role)}
              sx={{
                cursor: "pointer",
                borderRadius: "32px",
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(20px) saturate(160%)",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-12px)",
                  boxShadow: `0 20px 40px ${role.color}15`,
                  border: `1px solid ${role.color}40`,
                  background: "rgba(255, 255, 255, 0.9)",
                  "& .role-icon-bg": {
                    transform: "scale(1.1) rotate(5deg)",
                    background: `linear-gradient(135deg, ${role.color}15, ${role.color}05)`,
                  }
                },
              }}
            >
              <Box
                className="role-accent"
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "4px",
                  background: role.color,
                }}
              />
              <CardContent
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: { xs: 2.5, md: 3.5 },
                  py: { xs: 5, md: 7 },
                  px: { xs: 3, md: 4 },
                }}
              >
                <Box
                  className="role-icon-bg"
                  sx={{
                    width: { xs: 70, md: 90 },
                    height: { xs: 70, md: 90 },
                    borderRadius: "24px",
                    background: "rgba(0, 0, 0, 0.03)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: { xs: "1.8rem", md: "2.5rem" },
                    color: role.color,
                    transition: "all 0.4s ease",
                    mb: 1,
                  }}
                >
                  {role.title.charAt(0)}
                </Box>

                <Chip
                  label={role.level}
                  size="small"
                  sx={{
                    backgroundColor: `${role.color}15`,
                    color: role.color,
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    border: `1px solid ${role.color}30`,
                    py: 1.5,
                  }}
                />

                <Typography
                  variant="h5"
                  sx={{
                    color: "#0f172a",
                    fontWeight: 800,
                    fontSize: { xs: "1.2rem", md: "1.5rem" },
                    letterSpacing: -0.5,
                  }}
                >
                  {role.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748b",
                    fontSize: { xs: "0.85rem", md: "1rem" },
                    lineHeight: 1.6,
                  }}
                >
                  Secure access for {role.title.toLowerCase()} accounts
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ---------- MODAL FORM ---------- */}

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(40px) saturate(180%)",
            borderRadius: "32px",
            border: `1px solid rgba(255, 255, 255, 0.5)`,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#0f172a",
            fontSize: { xs: "1.5rem", md: "1.8rem" },
            fontWeight: 800,
            textAlign: "center",
            pt: 4,
            pb: 1,
          }}
        >
          {selectedRole?.title} Login
        </DialogTitle>

        <DialogContent sx={{ py: 4, px: { xs: 2, md: 3 } }}>
          <Stack spacing={3} mt={1}>
            {/* Position is hidden but preserved in formData for the API */}

            <TextField
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              placeholder="Enter your email"
              InputLabelProps={{ sx: { color: "#64748b" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  color: "#0f172a",
                  "& fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.1)",
                  },
                  "&:hover fieldset": {
                    borderColor: selectedRole?.color,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: selectedRole?.color,
                  },
                },
              }}
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              placeholder="Enter your password"
              InputLabelProps={{ sx: { color: "#64748b" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  color: "#0f172a",
                  "& fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.1)",
                  },
                  "&:hover fieldset": {
                    borderColor: selectedRole?.color,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: selectedRole?.color,
                  },
                },
              }}
            />

            <Button
              onClick={handleSubmit}
              fullWidth
              sx={{
                mt: 4,
                py: 2,
                background: `linear-gradient(135deg, ${selectedRole?.color} 0%, #000 100%)`,
                color: "#fff",
                fontWeight: 800,
                fontSize: "1rem",
                textTransform: "none",
                borderRadius: "16px",
                transition: "all 0.3s ease",
                boxShadow: `0 10px 20px ${selectedRole?.color}20`,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: `0 15px 30px ${selectedRole?.color}30`,
                  filter: "brightness(1.1)",
                },
              }}
            >
              Sign In to Command Center
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AdminRoleManager;
