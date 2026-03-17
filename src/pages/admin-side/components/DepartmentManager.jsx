import React from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  CardContent,
  alpha,
  Fade,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import GlassCard from "./GlassCard";
import { iPhoneGlassButton } from "./SharedStyles";

const DepartmentManager = ({
  departments,
  onAddDepartment,
  onEditDepartment,
  onDeleteDepartment,
  getDeptColor,
}) => {
  return (
    <Fade in={true}>
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 900, color: "rgba(0,0,0,0.8)" }}>
            Departments
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddDepartment}
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
            <Grid item xs={12} sm={6} md={4} key={dept.id || dept._id}>
              <GlassCard
                hoverEffect={true}
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  background: "rgba(255, 255, 255, 0.45)",
                }}
              >
                <Box
                  sx={{
                    height: "6px",
                    background: dept.color || "#38bdf8",
                    boxShadow: `0 0 15px ${dept.color || "#38bdf8"}30`,
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
                    sx={{ fontWeight: 900, color: "rgba(0,0,0,0.85)", mb: 1 }}
                  >
                    {dept.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748b", fontWeight: 600, mb: 3 }}
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
                    background: "rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <Button
                    size="small"
                    onClick={() => onEditDepartment(dept)}
                    sx={{
                      color: dept.color || "#38bdf8",
                      fontWeight: 800,
                      borderRadius: "10px",
                      "&:hover": { background: alpha(dept.color || "#38bdf8", 0.1) }
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    onClick={() => onDeleteDepartment(dept._id)}
                    sx={{
                      color: "#ef4444",
                      fontWeight: 800,
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
  );
};

export default DepartmentManager;
