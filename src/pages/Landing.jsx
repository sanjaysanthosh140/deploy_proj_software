/**
 * AntyGravity Instruction:
 * Apply rules from /docs/component_analysis_prompt.md
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Grid,
  Container,
  alpha,
  Stack,
  useTheme,
  useMediaQuery,
  Avatar,
  IconButton,
  Chip,
} from "@mui/material";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  RocketLaunch as RocketIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  AutoAwesome as MagicIcon,
  Bolt as BoltIcon,
  Groups as TeamIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
  Menu as MenuIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
const PRIMARY_SLATE = "#0f172a";
const SECONDARY_SLATE = "#475569";
const INDIGO_ACCENT = "#4f46e5";
const GLASS_BG = "rgba(255, 255, 255, 0.75)";
const GLASS_BORDER = "rgba(10, 15, 25, 0.08)";

const FadeIn = ({ children, delay = 0, y = 20 }) => (
  <motion.div
    initial={{ opacity: 0, y, scale: 0.96 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{
      type: "spring",
      stiffness: 150,
      damping: 20,
      delay
    }}
  >
    {children}
  </motion.div>
);

const AnimatedCounter = ({ target, suffix = "" }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = target / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [target]);
  return (
    <>
      {count.toLocaleString()}
      {suffix}
    </>
  );
};

/* ─── Navbar ─── */
const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: "all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
        bgcolor: scrolled ? "rgba(255, 255, 255, 0.8)" : "transparent",
        backdropFilter: scrolled ? "blur(40px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(40px) saturate(180%)" : "none",
        borderBottom: scrolled ? `1px solid ${GLASS_BORDER}` : "none",
        py: scrolled ? 1.5 : 2.5,
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          {/* Logo */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "10px",
                background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
              }}
            >
              <BoltIcon sx={{ color: "#fff", fontSize: 20 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 900, letterSpacing: -0.5, color: PRIMARY_SLATE }}
            >
              Antigravity.
            </Typography>
          </Stack>

          {/* Desktop Nav */}
          <Stack
            direction="row"
            spacing={4}
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            {["Ecosystem", "Protocols", "Infrastructure", "Intel"].map((item) => (
              <Typography
                key={item}
                sx={{
                  color: SECONDARY_SLATE,
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    color: PRIMARY_SLATE,
                    transform: "translateY(-1px)",
                  },
                }}
              >
                {item}
              </Typography>
            ))}
          </Stack>

          {/* Actions */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="text"
              sx={{
                color: PRIMARY_SLATE,
                fontWeight: 800,
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: 1,
                display: { xs: "none", sm: "block" },
              }}
              onClick={() => navigate("/login")}
            >
              Terminal
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate("/signup")}
              sx={{
                background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
                color: "#fff",
                fontWeight: 900,
                borderRadius: "12px",
                textTransform: "none",
                fontSize: "0.95rem",
                px: 3,
                boxShadow: "0 8px 20px rgba(15, 23, 42, 0.15)",
                "&:hover": {
                  background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.2)",
                },
              }}
            >
              Initialize Node
            </Button>
            <IconButton
              sx={{ display: { xs: "block", md: "none" }, color: PRIMARY_SLATE }}
            >
              <MenuIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};



