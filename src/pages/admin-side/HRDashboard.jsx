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
import TeamChat from "../../components/TeamChat";

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

const toLocalISO = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const HRDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin");
  };

  // Tab State
  const [tabValue, setTabValue] = useState(0);

  // Data State
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [reports, setReports] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog States
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openDeptDialog, setOpenDeptDialog] = useState(false);
  const [openResponsibleDialog, setOpenResponsibleDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);

  // Selection/Editing States
  const [userToDelete, setUserToDelete] = useState(null);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [userForPassword, setUserForPassword] = useState(null);
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
  const [passwordForm, setPasswordForm] = useState({
    email: "",
    newPassword: "",
    accountType: "employee", // "employee" or "admin"
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
      const token = localStorage.getItem("adminToken");
      const role = localStorage.getItem("adminRole");
      console.log(token, role);
      if (!token || role !== "hr") {
        navigate("/admin");
        return;
      }

      setLoading(true);
      await Promise.all([
        fetchUsers(),
        fetchAdmins(),
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
      const res = await axios.get("https://project-management-sodtware-backend-end.onrender.com/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await axios.get("https://project-management-sodtware-backend-end.onrender.com/admin/get_admins");
      setAdmins(res.data);
    } catch (err) {
      console.error("Error fetching admins:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("https://project-management-sodtware-backend-end.onrender.com/admin/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await axios.get("https://project-management-sodtware-backend-end.onrender.com/admin/reports");
      setReports(res.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("https://project-management-sodtware-backend-end.onrender.com/admin/employe_log", {
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

  const handlePasswordDialogOpen = (user, type = "employee") => {
    setUserForPassword(user);
    setPasswordForm({
      email: user.email,
      newPassword: "",
      accountType: type,
    });
    setOpenPasswordDialog(true);
  };

  const handleAdminDialogOpen = (admin = null) => {
    setEditingAdmin(admin);
    setResponsibleForm(
      admin
        ? { ...admin, post: admin.role || "" }
        : { name: "", email: "", post: "", department: "", password: "" }
    );
    setOpenResponsibleDialog(true);
  };

  const handleUserSubmit = async () => {
    try {
      if (editingUser) {
        const { password, ...updateData } = userForm;
        await axios.put(`https://project-management-sodtware-backend-end.onrender.com/admin/updateEmploye/${editingUser._id}`, updateData);
      } else {
        await axios.post("https://project-management-sodtware-backend-end.onrender.com/admin/employes", userForm);
        setAlertMessage(`User ${userForm.name} added successfully`);
        setAlertOpen(true);
      }
      fetchUsers();
      setOpenUserDialog(false);
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      if (passwordForm.accountType === "admin") {
        await axios.put("https://project-management-sodtware-backend-end.onrender.com/admin/updatePassword_admin", passwordForm);
      } else {
        await axios.post("https://project-management-sodtware-backend-end.onrender.com/admin/updatePassword", passwordForm);
      }
      setAlertMessage(`Password updated for ${passwordForm.email}`);
      setAlertOpen(true);
      setOpenPasswordDialog(false);
    } catch (err) {
      console.error("Error updating password:", err);
    }
  };

  const handleResponsibleSubmit = async () => {
    try {
      const payload = { ...responsibleForm, role: responsibleForm.post, active: true };
      delete payload.post;
      if (editingAdmin) {
        await axios.put(`https://project-management-sodtware-backend-end.onrender.com/admin/update_admin/${editingAdmin._id}`, payload);
        setAlertMessage(`Responsible User ${responsibleForm.name} updated successfully`);
      } else {
        await axios.post("https://project-management-sodtware-backend-end.onrender.com/admin/add_admins", payload);
        setAlertMessage(`Responsible User ${responsibleForm.name} added successfully`);
      }
      setAlertOpen(true);
      fetchAdmins();
      setOpenResponsibleDialog(false);
      setResponsibleForm({
        name: "",
        email: "",
        post: "",
        department: "",
        password: "",
      });
    } catch (err) {
      console.error("Error adding responsible:", err);
    }
  };

  const handleDeptSubmit = async () => {
    try {
      if (editingDept) {
        await axios.put(`https://project-management-sodtware-backend-end.onrender.com/admin/Editdepartments/${editingDept._id}`, deptForm);
      } else {
        await axios.post("https://project-management-sodtware-backend-end.onrender.com/admin/addDep", deptForm);
      }
      fetchDepartments();
      setOpenDeptDialog(false);
    } catch (err) {
      console.error("Error saving department:", err);
    }
  };


  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await axios.delete(`https://project-management-sodtware-backend-end.onrender.com/admin/deleteEmp/${userToDelete._id}`);
      setUsers(users.filter((u) => u._id !== userToDelete._id));
      setAlertMessage(`User deleted successfully`);
      setAlertOpen(true);
      setTimeout(() => setAlertOpen(false), 3000);
    } catch (err) {
      console.error("Error deleting user:", err);
    }
    setOpenDeleteDialog(false);
  };

  const confirmDeleteAdmin = async () => {
    if (!adminToDelete) return;
    try {
      let id = adminToDelete._id;
      await axios.delete(`https://project-management-sodtware-backend-end.onrender.com/admin/delete_admin/${id}`);
      fetchAdmins();
      setAlertMessage(`Responsible User deleted successfully`);
      setAlertOpen(true);
      setTimeout(() => setAlertOpen(false), 3000);
    } catch (err) {
      console.error("Error deleting admin:", err);
    }
    setOpenDeleteDialog(false);
  };

  const handleDeleteDept = async (deptId) => {
    try {
      await axios.delete(`https://project-management-sodtware-backend-end.onrender.com/admin/deleteDept/${deptId}`);
      fetchDepartments();
    } catch (err) {
      console.error("Error deleting dept:", err);
    }
  };

  // --- Stats Calculation ---
  const today = toLocalISO(new Date());
  const uniqueSubmittersToday = new Set(
    reports
      .filter((r) => {
        try {
          return toLocalISO(r.date) === today;
        } catch (e) {
          return false;
        }
      })
      .map((r) => r.author || r.userId || r.userName)
  );

  const pendingReportsCount = Math.max(0, users.length - uniqueSubmittersToday.size);

  const stats = [
    { title: "Total Employees", value: users.length, icon: PeopleIcon, color: "#38bdf8" },
    // { title: "Active Nodes", value: users.length, icon: CheckCircleIcon, color: "#4ade80" },
    { title: "Departments", value: departments.length, icon: FolderIcon, color: "#f472b6" },
    // { title: "Pending Reports", value: pendingReportsCount, icon: AssessmentIcon, color: "#fbbf24" },
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
    <>
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
          <Box sx={{ mb: 6, pl: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="h2" sx={{ fontWeight: 1000, color: "rgba(0,0,0,0.85)", fontSize: { xs: "2rem", md: "3.5rem" }, lineHeight: 1 }}>
                HR Command Center
              </Typography>
              <Typography variant="caption" sx={{ color: alpha("#000", 0.3), fontWeight: 900, letterSpacing: "4px", textTransform: "uppercase" }}>
                {/* • Advanced Management Interface • */}
              </Typography>
            </Box>

            {/* Logout Button */}
            <Box
              component="button"
              onClick={handleLogout}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.4 },
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(16px)",
                border: "1.5px solid rgba(192,57,43,0.3)",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                color: "#c0392b",
                fontWeight: 800,
                fontSize: { xs: "0.78rem", sm: "0.88rem" },
                cursor: "pointer",
                letterSpacing: "0.5px",
                transition: "all 0.3s ease",
                whiteSpace: "nowrap",
                flexShrink: 0,
                mt: { xs: 0.5, sm: 0 },
                "&:hover": {
                  background: "#c0392b",
                  color: "#fff",
                  borderColor: "#c0392b",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 28px rgba(192,57,43,0.2)",
                },
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </Box>
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
              <Tab label="Responsibles" />
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
                  onAddResponsible={() => {
                    setResponsibleForm({
                      name: "",
                      email: "",
                      post: "",
                      department: "",
                      password: "",
                    });
                    setOpenResponsibleDialog(true);
                  }}
                  onEditUser={handleUserDialogOpen}
                  onEditPassword={(user) => handlePasswordDialogOpen(user, "employee")}
                  onDeleteUser={(user) => { setUserToDelete(user); setAdminToDelete(null); setOpenDeleteDialog(true); }}
                />
              )}
              {tabValue === 5 && (
                <EmployeeManager
                  key="responsibles"
                  users={admins}
                  isAdminView={true}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  departmentFilter={departmentFilter}
                  setDepartmentFilter={setDepartmentFilter}
                  departmentsList={POSTS}
                  onAddEmployee={() => handleUserDialogOpen()}
                  onAddResponsible={() => handleAdminDialogOpen()}
                  onEditUser={handleAdminDialogOpen}
                  onEditPassword={(admin) => handlePasswordDialogOpen(admin, "admin")}
                  onDeleteUser={(admin) => { setAdminToDelete(admin); setUserToDelete(null); setOpenDeleteDialog(true); }}
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
          userToDelete={userToDelete || adminToDelete}
          confirmDeleteUser={adminToDelete ? confirmDeleteAdmin : confirmDeleteUser}
          openPasswordDialog={openPasswordDialog}
          handlePasswordDialogClose={() => setOpenPasswordDialog(false)}
          passwordForm={passwordForm}
          setPasswordForm={setPasswordForm}
          handlePasswordSubmit={handlePasswordSubmit}
        />

        {/* Snackbar Alert */}
        {alertOpen && (
          <Alert severity="success" onClose={() => setAlertOpen(false)} sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, borderRadius: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
            {alertMessage}
          </Alert>
        )}
      </Box>

      {/* Floating TeamChat Bubble */}
      <TeamChat />
    </>
  );
};

export default HRDashboard;
