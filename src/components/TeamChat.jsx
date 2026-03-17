/**
 * TeamChat.jsx
 * Floating chat bubble — click to open a slide-up panel from the bottom right.
 * Socket.io / WebSocket ready: connect your socket in the useEffect below.
 * UI-only placeholder for now.
 */
import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, IconButton, TextField, Avatar,
  alpha, Collapse, Fade, Badge,
} from "@mui/material";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CircleIcon from "@mui/icons-material/Circle";

const INDIGO_ACCENT = "#4f46e5";
const PRIMARY_SLATE = "#0f172a";
const SECONDARY_SLATE = "#475569";

// Mock team members online (replace with socket data)
const ONLINE_MEMBERS = [
  { id: 1, name: "Riya", initials: "R", color: "#10b981" },
  { id: 2, name: "Dev", initials: "D", color: "#f59e0b" },
  { id: 3, name: "Anuj", initials: "A", color: "#6366f1" },
];

const MOCK_MESSAGES = [
  { id: 1, from: "Riya", initials: "R", color: "#10b981", text: "Hey team! Dashboard looks great 🚀", time: "10:02 AM", self: false },
  { id: 2, from: "You", initials: "Y", color: INDIGO_ACCENT, text: "Thanks! Working on the report form now.", time: "10:04 AM", self: true },
  { id: 3, from: "Dev", initials: "D", color: "#f59e0b", text: "Can someone review the API PR?", time: "10:07 AM", self: false },
];

const TeamChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(1);
  const bottomRef = useRef(null);

  // ── Socket.io integration point ───────────────────────────
  // useEffect(() => {
  //   const socket = io("http://localhost:8080");
  //   socket.on("team_message", (msg) => {
  //     setMessages((prev) => [...prev, msg]);
  //     if (!open) setUnread((n) => n + 1);
  //   });
  //   return () => socket.disconnect();
  // }, [open]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 120);
    }
  }, [open, messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const msg = {
      id: Date.now(),
      from: "You",
      initials: "Y",
      color: INDIGO_ACCENT,
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      self: true,
    };
    setMessages((prev) => [...prev, msg]);
    setInput("");
    // socket.emit("team_message", msg);  // ← uncomment when socket is ready
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: { xs: 16, sm: 24 },
        right: { xs: 16, sm: 24 },
        zIndex: 1300,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 1.5,
      }}
    >
      {/* Chat Panel */}
      <Fade in={open} unmountOnExit>
        <Box
          sx={{
            width: { xs: "calc(100vw - 32px)", sm: 340, md: 360 },
            maxWidth: 400,
            height: { xs: 420, sm: 480 },
            borderRadius: "20px",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(32px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "0 20px 60px rgba(10,15,25,0.18)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2, py: 1.5,
              background: `linear-gradient(135deg, ${INDIGO_ACCENT} 0%, #3730a3 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ChatBubbleRoundedIcon sx={{ color: "#fff", fontSize: 16 }} />
              <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.88rem" }}>
                Team Chat
              </Typography>
            </Box>

            {/* Online avatars */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {ONLINE_MEMBERS.map((m) => (
                <Avatar
                  key={m.id}
                  sx={{ width: 22, height: 22, bgcolor: m.color, fontSize: "0.6rem", fontWeight: 800, border: "1.5px solid rgba(255,255,255,0.4)" }}
                >
                  {m.initials}
                </Avatar>
              ))}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, ml: 0.5 }}>
                <CircleIcon sx={{ fontSize: 8, color: "#4ade80" }} />
                <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.65rem", fontWeight: 600 }}>
                  {ONLINE_MEMBERS.length} online
                </Typography>
              </Box>
            </Box>

            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "rgba(255,255,255,0.8)", p: 0.3, "&:hover": { color: "#fff" } }}>
              <CloseRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 1.5,
              py: 1,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              "&::-webkit-scrollbar": { width: "4px" },
              "&::-webkit-scrollbar-thumb": { background: "rgba(0,0,0,0.12)", borderRadius: "4px" },
            }}
          >
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  flexDirection: msg.self ? "row-reverse" : "row",
                  alignItems: "flex-end",
                  gap: 0.8,
                }}
              >
                {!msg.self && (
                  <Avatar sx={{ width: 24, height: 24, bgcolor: msg.color, fontSize: "0.6rem", fontWeight: 800, flexShrink: 0 }}>
                    {msg.initials}
                  </Avatar>
                )}
                <Box sx={{ maxWidth: "72%" }}>
                  {!msg.self && (
                    <Typography sx={{ fontSize: "0.62rem", fontWeight: 600, color: alpha(SECONDARY_SLATE, 0.7), mb: 0.3, ml: 0.5 }}>
                      {msg.from}
                    </Typography>
                  )}
                  <Box
                    sx={{
                      px: 1.5, py: 0.8,
                      borderRadius: msg.self ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      bgcolor: msg.self ? INDIGO_ACCENT : "rgba(15,23,42,0.06)",
                      color: msg.self ? "#fff" : PRIMARY_SLATE,
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      lineHeight: 1.45,
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.text}
                  </Box>
                  <Typography sx={{ fontSize: "0.6rem", color: alpha(SECONDARY_SLATE, 0.5), mt: 0.3, textAlign: msg.self ? "right" : "left", mx: 0.5 }}>
                    {msg.time}
                  </Typography>
                </Box>
              </Box>
            ))}
            <div ref={bottomRef} />
          </Box>

          {/* Input */}
          <Box
            sx={{
              px: 1.5, py: 1.2,
              borderTop: "1px solid rgba(15,23,42,0.06)",
              display: "flex",
              gap: 1,
              alignItems: "center",
              bgcolor: "rgba(255,255,255,0.6)",
              flexShrink: 0,
            }}
          >
            <TextField
              size="small"
              fullWidth
              multiline
              maxRows={3}
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  fontSize: "0.8rem",
                  bgcolor: "rgba(255,255,255,0.7)",
                  "& fieldset": { borderColor: "rgba(15,23,42,0.1)" },
                  "&:hover fieldset": { borderColor: alpha(INDIGO_ACCENT, 0.3) },
                  "&.Mui-focused fieldset": { borderColor: INDIGO_ACCENT },
                },
                "& .MuiOutlinedInput-input": { py: 0.8, px: 1.2 },
              }}
            />
            <IconButton
              onClick={handleSend}
              size="small"
              sx={{
                bgcolor: INDIGO_ACCENT,
                color: "#fff",
                width: 34,
                height: 34,
                flexShrink: 0,
                borderRadius: "10px",
                "&:hover": { bgcolor: "#3730a3" },
                "&:disabled": { bgcolor: alpha(SECONDARY_SLATE, 0.2) },
              }}
              disabled={!input.trim()}
            >
              <SendRoundedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Box>
        </Box>
      </Fade>

      {/* FAB Bubble */}
      <Badge
        badgeContent={!open ? unread : 0}
        color="error"
        overlap="circular"
        sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem", minWidth: 16, height: 16, top: 4, right: 4 } }}
      >
        <IconButton
          onClick={() => setOpen((v) => !v)}
          sx={{
            width: { xs: 48, sm: 52 },
            height: { xs: 48, sm: 52 },
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${INDIGO_ACCENT} 0%, #3730a3 100%)`,
            color: "#fff",
            boxShadow: "0 8px 24px rgba(79,70,229,0.35)",
            transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
            "&:hover": {
              transform: "scale(1.08)",
              boxShadow: "0 12px 32px rgba(79,70,229,0.45)",
            },
          }}
          aria-label="Open team chat"
        >
          {open
            ? <CloseRoundedIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />
            : <ChatBubbleRoundedIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />
          }
        </IconButton>
      </Badge>
    </Box>
  );
};

export default TeamChat;
