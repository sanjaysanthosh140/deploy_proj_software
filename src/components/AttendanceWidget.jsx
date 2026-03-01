/**
 * AntyGravity Instruction:
 * Apply rules from /docs/component_analysis_prompt.md
 */import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, Paper, Chip, alpha } from "@mui/material";
import { AccessTime, FreeBreakfast, Business, Home } from "@mui/icons-material";
import axios from "axios";
import { useToast } from "../context/ToastContext";

const AttendanceWidget = ({ currentUserId }) => {
  const { showToast } = useToast();
  // ---- CLOCK (manual safe clock) ----
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime((prev) => new Date(prev.getTime() + 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ---- STATES ----
  const [status, setStatus] = useState("ABSENT");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(false);

  // ---- TIME REFS (no re-render issues) ----
  const workStartRef = useRef(null);
  const breakStartRef = useRef(null);
  const totalBreakMsRef = useRef(0);

  // ---- WORK TIMER ----
  useEffect(() => {
    if (status === "WORKING" && workStartRef.current) {
      const now = currentTime.getTime();
      const workedMs = now - workStartRef.current - totalBreakMsRef.current;
      setElapsedSeconds(Math.max(0, Math.floor(workedMs / 1000)));
    }
  }, [status, currentTime]);

  // ---- FORMAT TIME ----
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ---- PUNCH HANDLER ----
  const handlePunch = async (action) => {
    setLoading(true);
    const now = currentTime.getTime();

    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:8080/admin/attendance",
        {
          action,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (action === "PUNCH_IN") {
        workStartRef.current = now;
        totalBreakMsRef.current = 0;
        setElapsedSeconds(0);
        setStatus("WORKING");
      }

      if (action === "LUNCH_START") {
        breakStartRef.current = now;
        setStatus("ON_BREAK");
      }

      if (action === "LUNCH_END") {
        totalBreakMsRef.current += now - breakStartRef.current;
        breakStartRef.current = null;
        setStatus("WORKING");
      }

      if (action === "PUNCH_OUT") {
        setStatus("COMPLETED");
      }

      const actionLabel = action.replace("_", " ").toLowerCase();
      showToast(`Protocol ${actionLabel} executed successfully.`, "success");
    } catch (err) {
      console.error("Punch failed", err);
      showToast("Signal interference detected. Protocol execution failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const PRIMARY_SLATE = "#0f172a";
  const SECONDARY_SLATE = "#475569";
  const INDIGO_ACCENT = "#4f46e5";
  const GLASS_BG = "rgba(255, 255, 255, 0.75)";
  const GLASS_BORDER = "rgba(10, 15, 25, 0.08)";

  // ---- STATUS COLOR ----
  const getStatusColor = () => {
    switch (status) {
      case "WORKING":
        return "#10b981"; // Emerald
      case "ON_BREAK":
        return "#f59e0b"; // Amber
      case "COMPLETED":
        return "#6366f1"; // Indigo
      default:
        return "#ef4444"; // Red
    }
  };

  // ---- UI ----
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: GLASS_BG,
        backdropFilter: "blur(48px) saturate(180%)",
        borderRadius: "24px",
        border: `1px solid ${GLASS_BORDER}`,
        boxShadow: "0 12px 32px -4px rgba(10, 15, 25, 0.04)",
      }}
    >
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Box>
          <Typography variant="h6" sx={{ color: PRIMARY_SLATE, fontWeight: 800, letterSpacing: "-0.01em" }}>
            <AccessTime sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
            Attendance
          </Typography>
          <Typography variant="caption" sx={{ color: SECONDARY_SLATE, fontWeight: 500 }}>
            {currentTime.toDateString()}
          </Typography>
        </Box>

        <Chip
          label={status.replace("_", " ")}
          sx={{
            color: getStatusColor(),
            border: `1px solid ${alpha(getStatusColor(), 0.3)}`,
            background: alpha(getStatusColor(), 0.1),
            fontWeight: 800,
            fontSize: "0.7rem",
            height: "24px"
          }}
        />
      </Box>

      {/* TIMER */}
      <Box textAlign="center" py={2}>
        <Typography variant="h3" sx={{ fontWeight: 900, color: PRIMARY_SLATE, letterSpacing: "-0.04em" }}>
          {status === "ABSENT"
            ? currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
            : formatTime(elapsedSeconds)}
        </Typography>
        <Typography sx={{ color: SECONDARY_SLATE, fontWeight: 500, mt: 0.5 }}>
          {status === "ABSENT" ? "Ready to initialize?" : "Active Session Duration"}
        </Typography>
      </Box>

      {/* ACTIONS */}
      <Box mt={2}>
        {status === "ABSENT" && (
          <Button
            fullWidth
            onClick={() => handlePunch("PUNCH_IN")}
            disabled={loading}
            startIcon={<Business />}
            sx={{
              borderRadius: "14px",
              py: 1.5,
              background: `linear-gradient(135deg, ${INDIGO_ACCENT} 0%, #3730a3 100%)`,
              color: "#fff",
              fontWeight: 700,
              boxShadow: `0 8px 20px ${alpha(INDIGO_ACCENT, 0.25)}`,
              "& .MuiButton-startIcon": { mr: 1 }
            }}
          >
            Initialize Session
          </Button>
        )}

        {status === "WORKING" && (
          <Box display="flex" gap={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handlePunch("LUNCH_START")}
              startIcon={<FreeBreakfast />}
              sx={{
                borderRadius: "12px",
                borderColor: GLASS_BORDER,
                color: SECONDARY_SLATE,
                fontWeight: 700,
                "&:hover": { borderColor: alpha(INDIGO_ACCENT, 0.3), background: alpha(INDIGO_ACCENT, 0.05) }
              }}
            >
              Break
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="error"
              onClick={() => handlePunch("PUNCH_OUT")}
              startIcon={<Home />}
              sx={{
                borderRadius: "12px",
                background: "#ef4444",
                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
                fontWeight: 700,
              }}
            >
              Terminate
            </Button>
          </Box>
        )}

        {status === "ON_BREAK" && (
          <Button
            fullWidth
            variant="contained"
            onClick={() => handlePunch("LUNCH_END")}
            startIcon={<Business />}
            sx={{
              borderRadius: "12px",
              background: INDIGO_ACCENT,
              fontWeight: 700,
            }}
          >
            Resume Protocol
          </Button>
        )}

        {status === "COMPLETED" && (
          <Typography align="center" sx={{ color: "#10b981", fontWeight: 700 }}>
            Session finalized. Excellent work.
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default AttendanceWidget;