/* ─── Main Landing Component ─── */
const Landing = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        bgcolor: "#f8fafc",
        minHeight: "100vh",
        color: PRIMARY_SLATE,
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* Background Mesh Gradients */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "-10%",
            left: "10%",
            width: "60vw",
            height: "60vw",
            background: "radial-gradient(circle, rgba(79, 70, 229, 0.05) 0%, rgba(255,255,255,0) 70%)",
            filter: "blur(80px)",
          }}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: "0%",
            right: "5%",
            width: "50vw",
            height: "50vw",
            background: "radial-gradient(circle, rgba(15, 23, 42, 0.03) 0%, rgba(255,255,255,0) 70%)",
            filter: "blur(100px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80vw",
            height: "80vh",
            background: "radial-gradient(circle, rgba(248, 250, 252, 0) 0%, #f8fafc 80%)",
            zIndex: 1,
          }}
        />
      </Box>

      <Navbar />

      {/* Hero Section */}
      <Container
        maxWidth="lg"
        sx={{ pt: { xs: 15, md: 25 }, pb: { xs: 10, md: 20 }, position: "relative", zIndex: 2 }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -100,
            left: "20%",
            width: 500,
            height: 500,
            background:
              "radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, rgba(0,0,0,0) 70%)",
            filter: "blur(60px)",
            zIndex: -1,
          }}
        />

        <Stack alignItems="center" spacing={3} textAlign="center">
          <FadeIn>
            <Chip
              label="v2.0: Neural Orchestration Engine 🧠"
              sx={{
                background: "rgba(79, 70, 229, 0.06)",
                color: INDIGO_ACCENT,
                border: `1px solid ${alpha(INDIGO_ACCENT, 0.1)}`,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 2,
                fontSize: "0.7rem",
                py: 2,
                mb: 2,
              }}
            />
          </FadeIn>

          <FadeIn delay={0.1}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.8rem", md: "5.5rem" },
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
                color: PRIMARY_SLATE,
              }}
            >
              Master Your Projects with <br />
              <motion.span
                style={{
                  display: "inline-block",
                  background: "linear-gradient(135deg, #0f172a 0%, #4f46e5 50%, #0f172a 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
                animate={{
                  backgroundPosition: ["0% center", "200% center"]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                Infinite Precision
              </motion.span>
            </Typography>
          </FadeIn>

          <FadeIn delay={0.2}>
            <Typography
              variant="h5"
              sx={{
                color: SECONDARY_SLATE,
                maxWidth: 720,
                lineHeight: 1.6,
                fontSize: { xs: "1.1rem", md: "1.4rem" },
                fontWeight: 500,
                letterSpacing: "-0.01em",
              }}
            >
              The definitive operating system for high-output engineering teams.
              Orchestrate complex protocols, automate friction, and achieve pure velocity.
            </Typography>
          </FadeIn>

          <FadeIn delay={0.3}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2.5}
              sx={{ mt: 3 }}
            >
              <Button
                variant="contained"
                size="large"
                sx={{
                  background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
                  color: "#fff",
                  fontSize: "1rem",
                  fontWeight: 900,
                  px: 5,
                  py: 1.8,
                  borderRadius: "16px",
                  boxShadow: "0 12px 32px rgba(15, 23, 42, 0.15)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.25)",
                    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                  },
                }}
              >
                Access Terminal
              </Button>
              <Button
                variant="outlined"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  borderColor: GLASS_BORDER,
                  color: PRIMARY_SLATE,
                  fontSize: "1rem",
                  fontWeight: 800,
                  px: 5,
                  py: 1.8,
                  borderRadius: "16px",
                  borderWidth: "2px",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: PRIMARY_SLATE,
                    bgcolor: "rgba(15, 23, 42, 0.04)",
                    borderWidth: "2px",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Protocol Audit
              </Button>
            </Stack>
          </FadeIn>
        </Stack>
      </Container>

      <Box
        sx={{
          borderTop: `1px solid ${GLASS_BORDER}`,
          borderBottom: `1px solid ${GLASS_BORDER}`,
          py: 6,
          bgcolor: "rgba(15, 23, 42, 0.01)",
        }}
      >
        <Container maxWidth="xl">
          <Typography
            variant="overline"
            display="block"
            align="center"
            sx={{ color: SECONDARY_SLATE, mb: 6, letterSpacing: 6, fontWeight: 900, fontSize: "0.75rem" }}
          >
            Powering Next-Generation Protocols
          </Typography>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            flexWrap="wrap"
            spacing={{ xs: 6, md: 12 }}
            sx={{ px: 2 }}
          >
            {[
              "NEURAL",
              "AXON",
              "VECTOR",
              "NEXUS",
              "SYNAPSE",
              "CORE",
            ].map((name) => (
              <Typography
                key={name}
                sx={{
                  color: PRIMARY_SLATE,
                  fontWeight: 900,
                  fontSize: "1.4rem",
                  letterSpacing: 6,
                  opacity: 0.15,
                  cursor: "default",
                  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  "&:hover": {
                    opacity: 0.8,
                    color: INDIGO_ACCENT,
                    transform: "scale(1.05)",
                  }
                }}
              >
                {name}
              </Typography>
            ))}
          </Stack>
        </Container>
      </Box>



      {/* Stats Section */}
      <Box
        sx={{
          py: { xs: 8, md: 15 },
          bgcolor: "rgba(15, 23, 42, 0.01)",
          borderTop: `1px solid ${GLASS_BORDER}`,
          borderBottom: `1px solid ${GLASS_BORDER}`,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-around"
            alignItems="center"
            spacing={6}
          >
            {[
              { val: 12500, label: "Neural Nodes", suffix: "+" },
              { val: 640, label: "Elite Consortiums", suffix: "" },
              { val: 99, label: "Core Availability", suffix: ".99%" },
            ].map((stat, i) => (
              <Box key={i} sx={{ textAlign: "center" }}>
                <FadeIn delay={i * 0.2}>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 900,
                      mb: 1,
                      background: "linear-gradient(135deg, #0f172a 0%, #4f46e5 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      letterSpacing: "-0.04em",
                    }}
                  >
                    <AnimatedCounter target={stat.val} suffix={stat.suffix} />
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: SECONDARY_SLATE,
                      fontWeight: 800,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      fontSize: "0.75rem"
                    }}
                  >
                    {stat.label}
                  </Typography>
                </FadeIn>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* CTA */}
      <Container maxWidth="md" sx={{ py: 20, textAlign: "center" }}>
        <FadeIn>
          <Box
            sx={{
              position: "relative",
              p: { xs: 6, md: 12 },
              borderRadius: "48px",
              overflow: "hidden",
              background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
              border: `1px solid ${alpha(PRIMARY_SLATE, 0.1)}`,
              boxShadow: "0 64px 128px -32px rgba(15, 23, 42, 0.3)",
            }}
          >
            {/* Animated Canvas Elements */}
            <Box
              sx={{
                position: "absolute",
                top: "-10%",
                left: "-10%",
                width: "50%",
                height: "50%",
                background: "radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, rgba(0,0,0,0) 70%)",
                filter: "blur(60px)",
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: "-10%",
                right: "-10%",
                width: "50%",
                height: "50%",
                background: "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(0,0,0,0) 70%)",
                filter: "blur(60px)",
                zIndex: 0,
              }}
            />

            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Typography variant="h2" sx={{ fontWeight: 900, mb: 3, letterSpacing: "-0.04em", color: "#fff" }}>
                Ready to Accelerate?
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: alpha("#fff", 0.7), mb: 8, maxWidth: 540, mx: "auto", lineHeight: 1.6, fontWeight: 500 }}
              >
                Join the global consortium of high-velocity engineering teams orchestrating the future with Antigravity.
              </Typography>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/signup")}
                  sx={{
                    bgcolor: "#fff",
                    color: PRIMARY_SLATE,
                    fontSize: "1.1rem",
                    fontWeight: 900,
                    px: 8,
                    py: 2.5,
                    borderRadius: "20px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                    "&:hover": {
                      bgcolor: "#f8fafc",
                      boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
                    },
                  }}
                >
                  Request Access
                </Button>
              </motion.div>
            </Box>
          </Box>
        </FadeIn>
      </Container>

      <Box
        sx={{
          borderTop: `1px solid ${GLASS_BORDER}`,
          py: 10,
          background: "rgba(15, 23, 42, 0.01)",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={8} justifyContent="space-between">
            <Grid item xs={12} md={4}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{ mb: 3 }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 16px rgba(15, 23, 42, 0.15)",
                  }}
                >
                  <BoltIcon sx={{ color: "#fff", fontSize: 20 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: PRIMARY_SLATE, letterSpacing: -0.5 }}>
                  Antigravity.
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                sx={{ color: SECONDARY_SLATE, maxWidth: 300, lineHeight: 1.8, fontWeight: 500 }}
              >
                The definitive operating system for high-output engineering teams.
                Orchestrate your future with cinematic precision.
              </Typography>
            </Grid>

            {[
              {
                title: "Protocols",
                links: ["Ecosystem", "Neural Engine", "Security Hub", "Infrastructure"]
              },
              {
                title: "Organization",
                links: ["Consortium", "Careers", "Documentation", "Contact"]
              },
              {
                title: "Intelligence",
                links: ["Blog", "Analytics", "Performance", "Release Notes"]
              }
            ].map((col, i) => (
              <Grid item xs={6} md={2} key={i}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: PRIMARY_SLATE, fontWeight: 900, mb: 3, textTransform: "uppercase", letterSpacing: 1 }}
                >
                  {col.title}
                </Typography>
                <Stack spacing={2}>
                  {col.links.map((link) => (
                    <Typography
                      key={link}
                      variant="body2"
                      sx={{
                        color: SECONDARY_SLATE,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "color 0.2s ease",
                        "&:hover": { color: INDIGO_ACCENT }
                      }}
                    >
                      {link}
                    </Typography>
                  ))}
                </Stack>
              </Grid>
            ))}
          </Grid>

          <Box
            sx={{
              mt: 10,
              pt: 4,
              borderTop: `1px solid ${GLASS_BORDER}`,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: alpha(SECONDARY_SLATE, 0.6), fontWeight: 600 }}
            >
              © 2026 Antigravity Systems. Industrial grade orchestration.
            </Typography>
            <Stack direction="row" spacing={4}>
              {["Privacy", "Terms", "Security", "Status"].map((link) => (
                <Typography
                  key={link}
                  variant="caption"
                  sx={{
                    color: alpha(SECONDARY_SLATE, 0.6),
                    fontWeight: 700,
                    cursor: "pointer",
                    "&:hover": { color: PRIMARY_SLATE }
                  }}
                >
                  {link}
                </Typography>
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
