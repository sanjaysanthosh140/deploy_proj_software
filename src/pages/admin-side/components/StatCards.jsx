import React from "react";
import { Grid, Box, CardContent, Typography, alpha, Zoom } from "@mui/material";
import GlassCard from "./GlassCard";

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

const StatCards = ({ stats }) => {
  return (
    <Grid container spacing={3} sx={{ mb: 6, position: "relative", zIndex: 1 }}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} lg={3} key={index}>
          <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
            <Box>
              <StatCard {...stat} />
            </Box>
          </Zoom>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatCards;

