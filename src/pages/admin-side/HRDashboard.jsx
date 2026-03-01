/**
 * AntyGravity Instruction:
 * Apply rules from /docs/component_analysis_prompt.md
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Stack,
  Chip,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Tabs,
  Tab,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  CircularProgress,
  Avatar,
  useTheme,
  alpha,
  Zoom,
  Fade,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import BusinessIcon from "@mui/icons-material/Business";
import ReportIcon from "@mui/icons-material/Report";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FolderIcon from "@mui/icons-material/Folder";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ScheduleIcon from "@mui/icons-material/Schedule";
import BlockIcon from "@mui/icons-material/Block";
import WarningIcon from "@mui/icons-material/Warning";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// --- Styled Components & Theme Constants ---
const GLASS_BG = "rgba(255, 255, 255, 0.75)";
const GLASS_BORDER = "rgba(10, 15, 25, 0.08)";

const GlassCard = ({ children, sx = {}, hoverEffect = true }) => (
  <Card
    component={motion.div}
    whileHover={hoverEffect ? {
      translateY: -5,
      scale: 1.01,
      borderColor: "rgba(255, 255, 255, 0.2)",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(56, 189, 248, 0.1)"
    } : {}}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 150, damping: 20 }}
    sx={{
      background: GLASS_BG,
      backdropFilter: "blur(24px) saturate(160%)",
      WebkitBackdropFilter: "blur(24px) saturate(160%)",
      border: `1px solid ${GLASS_BORDER}`,
      borderRadius: "24px",
      boxShadow: "0 8px 32px 0 rgba(10, 15, 25, 0.05)",
      color: "#0f172a",
      overflow: "hidden",
      ...sx,
    }}
  >
    {children}
  </Card>
);

const HRDashboard = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [reports, setReports] = useState([]);
  const [logs, setLogs] = useState([]);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openDeptDialog, setOpenDeptDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingDept, setEditingDept] = useState(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
    active: true,
  });
  const [deptForm, setDeptForm] = useState({
    id: "",
    title: "",
    color: "",
    description: "",
  });
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUsers(),
        fetchDepartments(),
        fetchReports(),
        fetchLogs(),
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/admin/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://localhost:8080/admin/departments");
      setDepartments(res.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await axios.get("http://localhost:8080/admin/reports");
      setReports(res.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const fetchLogs = async () => {
    try {
      let token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8080/admin/employe_log", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setLogs(res.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleUserDialogOpen = (user = null) => {
    setEditingUser(user);
    setUserForm(
      user
        ? { ...user }
        : { name: "", email: "", department: "", password: "", active: true },
    );
    setOpenUserDialog(true);
  };

  const handleUserDialogClose = () => {
    setOpenUserDialog(false);
    setEditingUser(null);
  };

  const handleDeptDialogOpen = (dept = null) => {
    setEditingDept(dept);
    setDeptForm(
      dept ? { ...dept } : { id: "", title: "", color: "", description: "" },
    );
    setOpenDeptDialog(true);
  };

  const handleDeptDialogClose = () => {
    setOpenDeptDialog(false);
    setEditingDept(null);
  };

  const handleUserSubmit = async () => {
    try {
      if (editingUser) {
        const { password, ...updateData } = userForm;
        let id = editingUser._id;
        await axios.put(
          `http://localhost:8080/admin/updateEmploye/${id}`,
          updateData,
        );
      } else {
        await axios
          .post("http://localhost:8080/admin/employes", userForm)
          .then((res) => {
            setAlertMessage(`User ${userForm.name} added successfully`);
            setAlertOpen(true);
          });
      }
      fetchUsers();
      handleUserDialogClose();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDeptSubmit = async () => {
    try {
      if (editingDept) {
        let id = editingDept._id;
        await axios.put(
          `http://localhost:8080/admin/Editdepartments/${id}`,
          deptForm,
        );
      } else {
        await axios.post("http://localhost:8080/admin/addDep", deptForm);
      }
      fetchDepartments();
      handleDeptDialogClose();
    } catch (error) {
      console.error("Error saving department:", error);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await axios.put(`http://localhost:8080/hr/users/${userId}`, {
        active: !currentStatus,
      });
      fetchUsers();
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        await axios
          .delete(`http://localhost:8080/admin/deleteEmp/${userToDelete._id}`)
          .then((res) => {
            setUsers(users.filter((u) => u._id !== userToDelete._id));
            setAlertMessage(`User ${userToDelete.name} deleted successfully`);
            setAlertOpen(true);
            setTimeout(() => setAlertOpen(false), 3000);
          });
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
    setOpenDeleteDialog(false);
    setUserToDelete(null);
  };

  const cancelDeleteUser = () => {
    setOpenDeleteDialog(false);
    setUserToDelete(null);
  };

  const handleDeleteDept = async (deptId) => {
    try {
      let id = deptId;
      await axios.delete(`http://localhost:8080/admin/deleteDept/${id}`);
      fetchDepartments();
    } catch (error) {
      console.error("Error deleting department:", error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <GlassCard
      sx={{
        position: "relative",
        overflow: "hidden",
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "4px",
          background: color,
          boxShadow: `0 0 20px ${color}`,
        },
      }}
    >
      <CardContent sx={{ p: 4, display: "flex", alignItems: "center", gap: 3 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: "16px",
            background: alpha(color, 0.15),
            color: color,
            display: "flex",
            boxShadow: `0 0 20px ${alpha(color, 0.3)}`,
          }}
        >
          <Icon sx={{ fontSize: 40 }} />
        </Box>
        <Box>
          <Typography
            variant="h3"
            fontWeight="800"
            sx={{
              background: `linear-gradient(135deg, #0f172a, ${alpha(
                color,
                0.7,
              )})`,
              backgroundClip: "text",
              textFillColor: "transparent",
            }}
          >
            {value}
          </Typography>
          <Typography variant="body2" sx={{ color: "#475569", mt: 0.5 }}>
            {title}
          </Typography>
        </Box>
      </CardContent>
    </GlassCard>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f1f5f9",
        position: "relative",
        overflow: "hidden",
        p: { xs: 2, md: 4 },
        color: "#0f172a",
      }}
    >
      {/* Background Mesh Blobs */}
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: "none" }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{
            position: "absolute",
            top: "-10%",
            right: "10%",
            width: "50vw",
            height: "50vw",
            background: "radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "10%",
            width: "50vw",
            height: "50vw",
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </Box>

      {/* Header */}
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: 6, textAlign: "center", position: "relative", zIndex: 1 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              mb: 1,
              letterSpacing: -1,
              background: "linear-gradient(135deg, #0f172a 0%, #475569 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 20px rgba(0,0,0,0.05))",
            }}
          >
            HR Command Center
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#64748b",
              fontWeight: 500,
              letterSpacing: 1,
              textTransform: "uppercase",
              fontSize: "0.9rem"
            }}
          >
            Enterprise Management Suite
          </Typography>
        </Box>
      </Fade>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 6, position: "relative", zIndex: 1 }}>
        {[
          {
            title: "Total Employees",
            value: users.length,
            icon: PeopleIcon,
            color: "#38bdf8",
          },
          {
            title: "Active Now",
            value: users.filter((u) => u.active).length,
            icon: CheckCircleIcon,
            color: "#4ade80",
          },
          {
            title: "Departments",
            value: departments.length,
            icon: FolderIcon,
            color: "#f472b6",
          },
          {
            title: "Pending Reports",
            value: reports.length,
            icon: AssessmentIcon,
            color: "#fbbf24",
          },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
              <Box>
                <StatCard {...stat} />
              </Box>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Area */}
      <GlassCard sx={{ minHeight: "600px", overflow: "hidden" }}>
        {/* Navigation Tabs */}
        <Box
          sx={{
            borderBottom: `1px solid ${GLASS_BORDER}`,
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(10px)",
            px: 2,
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            centered
            sx={{
              "& .MuiTabs-indicator": {
                height: "4px",
                borderRadius: "4px 4px 0 0",
                background: "linear-gradient(90deg, #38bdf8, #818cf8)",
                boxShadow: "0 0 15px rgba(56, 189, 248, 0.5)",
              },
            }}
          >
            {[
              { icon: PersonAddIcon, label: "Employees" },
              { icon: BusinessIcon, label: "Departments" },
              { icon: ReportIcon, label: "Work Reports" },
              { icon: AccessTimeIcon, label: "Attendance Logs" },
            ].map((tab, idx) => (
              <Tab
                key={idx}
                icon={<tab.icon sx={{ fontSize: 20, mb: 0.5 }} />}
                label={tab.label}
                sx={{
                  color: "#64748b",
                  minHeight: 80,
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  fontWeight: 700,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&.Mui-selected": {
                    color: "#0f172a",
                    textShadow: "0 0 10px rgba(10, 15, 25, 0.05)"
                  },
                  "&:hover": {
                    color: "#cbd5e1",
                    transform: "translateY(-2px)"
                  }
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ p: 4 }}>
          {/* USER MANAGEMENT TAB */}
          {tabValue === 0 && (
            <Fade in={tabValue === 0}>
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 4,
                  }}
                >
                  <Typography variant="h5" fontWeight="bold">
                    User Directory
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleUserDialogOpen()}
                    sx={{
                      background: "linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)",
                      borderRadius: "14px",
                      textTransform: "none",
                      fontWeight: 800,
                      px: 3,
                      boxShadow: "0 8px 20px -5px rgba(56, 189, 248, 0.4)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 12px 25px -5px rgba(56, 189, 248, 0.5)",
                      }
                    }}
                  >
                    Add Employee
                  </Button>
                </Box>
                <TableContainer
                  component={Paper}
                  sx={{ background: "transparent", boxShadow: "none" }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        {[
                          "Employee",
                          "Contact Details",
                          "Role & Dept",
                          "Status",
                          "Actions",
                        ].map((head) => (
                          <TableCell
                            key={head}
                            sx={{
                              color: "#64748b",
                              borderBottom: `1px solid ${GLASS_BORDER}`,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {head}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow
                          key={user._id}
                          component={motion.tr}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          sx={{
                            "&:hover": {
                              background: "rgba(0, 0, 0, 0.03)",
                            },
                            transition: "background 0.3s ease",
                          }}
                        >
                          <TableCell
                            sx={{ borderBottom: `1px solid ${GLASS_BORDER}` }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Avatar
                                sx={{
                                  background: `linear-gradient(135deg, ${["#f472b6", "#c084fc", "#818cf8"][
                                    user.name.length % 3
                                  ]
                                    }, ${["#db2777", "#9333ea", "#4f46e5"][
                                    user.name.length % 3
                                    ]
                                    })`,
                                  color: "#f8fafc",
                                }}
                              >
                                {user.name.charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography fontWeight="600" color="#0f172a">
                                {user.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{
                              borderBottom: `1px solid ${GLASS_BORDER}`,
                              color: "#94a3b8",
                            }}
                          >
                            {user.email}
                          </TableCell>
                          <TableCell
                            sx={{ borderBottom: `1px solid ${GLASS_BORDER}` }}
                          >
                            <Stack direction="row" spacing={1}>
                              <Chip
                                label={user.department || "General"}
                                size="small"
                                sx={{
                                  background: alpha("#38bdf8", 0.1),
                                  color: "#38bdf8",
                                  border: `1px solid ${alpha("#38bdf8", 0.2)}`,
                                }}
                              />
                              <Chip
                                label={user.role || "Staff"}
                                size="small"
                                sx={{
                                  background: alpha("#c084fc", 0.1),
                                  color: "#c084fc",
                                  border: `1px solid ${alpha("#c084fc", 0.2)}`,
                                }}
                              />
                            </Stack>
                          </TableCell>
                          <TableCell
                            sx={{ borderBottom: `1px solid ${GLASS_BORDER}` }}
                          >
                            <Chip
                              label={user.active ? "Active" : "Inactive"}
                              size="small"
                              sx={{
                                background: user.active
                                  ? alpha("#4ade80", 0.1)
                                  : alpha("#ef4444", 0.1),
                                color: user.active ? "#4ade80" : "#ef4444",
                                fontWeight: "bold",
                              }}
                            />
                          </TableCell>
                          <TableCell
                            sx={{ borderBottom: `1px solid ${GLASS_BORDER}` }}
                          >
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                size="small"
                                onClick={() => handleUserDialogOpen(user)}
                                sx={{
                                  color: "#38bdf8",
                                  "&:hover": {
                                    background: alpha("#38bdf8", 0.1),
                                  },
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleToggleUserStatus(
                                    user._id || user.id,
                                    user.active,
                                  )
                                }
                                sx={{
                                  color: user.active ? "#ef4444" : "#4ade80",
                                  "&:hover": {
                                    background: alpha(
                                      user.active ? "#ef4444" : "#4ade80",
                                      0.1,
                                    ),
                                  },
                                }}
                              >
                                {user.active ? (
                                  <BlockIcon fontSize="small" />
                                ) : (
                                  <CheckCircleIcon fontSize="small" />
                                )}
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteUser(user)}
                                sx={{
                                  color: "#ef4444",
                                  "&:hover": {
                                    background: alpha("#ef4444", 0.1),
                                  },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Fade>
          )}

          {/* DEPARTMENTS TAB */}
          {tabValue === 1 && (
            <Fade in={tabValue === 1}>
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 4,
                  }}
                >
                  <Typography variant="h5" fontWeight="bold">
                    Departments
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleDeptDialogOpen()}
                    sx={{
                      background: "linear-gradient(135deg, #f472b6 0%, #db2777 100%)",
                      borderRadius: "14px",
                      textTransform: "none",
                      fontWeight: 800,
                      px: 3,
                      boxShadow: "0 8px 20px -5px rgba(244, 114, 182, 0.4)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 12px 25px -5px rgba(244, 114, 182, 0.5)",
                      }
                    }}
                  >
                    Add Department
                  </Button>
                </Box>
                <Grid container spacing={4}>
                  {departments.map((dept) => (
                    <Grid item xs={12} sm={6} md={4} key={dept.id}>
                      <GlassCard
                        hoverEffect={true}
                        sx={{
                          position: "relative",
                          overflow: "hidden",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Box
                          sx={{
                            height: "6px",
                            background: dept.color || "#38bdf8",
                            boxShadow: `0 0 15px ${dept.color || "#38bdf8"}`,
                          }}
                        />
                        <CardContent sx={{ p: 4, flexGrow: 1 }}>
                          <Box
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: "14px",
                              background: alpha(dept.color || "#38bdf8", 0.1),
                              color: dept.color || "#38bdf8",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mb: 3,
                            }}
                          >
                            <Typography variant="h4" fontWeight="bold">
                              {dept.title
                                ? dept.title.charAt(0).toUpperCase()
                                : "#"}
                            </Typography>
                          </Box>
                          <Typography
                            variant="h5"
                            fontWeight="bold"
                            sx={{ mb: 1 }}
                          >
                            {dept.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#94a3b8", mb: 3 }}
                          >
                            {dept.description}
                          </Typography>
                        </CardContent>
                        <Box
                          sx={{
                            p: 2.5,
                            borderTop: `1px solid ${GLASS_BORDER}`,
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 1.5,
                            background: "rgba(0,0,0,0.2)",
                          }}
                        >
                          <Button
                            size="small"
                            onClick={() => handleDeptDialogOpen(dept)}
                            sx={{
                              color: dept.color || "#38bdf8",
                              fontWeight: 700,
                              borderRadius: "10px",
                              "&:hover": { background: alpha(dept.color || "#38bdf8", 0.1) }
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleDeleteDept(dept._id)}
                            sx={{
                              color: "#ef4444",
                              fontWeight: 700,
                              borderRadius: "10px",
                              "&:hover": { background: alpha("#ef4444", 0.1) }
                            }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </GlassCard>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Fade>
          )}

          {/* REPORTS TAB */}
          {tabValue === 2 && (
            <Fade in={tabValue === 2}>
              <Box>
                <Box
                  sx={{
                    mb: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h5" fontWeight="bold">
                    Daily Activity Reports
                  </Typography>
                  <Chip
                    label={`${reports.length} Total Reports`}
                    color="warning"
                    variant="outlined"
                  />
                </Box>

                {Object.entries(
                  reports.reduce((acc, report) => {
                    let dept =
                      report.deptId || report.departmentId || "General";
                    // Normalize Department Names
                    if (dept === "DM") dept = "Digital Marketing";
                    else if (dept === "IT") dept = "IT Department";
                    else if (dept.length > 10) dept = "General"; // Handle long ID strings as default

                    if (!acc[dept]) acc[dept] = [];
                    acc[dept].push(report);
                    return acc;
                  }, {}),
                ).map(([category, categoryReports]) => (
                  <Box key={category} sx={{ mb: 5 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        borderLeft: `4px solid ${category === "Digital Marketing"
                          ? "#f472b6"
                          : category === "IT Department"
                            ? "#38bdf8"
                            : "#fbbf24"
                          }`,
                        pl: 2,
                      }}
                    >
                      {category}
                    </Typography>
                    <Grid container spacing={3}>
                      {categoryReports.map((report) => (
                        <Grid
                          item
                          xs={12}
                          md={6}
                          lg={4}
                          key={report._id || report.id}
                        >
                          <GlassCard
                            sx={{
                              height: "100%",
                              borderLeft: `4px solid ${category === "Digital Marketing"
                                ? "#f472b6"
                                : category === "IT Department"
                                  ? "#38bdf8"
                                  : "#fbbf24"
                                }`,
                            }}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  mb: 2,
                                }}
                              >
                                <Chip
                                  label={
                                    report.deptId ||
                                    report.departmentId ||
                                    "General"
                                  }
                                  size="small"
                                  sx={{
                                    background: alpha(
                                      category === "Digital Marketing"
                                        ? "#f472b6"
                                        : category === "IT Department"
                                          ? "#38bdf8"
                                          : "#fbbf24",
                                      0.1,
                                    ),
                                    color:
                                      category === "Digital Marketing"
                                        ? "#f472b6"
                                        : category === "IT Department"
                                          ? "#38bdf8"
                                          : "#fbbf24",
                                    fontWeight: "bold",
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#94a3b8" }}
                                >
                                  {new Date(report.date).toLocaleDateString()}
                                </Typography>
                              </Box>
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                sx={{ mb: 1, color: "#0f172a" }}
                              >
                                {report.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: "#475569", mb: 0 }}
                              >
                                {report.desc || report.content}
                              </Typography>
                            </CardContent>
                          </GlassCard>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ))}

                {reports.length === 0 && (
                  <Box sx={{ width: "100%", textAlign: "center", py: 8 }}>
                    <Typography sx={{ color: "#64748b" }}>
                      No reports found.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Fade>
          )}

          {/* LOGS TAB */}
          {tabValue === 3 && (
            <Fade in={tabValue === 3}>
              <Box>
                <Box
                  sx={{
                    mb: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h5" fontWeight="bold">
                    Authentication Logs
                  </Typography>
                  <Chip
                    label={`${logs.length} Total Entries`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>

                {Object.entries(
                  logs.reduce((acc, log) => {
                    let dept = log.users?.department || "General";
                    // Normalize Department Names
                    if (dept === "DM") dept = "Digital Marketing";
                    else if (dept === "IT") dept = "IT Department";
                    else if (dept.length > 10) dept = "General";

                    if (!acc[dept]) acc[dept] = [];
                    acc[dept].push(log);
                    return acc;
                  }, {}),
                ).map(([category, categoryLogs]) => (
                  <Box key={category} sx={{ mb: 5 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        borderLeft: `4px solid ${category === "Digital Marketing"
                          ? "#f472b6"
                          : category === "IT Department"
                            ? "#38bdf8"
                            : "#fbbf24"
                          }`,
                        pl: 2,
                      }}
                    >
                      {category}
                    </Typography>
                    <TableContainer
                      component={Paper}
                      sx={{ background: "transparent", boxShadow: "none" }}
                    >
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{
                                color: "#64748b",
                                borderBottom: `1px solid ${GLASS_BORDER}`,
                              }}
                            >
                              EMPLOYEE
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "#64748b",
                                borderBottom: `1px solid ${GLASS_BORDER}`,
                              }}
                            >
                              DATE
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "#64748b",
                                borderBottom: `1px solid ${GLASS_BORDER}`,
                              }}
                            >
                              DEPARTMENT
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "#64748b",
                                borderBottom: `1px solid ${GLASS_BORDER}`,
                              }}
                            >
                              SESSION 1
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "#64748b",
                                borderBottom: `1px solid ${GLASS_BORDER}`,
                              }}
                            >
                              SESSION 2
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {categoryLogs.map((log) => (
                            <TableRow
                              key={log._id}
                              sx={{
                                "&:hover": {
                                  background: "rgba(255,255,255,0.02)",
                                },
                              }}
                            >
                              <TableCell
                                sx={{
                                  borderBottom: `1px solid ${GLASS_BORDER}`,
                                  color: "#0f172a",
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                  }}
                                >
                                  <Avatar
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      fontSize: "0.75rem",
                                      background: alpha("#38bdf8", 0.2),
                                      color: "#38bdf8",
                                    }}
                                  >
                                    {log.users?.name?.charAt(0) || "?"}
                                  </Avatar>
                                  {log.users?.name || "Unknown"}
                                </Box>
                              </TableCell>
                              <TableCell
                                sx={{
                                  borderBottom: `1px solid ${GLASS_BORDER}`,
                                  color: "#94a3b8",
                                }}
                              >
                                {log.date ? log.date.split("T")[0] : "N/A"}
                              </TableCell>
                              <TableCell
                                sx={{
                                  borderBottom: `1px solid ${GLASS_BORDER}`,
                                }}
                              >
                                <Chip
                                  label={log.users?.department || "N/A"}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    color: "#475569",
                                    borderColor: "#475569",
                                  }}
                                />
                              </TableCell>
                              <TableCell
                                sx={{
                                  borderBottom: `1px solid ${GLASS_BORDER}`,
                                  color: "#0f172a",
                                }}
                              >
                                {log.first
                                  ? `${log.first.timeIn} - ${log.first.timeOut || "..."
                                  }`
                                  : "-"}
                              </TableCell>
                              <TableCell
                                sx={{
                                  borderBottom: `1px solid ${GLASS_BORDER}`,
                                  color: "#0f172a",
                                }}
                              >
                                {log.second
                                  ? `${log.second.timeIn} - ${log.second.timeOut || "..."
                                  }`
                                  : "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ))}
              </Box>
            </Fade>
          )}
        </Box>
      </GlassCard>

      <AnimatePresence>
        {openUserDialog && (
          <Dialog
            open={openUserDialog}
            onClose={handleUserDialogClose}
            TransitionComponent={Fade}
            transitionDuration={400}
            PaperProps={{
              sx: {
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(40px) saturate(180%)",
                WebkitBackdropFilter: "blur(40px) saturate(180%)",
                border: `1px solid ${GLASS_BORDER}`,
                borderRadius: "32px",
                boxShadow: "0 25px 50px -12px rgba(10, 15, 25, 0.1)",
                color: "#0f172a",
                overflow: "hidden"
              },
            }}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle sx={{ borderBottom: `1px solid ${GLASS_BORDER}`, p: 3, fontWeight: 800 }}>
              {editingUser ? "Edit Information" : "Onboard New Employee"}
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
              <Stack spacing={4} sx={{ mt: 2 }}>
                <TextField
                  label="Full Name"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      color: "#0f172a",
                      "& fieldset": { borderColor: "rgba(10, 15, 25, 0.1)" },
                      "&.Mui-focused fieldset": { borderColor: "#38bdf8" },
                    },
                    "& .MuiInputLabel-root": { color: "#475569" },
                  }}
                />
                <TextField
                  label="Email Address"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      color: "#0f172a",
                      "& fieldset": { borderColor: "rgba(10, 15, 25, 0.1)" },
                      "&.Mui-focused fieldset": { borderColor: "#38bdf8" },
                    },
                    "& .MuiInputLabel-root": { color: "#475569" },
                  }}
                />
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "#64748b" }}>Department Assignment</InputLabel>
                  <Select
                    value={userForm.department}
                    onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                    label="Department Assignment"
                    sx={{
                      borderRadius: "14px",
                      color: "#0f172a",
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(10, 15, 25, 0.1)" },
                    }}
                  >
                    <MenuItem value="IT">IT</MenuItem>
                    <MenuItem value="DM">DM</MenuItem>
                  </Select>
                </FormControl>
                {!editingUser && (
                  <TextField
                    label="Set Password"
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                        color: "#f1f5f9",
                        "& fieldset": { borderColor: "rgba(241, 245, 249, 0.1)" },
                        "&.Mui-focused fieldset": { borderColor: "#38bdf8" },
                      },
                      "& .MuiInputLabel-root": { color: "#64748b" },
                    }}
                  />
                )}
                <Button
                  variant="contained"
                  onClick={handleUserSubmit}
                  size="large"
                  sx={{
                    background: "linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)",
                    height: 56,
                    borderRadius: "16px",
                    fontWeight: 800,
                    fontSize: "1rem",
                    boxShadow: "0 10px 20px -5px rgba(56, 189, 248, 0.4)",
                    textTransform: "none",
                    "&:hover": {
                      background: "linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 15px 30px -5px rgba(56, 189, 248, 0.5)",
                    }
                  }}
                >
                  {editingUser ? "Update Information" : "Create Account"}
                </Button>
              </Stack>
            </DialogContent>
          </Dialog>
        )}

        {openDeptDialog && (
          <Dialog
            open={openDeptDialog}
            onClose={handleDeptDialogClose}
            TransitionComponent={Fade}
            PaperProps={{
              sx: {
                background: "rgba(15, 23, 42, 0.8)",
                backdropFilter: "blur(40px) saturate(180%)",
                WebkitBackdropFilter: "blur(40px) saturate(180%)",
                border: `1px solid ${GLASS_BORDER}`,
                borderRadius: "32px",
                color: "#0f172a",
                overflow: "hidden"
              },
            }}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle sx={{ borderBottom: `1px solid ${GLASS_BORDER}`, p: 3, fontWeight: 800 }}>
              {editingDept ? "Configure Department" : "Initialize Department"}
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
              <Stack spacing={4} sx={{ mt: 2 }}>
                <TextField
                  label="Department ID"
                  value={deptForm.id}
                  onChange={(e) => setDeptForm({ ...deptForm, id: e.target.value })}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      color: "#f1f5f9",
                      "& fieldset": { borderColor: "rgba(241, 245, 249, 0.1)" },
                    },
                  }}
                />
                <TextField
                  label="Title"
                  value={deptForm.title}
                  onChange={(e) => setDeptForm({ ...deptForm, title: e.target.value })}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      color: "#f1f5f9",
                      "& fieldset": { borderColor: "rgba(241, 245, 249, 0.1)" },
                    },
                  }}
                />
                <TextField
                  label="Visual Accent (Hex)"
                  value={deptForm.color}
                  onChange={(e) => setDeptForm({ ...deptForm, color: e.target.value })}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      color: "#f1f5f9",
                      "& fieldset": { borderColor: "rgba(241, 245, 249, 0.1)" },
                    },
                  }}
                />
                <TextField
                  label="Description"
                  value={deptForm.description}
                  multiline
                  rows={3}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      color: "#f1f5f9",
                      "& fieldset": { borderColor: "rgba(241, 245, 249, 0.1)" },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleDeptSubmit}
                  size="large"
                  sx={{
                    background: "linear-gradient(135deg, #f472b6 0%, #db2777 100%)",
                    height: 56,
                    borderRadius: "16px",
                    fontWeight: 800,
                    boxShadow: "0 10px 20px -5px rgba(244, 114, 182, 0.4)",
                    textTransform: "none",
                  }}
                >
                  Confirm Configuration
                </Button>
              </Stack>
            </DialogContent>
          </Dialog>
        )}

        {openDeleteDialog && (
          <Dialog
            open={openDeleteDialog}
            onClose={cancelDeleteUser}
            PaperProps={{
              sx: {
                background: "rgba(15, 23, 42, 0.95)",
                backdropFilter: "blur(40px)",
                color: "#f8fafc",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "24px",
                p: 2
              },
            }}
          >
            <DialogTitle
              sx={{
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                fontWeight: 800
              }}
            >
              <WarningIcon /> Security Override
            </DialogTitle>
            <DialogContent>
              <Typography sx={{ color: "#94a3b8", mb: 2 }}>
                Confirm immediate deletion of <b>{userToDelete?.name}</b>. This state change is permanent.
              </Typography>
              <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button onClick={cancelDeleteUser} sx={{ color: "#64748b", fontWeight: 700 }}>
                  Abort
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "rgba(239, 68, 68, 0.1)",
                    color: "#ef4444",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: "12px",
                    fontWeight: 800,
                    "&:hover": { bgcolor: "rgba(239, 68, 68, 0.2)" }
                  }}
                  onClick={confirmDeleteUser}
                >
                  Execute Deletion
                </Button>
              </Box>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Alert Snackbar */}
      {alertOpen && (
        <Alert
          severity="success"
          onClose={() => setAlertOpen(false)}
          sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}
        >
          {alertMessage}
        </Alert>
      )}
    </Box>
  );
};

export default HRDashboard;
