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
    position: "",
    name: "",
    department: "",
    password: "",
  });

  const handleOpen = (role) => {
    setSelectedRole(role);
    setFormData({
      position: role.title,
      name: "",
      department: "",
      password: "",
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
        background: "radial-gradient(circle at top, #0f172a 0%, #020617 70%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <Box sx={{ width: "100%", textAlign: "center", mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            color: "#e5e7eb",
            fontWeight: 700,
            mb: 2,
            fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3rem" },
            background: "linear-gradient(135deg, #00d4ff, #4ade80, #a855f7)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: 1,
          }}
        >
          Admin Roles
        </Typography>
        <Box
          sx={{
            height: 3,
            width: { xs: "60px", md: "100px" },
            background: "linear-gradient(90deg, #00d4ff, #4ade80)",
            borderRadius: 2,
            mx: "auto",
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
                borderRadius: { xs: 2, md: 3 },
                background: "linear-gradient(135deg, #020617, #1a1f3a)",
                border: "2px solid #1e293b",
                boxShadow: `0 0 25px ${role.color}20`,
                transition: "all 0.4s ease-in-out",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                py: { xs: 3, sm: 4, md: 5 },
                px: { xs: 2, sm: 3, md: 4 },
                "&:hover": {
                  transform: "translateY(-12px) scale(1.05)",
                  boxShadow: `0 12px 40px ${role.color}50`,
                  border: `2px solid ${role.color}60`,
                  background: `linear-gradient(135deg, #020617, #1a1f3a${role.color}15)`,
                },
              }}
            >
              <CardContent
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: { xs: 2, md: 3 },
                }}
              >
                <Box
                  sx={{
                    width: { xs: 60, md: 80 },
                    height: { xs: 60, md: 80 },
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${role.color}20, ${role.color}05)`,
                    border: `3px solid ${role.color}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: { xs: "1.5rem", md: "2rem" },
                  }}
                >
                  {role.title.charAt(0)}
                </Box>

                <Chip
                  label={role.level}
                  size="medium"
                  sx={{
                    backgroundColor: `${role.color}20`,
                    color: role.color,
                    fontWeight: 600,
                    fontSize: { xs: "0.75rem", md: "0.875rem" },
                    py: 2,
                    px: 1,
                  }}
                />

                <Typography
                  variant="h5"
                  sx={{
                    color: "#e5e7eb",
                    fontWeight: 700,
                    fontSize: { xs: "1.1rem", md: "1.4rem" },
                    letterSpacing: 0.5,
                  }}
                >
                  {role.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#94a3b8",
                    fontSize: { xs: "0.8rem", md: "0.95rem" },
                  }}
                >
                  Click to create new {role.title.toLowerCase()}
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
            background: "linear-gradient(135deg, #020617, #1a1f3a)",
            borderRadius: { xs: 2, md: 3 },
            border: `2px solid ${selectedRole?.color}40`,
            boxShadow: `0 12px 50px ${selectedRole?.color}30`,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#e5e7eb",
            fontSize: { xs: "1.25rem", md: "1.5rem" },
            fontWeight: 700,
            textAlign: "center",
            background: `linear-gradient(135deg, ${selectedRole?.color}20, transparent)`,
            paddingY: 3,
          }}
        >
          Create {selectedRole?.title}
        </DialogTitle>

        <DialogContent sx={{ py: 4, px: { xs: 2, md: 3 } }}>
          <Stack spacing={3} mt={2}>
            <TextField
              label="Position"
              name="position"
              value={formData.position}
              disabled
              fullWidth
              InputLabelProps={{ sx: { color: "#94a3b8" } }}
              sx={{
                input: {
                  color: "#e5e7eb",
                  fontSize: { xs: "0.95rem", md: "1rem" },
                },
                "& .MuiOutlinedInput-root": {
                  borderColor: "#1e293b",
                  "& fieldset": {
                    borderColor: "#1e293b",
                  },
                  "&:hover fieldset": {
                    borderColor: selectedRole?.color,
                  },
                },
              }}
            />

            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              placeholder="Enter full name"
              InputLabelProps={{ sx: { color: "#94a3b8" } }}
              sx={{
                input: {
                  color: "#e5e7eb",
                  fontSize: { xs: "0.95rem", md: "1rem" },
                },
                "& .MuiOutlinedInput-root": {
                  borderColor: "#1e293b",
                  "& fieldset": {
                    borderColor: "#1e293b",
                  },
                  "&:hover fieldset": {
                    borderColor: selectedRole?.color,
                  },
                },
              }}
            />
            <TextField
              label="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              fullWidth
              placeholder="Enter department"
              InputLabelProps={{ sx: { color: "#94a3b8" } }}
              sx={{
                input: {
                  color: "#e5e7eb",
                  fontSize: { xs: "0.95rem", md: "1rem" },
                },
                "& .MuiOutlinedInput-root": {
                  borderColor: "#1e293b",
                  "& fieldset": {
                    borderColor: "#1e293b",
                  },
                  "&:hover fieldset": {
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
              placeholder="Enter secure password"
              InputLabelProps={{ sx: { color: "#94a3b8" } }}
              sx={{
                input: {
                  color: "#e5e7eb",
                  fontSize: { xs: "0.95rem", md: "1rem" },
                },
                "& .MuiOutlinedInput-root": {
                  borderColor: "#1e293b",
                  "& fieldset": {
                    borderColor: "#1e293b",
                  },
                  "&:hover fieldset": {
                    borderColor: selectedRole?.color,
                  },
                },
              }}
            />

            <Button
              onClick={handleSubmit}
              fullWidth
              sx={{
                mt: 3,
                py: { xs: 1.5, md: 2 },
                background: `linear-gradient(135deg, ${selectedRole?.color}, ${selectedRole?.color}cc)`,
                color: "#020617",
                fontWeight: 700,
                fontSize: { xs: "0.95rem", md: "1rem" },
                textTransform: "uppercase",
                letterSpacing: 1,
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  background: `linear-gradient(135deg, ${selectedRole?.color}dd, ${selectedRole?.color})`,
                  transform: "translateY(-2px)",
                  boxShadow: `0 8px 25px ${selectedRole?.color}40`,
                },
              }}
            >
              Create User
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AdminRoleManager;
