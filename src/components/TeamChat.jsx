import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Typography, IconButton, TextField, Avatar,
  alpha, Fade, Badge, List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Checkbox, FormControlLabel, Tooltip,
} from "@mui/material";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import CircleIcon from "@mui/icons-material/Circle";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import axios from "axios";
import io from "socket.io-client";
const socket = io("http://localhost:8080", {
  auth: {
    token: localStorage.getItem("token") || localStorage.getItem("adminToken")
  }
});

const INDIGO_ACCENT = "#4f46e5";
const PRIMARY_SLATE = "#0f172a";
const SECONDARY_SLATE = "#475569";
const MEMBER_COLORS = ["#ef4444", "#f97316", "#f59e0b", "#10b981", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#f43f5e"];

const formatTime = (time) => {
  if (!time) return "";
  const d = new Date(time);
  if (!isNaN(d.getTime()) && (typeof time === "string" && (time.includes("T") || time.includes("Z")))) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
  }
  return time;
};

const getMemberColor = (name) => {
  if (!name) return SECONDARY_SLATE;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return MEMBER_COLORS[Math.abs(hash) % MEMBER_COLORS.length];
};

const TeamChat = () => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("list"); // 'list' or 'chat'
  const [user, setUser] = useState({ name: "You", department: "general", initials: "Y" });
  const [activeRoom, setActiveRoom] = useState(null); // { id, title, type }
  const [departments, setDepartments] = useState([]);
  const [groups, setGroups] = useState([
    { id: "project-x", title: "Project X Team", type: "group", lastMsg: "See you at the meeting!" },
    { id: "announcements", title: "Announcements", type: "group", lastMsg: "New policy update." },
  ]);
  const [messagesByRoom, setMessagesByRoom] = useState({});
  const [input, setInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const bottomRef = useRef(null);
  const [typingUsers, setTypingUsers] = useState({}); // { roomId: [usernames] }
  const typingTimeoutRef = useRef(null);

  // Group Creation State
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]); // Array of IDs

  // 1. Fetch User and Departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const adminToken = localStorage.getItem("adminToken");
        const employeeToken = localStorage.getItem("token");
        const token = adminToken || employeeToken;
        const adminRole = localStorage.getItem("adminRole");

        if (token) {
          try {
            // Determine endpoint based on which token is present
            const profileEndpoint = adminToken
              ? "http://localhost:8080/admin/admin_profile"
              : "http://localhost:8080/employee_profile";

            const profileRes = await axios.get(profileEndpoint, {
              headers: { Authorization: token }
            });
            const userData = profileRes.data && profileRes.data[0];

            if (userData) {
              console.log("Logged in User Profile:", userData);
              setUser({
                id: userData._id,
                name: userData.name,
                department: userData.department,
                initials: (userData.name || "U").charAt(0).toUpperCase()
              });
            } else if (adminRole) {
              // Fallback for admin if profile data is empty
              setUser({
                id: "admin-" + adminRole,
                name: adminRole.toUpperCase(),
                department: adminRole,
                initials: adminRole.charAt(0).toUpperCase()
              });
            }
          } catch (profileErr) {
            console.warn("Profile fetch failed, using fallback:", profileErr);
            if (adminRole) {
              setUser({
                id: "admin-" + adminRole,
                name: adminRole.toUpperCase(),
                department: adminRole,
                initials: adminRole.charAt(0).toUpperCase()
              });
            }
          }

          // Fetch departments
          const deptsRes = await axios.get("http://localhost:8080/admin/departments");
          setDepartments(deptsRes.data);

          // Fetch groups
          const groupsRes = await axios.get("http://localhost:8080/groups/user", {
            headers: { Authorization: token }
          });
          console.log("Groups response:", groupsRes.data);
          if (groupsRes.data) {
            setGroups(groupsRes.data.map(g => ({
              id: g._id,
              title: g.groupName,
              type: "group",
              lastMsg: `${g.members?.length ?? 0} members`
            })));
          }
        }
      } catch (err) {
        console.error("Failed to fetch chat data:", err);
      }
    };
    fetchData();
  }, []);

  // 2. Socket Room Management
  useEffect(() => {
    if (activeRoom) {
      socket.emit("join_room", activeRoom.id);
      return () => socket.emit("leave_room", activeRoom.id);
    }
  }, [activeRoom]);

  const fetchRoomHistory = useCallback(async (roomId) => {
    if (!roomId) return;
    try {
      const response = await axios.get(`http://localhost:8080/messages/${roomId}`);
      if (response.data) {
        console.log("Fetched history for sync:", response.data.length, "messages");
        const history = response.data.map(m => ({
          id: m._id,
          room: roomId,
          from: m.name || "Unknown",
          initials: (m.name || "U").charAt(0).toUpperCase(),
          text: m.message,
          time: formatTime(m.time) || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }),
          self: m.sender === user.id || m.sender?._id === user.id,
          senderId: m.sender?._id || m.sender
        }));
        setMessagesByRoom(prev => ({ ...prev, [roomId]: history }));
      }
    } catch (err) {
      console.warn("Background fetch failed:", err);
    }
  }, [user.id]);

  // 3. Global Message & Typing Listener
  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      // Optimistic update
      setMessagesByRoom((prev) => ({
        ...prev,
        [msg.room]: [...(prev[msg.room] || []), msg]
      }));

      // Instant DB refresh for active room
      if (activeRoom && activeRoom.id === msg.room) {
        fetchRoomHistory(msg.room);
      }

      if (!open || (activeRoom && activeRoom.id !== msg.room)) {
        setUnreadCount((c) => c + 1);
      }
    };

    const handleTyping = ({ room, user: typingUser }) => {
      setTypingUsers((prev) => {
        const users = prev[room] || [];
        if (!users.includes(typingUser)) return { ...prev, [room]: [...users, typingUser] };
        return prev;
      });
    };

    const handleStopTyping = ({ room, user: typingUser }) => {
      setTypingUsers((prev) => {
        const users = prev[room] || [];
        return { ...prev, [room]: users.filter((u) => u !== typingUser) };
      });
    };

    const handleMessageDeleted = ({ roomId, messageId }) => {
      setMessagesByRoom((prev) => ({
        ...prev,
        [roomId]: (prev[roomId] || []).filter((msg) => msg.id !== messageId),
      }));
      // Refresh DB state after deletion to ensure sync
      if (activeRoom && activeRoom.id === roomId) {
        fetchRoomHistory(roomId);
      }
    };

    const handleMessageReceipt = ({ tempId, realId, roomId }) => {
      // Refresh entire history when our own message is confirmed
      if (activeRoom && activeRoom.id === roomId) {
        fetchRoomHistory(roomId);
      } else {
        // Fallback to manual sync if not in active room
        setMessagesByRoom((prev) => {
          const roomMessages = prev[roomId] || [];
          const updatedMessages = roomMessages.map((msg) =>
            msg.id === tempId ? { ...msg, id: realId } : msg
          );
          return { ...prev, [roomId]: updatedMessages };
        });
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);
    socket.on("message_deleted", handleMessageDeleted);
    socket.on("message_receipt", handleMessageReceipt);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
      socket.off("message_deleted", handleMessageDeleted);
      socket.off("message_receipt", handleMessageReceipt);
    };
  }, [open, activeRoom, fetchRoomHistory]);

  // 4. Scroll to Bottom
  useEffect(() => {
    if (view === "chat") {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [view, messagesByRoom, activeRoom, typingUsers]);

  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (!activeRoom) return;

    socket.emit("typing", { room: activeRoom.id, user: user.name });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { room: activeRoom.id, user: user.name });
    }, 2000);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || !activeRoom) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit("stop_typing", { room: activeRoom.id, user: user.name });

    const msg = {
      id: Date.now(),
      room: activeRoom.id,
      from: user.name,
      initials: user.initials,
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }),
      sender: user.id,
      from: user.name,
      initials: user.initials,
      chatType: activeRoom.type === "dept" ? "department" : "group",
    };

    socket.emit("send_message", msg);
    // Optimistic update
    setMessagesByRoom((prev) => ({
      ...prev,
      [activeRoom.id]: [...(prev[activeRoom.id] || []), msg]
    }));
    setInput("");

    // Sudden re-fetch to ensure we have the REAL MongoDB ID for deletion
    setTimeout(() => {
      fetchRoomHistory(activeRoom.id);
    }, 500);
  };

  const selectRoom = async (room) => {
    setActiveRoom(room);
    setView("chat");
    setUnreadCount(0);
    fetchRoomHistory(room.id);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!activeRoom) return;

    // Optimistic UI Update
    setMessagesByRoom(prev => ({
      ...prev,
      [activeRoom.id]: (prev[activeRoom.id] || []).filter(m => m.id !== msgId)
    }));

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("adminToken");

      // Call REST API for persistence
      // await axios.delete(`http://localhost:8080/messages/${msgId}`, {
      //   headers: { Authorization: token }
      // });

      // Emit socket event for real-time update
      socket.emit("delete_message", { roomId: activeRoom.id, messageId: msgId });
    } catch (err) {
      console.error("Failed to delete message:", err);
      // Optional: Re-fetch history if delete fails to revert optimistic update
      selectRoom(activeRoom);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || selectedMembers.length === 0) return;
    try {
      const res = await axios.post("http://localhost:8080/groups/create", {
        name: newGroupName,
        members: [...selectedMembers, user.id],
        createdBy: user.id
      });
      if (res.data) {
        setGroups(prev => [...prev, {
          id: res.data._id,
          title: res.data.groupName || newGroupName,
          type: "group",
          lastMsg: `${res.data.members?.length ?? 0} members`
        }]);
        setShowCreateGroup(false);
        setNewGroupName("");
        setSelectedMembers([]);
      }
    } catch (err) {
      console.error("Failed to create group:", err);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
    try {
      const res = await axios.get("http://localhost:8080/employeelists", {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json"
        }
      });
      console.log("employee", res.data);
      setAllUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const toggleMember = (id) => {
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const currentMessages = activeRoom ? (messagesByRoom[activeRoom.id] || []) : [];

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
      <Fade in={open} unmountOnExit>
        <Box
          sx={{
            width: { xs: "calc(100vw - 32px)", sm: 340, md: 360 },
            maxWidth: 400,
            height: { xs: 480, sm: 540 },
            borderRadius: "24px",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2, py: 2,
              background: `linear-gradient(135deg, ${INDIGO_ACCENT} 0%, #3730a3 100%)`,
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexShrink: 0,
            }}
          >
            {view === "chat" && (
              <IconButton size="small" onClick={() => setView("list")} sx={{ color: "#fff", mr: -0.5 }}>
                <ChevronLeftRoundedIcon />
              </IconButton>
            )}

            <Box sx={{ flex: 1 }}>
              <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "0.95rem" }}>
                {view === "list" ? "Collaborations" : activeRoom?.title}
              </Typography>
              {view === "chat" && (
                <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.68rem", fontWeight: 500 }}>
                  Active Discussion
                </Typography>
              )}
            </Box>

            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "rgba(255,255,255,0.8)", "&:hover": { color: "#fff" } }}>
              <CloseRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {view === "list" ? (
              <List sx={{ flex: 1, overflowY: "auto", py: 0 }}>
                {/* Department Section */}
                <Typography sx={{ px: 2, py: 1.5, fontSize: "0.7rem", fontWeight: 800, color: SECONDARY_SLATE, textTransform: "uppercase", letterSpacing: 1, bgcolor: "rgba(0,0,0,0.02)" }}>
                  Departments
                </Typography>
                {departments.map((dept) => (
                  <ListItem
                    key={dept.Dep_id}
                    disablePadding
                    sx={{ "&:hover": { bgcolor: alpha(INDIGO_ACCENT, 0.04) } }}
                  >
                    <ListItemButton
                      onClick={() => selectRoom({ id: dept.Dep_id, title: dept.title, type: "dept" })}
                      sx={{ py: 1 }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: alpha(INDIGO_ACCENT, 0.1), color: INDIGO_ACCENT }}>
                          <BusinessRoundedIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: PRIMARY_SLATE }}>{dept.title}</Typography>}
                        secondary={<Typography noWrap sx={{ fontSize: "0.75rem", color: SECONDARY_SLATE }}>{dept.description?.substring(0, 30)}...</Typography>}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}

                <Divider />

                {/* Groups Section */}
                <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: "rgba(0,0,0,0.02)" }}>
                  <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, color: SECONDARY_SLATE, textTransform: "uppercase", letterSpacing: 1 }}>
                    Groups
                  </Typography>
                  <IconButton size="small" onClick={() => { fetchUsers(); setShowCreateGroup(true); }} sx={{ color: INDIGO_ACCENT }}>
                    <AddRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
                {groups.map((grp) => (
                  <ListItem
                    key={grp.id}
                    disablePadding
                    sx={{ "&:hover": { bgcolor: alpha(INDIGO_ACCENT, 0.04) } }}
                  >
                    <ListItemButton
                      onClick={() => selectRoom(grp)}
                      sx={{ py: 1 }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: alpha("#10b981", 0.1), color: "#10b981" }}>
                          <GroupsRoundedIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: PRIMARY_SLATE }}>{grp.title}</Typography>}
                        secondary={<Typography noWrap sx={{ fontSize: "0.75rem", color: SECONDARY_SLATE }}>{grp.lastMsg}</Typography>}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <>
                <Box
                  sx={{
                    flex: 1,
                    overflowY: "auto",
                    px: 2, py: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    bgcolor: "#fcfcfc",
                    "&::-webkit-scrollbar": { width: "4px" },
                    "&::-webkit-scrollbar-thumb": { background: "rgba(0,0,0,0.1)", borderRadius: "4px" },
                  }}
                >
                  {currentMessages.length === 0 && (
                    <Box sx={{ mt: 10, textAlign: "center", opacity: 0.5 }}>
                      <ChatBubbleRoundedIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography sx={{ fontSize: "0.8rem" }}>No messages here yet.</Typography>
                    </Box>
                  )}
                  {currentMessages.map((msg) => {
                    // Check if message is from current user using persistent ID
                    // Support both sender as string and sender as object
                    const msgSenderId = msg.sender?._id || msg.sender;
                    const isSelf = msg.self === true || (msgSenderId && msgSenderId === user.id);

                    const memberColor = getMemberColor(msg.from);

                    return (
                      <Box
                        key={msg.id}
                        sx={{
                          display: "flex",
                          flexDirection: isSelf ? "row-reverse" : "row",
                          alignItems: "flex-end",
                          gap: 1,
                          mb: 0.5
                        }}
                      >
                        {!isSelf && (
                          <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(memberColor, 0.1), color: memberColor, fontSize: "0.7rem", fontWeight: 800 }}>
                            {msg.initials}
                          </Avatar>
                        )}
                        <Box sx={{ maxWidth: "75%" }}>
                          {!isSelf && (
                            <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: memberColor, mb: 0.4, ml: 0.5 }}>
                              {msg.from}
                            </Typography>
                          )}
                          <Box
                            sx={{
                              px: 1.8, py: 1,
                              borderRadius: isSelf ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                              bgcolor: isSelf ? INDIGO_ACCENT : alpha(memberColor, 0.05),
                              color: isSelf ? "#fff" : PRIMARY_SLATE,
                              fontSize: "0.85rem",
                              fontWeight: 500,
                              lineHeight: 1.5,
                              boxShadow: isSelf ? "0 4px 12px rgba(79,70,229,0.2)" : "0 2px 8px rgba(0,0,0,0.05)",
                              border: isSelf ? "none" : `1px solid ${alpha(memberColor, 0.1)}`,
                              position: "relative",
                              "&:hover .delete-btn": { opacity: 1 }
                            }}
                          >
                            {msg.text}
                            {isSelf && (
                              <Tooltip
                                title="Delete message"
                                arrow
                                placement="left"
                                disableInteractive
                                componentsProps={{
                                  tooltip: { sx: { pointerEvents: "none" } }
                                }}
                              >
                                <Box
                                  component="span"
                                  className="delete-btn"
                                  sx={{
                                    position: "absolute",
                                    left: -35,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    opacity: 0,
                                    transition: "all 0.2s",
                                    pointerEvents: "auto",
                                  }}
                                >
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteMessage(msg.id)}
                                    sx={{
                                      color: "#ef4444",
                                      "&:hover": { bgcolor: alpha("#ef4444", 0.12) },
                                      padding: "4px"
                                    }}
                                  >
                                    <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Box>
                              </Tooltip>
                            )}
                          </Box>
                          <Typography sx={{ fontSize: "0.6rem", color: alpha(SECONDARY_SLATE, 0.6), mt: 0.5, textAlign: isSelf ? "right" : "left", mx: 0.5 }}>
                            {msg.time}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}

                  {/* Typing Indicator */}
                  {(typingUsers[activeRoom.id] || []).filter(u => u !== user.name).length > 0 && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1, mb: 1 }}>
                      <Typography sx={{ fontSize: "0.7rem", color: alpha(SECONDARY_SLATE, 0.6), fontStyle: "italic" }}>
                        {(typingUsers[activeRoom.id] || []).filter(u => u !== user.name).join(", ")} is typing...
                      </Typography>
                    </Box>
                  )}
                  <div ref={bottomRef} />
                </Box>

                {/* Input Area */}
                <Box
                  sx={{
                    px: 2, py: 2,
                    borderTop: "1px solid rgba(0,0,0,0.06)",
                    display: "flex",
                    gap: 1.5,
                    alignItems: "center",
                    bgcolor: "#fff",
                  }}
                >
                  <TextField
                    size="small"
                    fullWidth
                    multiline
                    maxRows={3}
                    placeholder="Message..."
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKey}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "16px",
                        fontSize: "0.88rem",
                        bgcolor: "#f8f9fa",
                        color: "#000",
                        "& fieldset": { border: "none" },
                      },
                    }}
                  />
                  <IconButton
                    onClick={handleSend}
                    disabled={!input.trim()}
                    sx={{
                      bgcolor: INDIGO_ACCENT,
                      color: "#fff",
                      width: 38,
                      height: 38,
                      borderRadius: "12px",
                      "&:hover": { bgcolor: "#3730a3", transform: "scale(1.05)" },
                      "&:disabled": { bgcolor: alpha(SECONDARY_SLATE, 0.1), color: alpha(SECONDARY_SLATE, 0.3) },
                      transition: "all 0.2s",
                    }}
                  >
                    <SendRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Fade>

      <Badge
        badgeContent={!open ? unreadCount : 0}
        color="error"
        overlap="circular"
        sx={{ "& .MuiBadge-badge": { fontSize: "0.7rem", fontWeight: 700 } }}
      >
        <IconButton
          onClick={() => setOpen((v) => !v)}
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${INDIGO_ACCENT} 0%, #3730a3 100%)`,
            color: "#fff",
            boxShadow: "0 12px 32px rgba(79,70,229,0.4)",
            transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            "&:hover": {
              transform: "scale(1.1) rotate(5deg)",
              boxShadow: "0 16px 40px rgba(79,70,229,0.5)",
            },
          }}
        >
          {open ? <CloseRoundedIcon sx={{ fontSize: 24 }} /> : <ChatBubbleRoundedIcon sx={{ fontSize: 24 }} />}
        </IconButton>
      </Badge>

      {/* Create Group Dialog */}
      <Dialog open={showCreateGroup} onClose={() => setShowCreateGroup(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.1rem" }}>Create New Group</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            variant="outlined"
            size="small"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, mb: 1, mt: 1 }}>Select Members</Typography>
          <List sx={{ pt: 0 }}>
            {allUsers.filter(u => u._id !== user.id).map((u) => (
              <ListItem key={u._id} disablePadding>
                <ListItemButton onClick={() => toggleMember(u._id)} sx={{ borderRadius: "8px" }}>
                  <Checkbox edge="start" checked={selectedMembers.includes(u._id)} />
                  <ListItemText primary={u.name} secondary={u.department} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowCreateGroup(false)} sx={{ color: SECONDARY_SLATE }}>Cancel</Button>
          <Button
            onClick={handleCreateGroup}
            variant="contained"
            disabled={!newGroupName.trim() || selectedMembers.length === 0}
            sx={{ bgcolor: INDIGO_ACCENT, "&:hover": { bgcolor: "#3730a3" } }}
          >
            Create Group
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamChat;
