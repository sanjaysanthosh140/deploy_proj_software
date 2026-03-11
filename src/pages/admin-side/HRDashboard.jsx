
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

// --- iOS Liquid Glass Design Constants ---
const PRIMARY_BG = "#ffffff";
const SECONDARY_BG = "#eff2f5";
const TERTIARY_BG = "#e9eef5";
const GLASS_BORDER = "rgba(255, 255, 255, 0.45)";

const glassEffect = {
  background: "rgba(255, 255, 255, 0.25)",
  backdropFilter: "blur(30px) saturate(160%)",
  border: "1px solid rgba(255, 255, 255, 0.45)",
  borderRadius: "22px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.5)",
  transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  position: "relative",
};

const iPhoneGlassButton = {
  background: "rgba(255, 255, 255, 0.3)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.45)",
  borderRadius: "16px",
  color: "rgba(0, 0, 0, 0.8)",
  fontWeight: 1000,
  textTransform: "none",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "rgba(255, 255, 255, 0.45)",
    transform: "translateY(-2px)",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
  }
};

const POSTS = ["admin", "head", "superadmin"];
const DEPARTMENTS = [
  "IT",
  "DM",
  "Editing",
  "Content-writing",
  "Video-production",
  "Graphic Design",
  "Accounts",
  "Sales"
];

const normalizeDeptName = (dept) => {
  if (!dept || dept.length > 15) return dept || "Unknown";
  if (dept === "DM") return "Digital marketing";
  if (dept === "IT") return "information technology";
  if (dept === "Editing") return "videos-editing";
  if (dept === "Video-production") return "Video-production";
  if (dept === "Content-writing") return "Content-writing";
  if (dept === "Graphic Design") return "graphic-design";
  if (dept === "Accounts") return "Accounts";
  if (dept === "Sales") return "Sales";
  return dept;
};

const getDeptColor = (dept) => {
  switch (dept) {
    case "Digital marketing": return "#f472b6";
    case "information technology": return "#38bdf8";
    case "videos-editing": return "#a78bfa";
    case "Content-writing": return "#34d399";
    case "Video-production": return "#fb7185";
    case "graphic-design": return "#facc15";
    case "Accounts": return "#60a5fa";
    case "Sales": return "#fb923c";
    default: return "#94a3b8"; // fallback for any other dept
  }
};

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
      ...glassEffect,
      background: "rgba(255, 255, 255, 0.25)",
      border: "1px solid rgba(255, 255, 255, 0.45)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
      color: "#0f172a",
      overflow: "hidden",
      ...sx,
    }}
  >
    {children}
  </Card>
);

