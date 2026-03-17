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
  Grid,
  CardContent,
  Fade,
  Avatar,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { iPhoneGlassButton, whiteCard } from "./SharedStyles";

const ReportManager = ({
  reports,
  reportDate,
  setReportDate,
  reportDeptFilter,
  setReportDeptFilter,
  normalizedDepartmentOptions,
  getDeptColor,
  normalizeDeptName,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const filteredReports = reports.filter((report) => {
    const matchesDate = !reportDate
      ? true
      : new Date(report.date).toISOString().split("T")[0] === reportDate;

    const deptRaw = report.deptId || report.departmentId || "General";
    const deptNormalized = normalizeDeptName(deptRaw);
    const matchesDept =
      reportDeptFilter === "ALL" ||
      reportDeptFilter === deptRaw ||
      reportDeptFilter === deptNormalized;

    return matchesDate && matchesDept;
  });

  const groupedReports = filteredReports.reduce((acc, report) => {
    let deptRaw = report.deptId || report.departmentId || "General";
    let dept = normalizeDeptName(deptRaw);

    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(report);
    return acc;
  }, {});

  return (
    <Fade in={true}>
      <Box sx={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto", pr: 1, "&::-webkit-scrollbar": { width: "8px" }, "&::-webkit-scrollbar-track": { background: "transparent" }, "&::-webkit-scrollbar-thumb": { background: "rgba(0,0,0,0.1)", borderRadius: "4px" } }}>
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
              Daily Activity Reports
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
              Tracking Command Node Intelligence
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
                value={reportDeptFilter}
                label="Department"
                onChange={(e) => setReportDeptFilter(e.target.value)}
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
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
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
                  height: "40px",
                  minWidth: "80px"
                }}
              >
                Clear
              </Button>
            )}
          </Stack>
        </Box>

        {Object.entries(groupedReports).map(([category, categoryReports]) => (
          <Box key={category} sx={{ mb: 6 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                color: getDeptColor(category),
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                borderLeft: `4px solid ${getDeptColor(category)}`,
                pl: 2,
              }}
            >
              {category}
            </Typography>
            <Grid container spacing={4}>
              {categoryReports.map((report) => (
                <Grid item xs={12} md={6} lg={4} key={report._id || report.id}>
                  <Box
                    sx={{
                      ...whiteCard,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Top Accent Bar */}
                    <Box
                      sx={{
                        height: "4px",
                        width: "100%",
                        background: getDeptColor(category),
                      }}
                    />

                    <CardContent sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                      {/* Card Header */}
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              fontSize: "0.9rem",
                              fontWeight: 900,
                              background: alpha(getDeptColor(category), 0.1),
                              color: getDeptColor(category),
                              border: `1px solid ${alpha(getDeptColor(category), 0.2)}`,
                            }}
                          >
                            {report.author?.charAt(0) || "R"}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "rgba(0,0,0,0.8)", lineHeight: 1.2 }}>
                              {report.author || "System Log"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700 }}>
                              {new Date(report.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </Typography>
                          </Box>
                        </Stack>
                        <Chip
                          label={category}
                          size="small"
                          sx={{
                            height: "20px",
                            fontSize: "0.65rem",
                            fontWeight: 900,
                            textTransform: "uppercase",
                            background: alpha(getDeptColor(category), 0.08),
                            color: getDeptColor(category),
                            borderRadius: "6px",
                          }}
                        />
                      </Box>

                      {/* Content Area */}
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 900,
                          mb: 1.5,
                          color: "rgba(0,0,0,0.9)",
                          fontSize: "1.1rem",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {report.title}
                      </Typography>
                      
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#475569",
                          fontWeight: 600,
                          lineHeight: 1.7,
                          fontSize: "0.925rem",
                          whiteSpace: "pre-wrap",
                          display: "-webkit-box",
                          WebkitLineClamp: 6,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {report.desc || report.content || "No description provided."}
                      </Typography>
                    </CardContent>

                    {/* Footer / Meta */}
                    <Box
                      sx={{
                        p: 2,
                        px: 3,
                        borderTop: "1px solid rgba(0,0,0,0.04)",
                        background: "rgba(0,0,0,0.01)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700 }}>
                        INTERNAL REPORT
                      </Typography>
                      <Button
                        size="small"
                        sx={{
                          minWidth: 0,
                          p: 0,
                          color: getDeptColor(category),
                          fontWeight: 800,
                          fontSize: "0.75rem",
                          textTransform: "none",
                          "&:hover": { background: "transparent", opacity: 0.8 }
                        }}
                      >
                        View Full Details
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}

        {filteredReports.length === 0 && (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography sx={{ color: "#94a3b8", fontWeight: 700 }}>
              No reports detected for this selection.
            </Typography>
          </Box>
        )}
      </Box>
    </Fade>
  );
};

export default ReportManager;
