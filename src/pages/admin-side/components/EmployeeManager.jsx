import React from "react";
import {
  Box,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Chip,
  IconButton,
  Fade,
  useTheme,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
  Tooltip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import { iPhoneGlassButton, GLASS_BORDER, whiteCard } from "./SharedStyles";

const EmployeeManager = ({
  users,
  searchQuery,
  setSearchQuery,
  departmentFilter,
  setDepartmentFilter,
  departmentsList,
  onAddEmployee,
  onAddResponsible,
  onEditUser,
  onToggleUserStatus,
  onDeleteUser,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchQuery ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      departmentFilter === "ALL" || user.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  return (
    <Fade in={true}>
      <Box sx={{ width: "100%" }}>
        {/* Header & Toolbar */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", lg: "center" },
            mb: 4,
            gap: 3,
          }}
        >
          <Box>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{ fontWeight: 1000, color: "rgba(0,0,0,0.85)", letterSpacing: "-0.025em" }}
            >
              User Directory
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
              Managing {filteredUsers.length} Active Nodes
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
            sx={{ width: { xs: "100%", lg: "auto" } }}
          >
            {/* Dept Filter */}
            <FormControl
              size="small"
              sx={{
                minWidth: { xs: "100%", sm: 160 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  background: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  "& fieldset": { borderColor: "rgba(0,0,0,0.08)" },
                  "& .MuiSelect-select": { color: "#000", fontWeight: 800 },
                },
                "& .MuiInputLabel-root": { fontWeight: 800, color: "rgba(0,0,0,0.4)" },
              }}
            >
              <InputLabel>Department</InputLabel>
              <Select
                value={departmentFilter}
                label="Department"
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Departments</MenuItem>
                {departmentsList.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Search Field */}
            <TextField
              placeholder="Search by name or email..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: { xs: "100%", sm: "240px", md: "300px" },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  background: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  "& fieldset": { borderColor: "rgba(0,0,0,0.08)" },
                  "& .MuiInputBase-input": { color: "#000", fontWeight: 800 },
                },
              }}
            />

            {/* Action Buttons */}
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onAddEmployee}
                fullWidth={isSmallMobile}
                sx={{
                  ...iPhoneGlassButton,
                  background: "linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)",
                  color: "#fff",
                  px: isSmallMobile ? 2 : 3,
                  fontSize: isSmallMobile ? "0.75rem" : "0.85rem",
                  "&:hover": { background: "linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%)" }
                }}
              >
                Employee
              </Button>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={onAddResponsible}
                fullWidth={isSmallMobile}
                sx={{
                  ...iPhoneGlassButton,
                  background: "linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)",
                  color: "#fff",
                  px: isSmallMobile ? 2 : 3,
                  fontSize: isSmallMobile ? "0.75rem" : "0.85rem",
                  "&:hover": { background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)" }
                }}
              >
                Responsible
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Content View Context Switch */}
        <AnimatePresence mode="wait">
          {isMobile ? (
            <Grid container spacing={2} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {filteredUsers.map((user) => (
                <Grid item xs={12} sm={6} key={user._id || user.id}>
                  <Box
                    sx={{
                      ...whiteCard,
                      p: 2.5,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      borderLeft: `4px solid ${user.active ? "#10b981" : "#e11d48"}`,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          background: `linear-gradient(135deg, #38bdf8, #818cf8)`,
                          color: "#fff",
                          fontWeight: 900,
                          borderRadius: "14px",
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 900, color: "rgba(0,0,0,0.85)", fontSize: "1.1rem" }}>
                          {user.name}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={user.role || "Staff"}
                            size="small"
                            sx={{ height: 18, fontSize: "0.6rem", fontWeight: 900, textTransform: "uppercase", background: "rgba(0,0,0,0.05)" }}
                          />
                          <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700 }}>
                            ID: {user._id?.slice(-6).toUpperCase()}
                          </Typography>
                        </Stack>
                      </Box>
                      <Chip
                        label={user.active ? "ON" : "OFF"}
                        size="small"
                        sx={{
                          background: user.active ? "rgba(16, 185, 129, 0.1)" : "rgba(225, 29, 72, 0.1)",
                          color: user.active ? "#10b981" : "#e11d48",
                          fontWeight: 1000,
                          fontSize: "0.6rem",
                        }}
                      />
                    </Box>

                    <Stack spacing={1}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <EmailIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#64748b" }}>{user.email}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <BusinessCenterIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#64748b" }}>{user.department || "General"}</Typography>
                      </Box>
                    </Stack>

                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1, pt: 2, borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small" onClick={() => onEditUser(user)} sx={{ background: "rgba(56, 189, 248, 0.1)", color: "#38bdf8" }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => onToggleUserStatus(user._id || user.id, user.active)} sx={{ background: user.active ? "rgba(225, 29, 72, 0.05)" : "rgba(16, 185, 129, 0.05)", color: user.active ? "#ef4444" : "#10b981" }}>
                          {user.active ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                      </Stack>
                      <IconButton size="small" onClick={() => onDeleteUser(user)} sx={{ background: "rgba(225, 29, 72, 0.1)", color: "#e11d48" }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                background: "rgba(255, 255, 255, 0.4)",
                backdropFilter: "blur(20px)",
                borderRadius: "28px",
                border: "1px solid rgba(0,0,0,0.05)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.03)",
                maxHeight: "65vh",
                overflowY: "auto",
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {["Employee Details", "Role & Department", "Access Status", "Operations"].map((head) => (
                      <TableCell
                        key={head}
                        sx={{
                          background: "rgba(255, 255, 255, 0.9) !important",
                          color: "rgba(0,0,0,0.4)",
                          fontWeight: 1000,
                          textTransform: "uppercase",
                          letterSpacing: "0.15em",
                          fontSize: "0.75rem",
                          py: 2.5,
                          borderBottom: "1px solid rgba(0,0,0,0.05)",
                        }}
                      >
                        {head}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow
                      key={user._id || user.id}
                      sx={{ "&:hover": { background: "rgba(0,0,0,0.01)" }, transition: "all 0.2s" }}
                    >
                      <TableCell sx={{ borderBottom: "1px solid rgba(0,0,0,0.03)", py: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                          <Avatar
                            sx={{
                              width: 44,
                              height: 44,
                              background: `linear-gradient(135deg, #38bdf8, #818cf8)`,
                              color: "#fff",
                              fontWeight: 900,
                              borderRadius: "14px",
                            }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 900, color: "rgba(0,0,0,0.85)", fontSize: "0.95rem" }}>
                              {user.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 700 }}>
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid rgba(0,0,0,0.03)" }}>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            label={user.department || "General"}
                            size="small"
                            sx={{ background: "rgba(56, 189, 248, 0.08)", color: "#0ea5e9", fontWeight: 900, borderRadius: "8px" }}
                          />
                          <Chip
                            label={user.role || "Staff"}
                            size="small"
                            sx={{ background: "rgba(129, 140, 248, 0.08)", color: "#4f46e5", fontWeight: 900, borderRadius: "8px" }}
                          />
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid rgba(0,0,0,0.03)" }}>
                        <Chip
                          icon={user.active ? <CheckCircleIcon style={{ color: "inherit", fontSize: 14 }} /> : <BlockIcon style={{ color: "inherit", fontSize: 14 }} />}
                          label={user.active ? "Authorized" : "Deauthorized"}
                          size="small"
                          sx={{
                            background: user.active ? "rgba(16, 185, 129, 0.1)" : "rgba(225, 29, 72, 0.1)",
                            color: user.active ? "#10b981" : "#e11d48",
                            fontWeight: 1000,
                            fontSize: "0.65rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid rgba(0,0,0,0.03)" }}>
                        <Stack direction="row" spacing={1.5}>
                          <Tooltip title="Edit Profile">
                            <IconButton size="small" onClick={() => onEditUser(user)} sx={{ color: "#38bdf8", "&:hover": { background: "rgba(56, 189, 248, 0.1)" } }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.active ? "Revoke Access" : "Grant Access"}>
                            <IconButton size="small" onClick={() => onToggleUserStatus(user._id || user.id, user.active)} sx={{ color: user.active ? "#f43f5e" : "#10b981", "&:hover": { background: user.active ? "rgba(244, 63, 94, 0.1)" : "rgba(16, 185, 129, 0.1)" } }}>
                              {user.active ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Purge Data">
                            <IconButton size="small" onClick={() => onDeleteUser(user)} sx={{ color: "#e11d48", "&:hover": { background: "rgba(225, 29, 72, 0.1)" } }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </AnimatePresence>
      </Box>
    </Fade>
  );
};

export default EmployeeManager;
