import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Fade,
  alpha,
  CircularProgress,
  Alert,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FolderIcon from "@mui/icons-material/Folder";
import AssessmentIcon from "@mui/icons-material/Assessment";
import axios from "axios";
import { AnimatePresence } from "framer-motion";

// Components
import GlassCard from "./components/GlassCard";
import StatCards from "./components/StatCards";
import EmployeeManager from "./components/EmployeeManager";
import DepartmentManager from "./components/DepartmentManager";
import ReportManager from "./components/ReportManager";
import AttendanceManager from "./components/AttendanceManager";
import DashboardDialogs from "./components/DashboardDialogs";

// Styles & Constants
import {
  PRIMARY_BG,
  SECONDARY_BG,
  DEPARTMENTS,
  POSTS,
  normalizeDeptName,
  getDeptColor,
} from "./components/SharedStyles";

const HRDashboard = () => {
  const navigate = useNavigate();
  
  // Tab State
  const [tabValue, setTabValue] = useState(0);
  
  // Data State
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [reports, setReports] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog States
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openDeptDialog, setOpenDeptDialog] = useState(false);
  const [openResponsibleDialog, setOpenResponsibleDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  // Selection/Editing States
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingDept, setEditingDept] = useState(null);

  // Form States
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
    active: true,
  });
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

  // Filter & Alert States
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [reportDate, setReportDate] = useState("");
  const [reportDeptFilter, setReportDeptFilter] = useState("ALL");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [attendanceDeptFilter, setAttendanceDeptFilter] = useState("ALL");

  // --- Initial Data Fetch ---
  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("adminRole");
      
      if (!token || role !== "hr") {
        navigate("/admin");
        return;
      }

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
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://localhost:8080/admin/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await axios.get("http://localhost:8080/admin/reports");
      setReports(res.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8080/admin/employe_log", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data);
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  // --- Handlers ---
  const handleTabChange = (e, newValue) => {
    if (newValue === 4) {
      navigate("/hr/project-progress");
      return;
    }
    setTabValue(newValue);
  };

  const handleUserDialogOpen = (user = null) => {
    setEditingUser(user);
    setUserForm(
      user
        ? { ...user }
        : { name: "", email: "", department: "", password: "", active: true }
    );
    setOpenUserDialog(true);
  };

  const handleUserSubmit = async () => {
    try {
      if (editingUser) {
        const { password, ...updateData } = userForm;
        await axios.put(`http://localhost:8080/admin/updateEmploye/${editingUser._id}`, updateData);
      } else {
        await axios.post("http://localhost:8080/admin/employes", userForm);
        setAlertMessage(`User ${userForm.name} added successfully`);
        setAlertOpen(true);
      }
      fetchUsers();
      setOpenUserDialog(false);
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  const handleResponsibleSubmit = async () => {
    try {
      const payload = { ...responsibleForm, role: responsibleForm.post, active: true };
      delete payload.post;
      await axios.post("http://localhost:8080/admin/add_admins", payload);
      setAlertMessage(`Responsible User ${responsibleForm.name} added successfully`);
      setAlertOpen(true);
      fetchUsers();
      setOpenResponsibleDialog(false);
    } catch (err) {
      console.error("Error adding responsible:", err);
    }
  };

  const handleDeptSubmit = async () => {
    try {
      if (editingDept) {
        await axios.put(`http://localhost:8080/admin/Editdepartments/${editingDept._id}`, deptForm);
      } else {
        await axios.post("http://localhost:8080/admin/addDep", deptForm);
      }
      fetchDepartments();
      setOpenDeptDialog(false);
    } catch (err) {
      console.error("Error saving department:", err);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await axios.put(`http://localhost:8080/hr/users/${userId}`, { active: !currentStatus });
      fetchUsers();
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await axios.delete(`http://localhost:8080/admin/deleteEmp/${userToDelete._id}`);
      setUsers(users.filter((u) => u._id !== userToDelete._id));
      setAlertMessage(`User deleted successfully`);
      setAlertOpen(true);
      setTimeout(() => setAlertOpen(false), 3000);
    } catch (err) {
      console.error("Error deleting user:", err);
    }
    setOpenDeleteDialog(false);
  };

  const handleDeleteDept = async (deptId) => {
    try {
      await axios.delete(`http://localhost:8080/admin/deleteDept/${deptId}`);
      fetchDepartments();
    } catch (err) {
      console.error("Error deleting dept:", err);
    }
  };

  // --- Stats Calculation ---
  const today = new Date().toISOString().split("T")[0];
  const uniqueSubmittersToday = new Set(
    reports
      .filter((r) => {
        try {
          return new Date(r.date).toISOString().split("T")[0] === today;
        } catch (e) {
          return false;
        }
      })
      .map((r) => r.author || r.userId || r.userName)
  );

  const pendingReportsCount = Math.max(0, users.length - uniqueSubmittersToday.size);

  const stats = [
    { title: "Total Employees", value: users.length, icon: PeopleIcon, color: "#38bdf8" },
    { title: "Active Now", value: users.filter((u) => u.active).length, icon: CheckCircleIcon, color: "#4ade80" },
    { title: "Departments", value: departments.length, icon: FolderIcon, color: "#f472b6" },
    { title: "Pending Reports", value: pendingReportsCount, icon: AssessmentIcon, color: "#fbbf24" },
  ];

  const normalizedDepartmentOptions = Array.from(new Set(DEPARTMENTS.map(normalizeDeptName)));

  if (loading) {
    return (
      <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: PRIMARY_BG }}>
        <CircularProgress sx={{ color: "#38bdf8" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${PRIMARY_BG} 0%, ${SECONDARY_BG} 100%)`,
        p: { xs: 2, md: 4 },
        pb: 8,
        color: "#0f172a",
      }}
    >
      {/* Header Section */}
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: 6, pl: 1 }}>
          <Typography variant="h2" sx={{ fontWeight: 1000, color: "rgba(0,0,0,0.85)", fontSize: { xs: "2rem", md: "3.5rem" }, lineHeight: 1 }}>
            HR Command Center
          </Typography>
          <Typography variant="caption" sx={{ color: alpha("#000", 0.3), fontWeight: 900, letterSpacing: "4px", textTransform: "uppercase" }}>
            • Advanced Management Interface •
          </Typography>
        </Box>
      </Fade>

      {/* Top Stats Section */}
      <StatCards stats={stats} />

      {/* Main Feature Area */}
      <GlassCard sx={{ minHeight: "60vh", borderRadius: "32px" }}>
        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.4)", px: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                fontWeight: 900,
                fontSize: "0.85rem",
                color: "rgba(0,0,0,0.4)",
                minHeight: 64,
                transition: "all 0.3s ease",
                "&.Mui-selected": { color: "#38bdf8" }
              },
              "& .MuiTabs-indicator": { height: 4, borderRadius: "2px", background: "linear-gradient(90deg, #38bdf8, #818cf8)" }
            }}
          >
            <Tab label="Employees" />
            <Tab label="Departments" />
            <Tab label="Work Reports" />
            <Tab label="Attendance" />
            <Tab label="Intelligence" />
          </Tabs>
        </Box>

        {/* Content Area */}
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <AnimatePresence mode="wait">
            {tabValue === 0 && (
              <EmployeeManager
                key="employees"
                users={users}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                departmentFilter={departmentFilter}
                setDepartmentFilter={setDepartmentFilter}
                departmentsList={DEPARTMENTS}
                onAddEmployee={() => handleUserDialogOpen()}
                onAddResponsible={() => setOpenResponsibleDialog(true)}
                onEditUser={handleUserDialogOpen}
                onToggleUserStatus={handleToggleUserStatus}
                onDeleteUser={(user) => { setUserToDelete(user); setOpenDeleteDialog(true); }}
              />
            )}
            {tabValue === 1 && (
              <DepartmentManager
                key="depts"
                departments={departments}
                onAddDepartment={() => { setEditingDept(null); setDeptForm({ id: "", title: "", color: "", description: "" }); setOpenDeptDialog(true); }}
                onEditDepartment={(dept) => { setEditingDept(dept); setDeptForm({ ...dept }); setOpenDeptDialog(true); }}
                onDeleteDepartment={handleDeleteDept}
                getDeptColor={getDeptColor}
              />
            )}
            {tabValue === 2 && (
              <ReportManager
                key="reports"
                reports={reports}
                reportDate={reportDate}
                setReportDate={setReportDate}
                reportDeptFilter={reportDeptFilter}
                setReportDeptFilter={setReportDeptFilter}
                normalizedDepartmentOptions={normalizedDepartmentOptions}
                getDeptColor={getDeptColor}
                normalizeDeptName={normalizeDeptName}
              />
            )}
            {tabValue === 3 && (
              <AttendanceManager
                key="attendance"
                logs={logs}
                attendanceDate={attendanceDate}
                setAttendanceDate={setAttendanceDate}
                attendanceDeptFilter={attendanceDeptFilter}
                setAttendanceDeptFilter={setAttendanceDeptFilter}
                normalizedDepartmentOptions={normalizedDepartmentOptions}
                getDeptColor={getDeptColor}
                normalizeDeptName={normalizeDeptName}
              />
            )}
          </AnimatePresence>
        </Box>
      </GlassCard>

      {/* Global Dialogs */}
      <DashboardDialogs
        openUserDialog={openUserDialog}
        handleUserDialogClose={() => setOpenUserDialog(false)}
        editingUser={editingUser}
        userForm={userForm}
        setUserForm={setUserForm}
        handleUserSubmit={handleUserSubmit}
        DEPARTMENTS={DEPARTMENTS}
        openResponsibleDialog={openResponsibleDialog}
        handleResponsibleDialogClose={() => setOpenResponsibleDialog(false)}
        responsibleForm={responsibleForm}
        setResponsibleForm={setResponsibleForm}
        handleResponsibleSubmit={handleResponsibleSubmit}
        POSTS={POSTS}
        openDeptDialog={openDeptDialog}
        handleDeptDialogClose={() => setOpenDeptDialog(false)}
        editingDept={editingDept}
        deptForm={deptForm}
        setDeptForm={setDeptForm}
        handleDeptSubmit={handleDeptSubmit}
        openDeleteDialog={openDeleteDialog}
        cancelDeleteUser={() => setOpenDeleteDialog(false)}
        userToDelete={userToDelete}
        confirmDeleteUser={confirmDeleteUser}
      />

      {/* Snackbar Alert */}
      {alertOpen && (
        <Alert severity="success" onClose={() => setAlertOpen(false)} sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, borderRadius: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
          {alertMessage}
        </Alert>
      )}
    </Box>
  );
};

export default HRDashboard;