const HRDashboard = () => {
  const navigate = useNavigate();
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
  const [openResponsibleDialog, setOpenResponsibleDialog] = useState(false);
  const [responsibleForm, setResponsibleForm] = useState({
    name: "",
    email: "",
    post: "",
    department: "",
    password: "",
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
  const [reportDate, setReportDate] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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
    if (newValue === 4) {
      navigate("/hr/project-progress");
      return;
    }
    setTabValue(newValue);
  };

  const handleResponsibleDialogOpen = () => {
    setResponsibleForm({
      name: "",
      email: "",
      post: "",
      department: "",
      password: "",
    });
    setOpenResponsibleDialog(true);
  };

  const handleResponsibleDialogClose = () => {
    setOpenResponsibleDialog(false);
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

  const handleResponsibleSubmit = async () => {
    try {
      const payload = {
        name: responsibleForm.name,
        email: responsibleForm.email,
        department: responsibleForm.department,
        password: responsibleForm.password,
        role: responsibleForm.post,
        active: true
      };

      await axios.post("http://localhost:8080/admin/add_admins", payload).then((res) => {
        setAlertMessage(`Responsible User ${responsibleForm.name} added successfully as ${responsibleForm.post}`);
        setAlertOpen(true);
      });

      fetchUsers();
      handleResponsibleDialogClose();
    } catch (error) {
      console.error("Error saving responsible user:", error);
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
        p: 0,
        overflow: "hidden",
        background: "rgba(255, 255, 255, 0.2)",
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          width: "4px",
          height: "100%",
          background: color,
          boxShadow: `0 0 15px ${color}`,
        },
      }}
    >
      <CardContent sx={{ p: 3, display: "flex", alignItems: "center", gap: 2.5 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: "14px",
            background: "rgba(255, 255, 255, 0.4)",
            color: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 12px ${alpha(color, 0.2)}`,
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
          }}
        >
          <Icon sx={{ fontSize: 32 }} />
        </Box>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 1000,
              color: "rgba(0, 0, 0, 0.85)",
              letterSpacing: "-0.04em",
              lineHeight: 1,
              mb: 0.5
            }}
          >
            {value}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "rgba(0, 0, 0, 0.45)",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontSize: "0.65rem"
            }}
          >
            {title}
          </Typography>
        </Box>
      </CardContent>
    </GlassCard>
  );

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${PRIMARY_BG} 0%, ${SECONDARY_BG} 100%)`,
        position: "relative",
        overflowX: "hidden",
        overflowY: "auto",
        p: { xs: 2, sm: 3, md: 4 },
        pb: { xs: 6, md: 8 },
        color: "#0f172a",
      }}
    >
      {/* Fixed Background Cover */}
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        {/* Removed heavy moving blur filter elements to fix rendering artifact */}
      </Box>

      {/* Header */}
      <Fade in={true} timeout={1000}>
        <Box sx={{ mb: 6, textAlign: "left", position: "relative", zIndex: 1, pl: 1 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 1000,
              mb: 0,
              letterSpacing: { xs: "-0.03em", md: "-0.06em" },
              color: "rgba(0, 0, 0, 0.85)",
              fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3.8rem" },
              lineHeight: 1,
            }}
          >
            HR Command
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 1000,
                letterSpacing: { xs: "-0.03em", md: "-0.06em" },
                color: "rgba(0, 0, 0, 0.85)",
                fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3.8rem" },
                lineHeight: 1,
              }}
            >
              Center
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: alpha("#000", 0.3),
                fontWeight: 900,
                letterSpacing: "4px",
                textTransform: "uppercase",
                fontSize: "0.75rem"
              }}
            >
              • EnterpriseOS_v2
            </Typography>
          </Box>
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
            borderBottom: "1px solid rgba(255, 255, 255, 0.45)",
            background: "rgba(255, 255, 255, 0.3)",
            backdropFilter: "blur(20px) saturate(160%)",
            px: 2,
            zIndex: 10,
            position: "relative",
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: "70px",
              "& .MuiTabs-indicator": {
                height: "4px",
                borderRadius: "4px 4px 0 0",
                background: "rgba(0,0,0,0.8)",
                boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            {[
              { icon: PersonAddIcon, label: "Employees" },
              { icon: BusinessIcon, label: "Departments" },
              { icon: ReportIcon, label: "Work Reports" },
              { icon: AccessTimeIcon, label: "Attendance" },
              { icon: AssessmentIcon, label: "Intelligence" },
            ].map((tab, idx) => (
              <Tab
                key={idx}
                icon={<tab.icon sx={{ fontSize: 20 }} />}
                iconPosition="start"
                label={tab.label}
                sx={{
                  color: "rgba(0,0,0,0.4)",
                  minHeight: 70,
                  fontSize: "0.8rem",
                  textTransform: "none",
                  fontWeight: 1000,
                  gap: 1.5,
                  letterSpacing: "-0.01em",
                  px: 4,
                  transition: "all 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
                  "&.Mui-selected": {
                    color: "rgba(0,0,0,0.85)",
                    transform: "scale(1.05)",
                  },
                  "&:hover": {
                    color: "rgba(0,0,0,0.6)",
                    transform: "translateY(-1px)",
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
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                      placeholder="Search employees..."
                      variant="outlined"
                      size="small"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "14px",
                          background: "rgba(255, 255, 255, 0.5)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255, 255, 255, 0.6)",
                          width: { xs: "100%", sm: "250px" },
                          "& fieldset": { border: "none" },
                        },
                        "& .MuiInputBase-input": {
                          color: "rgba(0, 0, 0, 0.85)",
                          fontWeight: 700,
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleUserDialogOpen()}
                      sx={{
                        ...iPhoneGlassButton,
                        background: "linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)",
                        color: "#fff",
                        px: 3,
                        "&:hover": {
                          ...iPhoneGlassButton["&:hover"],
                          background: "linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%)",
                        }
                      }}
                    >
                      Add Employee
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<PersonAddIcon />}
                      onClick={handleResponsibleDialogOpen}
                      sx={{
                        ...iPhoneGlassButton,
                        background: "linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)",
                        color: "#fff",
                        px: 3,
                        "&:hover": {
                          ...iPhoneGlassButton["&:hover"],
                          background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
                        }
                      }}
                    >
                      Add Responsible
                    </Button>
                  </Stack>
                </Box>
                <TableContainer
                  component={Paper}
                  sx={{
                    background: "transparent",
                    boxShadow: "none",
                    maxHeight: "60vh",
                    overflowY: "auto",
                    overflowX: "auto",
                    "&::-webkit-scrollbar": { width: "6px", height: "6px" },
                    "&::-webkit-scrollbar-track": { background: "rgba(0,0,0,0.02)", borderRadius: "10px" },
                    "&::-webkit-scrollbar-thumb": { background: "rgba(0,0,0,0.15)", borderRadius: "10px" },
                  }}
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
                              color: "rgba(0,0,0,0.45)",
                              borderBottom: "1px solid rgba(255, 255, 255, 0.4)",
                              fontWeight: 900,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                              py: 2
                            }}
                          >
                            {head}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users
                        .filter((user) =>
                          user.name.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((user) => (
                          <TableRow
                            key={user._id}
                            component={motion.tr}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            sx={{
                              borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                              "&:hover": {
                                background: "rgba(255, 255, 255, 0.25)",
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
                                    color: "#fff",
                                    fontWeight: 900,
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                  }}
                                >
                                  {user.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography sx={{ fontWeight: 1000, color: "rgba(0,0,0,0.85)", fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.3rem" } }}>
                                  {user.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell
                              sx={{
                                borderBottom: `1px solid ${GLASS_BORDER}`,
                                color: "#94a3b8",
                                fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.1rem" }
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
                                    background: "rgba(56, 189, 248, 0.15)",
                                    color: "#0ea5e9",
                                    fontWeight: 1000,
                                    borderRadius: "8px",
                                    border: "1px solid rgba(56, 189, 248, 0.3)",
                                    fontSize: { xs: "0.9rem", sm: "0.95rem", md: "1rem" },
                                    textTransform: "uppercase",
                                    padding: "0.75rem"
                                  }}
                                />
                                <Chip
                                  label={user.role || "Staff"}
                                  size="small"
                                  sx={{
                                    background: "rgba(192, 132, 252, 0.15)",
                                    color: "#9333ea",
                                    fontWeight: 1000,
                                    borderRadius: "8px",
                                    border: "1px solid rgba(192, 132, 252, 0.3)",
                                    fontSize: { xs: "0.9rem", sm: "0.95rem", md: "1rem" },
                                    textTransform: "uppercase",
                                    padding: "0.75rem"
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
                                    ? "rgba(74, 222, 128, 0.15)"
                                    : "rgba(244, 63, 94, 0.15)",
                                  color: user.active ? "#10b981" : "#e11d48",
                                  fontWeight: 1000,
                                  borderRadius: "8px",
                                  fontSize: { xs: "0.9rem", sm: "0.95rem", md: "1rem" },
                                  padding: "0.75rem",
                                  border: `1px solid ${user.active ? "rgba(74, 222, 128, 0.3)" : "rgba(244, 63, 94, 0.3)"}`,
                                  fontSize: "0.65rem",
                                  textTransform: "uppercase"
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
                                    ...iPhoneGlassButton,
                                    p: 1,
                                    color: "#38bdf8",
                                    background: "rgba(56, 189, 248, 0.1)",
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
                                    ...iPhoneGlassButton,
                                    p: 1,
                                    color: user.active ? "#ef4444" : "#10b981",
                                    background: user.active ? "rgba(244, 63, 94, 0.1)" : "rgba(16, 185, 129, 0.1)",
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
                                    ...iPhoneGlassButton,
                                    p: 1,
                                    color: "#e11d48",
                                    background: "rgba(244, 63, 94, 0.1)",
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
                      ...iPhoneGlassButton,
                      background: "linear-gradient(135deg, #f472b6 0%, #db2777 100%)",
                      color: "#fff",
                      px: 3,
                      "&:hover": {
                        ...iPhoneGlassButton["&:hover"],
                        background: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
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
                            sx={{ color: "#94a3b8", mb: 3, fontSize: { xs: "1rem", sm: "1.05rem", md: "1.15rem" } }}
                          >
                            {dept.description}
                          </Typography>
                        </CardContent>
                        <Box
                          sx={{
                            p: 2,
                            px: 3,
                            borderTop: "1px solid rgba(255, 255, 255, 0.3)",
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 1.5,
                            background: "rgba(255, 255, 255, 0.15)",
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
              <Box sx={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto", pr: 2, "&::-webkit-scrollbar": { width: "10px" }, "&::-webkit-scrollbar-track": { background: "transparent" }, "&::-webkit-scrollbar-thumb": { background: "rgba(0,0,0,0.2)", borderRadius: "5px" }, "&::-webkit-scrollbar-thumb:hover": { background: "rgba(0,0,0,0.35)" } }}>
                <Box
                  sx={{
                    mb: 5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{
                      fontSize: { xs: "1.8rem", sm: "2.2rem" },
                      background: `linear-gradient(135deg, #6366f1, #8b5cf6)`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Daily Activity Reports
                  </Typography>
                  <Chip
                    label={`${reports.length} Total Reports`}
                    color="warning"
                    variant="outlined"
                    sx={{
                      fontSize: "1rem",
                      padding: "1.5rem 1rem",
                      fontWeight: 800,
                      background: `linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(249, 115, 22, 0.08) 100%)`,
                      border: `2px solid rgba(249, 115, 22, 0.3)`,
                      backdropFilter: "blur(20px)",
                      boxShadow: "0 0 20px rgba(249, 115, 22, 0.1)",
                      transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      "&:hover": {
                        background: `linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.12) 100%)`,
                        boxShadow: "0 0 30px rgba(249, 115, 22, 0.15)",
                        transform: "translateY(-2px)",
                      }
                    }}
                  />

                  <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                      type="date"
                      label="Filter by Date"
                      value={reportDate}
                      onChange={(e) => setReportDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "14px",
                          background: "rgba(255, 255, 255, 0.5)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255, 255, 255, 0.6)",
                          fontWeight: 700,
                          width: "200px",
                          "& fieldset": { border: "none" },
                          "&:hover": { background: "rgba(255, 255, 255, 0.7)" },
                        },
                        "& .MuiInputBase-input": {
                          color: "rgba(0, 0, 0, 0.85)",
                        },
                        "& .MuiInputLabel-root": { fontWeight: 800, color: "rgba(0,0,0,0.6)" },
                        "& input::-webkit-calendar-picker-indicator": {
                          filter: "brightness(0)",
                          cursor: "pointer",
                        },
                      }}
                    />
                    {reportDate && (
                      <Button
                        size="small"
                        onClick={() => setReportDate("")}
                        sx={{
                          ...iPhoneGlassButton,
                          color: "#ef4444",
                          background: "rgba(244, 63, 94, 0.1)",
                          px: 2,
                          height: "40px",
                          fontWeight: 1000,
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </Stack>
                </Box>

                {Object.entries(
                  reports
                    .filter((report) => {
                      if (!reportDate) return true;
                      const rDate = new Date(report.date).toISOString().split("T")[0];
                      return rDate === reportDate;
                    })
                    .reduce((acc, report) => {
                      let deptRaw = report.deptId || report.departmentId || "General";
                      let dept = normalizeDeptName(deptRaw);

                      if (!acc[dept]) acc[dept] = [];
                      acc[dept].push(report);
                      return acc;
                    }, {}),
                ).map(([category, categoryReports]) => (
                  <Box key={category} sx={{ mb: 6 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        mb: 3,
                        color: getDeptColor(category),
                        textTransform: "capitalize",
                        letterSpacing: "0.1em",
                        fontSize: { xs: "1.3rem", sm: "1.5rem" },
                        fontWeight: 800,
                        borderLeft: `5px solid ${getDeptColor(category)}`,
                        pl: 2.5,
                        textShadow: `0 2px 4px ${getDeptColor(category)}30`,
                      }}
                    >
                      {category}
                    </Typography>
                    <Grid container spacing={4} sx={{ mb: 8 }}>
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
                              background: `linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.15) 100%)`,
                              backdropFilter: "blur(40px) saturate(180%)",
                              WebkitBackdropFilter: "blur(40px) saturate(180%)",
                              borderLeft: `6px solid ${getDeptColor(category)}`,
                              border: `1px solid rgba(255, 255, 255, 0.6)`,
                              minHeight: "380px",
                              display: "flex",
                              flexDirection: "column",
                              boxShadow: `0 15px 45px rgba(0, 0, 0, 0.12), 0 0 30px ${getDeptColor(category)}15, inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(255, 255, 255, 0.2)`,
                              position: "relative",
                              overflow: "hidden",
                              transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                              "&:hover": {
                                transform: "translateY(-8px) scale(1.02)",
                                boxShadow: `0 25px 60px rgba(0, 0, 0, 0.15), 0 0 50px ${getDeptColor(category)}25, inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(255, 255, 255, 0.3)`,
                                background: `linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.25) 100%)`,
                              },
                            }}
                          >
                            <CardContent sx={{ p: 4, flex: 1, display: "flex", flexDirection: "column" }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  mb: 2.5,
                                  gap: 1.5,
                                }}
                              >
                                <Chip
                                  label={
                                    report.deptId ||
                                    report.departmentId ||
                                    "Unassigned"
                                  }
                                  size="medium"
                                  sx={{
                                    background: `linear-gradient(135deg, ${getDeptColor(category)}20 0%, ${getDeptColor(category)}08 100%)`,
                                    color: getDeptColor(category),
                                    fontWeight: 900,
                                    borderRadius: "10px",
                                    border: `1.5px solid ${getDeptColor(category)}60`,
                                    fontSize: "0.9rem",
                                    textTransform: "capitalize",
                                    padding: "1rem 0.75rem",
                                    height: "32px",
                                    backdropFilter: "blur(20px)",
                                    WebkitBackdropFilter: "blur(20px)",
                                    boxShadow: `0 4px 12px ${getDeptColor(category)}12`,
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{ color: `${getDeptColor(category)}AA`, fontWeight: 900, fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "0.5px" }}
                                >
                                  {new Date(report.date).toLocaleDateString()}
                                </Typography>
                              </Box>
                              <Typography
                                variant="h5"
                                sx={{
                                  mb: 2.5,
                                  fontWeight: 900,
                                  letterSpacing: "-0.02em",
                                  fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" },
                                  background: `linear-gradient(135deg, ${getDeptColor(category)}, rgba(0,0,0,0.8))`,
                                  backgroundClip: "text",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                }}
                              >
                                {report.title}
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 700,
                                  lineHeight: 1.9,
                                  fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.5rem" },
                                  flex: 1,
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word",
                                  background: `linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.45))`,
                                  backgroundClip: "text",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                }}
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
                    <Typography sx={{ color: "#64748b", fontSize: "1.1rem" }}>
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
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                      type="date"
                      label="Filter by Date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "14px",
                          background: "rgba(255, 255, 255, 0.5)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255, 255, 255, 0.6)",
                          fontWeight: 700,
                          width: "200px",
                          "& fieldset": { border: "none" },
                          "&:hover": { background: "rgba(255, 255, 255, 0.7)" },
                        },
                        "& .MuiInputBase-input": {
                          color: "rgba(0, 0, 0, 0.85)",
                        },
                        "& .MuiInputLabel-root": { fontWeight: 800, color: "rgba(0,0,0,0.6)" },
                        "& input::-webkit-calendar-picker-indicator": {
                          filter: "brightness(0)",
                          cursor: "pointer",
                        },
                      }}
                    />
                    {attendanceDate && (
                      <Button
                        size="small"
                        onClick={() => setAttendanceDate("")}
                        sx={{
                          ...iPhoneGlassButton,
                          color: "#ef4444",
                          background: "rgba(244, 63, 94, 0.1)",
                          px: 2,
                          height: "40px",
                          fontWeight: 1000,
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </Stack>
                </Box>

                {Object.entries(
                  logs
                    .filter((log) => {
                      if (!attendanceDate) return true;
                      const lDate = log.date ? log.date.split("T")[0] : "";
                      return lDate === attendanceDate;
                    })
                    .reduce((acc, log) => {
                      let deptRaw = log.users?.department || "General";
                      let dept = normalizeDeptName(deptRaw);

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
                        fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
                        fontWeight: 700,
                        borderLeft: `4px solid ${getDeptColor(category)}`,
                        pl: 2,
                      }}
                    >
                      {category}
                    </Typography>
                    <TableContainer
                      component={Box}
                      sx={{
                        background: "rgba(255, 255, 255, 0.15)",
                        backdropFilter: "blur(20px)",
                        borderRadius: "24px",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        boxShadow: "none",
                        overflowX: "auto",
                        overflowY: "auto",
                        maxHeight: "50vh",
                        "&::-webkit-scrollbar": { width: "6px", height: "6px" },
                        "&::-webkit-scrollbar-track": { background: "rgba(0,0,0,0.02)", borderRadius: "10px" },
                        "&::-webkit-scrollbar-thumb": { background: "rgba(0,0,0,0.15)", borderRadius: "10px" },
                      }}
                    >
                      <Table>
                        <TableHead>
                          <TableRow sx={{ background: "rgba(255, 255, 255, 0.2)" }}>
                            <TableCell
                              sx={{
                                color: "rgba(0,0,0,0.45)",
                                fontWeight: 1000,
                                fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" },
                                letterSpacing: "0.08em",
                                borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                              }}
                            >
                              AGENT NODE
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "rgba(0,0,0,0.45)",
                                fontWeight: 1000,
                                fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" },
                                letterSpacing: "0.08em",
                                borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                              }}
                            >
                              TIMESTAMP
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "rgba(0,0,0,0.45)",
                                fontWeight: 1000,
                                fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" },
                                letterSpacing: "0.08em",
                                borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                              }}
                            >
                              CLUSTER
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "rgba(0,0,0,0.45)",
                                fontWeight: 1000,
                                fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" },
                                letterSpacing: "0.08em",
                                borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                              }}
                            >
                              SESSION_01
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "rgba(0,0,0,0.45)",
                                fontWeight: 1000,
                                fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" },
                                letterSpacing: "0.08em",
                                borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
                              }}
                            >
                              SESSION_02
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {categoryLogs.map((log) => (
                            <TableRow
                              key={log._id}
                              sx={{
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  background: "rgba(255,255,255,0.25)",
                                },
                              }}
                            >
                              <TableCell
                                sx={{
                                  borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                                  color: "rgba(0,0,0,0.85)",
                                  fontWeight: 1000,
                                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" }
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
                                      width: 32,
                                      height: 32,
                                      fontSize: "0.85rem",
                                      fontWeight: 1000,
                                      background: "linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)",
                                      color: "#fff",
                                      border: "2px solid rgba(255, 255, 255, 0.5)",
                                    }}
                                  >
                                    {log.users?.name?.charAt(0) || "?"}
                                  </Avatar>
                                  {log.users?.name || "Unknown"}
                                </Box>
                              </TableCell>
                              <TableCell
                                sx={{
                                  borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                                  color: "rgba(0,0,0,0.4)",
                                  fontWeight: 800,
                                  fontSize: { xs: "1rem", sm: "1.05rem", md: "1.1rem" }
                                }}
                              >
                                {log.date ? log.date.split("T")[0] : "N/A"}
                              </TableCell>
                              <TableCell
                                sx={{
                                  borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                                }}
                              >
                                <Chip
                                  label={log.users?.department || "N/A"}
                                  size="small"
                                  sx={{
                                    background: "rgba(255, 255, 255, 0.4)",
                                    color: "rgba(0,0,0,0.6)",
                                    fontWeight: 1000,
                                    borderRadius: "8px",
                                    border: "1px solid rgba(255, 255, 255, 0.5)",
                                    fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                                    textTransform: "uppercase",
                                    padding: "0.6rem"
                                  }}
                                />
                              </TableCell>
                              <TableCell
                                sx={{
                                  borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                                  color: "rgba(0,0,0,0.75)",
                                  fontWeight: 1000,
                                  fontSize: { xs: "1rem", sm: "1.05rem", md: "1.1rem" }
                                }}
                              >
                                {log.first && log.first.timeIn
                                  ? `${log.first.timeIn} - ${log.first.timeOut || "..."}`
                                  : "-"}
                              </TableCell>
                              <TableCell
                                sx={{
                                  borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                                  color: "rgba(0,0,0,0.75)",
                                  fontWeight: 1000,
                                  fontSize: { xs: "1rem", sm: "1.05rem", md: "1.1rem" }
                                }}
                              >
                                {log.second && log.second.timeIn
                                  ? `${log.second.timeIn} - ${log.second.timeOut || "..."}`
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
                ...glassEffect,
                background: "rgba(255, 255, 255, 0.25)",
                backdropFilter: "blur(50px) saturate(180%)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                borderRadius: "32px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2)",
                overflow: "hidden"
              },
            }}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle sx={{
              p: 3,
              fontWeight: 1000,
              fontSize: "1.5rem",
              letterSpacing: "-0.04em",
              color: "rgba(0,0,0,0.85)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
              background: "rgba(255, 255, 255, 0.2)"
            }}>
              {editingUser ? "Edit Profile" : "New Onboarding"}
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
              <Stack spacing={3} sx={{ mt: 2 }}>
                <TextField
                  label="Full Name"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      background: "rgba(255, 255, 255, 0.3)",
                      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.4)" },
                      "&.Mui-focused fieldset": { borderColor: "rgba(0, 0, 0, 0.2)" },
                    },
                    "& .MuiInputLabel-root": { fontWeight: 800, color: "rgba(0,0,0,0.4)" },
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
                      background: "rgba(255, 255, 255, 0.3)",
                      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.4)" },
                    },
                    "& .MuiInputLabel-root": { fontWeight: 800, color: "rgba(0,0,0,0.4)" },
                  }}
                />
                <FormControl fullWidth>
                  <InputLabel sx={{ fontWeight: 800, color: "rgba(0,0,0,0.4)" }}>Department</InputLabel>
                  <Select
                    value={userForm.department}
                    onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                    label="Department"
                    sx={{
                      borderRadius: "14px",
                      background: "rgba(255, 255, 255, 0.3)",
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.4)" },
                    }}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {!editingUser && (
                  <TextField
                    label="Access Key"
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                        background: "rgba(255, 255, 255, 0.3)",
                        "& fieldset": { borderColor: "rgba(255, 255, 255, 0.4)" },
                      },
                      "& .MuiInputLabel-root": { fontWeight: 800, color: "rgba(0,0,0,0.4)" },
                    }}
                  />
                )}
                <Button
                  variant="contained"
                  onClick={handleUserSubmit}
                  fullWidth
                  sx={{
                    ...iPhoneGlassButton,
                    height: 56,
                    background: "rgba(0,0,0,0.85)",
                    color: "#fff",
                    fontSize: "1rem",
                    "&:hover": {
                      ...iPhoneGlassButton["&:hover"],
                      background: "#000",
                    }
                  }}
                >
                  {editingUser ? "Push Updates" : "Initialize Agent"}
                </Button>
              </Stack>
            </DialogContent>
          </Dialog>
        )}

        {openResponsibleDialog && (
          <Dialog
            open={openResponsibleDialog}
            onClose={handleResponsibleDialogClose}
            TransitionComponent={Fade}
            transitionDuration={400}
            PaperProps={{
              sx: {
                ...glassEffect,
                background: "rgba(255, 255, 255, 0.25)",
                backdropFilter: "blur(50px) saturate(180%)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                borderRadius: "32px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2)",
                overflow: "hidden"
              },
            }}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle sx={{
              p: 3,
              fontWeight: 1000,
              fontSize: "1.5rem",
              letterSpacing: "-0.04em",
              color: "rgba(0,0,0,0.85)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
              background: "rgba(255, 255, 255, 0.2)"
            }}>
              Node_init • Responsible
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
              <Stack spacing={3} sx={{ mt: 2 }}>
                <TextField
                  label="Full Name"
                  value={responsibleForm.name}
                  onChange={(e) => setResponsibleForm({ ...responsibleForm, name: e.target.value })}
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      background: "rgba(255, 255, 255, 0.3)",
                      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.4)" },
                    },
                    "& .MuiInputLabel-root": { fontWeight: 800, color: "rgba(0,0,0,0.4)" },
                  }}
                />
                <TextField
                  label="Gmail Address"
                  value={responsibleForm.email}
                  onChange={(e) => setResponsibleForm({ ...responsibleForm, email: e.target.value })}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      background: "rgba(255, 255, 255, 0.3)",
                      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.4)" },
                    },
                    "& .MuiInputLabel-root": { fontWeight: 800, color: "rgba(0,0,0,0.4)" },
                  }}
                />
                <FormControl fullWidth>
                  <InputLabel sx={{ fontWeight: 800, color: "rgba(0,0,0,0.4)" }}>Role Designation</InputLabel>
                  <Select
                    value={responsibleForm.post}
                    onChange={(e) => setResponsibleForm({ ...responsibleForm, post: e.target.value })}
                    label="Role Designation"
                    sx={{
                      borderRadius: "14px",
                      background: "rgba(255, 255, 255, 0.3)",
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.4)" },
                    }}
                  >
                    {POSTS.map((post) => (
                      <MenuItem key={post} value={post}>
                        {post.charAt(0).toUpperCase() + post.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel sx={{ fontWeight: 800, color: "rgba(0,0,0,0.4)" }}>Department</InputLabel>
                  <Select
                    value={responsibleForm.department}
                    onChange={(e) => setResponsibleForm({ ...responsibleForm, department: e.target.value })}
                    label="Department"
                    sx={{
                      borderRadius: "14px",
                      background: "rgba(255, 255, 255, 0.3)",
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.4)" },
                    }}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Secure Access Key"
                  type="password"
                  value={responsibleForm.password}
                  onChange={(e) => setResponsibleForm({ ...responsibleForm, password: e.target.value })}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      background: "rgba(255, 255, 255, 0.3)",
                      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.4)" },
                    },
                    "& .MuiInputLabel-root": { fontWeight: 800, color: "rgba(0,0,0,0.4)" },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleResponsibleSubmit}
                  fullWidth
                  sx={{
                    ...iPhoneGlassButton,
                    height: 56,
                    background: "rgba(0,0,0,0.85)",
                    color: "#fff",
                    fontSize: "1rem",
                    mt: 2,
                    "&:hover": {
                      ...iPhoneGlassButton["&:hover"],
                      background: "#000",
                    }
                  }}
                >
                  Deploy Command Node
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
                ...glassEffect,
                background: "rgba(255, 255, 255, 0.25)",
                backdropFilter: "blur(50px) saturate(180%)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                borderRadius: "32px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2)",
                overflow: "hidden"
              },
            }}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle sx={{
              p: 3,
              fontWeight: 1000,
              fontSize: "1.5rem",
              letterSpacing: "-0.04em",
              color: "rgba(0,0,0,0.85)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
              background: "rgba(255, 255, 255, 0.2)"
            }}>
              {editingDept ? "Configure Cluster" : "Provision Cluster"}
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
              <Stack spacing={4} sx={{ mt: 2 }}>
                <TextField
                  label="Cluster ID"
                  value={deptForm.Dep_id}
                  onChange={(e) => setDeptForm({ ...deptForm, id: e.target.value })}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      background: "rgba(255, 255, 255, 0.3)",
                      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.4)" },
                    },
                    "& .MuiInputLabel-root": { fontWeight: 800, color: "rgba(0,0,0,0.4)" },
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
                      background: "rgba(255, 255, 255, 0.3)",
                      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.4)" },
                    },
                    "& .MuiInputLabel-root": { fontWeight: 800, color: "rgba(0,0,0,0.4)" },
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
                      background: "rgba(255, 255, 255, 0.3)",
                      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.4)" },
                    },
                    "& .MuiInputLabel-root": { fontWeight: 800, color: "rgba(0,0,0,0.4)" },
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
                      background: "rgba(255, 255, 255, 0.3)",
                      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.4)" },
                    },
                    "& .MuiInputLabel-root": { fontWeight: 800, color: "rgba(0,0,0,0.4)" },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleDeptSubmit}
                  fullWidth
                  sx={{
                    ...iPhoneGlassButton,
                    height: 56,
                    background: "rgba(0,0,0,0.85)",
                    color: "#fff",
                    fontSize: "1rem",
                    "&:hover": {
                      ...iPhoneGlassButton["&:hover"],
                      background: "#000",
                    }
                  }}
                >
                  Verify Configuration
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
                ...glassEffect,
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(60px)",
                color: "rgba(0,0,0,0.85)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "32px",
                p: 2
              },
            }}
          >
            <DialogTitle
              sx={{
                color: "#e11d48",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                fontWeight: 1000,
                fontSize: "1.4rem",
                letterSpacing: "-0.04em"
              }}
            >
              <WarningIcon /> Security Override
            </DialogTitle>
            <DialogContent>
              <Typography sx={{ color: "rgba(0,0,0,0.5)", fontWeight: 800, mb: 2 }}>
                Confirm immediate deletion of <b>{userToDelete?.name}</b>. This state change is permanent.
              </Typography>
              <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  onClick={cancelDeleteUser}
                  sx={{
                    ...iPhoneGlassButton,
                    color: "rgba(0,0,0,0.4)",
                    boxShadow: "none",
                    "&:hover": { background: "rgba(0,0,0,0.05)" }
                  }}
                >
                  Abort
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    ...iPhoneGlassButton,
                    bgcolor: "rgba(225, 29, 72, 0.1)",
                    color: "#e11d48",
                    border: "1px solid rgba(225, 29, 72, 0.2)",
                    fontWeight: 1000,
                    "&:hover": { bgcolor: "rgba(225, 29, 72, 0.2)" }
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
      {
        alertOpen && (
          <Alert
            severity="success"
            onClose={() => setAlertOpen(false)}
            sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}
          >
            {alertMessage}
          </Alert>
        )
      }
    </Box >
  );
};

export default HRDashboard;
