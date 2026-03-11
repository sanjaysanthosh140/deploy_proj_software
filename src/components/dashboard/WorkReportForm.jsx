
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  alpha,
} from "@mui/material";
import { useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import { useToast } from "../../context/ToastContext";

const PRIMARY_SLATE = "#0f172a";
const SECONDARY_SLATE = "#475569";
const INDIGO_ACCENT = "#4f46e5";
const GLASS_BG = "rgba(255, 255, 255, 0.75)";
const GLASS_BORDER = "rgba(10, 15, 25, 0.08)";

const WorkReportForm = ({ deptId }) => {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  // Safe toast usage
  let showToast = (msg, type) => console.log(msg, type);
  try {
    const toast = useToast();
    showToast = toast.showToast;
  } catch (e) {
    /* ignore if context missing */
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!report.trim()) return;

    setLoading(true);
    try {
      // Modified endpoint as per requirements: /admin/add_task (modified for reports)
      // Assuming structure matches what the backend expects
      if (report && deptId) {
        let reportData = {
          title: "Daily Work Report",
          desc: report,
          deptId: deptId,
          type: "report",
          date: new Date().toISOString().split("T")[0],
        };

        await axios.post("http://localhost:8080/admin/Daily_reports", {
          ...reportData,
        });

        console.log(reportData);
      }
      showToast("Report submitted successfully", "success");
      setReport("");
    } catch (error) {
      console.error("Failed to submit report", error);
      showToast("Failed to submit report", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: { xs: 3, md: 5 },
        background: GLASS_BG,
        backdropFilter: "blur(48px) saturate(180%)",
        border: `1px solid ${GLASS_BORDER}`,
        borderRadius: "24px",
        boxShadow: "0 12px 32px -4px rgba(10, 15, 25, 0.04)",
      }}
    >
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 900, color: PRIMARY_SLATE, letterSpacing: "-0.02em", fontSize: { xs: "2rem", sm: "2.4rem" } }}>
        Mission Logs & Protocol Reporting
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={12}
        variant="outlined"
        placeholder="Log your active accomplishments..."
        value={report}
        onChange={(e) => setReport(e.target.value)}
        sx={{
          mb: 4,
          "& .MuiOutlinedInput-root": {
            fontSize: { xs: "1.3rem", sm: "1.5rem" },
            color: PRIMARY_SLATE,
            fontWeight: 500,
            bgcolor: "rgba(255,255,255,0.4)",
            borderRadius: "16px",
            padding: { xs: "1.75rem", sm: "2rem" },
            "& fieldset": { borderColor: GLASS_BORDER },
            "&:hover fieldset": { borderColor: alpha(INDIGO_ACCENT, 0.2) },
            "&.Mui-focused fieldset": { borderColor: INDIGO_ACCENT },
          },
          "& .MuiOutlinedInput-input": {
            fontSize: { xs: "1.3rem", sm: "1.5rem" },
            lineHeight: 1.8,
          },
          "& .MuiInputBase-input::placeholder": {
            color: alpha(SECONDARY_SLATE, 0.5),
            opacity: 1,
            fontSize: { xs: "1.2rem", sm: "1.35rem" },
          }
        }}
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          endIcon={loading ? <CircularProgress size={28} color="inherit" /> : <SendIcon />}
          sx={{
            background: INDIGO_ACCENT,
            color: "#fff",
            fontWeight: 700,
            fontSize: { xs: "1.25rem", sm: "1.45rem" },
            borderRadius: "12px",
            px: { xs: 4, sm: 6 },
            py: { xs: 1.8, sm: 2.2 },
            textTransform: "none",
            boxShadow: `0 4px 14px ${alpha(INDIGO_ACCENT, 0.3)}`,
            "&.Mui-disabled": {
              background: alpha(SECONDARY_SLATE, 0.1),
              color: alpha(SECONDARY_SLATE, 0.3),
            },
          }}
        >
          {loading ? "Transmitting..." : "Log Activity"}
        </Button>
      </Box>
    </Paper>
  );
};

export default WorkReportForm;
