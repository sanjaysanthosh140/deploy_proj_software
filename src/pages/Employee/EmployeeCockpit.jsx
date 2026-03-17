/**
 * EmployeeCockpit.jsx
 * Full-width stacked layout — each section fills the complete page width.
 * Responsive on all device sizes. TeamChat bubble fixed bottom-right.
 */
import React from "react";
import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import AttendanceWidget from "../../components/AttendanceWidget";
import ProjectsPreview from "../../components/dashboard/ProjectsPreview";
import WorkReportForm from "../../components/dashboard/WorkReportForm";
import TeamChat from "../../components/TeamChat";
// import DeadlineNotifications from "../../components/dashboard/DeadlineNotifications";

const EmployeeCockpit = (props) => {
  const { deptId: paramDeptId } = useParams();
  const deptId = props.deptId || paramDeptId || "it";
  const currentUserId = localStorage.getItem("token");

  return (
    <>
      <Box
        sx={{
          width: "100%",
          minHeight: "100%",
          py: { xs: 2, sm: 2.5, md: 3 },
          px: { xs: 1, sm: 1.5, md: 2 },
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: { xs: 2, sm: 2.5, md: 3 },
        }}
      >
        {/* ── Page Header ─────────────────────────────────── */}
        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              color: "rgba(0,0,0,0.88)",
              fontSize: { xs: "1.2rem", sm: "1.45rem", md: "1.6rem" },
              letterSpacing: "-0.02em",
            }}
          >
            Workday Overview
          </Typography>
          <Typography
            sx={{
              color: "rgba(0,0,0,0.45)",
              fontSize: { xs: "0.8rem", sm: "0.88rem" },
              mt: 0.3,
            }}
          >
            Attendance, projects & daily report
          </Typography>
        </Box>

        {/* ── Section 1: Attendance — full width ─────────── */}
        <AttendanceWidget currentUserId={currentUserId} />

        {/* ── Section 2: Projects — full width ───────────── */}
        <ProjectsPreview userId={currentUserId} maxProjects={9} />

        {/* ── Section 3: Work Report — full width ────────── */}
        <WorkReportForm deptId={deptId} />
      </Box>

      {/* Floating chat bubble */}
      <TeamChat />
    </>
  );
};

export default EmployeeCockpit;
