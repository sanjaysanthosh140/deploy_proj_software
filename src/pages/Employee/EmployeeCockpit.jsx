/**
 * EmployeeCockpit.jsx
 * Figma-matched layout:
 *   Header  → "Welcome back, [Name] 👋"  |  Logout
 *   Section 1 → AttendanceWidget (4 navy stat cards + punch actions)
 *   Section 2 → ProjectsPreview
 *   Section 3 → WorkReportForm (textarea + inline reports list, submit btn)
 *
 * UserReportsList is rendered inside WorkReportForm now — NOT separately here.
 */
import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import AttendanceWidget from "../../components/AttendanceWidget";
import ProjectsPreview from "../../components/dashboard/ProjectsPreview";
import WorkReportForm from "../../components/dashboard/WorkReportForm";
import TeamChat from "../../components/TeamChat";
import axios from "axios";

const PRIMARY = "#0f172a";
const SECONDARY = "#64748b";

const EmployeeCockpit = (props) => {
  const { deptId: paramDeptId } = useParams();
  const deptId = props.deptId || paramDeptId || "it";
  const token = localStorage.getItem("token");
  const [profile, setProfile] = React.useState(null);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const navigate = useNavigate();

  /* ── Logout ── */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  /* ── Report submitted callback ── */
  const handleReportSubmitted = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  /* ── Fetch employee profile (API preserved exactly) ── */
  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (token) {
          const res = await axios.get(
            "https://project-management-sodtware-backend-end.onrender.com/employee_profile",
            {
              headers: {
                Authorization: `${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const profileData = Array.isArray(res.data) ? res.data[0] : res.data;
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Failed to fetch profile in Cockpit", error);
      }
    };
    fetchProfile();
  }, [token]);

  /* Derive first name for greeting */
  const firstName =
    profile?.name?.split(" ")[0] ||
    profile?.username?.split(" ")[0] ||
    "there";

  return (
    <>
      <Box
        sx={{
          width: "100%",
          minHeight: "100%",
          py: { xs: 2.5, sm: 3, md: 3.5 },
          px: { xs: 2, sm: 2.5, md: 3 },
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: { xs: 3, sm: 3.5, md: 4 },
          bgcolor: "#f8f9fb",
        }}
      >
        {/* ══ Page Header ════════════════════════════════════════════════ */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {/* Greeting */}
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                color: PRIMARY,
                fontSize: { xs: "1.25rem", sm: "1.45rem", md: "1.6rem" },
                letterSpacing: "-0.025em",
                lineHeight: 1.15,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              Welcome back, {firstName}&nbsp;
              <span style={{ fontSize: "1.1em" }}>👋</span>
            </Typography>
            <Typography
              sx={{
                color: SECONDARY,
                fontSize: { xs: "0.78rem", sm: "0.85rem" },
                mt: 0.4,
                fontWeight: 400,
              }}
            >
              Here's your workday overview
            </Typography>
          </Box>

          {/* Logout pill */}
          <Box
            component="button"
            onClick={handleLogout}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.7,
              px: { xs: 1.6, sm: 2.2 },
              py: { xs: 0.65, sm: 0.8 },
              border: "1.5px solid rgba(220,38,38,0.3)",
              borderRadius: "999px",
              background: "rgba(254,242,242,0.9)",
              color: "#c0392b",
              fontWeight: 700,
              fontSize: { xs: "0.72rem", sm: "0.78rem" },
              cursor: "pointer",
              letterSpacing: "0.01em",
              transition: "all 0.18s ease",
              whiteSpace: "nowrap",
              mt: { xs: 0.3, sm: 0.2 },
              flexShrink: 0,
              "&:hover": {
                background: "#c0392b",
                color: "#fff",
                borderColor: "#c0392b",
                boxShadow: "0 2px 12px rgba(192,57,43,0.25)",
              },
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </Box>
        </Box>

        {/* ══ Section 1 — Attendance (4 navy stat cards + punch actions) ═ */}
        <AttendanceWidget currentUserId={token} />

        {/* Subtle divider */}
        <Divider sx={{ borderColor: "rgba(15,23,42,0.06)" }} />

        {/* ══ Section 2 — My Projects ════════════════════════════════════ */}
        <ProjectsPreview userId={token} maxProjects={9} />

        {/* Subtle divider */}
        <Divider sx={{ borderColor: "rgba(15,23,42,0.06)" }} />

        {/* ══ Section 3 — Daily Work Report (form + inline list) ═════════ */}
        <WorkReportForm
          deptId={deptId}
          profile={profile}
          onReportSubmitted={handleReportSubmitted}
        />

        {/* Bottom breathing room */}
        <Box sx={{ pb: { xs: 6, sm: 2 } }} />
      </Box>

      {/* Floating chat bubble */}
      <TeamChat />
    </>
  );
};

export default EmployeeCockpit;