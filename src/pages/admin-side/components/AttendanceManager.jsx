import React from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Fade,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { motion } from "framer-motion";
import { iPhoneGlassButton, GLASS_BORDER } from "./SharedStyles";

const AttendanceManager = ({
  logs,
  attendanceDate,
  setAttendanceDate,
  attendanceDeptFilter,
  setAttendanceDeptFilter,
  normalizedDepartmentOptions,
  getDeptColor,
  normalizeDeptName,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const filteredLogs = logs.filter((log) => {
    const matchesDate = !attendanceDate
      ? true
      : (log.date ? log.date.split("T")[0] : "") === attendanceDate;

    const deptRaw = log.users?.department || "General";
    const deptNormalized = normalizeDeptName(deptRaw);
    const matchesDept =
      attendanceDeptFilter === "ALL" ||
      attendanceDeptFilter === deptRaw ||
      attendanceDeptFilter === deptNormalized;

    return matchesDate && matchesDept;
  });

  const groupedLogs = filteredLogs.reduce((acc, log) => {
    let deptRaw = log.users?.department || "General";
    let dept = normalizeDeptName(deptRaw);

    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(log);
    return acc;
  }, {});

  return (
    <Fade in={true}>
      <Box>
        <Box
          sx={{
            mb: 4,
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            alignItems: { xs: "stretch", lg: "center" },
            justifyContent: "space-between",
            gap: 3,
          }}
        >
          <Box>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{ fontWeight: 1000, color: "rgba(0,0,0,0.85)", letterSpacing: "-0.025em" }}
            >
              Authentication Logs
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
              Monitoring Active Access Nodes
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
            sx={{ width: { xs: "100%", lg: "auto" } }}
          >
            <FormControl
              size="small"
              sx={{
                minWidth: { xs: "100%", sm: 200 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  background: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  "& fieldset": { borderColor: "rgba(0,0,0,0.08)" },
                  "& .MuiSelect-select": {
                    color: "#000",
                    fontWeight: 800,
                  },
                },
              }}
            >
              <InputLabel>Department</InputLabel>
              <Select
                value={attendanceDeptFilter}
                label="Department"
                onChange={(e) => setAttendanceDeptFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Departments</MenuItem>
                {normalizedDepartmentOptions.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
                  background: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  "& fieldset": { borderColor: "rgba(0,0,0,0.08)" },
                  width: { xs: "100%", sm: "200px" },
                  "& .MuiInputBase-input": {
                    color: "#000",
                    fontWeight: 800,
                  }
                }
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
                  height: "40px",
                  minWidth: "80px"
                }}
              >
                Clear
              </Button>
            )}
          </Stack>
        </Box>

        {Object.entries(groupedLogs).map(([category, categoryLogs]) => (
          <Box key={category} sx={{ mb: 5 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 800,
                borderLeft: `4px solid ${getDeptColor(category)}`,
                pl: 2,
              }}
            >
              {category}
            </Typography>
            <TableContainer
              sx={{
                background: "rgba(255, 255, 255, 0.3)",
                backdropFilter: "blur(20px)",
                borderRadius: "24px",
                border: `1px solid ${GLASS_BORDER}`,
                boxShadow: "none",
                overflow: "hidden",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ background: "rgba(255, 255, 255, 0.4)" }}>
                    {["AGENT NODE", "TIMESTAMP", "CLUSTER", "SESSION_01", "SESSION_02"].map((head) => (
                      <TableCell
                        key={head}
                        sx={{
                          color: "rgba(0,0,0,0.45)",
                          fontWeight: 900,
                          fontSize: "0.85rem",
                          letterSpacing: "0.08em",
                          borderBottom: `1px solid ${GLASS_BORDER}`,
                        }}
                      >
                        {head}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categoryLogs.map((log) => (
                    <TableRow
                      key={log._id}
                      component={motion.tr}
                      transition={{ duration: 0.2 }}
                      sx={{
                        "&:hover": { background: "rgba(255,255,255,0.4)" },
                      }}
                    >
                      <TableCell sx={{ borderBottom: `1px solid ${GLASS_BORDER}` }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: "0.85rem",
                              fontWeight: 900,
                              background: "linear-gradient(135deg, #38bdf8, #2563eb)",
                              color: "#fff",
                            }}
                          >
                            {log.users?.name?.charAt(0) || "?"}
                          </Avatar>
                          <Typography sx={{ fontWeight: 800, color: "rgba(0,0,0,0.8)" }}>
                            {log.users?.name || "Unknown"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${GLASS_BORDER}`, color: "#64748b", fontWeight: 700 }}>
                        {log.date ? log.date.split("T")[0] : "N/A"}
                      </TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${GLASS_BORDER}` }}>
                        <Chip
                          label={log.users?.department || "N/A"}
                          size="small"
                          sx={{
                            background: "rgba(56, 189, 248, 0.1)",
                            color: "#0ea5e9",
                            fontWeight: 800,
                            borderRadius: "8px",
                            fontSize: "0.75rem",
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${GLASS_BORDER}`, fontWeight: 700, color: "rgba(0,0,0,0.7)" }}>
                        {log.first?.timeIn ? `${log.first.timeIn} - ${log.first.timeOut || "..."}` : "-"}
                      </TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${GLASS_BORDER}`, fontWeight: 700, color: "rgba(0,0,0,0.7)" }}>
                        {log.second?.timeIn ? `${log.second.timeIn} - ${log.second.timeOut || "..."}` : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}

        {filteredLogs.length === 0 && (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography sx={{ color: "#94a3b8", fontWeight: 700 }}>
              No authentication logs detected.
            </Typography>
          </Box>
        )}
      </Box>
    </Fade>
  );
};

export default AttendanceManager;
