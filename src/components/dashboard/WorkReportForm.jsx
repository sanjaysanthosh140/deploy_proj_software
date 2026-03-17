
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
        p: { xs: 2, sm: 2.5, md: 3 },
        background: GLASS_BG,
        backdropFilter: "blur(48px) saturate(180%)",
        border: `1px solid ${GLASS_BORDER}`,
        borderRadius: "20px",
        boxShadow: "0 6px 20px -4px rgba(10,15,25,0.06)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ width: 3, height: 16, borderRadius: 1, bgcolor: INDIGO_ACCENT, flexShrink: 0 }} />
        <Typography sx={{ fontWeight: 800, color: PRIMARY_SLATE, fontSize: { xs: "0.9rem", sm: "0.95rem" }, letterSpacing: "-0.01em" }}>
          Daily Work Report
        </Typography>
      </Box>
      <TextField
        fullWidth
        multiline
        rows={7}
        variant="outlined"
        placeholder="What did you accomplish today? Any blockers?"
        value={report}
        onChange={(e) => setReport(e.target.value)}
        sx={{
          mb: { xs: 1.5, sm: 2 },
          "& .MuiOutlinedInput-root": {
            fontSize: { xs: "0.82rem", sm: "0.87rem" },
            color: PRIMARY_SLATE,
            fontWeight: 500,
            bgcolor: "rgba(255,255,255,0.4)",
            borderRadius: "12px",
            "& fieldset": { borderColor: GLASS_BORDER },
            "&:hover fieldset": { borderColor: alpha(INDIGO_ACCENT, 0.2) },
            "&.Mui-focused fieldset": { borderColor: INDIGO_ACCENT },
          },
          "& .MuiOutlinedInput-input": {
            fontSize: { xs: "0.82rem", sm: "0.87rem" },
            lineHeight: 1.7,
            py: 1.5,
            px: 2,
          },
          "& .MuiInputBase-input::placeholder": {
            color: alpha(SECONDARY_SLATE, 0.5),
            opacity: 1,
            fontSize: { xs: "0.78rem", sm: "0.82rem" },
          }
        }}
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          endIcon={loading ? <CircularProgress size={14} color="inherit" /> : <SendIcon sx={{ fontSize: 14 }} />}
          sx={{
            background: INDIGO_ACCENT,
            color: "#fff",
            fontWeight: 700,
            fontSize: { xs: "0.78rem", sm: "0.82rem" },
            borderRadius: "10px",
            px: { xs: 2.5, sm: 3 },
            py: { xs: 0.8, sm: 0.9 },
            textTransform: "none",
            boxShadow: `0 4px 10px ${alpha(INDIGO_ACCENT, 0.25)}`,
            "&.Mui-disabled": {
              background: alpha(SECONDARY_SLATE, 0.1),
              color: alpha(SECONDARY_SLATE, 0.3),
            },
          }}
        >
          {loading ? "Submitting..." : "Submit Report"}
        </Button>
      </Box>
    </Paper>
  );
};

export default WorkReportForm;
