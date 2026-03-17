/**
 * AttendanceWidget.jsx — full-width horizontal layout.
 * Left: clock / status info.  Right: action buttons.
 * All API logic preserved exactly.
 */
import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, Paper, Chip, Divider, alpha } from "@mui/material";
import { AccessTime, FreeBreakfast, Business, Home } from "@mui/icons-material";
import axios from "axios";
import { useToast } from "../context/ToastContext";

const PRIMARY_SLATE   = "#0f172a";
const SECONDARY_SLATE = "#475569";
const INDIGO_ACCENT   = "#4f46e5";
const GLASS_BG        = "rgba(255, 255, 255, 0.82)";
const GLASS_BORDER    = "rgba(10, 15, 25, 0.08)";

const AttendanceWidget = ({ currentUserId }) => {
  const { showToast } = useToast();
  const [currentTime, setCurrentTime]       = useState(() => new Date());
  const [status, setStatus]                 = useState("ABSENT");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading]               = useState(false);
  const workStartRef    = useRef(null);
  const breakStartRef   = useRef(null);
  const totalBreakMsRef = useRef(0);
  const ATTENDANCE_SESSION_KEY = "attendance_session";

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(ATTENDANCE_SESSION_KEY);
    if (saved) {
      try {
        const s = JSON.parse(saved);
        if (s.status === "WORKING")      { workStartRef.current = s.workStart; totalBreakMsRef.current = s.totalBreakMs; setStatus("WORKING"); }
        else if (s.status === "ON_BREAK"){ workStartRef.current = s.workStart; breakStartRef.current = s.breakStart; totalBreakMsRef.current = s.totalBreakMs; setStatus("ON_BREAK"); }
        else if (s.status === "COMPLETED") setStatus("COMPLETED");
      } catch { localStorage.removeItem(ATTENDANCE_SESSION_KEY); }
    }
  }, []);

  const saveSession = (newStatus) => {
    localStorage.setItem(ATTENDANCE_SESSION_KEY, JSON.stringify({
      status: newStatus, workStart: workStartRef.current,
      breakStart: breakStartRef.current, totalBreakMs: totalBreakMsRef.current,
    }));
  };

  useEffect(() => {
    if (status === "WORKING" && workStartRef.current) {
      const workedMs = currentTime.getTime() - workStartRef.current - totalBreakMsRef.current;
      setElapsedSeconds(Math.max(0, Math.floor(workedMs / 1000)));
    }
  }, [status, currentTime]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handlePunch = async (action) => {
    setLoading(true);
    const now = currentTime.getTime();
    const token = localStorage.getItem("token");
    try {
      await axios.post("http://localhost:8080/admin/attendance", { action },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      if (action === "PUNCH_IN")    { workStartRef.current = now; totalBreakMsRef.current = 0; setElapsedSeconds(0); setStatus("WORKING"); saveSession("WORKING"); }
      if (action === "LUNCH_START") { breakStartRef.current = now; setStatus("ON_BREAK"); saveSession("ON_BREAK"); }
      if (action === "LUNCH_END")   { totalBreakMsRef.current += now - breakStartRef.current; breakStartRef.current = null; setStatus("WORKING"); saveSession("WORKING"); }
      if (action === "PUNCH_OUT")   { setStatus("COMPLETED"); saveSession("COMPLETED"); setTimeout(() => localStorage.removeItem(ATTENDANCE_SESSION_KEY), 1000); }
      showToast(`${action.replace("_", " ").toLowerCase()} executed.`, "success");
    } catch { showToast("Protocol execution failed.", "error"); }
    finally  { setLoading(false); }
  };

  const getStatusColor = () => ({ WORKING: "#10b981", ON_BREAK: "#f59e0b", COMPLETED: "#6366f1" }[status] ?? "#ef4444");

  const btnBase = {
    borderRadius: "12px", textTransform: "none", fontWeight: 700,
    fontSize: { xs: "0.82rem", sm: "0.88rem", md: "0.92rem" },
    py: { xs: 1, sm: 1.2 }, px: { xs: 2.5, sm: 3.5 },
    minWidth: { xs: 120, sm: 140 },
  };

  return (
    <Paper elevation={0} sx={{
      p: { xs: 2, sm: 2.5, md: 3 },
      background: GLASS_BG,
      backdropFilter: "blur(48px) saturate(180%)",
      borderRadius: "20px",
      border: `1px solid ${GLASS_BORDER}`,
      boxShadow: "0 6px 24px -4px rgba(10,15,25,0.07)",
    }}>
      {/* ── Horizontal flex: info LEFT | divider | actions RIGHT ── */}
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: { xs: 2, sm: 3 } }}>

        {/* LEFT — clock + status */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, sm: 3 }, flex: "1 1 auto", minWidth: 0 }}>
          {/* Date + label */}
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ display: "flex", alignItems: "center", gap: 0.7, fontWeight: 800, color: PRIMARY_SLATE, fontSize: { xs: "0.95rem", sm: "1rem", md: "1.05rem" }, letterSpacing: "-0.01em" }}>
              <AccessTime sx={{ fontSize: { xs: 16, sm: 18 } }} />
              Attendance
            </Typography>
            <Typography sx={{ color: alpha(SECONDARY_SLATE, 0.7), fontSize: { xs: "0.72rem", sm: "0.78rem" }, mt: 0.2 }}>
              {currentTime.toDateString()}
            </Typography>
          </Box>

          {/* Clock / Timer */}
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontWeight: 900, color: PRIMARY_SLATE, letterSpacing: "-0.04em", lineHeight: 1, fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.6rem" } }}>
              {status === "ABSENT"
                ? currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : formatTime(elapsedSeconds)}
            </Typography>
            <Typography sx={{ color: alpha(SECONDARY_SLATE, 0.6), fontSize: { xs: "0.7rem", sm: "0.75rem" }, mt: 0.3 }}>
              {status === "ABSENT" ? "Ready to punch in?" : "Active session"}
            </Typography>
          </Box>

          {/* Status chip */}
          <Chip
            label={status.replace("_", " ")}
            size="small"
            sx={{
              color: getStatusColor(),
              border: `1px solid ${alpha(getStatusColor(), 0.35)}`,
              background: alpha(getStatusColor(), 0.1),
              fontWeight: 700,
              fontSize: { xs: "0.68rem", sm: "0.72rem" },
              height: { xs: 24, sm: 26 },
              "& .MuiChip-label": { px: 1.2 },
            }}
          />
        </Box>

        {/* Divider (hidden on xs) */}
        <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" }, borderColor: GLASS_BORDER }} />

        {/* RIGHT — Action buttons */}
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center", flexShrink: 0 }}>
          {status === "ABSENT" && (
            <Button
              onClick={() => handlePunch("PUNCH_IN")} disabled={loading}
              startIcon={<Business sx={{ fontSize: { xs: 16, sm: 18 } }} />}
              variant="contained"
              sx={{ ...btnBase, background: `linear-gradient(135deg, ${INDIGO_ACCENT} 0%, #3730a3 100%)`, color: "#fff", boxShadow: `0 4px 12px ${alpha(INDIGO_ACCENT, 0.25)}` }}
            >
              Punch In
            </Button>
          )}

          {status === "WORKING" && <>
            <Button
              onClick={() => handlePunch("LUNCH_START")} disabled={loading}
              startIcon={<FreeBreakfast sx={{ fontSize: { xs: 15, sm: 16 } }} />}
              variant="outlined"
              sx={{ ...btnBase, borderColor: alpha(INDIGO_ACCENT, 0.3), color: SECONDARY_SLATE, "&:hover": { borderColor: INDIGO_ACCENT, bgcolor: alpha(INDIGO_ACCENT, 0.04) } }}
            >
              Break
            </Button>
            <Button
              onClick={() => handlePunch("PUNCH_OUT")} disabled={loading}
              startIcon={<Home sx={{ fontSize: { xs: 15, sm: 16 } }} />}
              variant="contained"
              sx={{ ...btnBase, background: "#ef4444", boxShadow: "0 4px 10px rgba(239,68,68,0.2)" }}
            >
              Punch Out
            </Button>
          </>}

          {status === "ON_BREAK" && (
            <Button
              onClick={() => handlePunch("LUNCH_END")} disabled={loading}
              startIcon={<Business sx={{ fontSize: { xs: 15, sm: 16 } }} />}
              variant="contained"
              sx={{ ...btnBase, background: INDIGO_ACCENT }}
            >
              Resume
            </Button>
          )}

          {status === "COMPLETED" && (
            <Typography sx={{ color: "#10b981", fontWeight: 700, fontSize: { xs: "0.85rem", sm: "0.9rem" } }}>
              ✓ Session complete. Great work!
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default AttendanceWidget;
