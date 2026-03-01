/**
 * AntyGravity Instruction:
 * Apply rules from /docs/component_analysis_prompt.md
 */
import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Container, alpha, Avatar } from "@mui/material";
import { GlassContainer } from "../../components/common/GlassComp";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Code as CodeIcon,
  Campaign as MarketingIcon,
  Groups as HRIcon,
  AccountBalance as FinanceIcon,
  DesignServices as DesignIcon,
  Business as GeneralIcon,
  ArrowForward as ArrowIcon,
} from "@mui/icons-material";

const PRIMARY_SLATE = "#0f172a";
const SECONDARY_SLATE = "#475569";
const INDIGO_ACCENT = "#4f46e5";
const GLASS_BG = "rgba(255, 255, 255, 0.75)";
const GLASS_BORDER = "rgba(10, 15, 25, 0.08)";

// Helper to get consistent styling based on department ID
const getDepartmentStyle = (deptId) => {
  const styles = {
    it: {
      color: "#6366f1", // Indigo
      gradient: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
      icon: <CodeIcon sx={{ fontSize: 32 }} />,
      glow: "0 8px 20px rgba(99, 102, 241, 0.15)",
    },
    marketing: {
      color: "#ec4899", // Pink
      gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
      icon: <MarketingIcon sx={{ fontSize: 32 }} />,
      glow: "0 8px 20px rgba(236, 72, 153, 0.15)",
    },
    hr: {
      color: "#8b5cf6", // Violet
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
      icon: <HRIcon sx={{ fontSize: 32 }} />,
      glow: "0 8px 20px rgba(139, 92, 246, 0.15)",
    },
    finance: {
      color: "#10b981", // Emerald
      gradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
      icon: <FinanceIcon sx={{ fontSize: 32 }} />,
      glow: "0 8px 20px rgba(16, 185, 129, 0.15)",
    },
    design: {
      color: "#f59e0b", // Amber
      gradient: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
      icon: <DesignIcon sx={{ fontSize: 32 }} />,
      glow: "0 8px 20px rgba(245, 158, 11, 0.15)",
    },
  };

  return (
    styles[deptId.toLowerCase()] || {
      color: "#64748b",
      gradient: "linear-gradient(135deg, #64748b 0%, #334155 100%)",
      icon: <GeneralIcon sx={{ fontSize: 32 }} />,
      glow: "0 8px 20px rgba(100, 116, 139, 0.15)",
    }
  );
};

const DepartmentGateway = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);

  const getDepartments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/admin/departments",
      );
      console.log(response.data);
      setDepartments(response.data);
    } catch (error) {
      console.error("Failed to fetch departments", error);
    }
  };

  useEffect(() => {
    getDepartments();
  }, []);

  const handleEnter = (deptId) => {
    navigate(`/employee/cockpit/${deptId}`);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: 12,
        pb: 8,
        px: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Decor */}
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          left: "10%",
          width: "800px",
          height: "800px",
          background: "radial-gradient(circle, rgba(79, 70, 229, 0.03) 0%, transparent 70%)",
          zIndex: 0,
          pointerEvents: "none",
          filter: "blur(60px)",
        }}
      />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ mb: 10, textAlign: "center" }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: PRIMARY_SLATE,
              mb: 2.5,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
            }}
          >
            Mission Selection
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: SECONDARY_SLATE,
              fontWeight: 500,
              maxWidth: "600px",
              mx: "auto",
              opacity: 0.8,
              lineHeight: 1.6,
            }}
          >
            Choose your specialized division to initialize your workspace protocols and team synchrony.
          </Typography>
        </Box>

        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="stretch"
        >
          {departments.map((dept) => {
            const style = getDepartmentStyle(dept.id);
            return (
              <Grid item xs={12} md={6} lg={6} key={dept.id}>
                <GlassContainer
                  onClick={() => handleEnter(dept.id)}
                  sx={{
                    height: "100%",
                    p: 6,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    border: `1px solid ${GLASS_BORDER}`,
                    background: GLASS_BG,
                    backdropFilter: "blur(48px) saturate(180%)",
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: "32px",
                    boxShadow: "0 10px 30px -10px rgba(10, 15, 25, 0.05)",
                    "&:hover": {
                      transform: "translateY(-12px)",
                      boxShadow: `0 20px 40px -10px ${alpha(style.color, 0.15)}`,
                      border: `1px solid ${alpha(style.color, 0.2)}`,
                      "& .icon-wrapper": {
                        transform: "scale(1.15) rotate(5deg)",
                        background: style.gradient,
                        boxShadow: `0 8px 24px ${alpha(style.color, 0.25)}`,
                        color: "#fff",
                      },
                      "& .action-btn": {
                        color: style.color,
                        transform: "translateY(-4px)",
                        "& .arrow-icon": {
                          transform: "translateX(8px)",
                          opacity: 1,
                        },
                      }
                    },
                  }}
                >
                  <Box sx={{ width: "100%" }}>
                    <Box
                      className="icon-wrapper"
                      sx={{
                        width: 88,
                        height: 88,
                        borderRadius: "28px",
                        background: alpha(style.color, 0.08),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: style.color,
                        mb: 5,
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        border: `1px solid ${alpha(style.color, 0.1)}`,
                      }}
                    >
                      {style.icon}
                    </Box>

                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 900,
                        color: PRIMARY_SLATE,
                        mb: 2,
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {dept.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: SECONDARY_SLATE,
                        lineHeight: 1.7,
                        mb: 4,
                        minHeight: "3.4em",
                        fontWeight: 500,
                        opacity: 0.8,
                      }}
                    >
                      {dept.description ||
                        "Access departmental tools, track progress, and manage team workflows through our secure workspace protocols."}
                    </Typography>
                  </Box>

                  <Box
                    className="action-btn"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      mt: "auto",
                      pt: 2.5,
                      borderTop: `1px solid ${alpha(PRIMARY_SLATE, 0.04)}`,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Typography
                      variant="button"
                      sx={{
                        color: alpha(SECONDARY_SLATE, 0.6),
                        fontWeight: 800,
                        flexGrow: 1,
                        letterSpacing: "0.05em",
                        fontSize: "0.75rem",
                        transition: "all 0.3s ease",
                      }}
                    >
                      INITIALIZE
                    </Typography>
                    <ArrowIcon
                      className="arrow-icon"
                      sx={{
                        color: alpha(SECONDARY_SLATE, 0.4),
                        opacity: 0.6,
                        transition: "all 0.3s ease",
                        fontSize: 18,
                      }}
                    />
                  </Box>
                </GlassContainer>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default DepartmentGateway;
