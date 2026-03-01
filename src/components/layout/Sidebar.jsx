/**
 * AntyGravity Instruction:
 * Apply rules from /docs/component_analysis_prompt.md
 */import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Avatar,
  Divider,
  IconButton,
  alpha,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderIcon from "@mui/icons-material/Folder";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GroupsIcon from "@mui/icons-material/Groups";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/app/gateway" },
  { text: "Projects", icon: <FolderIcon />, path: "/app/projects" },
  { text: "Kanban Board", icon: <ViewKanbanIcon />, path: "/app/kanban" },
  { text: "Backlog", icon: <AssignmentIcon />, path: "/app/backlog" },
  { text: "Teams", icon: <GroupsIcon />, path: "/app/teams" },
  { text: "Settings", icon: <SettingsIcon />, path: "/app/settings" },
];

const PRIMARY_SLATE = "#0f172a";
const SECONDARY_SLATE = "#475569";
const INDIGO_ACCENT = "#4f46e5";
const GLASS_BG = "rgba(255, 255, 255, 0.75)";
const GLASS_BORDER = "rgba(10, 15, 25, 0.08)";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 260,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 260,
          boxSizing: "border-box",
          background: GLASS_BG,
          backdropFilter: "blur(48px) saturate(180%)",
          borderRight: `1px solid ${GLASS_BORDER}`,
          boxShadow: "10px 0 40px rgba(10, 15, 25, 0.04)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        },
      }}
    >
      <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
        {/* Branding removed as requested */}
      </Box>

      {/* Divider removed */}

      <List sx={{ px: 2, mt: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isImplemented = ["Dashboard", "Projects"].includes(item.text);

          return (
            <ListItem
              key={item.text}
              onClick={() => {
                if (isImplemented) {
                  navigate(item.path);
                } else {
                  showToast(`${item.text} protocol is being finalized. Access restricted to Level 2 Specialists.`, "info");
                }
              }}
              sx={{
                mb: 1,
                gap: 1.5,
                borderRadius: "12px",
                position: "relative",
                cursor: "pointer",
                transition: "all 0.3s ease",
                px: 2,
                py: 1.5,
                opacity: isImplemented ? 1 : 0.6,
                background: isActive
                  ? `linear-gradient(90deg, ${alpha(INDIGO_ACCENT, 0.08)} 0%, transparent 100%)`
                  : "transparent",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "4px",
                  height: isActive ? "24px" : "0px",
                  backgroundColor: INDIGO_ACCENT,
                  borderRadius: "0 4px 4px 0",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: isActive ? `0 0 12px ${alpha(INDIGO_ACCENT, 0.4)}` : "none",
                },
                "&:hover": {
                  background: isImplemented ? alpha(INDIGO_ACCENT, 0.04) : "transparent",
                  transform: isImplemented ? "translateX(4px)" : "none",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? INDIGO_ACCENT : alpha(SECONDARY_SLATE, 0.6),
                  minWidth: 42,
                  display: "flex",
                  justifyContent: "center",
                  transition: "color 0.3s ease",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: "0.95rem",
                  fontWeight: isActive ? 800 : 500,
                  color: isActive ? PRIMARY_SLATE : alpha(SECONDARY_SLATE, 0.7),
                  letterSpacing: "0.01em",
                  transition: "color 0.3s ease",
                }}
                sx={{ m: 0 }}
              />
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: "20px",
            background: "rgba(255,255,255,0.4)",
            border: `1px solid ${GLASS_BORDER}`,
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.04)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
            <Avatar
              src="/broken-image.jpg"
              sx={{
                width: 36,
                height: 36,
                border: `2px solid ${alpha(INDIGO_ACCENT, 0.2)}`,
                bgcolor: alpha(INDIGO_ACCENT, 0.1)
              }}
            />
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ color: PRIMARY_SLATE, fontWeight: 800, lineHeight: 1.2 }}
              >
                Alkor User
              </Typography>
              <Typography variant="caption" sx={{ color: SECONDARY_SLATE, fontWeight: 500 }}>
                Product Owner
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            sx={{
              width: "100%",
              borderRadius: "10px",
              py: 0.8,
              color: alpha(SECONDARY_SLATE, 0.6),
              fontSize: "0.8rem",
              fontWeight: 700,
              textTransform: "none",
              border: `1px solid ${alpha(SECONDARY_SLATE, 0.1)}`,
              "&:hover": {
                color: "#ef4444",
                background: alpha("#ef4444", 0.08),
                borderColor: alpha("#ef4444", 0.2),
              },
            }}
          >
            <LogoutIcon sx={{ fontSize: 16, mr: 1 }} /> Logout
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
