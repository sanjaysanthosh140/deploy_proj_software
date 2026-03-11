/**
 * AntyGravity Instruction:
 * Apply rules from /docs/component_analysis_prompt.md
 */
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Avatar,
  Paper,
  Chip,
  Button,
  Tooltip,
  alpha,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import CloseIcon from "@mui/icons-material/Close";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PersonIcon from "@mui/icons-material/Person";
import ChecklistIcon from "@mui/icons-material/Checklist";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";

// --- Theme Constants ---
const GLASS_BG = "rgb(255, 255, 255)";
const GLASS_BORDER = "rgba(10, 15, 25, 0.08)";
const PRIMARY_SLATE = "#0f172a";
const SECONDARY_SLATE = "#475569";

const TaskAssignmentModal = ({ open, onClose, projectData, onSave }) => {
  const [unassignedTasks, setUnassignedTasks] = useState([]);
  const [specialists, setSpecialists] = useState([]);

  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
    const fetchExistingAssignments = async () => {
      if (open && projectData?._id) {
        try {
          // 1. Initialize Default State
          const initialSpecialists = (projectData.teamMembers || []).map(
            (member, index) => ({
              ...member,
              stableId: String(
                member.userId || member._id || `temp-id-${index}`,
              ),
              assignedTasks: [],
            }),
          );

          // 2. Fetch Existing Data from DB
          let id = projectData._id;
          const response = await axios.get(
            `http://localhost:8080/admin/check_assigned_tasks/${id}`,
          );
          const existingData = response.data;

          if (existingData && existingData.employeeTasks) {
            setIsUpdate(true); // Data exists, use PUT for updates
            const dbTasks = existingData.employeeTasks;

            // Helper to stringify ids perfectly
            const sanitizeTask = (t) => {
              const rawId = t._id || t.task_id || `temp-${Math.random()}`;
              const strId = typeof rawId === 'object' ? rawId.$oid || rawId.toString() : String(rawId);
              return { ...t, _id: strId };
            };

            // 3. Hydrate Specialists
            const hydratedSpecialists = initialSpecialists.map((s) => {
              const matchingTasks = dbTasks
                .filter((item) => item.employee === s.stableId)
                .map((item) => sanitizeTask(item.tasks));
              return { ...s, assignedTasks: matchingTasks };
            });
            setSpecialists(hydratedSpecialists);

            // 4. Filter Backlog (Todos - Assigned)
            const assignedTaskTitles = dbTasks.map((item) => item.tasks.title);
            const filteredBacklog = (projectData.todos || []).filter(
              (todo) => !assignedTaskTitles.includes(todo.title),
            ).map(sanitizeTask);
            setUnassignedTasks(filteredBacklog);
          } else {
            setIsUpdate(false);
            // No existing data, use default initialization
            setSpecialists(initialSpecialists);

            const sanitizeTask = (t) => {
              const rawId = t._id || t.task_id || `temp-${Math.random()}`;
              const strId = typeof rawId === 'object' ? rawId.$oid || rawId.toString() : String(rawId);
              return { ...t, _id: strId };
            };
            setUnassignedTasks((projectData.todos || []).map(sanitizeTask));
          }
        } catch (error) {
          console.error("Error fetching assignments:", error);
          setIsUpdate(false);
          // Fallback to default state on error
          const sanitizeTask = (t) => {
            const rawId = t._id || t.task_id || `temp-${Math.random()}`;
            const strId = typeof rawId === 'object' ? rawId.$oid || rawId.toString() : String(rawId);
            return { ...t, _id: strId };
          };
          setUnassignedTasks((projectData.todos || []).map(sanitizeTask));
          setSpecialists(
            (projectData.teamMembers || []).map((member, index) => ({
              ...member,
              stableId: String(
                member.userId || member._id || `temp-id-${index}`,
              ),
              assignedTasks: [],
            })),
          );
        }
      }
    };

    fetchExistingAssignments();
  }, [open, projectData]);

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    // Moving from Unassigned to a Specialist
    if (
      source.droppableId === "unassigned" &&
      destination.droppableId.startsWith("specialist-")
    ) {
      const task = unassignedTasks[source.index];
      const specialistId = String(
        destination.droppableId.replace("specialist-", ""),
      );

      // Remove from unassigned
      const newUnassigned = Array.from(unassignedTasks);
      newUnassigned.splice(source.index, 1);
      setUnassignedTasks(newUnassigned);

      // Add to specialist
      setSpecialists((prev) =>
        prev.map((s) => {
          if (s.stableId === specialistId) {
            const newTasks = Array.from(s.assignedTasks);
            newTasks.splice(destination.index, 0, task);
            return {
              ...s,
              assignedTasks: newTasks,
            };
          }
          return s;
        }),
      );
    }

    // Moving from one Specialist to another Specialist
    if (
      source.droppableId.startsWith("specialist-") &&
      destination.droppableId.startsWith("specialist-")
    ) {
      const sourceId = String(source.droppableId.replace("specialist-", ""));
      const destId = String(destination.droppableId.replace("specialist-", ""));

      setSpecialists((prevList) => {
        let movedItem;
        const newSpecialists = prevList.map((s) => {
          if (s.stableId === sourceId) {
            const newTasks = Array.from(s.assignedTasks);
            [movedItem] = newTasks.splice(source.index, 1);
            return { ...s, assignedTasks: newTasks };
          }
          return s;
        });

        if (!movedItem) return prevList;

        return newSpecialists.map((s) => {
          if (s.stableId === destId) {
            const newTasks = Array.from(s.assignedTasks);
            newTasks.splice(destination.index, 0, movedItem);
            return { ...s, assignedTasks: newTasks };
          }
          return s;
        });
      });
    }

    // Moving from Specialist back to Unassigned
    if (
      source.droppableId.startsWith("specialist-") &&
      destination.droppableId === "unassigned"
    ) {
      const sourceId = String(source.droppableId.replace("specialist-", ""));
      let taskToMove;

      setSpecialists((prev) =>
        prev.map((s) => {
          if (s.stableId === sourceId) {
            const newTasks = Array.from(s.assignedTasks);
            [taskToMove] = newTasks.splice(source.index, 1);
            return { ...s, assignedTasks: newTasks };
          }
          return s;
        }),
      );

      if (taskToMove) {
        const newUnassigned = Array.from(unassignedTasks);
        newUnassigned.splice(destination.index, 0, taskToMove);
        setUnassignedTasks(newUnassigned);
      }
    }
  };

  const handleSave = async () => {
    try {
      // task_id: reuse the stable ID if the task already has one (hydrated from DB),
      // or generate a fresh UUID for any new task being assigned for the first time.
      const submissionData = {
        projectId: projectData._id,
        headId: projectData.head_id,
        employeeTasks: specialists
          .filter((s) => s.assignedTasks.length > 0)
          .flatMap((s) =>
            s.assignedTasks.map((t) => ({
              employee: s.userId || s._id || s.stableId,
              tasks: {
                task_id: t.task_id || crypto.randomUUID(), // stable if exists, new UUID otherwise
                title: t.title,
                priority: t.priority,
                duedate: t.dueDate || t.duedate,
                status: t.status || "pending",
              },
            })),
          ),
      };

      if (isUpdate) {
        console.log("Updating Assignments (PUT):", submissionData);
        let id = projectData._id;
        await axios.put(
          `http://localhost:8080/admin/assigned_tasks/${id}`,
          submissionData,
        );
        console.log(submissionData);
      } else {
        console.log("Creating Assignments (POST):", submissionData);
        await axios.post(
          "http://localhost:8080/admin/assigned_tasks",
          submissionData,
        );
        setIsUpdate(true);
      }

      if (onSave) onSave(submissionData);
      onClose();
    } catch (error) {
      console.error("Error submitting assignments:", error);
    }
  };

  if (!projectData) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableEnforceFocus // Resolves aria-hidden and focus lock issues when using Portals for DnD
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          background: GLASS_BG,
          backdropFilter: "blur(48px) saturate(160%)",
          WebkitBackdropFilter: "blur(48px) saturate(160%)",
          borderRadius: "32px",
          border: `1px solid ${GLASS_BORDER}`,
          boxShadow: "0 40px 80px -20px rgba(10, 15, 25, 0.12)",
          minHeight: "85vh",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, md: 3 }, minWidth: 0 }}>
          <Avatar
            variant="rounded"
            sx={{
              background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
              color: "#fff",
              width: { xs: 40, md: 56 },
              height: { xs: 40, md: 56 },
              borderRadius: "16px",
              boxShadow: "0 8px 16px rgba(10, 15, 25, 0.08)",
              flexShrink: 0,
            }}
          >
            <AssignmentIndIcon sx={{ fontSize: { xs: 22, md: 32 } }} />
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" sx={{ color: PRIMARY_SLATE, fontWeight: 900, mb: 0.5, fontSize: { xs: "1.1rem", md: "1.3rem" } }}>
              Orchestrate Intelligence
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: SECONDARY_SLATE,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                fontWeight: 800,
                fontSize: { xs: "0.65rem", md: "0.75rem" },
              }}
            >
              Stream: {projectData.title}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: alpha(PRIMARY_SLATE, 0.2),
            "&:hover": { color: PRIMARY_SLATE, background: "rgba(15, 23, 42, 0.05)" }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3, md: 4 }, overflow: "visible" }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "350px 1fr" },
              gap: { xs: 2, md: 4 },
              height: "100%",
            }}
          >
            {/* Left Column: Unassigned Tasks */}
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}
              >
                <ChecklistIcon sx={{ color: "#38bdf8" }} />
                <Typography
                  variant="h6"
                  sx={{ color: PRIMARY_SLATE, fontWeight: 900, letterSpacing: "-0.01em" }}
                >
                  Backlog Portfolio
                </Typography>
              </Box>

              <Droppable droppableId="unassigned">
                {(provided, snapshot) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{
                      bgcolor: snapshot.isDraggingOver
                        ? "rgba(15, 23, 42, 0.05)"
                        : "rgba(15, 23, 42, 0.02)",
                      borderRadius: "24px",
                      p: 2.5,
                      minHeight: "60vh",
                      maxHeight: "65vh",
                      overflowY: "auto",
                      border: "1px solid",
                      borderColor: snapshot.isDraggingOver ? "rgba(15, 23, 42, 0.15)" : GLASS_BORDER,
                      boxShadow: snapshot.isDraggingOver ? "0 8px 32px rgba(10, 15, 25, 0.05)" : "none",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {unassignedTasks.map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided, snapshot) => {
                          const child = (
                            <Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                p: 2,
                                mb: 2,
                                background: snapshot.isDragging
                                  ? "rgba(255, 255, 255, 0.9)"
                                  : "rgba(255, 255, 255, 0.6)",
                                backdropFilter: snapshot.isDragging
                                  ? "blur(12px) saturate(180%)"
                                  : "blur(20px) saturate(120%)",
                                border: `1px solid ${snapshot.isDragging ? "rgba(15, 23, 42, 0.15)" : GLASS_BORDER}`,
                                borderRadius: "16px",
                                boxShadow: snapshot.isDragging
                                  ? "0 20px 40px rgba(10, 15, 25, 0.15)"
                                  : "0 4px 12px rgba(10, 15, 25, 0.03)",
                                cursor: "grab",
                                width: snapshot.isDragging ? "300px" : "auto",
                                zIndex: 9999,
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                "&:hover": {
                                  background: "rgba(255, 255, 255, 0.8)",
                                  borderColor: "rgba(15, 23, 42, 0.1)",
                                  transform: "translateY(-2px)",
                                  boxShadow: "0 8px 20px rgba(10, 15, 25, 0.05)"
                                },
                              }}
                            >
                              <Typography
                                sx={{
                                  color: PRIMARY_SLATE,
                                  fontWeight: 800,
                                  mb: 1,
                                  letterSpacing: "-0.01em"
                                }}
                              >
                                {task.title}
                              </Typography>
                              <Chip
                                label={task.priority}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "0.65rem",
                                  fontWeight: 800,
                                  bgcolor:
                                    task.priority === "Critical"
                                      ? "rgba(244, 63, 94, 0.1)"
                                      : "rgba(15, 23, 42, 0.05)",
                                  color:
                                    task.priority === "Critical"
                                      ? "#e11d48"
                                      : PRIMARY_SLATE,
                                  borderRadius: "6px"
                                }}
                              />
                              {(task.dueDate || task.duedate) && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: SECONDARY_SLATE,
                                    display: "block",
                                    mt: 1.5,
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                  }}
                                >
                                  Due:{" "}
                                  {new Date(
                                    task.dueDate || task.duedate,
                                  ).toLocaleDateString()}
                                </Typography>
                              )}
                            </Paper>
                          );

                          if (snapshot.isDragging) {
                            return ReactDOM.createPortal(child, document.body);
                          }
                          return child;
                        }}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {unassignedTasks.length === 0 && (
                      <Box sx={{ p: 4, textAlign: "center", color: SECONDARY_SLATE }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          No unassigned tasks remaining
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Droppable>
            </Box>

            {/* Right Side: Specialist Columns */}
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}
              >
                <PersonIcon sx={{ color: "#10b981" }} />
                <Typography
                  variant="h6"
                  sx={{ color: PRIMARY_SLATE, fontWeight: 900, letterSpacing: "-0.01em" }}
                >
                  Resource Deployment
                </Typography>
              </Box>

              <Box
                sx={{
                  maxHeight: "65vh",
                  overflowY: "auto",
                  pr: 1,
                  "&::-webkit-scrollbar": { width: 6 },
                  "&::-webkit-scrollbar-thumb": {
                    bgcolor: "rgba(255,255,255,0.1)",
                    borderRadius: 3,
                  },
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "repeat(2, 1fr)",
                      lg: "repeat(3, 1fr)",
                    },
                    gap: 3,
                    pb: 2,
                  }}
                >
                  {specialists.map((specialist) => (
                    <Box key={specialist.stableId} sx={{ width: "100%" }}>
                      <Droppable
                        droppableId={`specialist-${specialist.stableId}`}
                      >
                        {(provided, snapshot) => (
                          <Box
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            sx={{
                              bgcolor: snapshot.isDraggingOver
                                ? "rgba(15, 23, 42, 0.05)"
                                : "rgba(15, 23, 42, 0.02)",
                              borderRadius: "24px",
                              p: 2,
                              minHeight: "50vh",
                              border: "1px solid",
                              borderColor: snapshot.isDraggingOver ? "rgba(15, 23, 42, 0.15)" : GLASS_BORDER,
                              boxShadow: snapshot.isDraggingOver ? "0 8px 32px rgba(10, 15, 25, 0.05)" : "none",
                              transition: "all 0.3s ease",
                            }}
                          >
                            {/* Specialist Header */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                mb: 3,
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: 36,
                                  height: 36,
                                  background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
                                  color: "#fff",
                                  borderRadius: "10px",
                                  boxShadow: "0 4px 8px rgba(10, 15, 25, 0.1)"
                                }}
                              >
                                {specialist.name?.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="subtitle2"
                                  sx={{ color: PRIMARY_SLATE, fontWeight: 800 }}
                                >
                                  {specialist.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: SECONDARY_SLATE, fontWeight: 600, textTransform: "uppercase", fontSize: "0.65rem" }}
                                >
                                  {specialist.role || "Specialist"}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Assigned Tasks */}
                            {specialist.assignedTasks.map((task, index) => (
                              <Draggable
                                key={task._id}
                                draggableId={task._id}
                                index={index}
                              >
                                {(provided, snapshot) => {
                                  const child = (
                                    <Paper
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      sx={{
                                        p: 1.5,
                                        mb: 1.5,
                                        background: snapshot.isDragging
                                          ? "rgba(255, 255, 255, 0.9)"
                                          : "rgba(255, 255, 255, 0.6)",
                                        backdropFilter: snapshot.isDragging
                                          ? "blur(12px) saturate(180%)"
                                          : "blur(20px) saturate(120%)",
                                        border: `1px solid ${snapshot.isDragging ? "rgba(15, 23, 42, 0.15)" : GLASS_BORDER}`,
                                        borderRadius: "12px",
                                        boxShadow: snapshot.isDragging
                                          ? "0 20px 40px rgba(10, 15, 25, 0.15)"
                                          : "0 4px 12px rgba(10, 15, 25, 0.03)",
                                        width: snapshot.isDragging
                                          ? "240px"
                                          : "auto",
                                        zIndex: 9999,
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        "&:hover": {
                                          background: "rgba(255, 255, 255, 0.8)",
                                          borderColor: "rgba(15, 23, 42, 0.1)",
                                          transform: "translateY(-1px)",
                                        },
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: PRIMARY_SLATE,
                                          fontWeight: 700,
                                        }}
                                      >
                                        {task.title}
                                      </Typography>
                                      {(task.dueDate || task.duedate) && (
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "#10b981",
                                            display: "block",
                                            mt: 1,
                                            fontSize: "0.6rem",
                                            fontWeight: 800,
                                          }}
                                        >
                                          Due:{" "}
                                          {new Date(
                                            task.dueDate || task.duedate,
                                          ).toLocaleDateString()}
                                        </Typography>
                                      )}
                                    </Paper>
                                  );

                                  if (snapshot.isDragging) {
                                    return ReactDOM.createPortal(
                                      child,
                                      document.body,
                                    );
                                  }
                                  return child;
                                }}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            {specialist.assignedTasks.length === 0 &&
                              !snapshot.isDraggingOver && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: SECONDARY_SLATE,
                                    display: "block",
                                    textAlign: "center",
                                    mt: 4,
                                    fontWeight: 600
                                  }}
                                >
                                  Drop tasks here
                                </Typography>
                              )}
                          </Box>
                        )}
                      </Droppable>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </DragDropContext>

        {/* Footer Actions */}
        <Box
          sx={{ mt: 6, display: "flex", justifyContent: "flex-end", gap: 2 }}
        >
          <Button
            onClick={onClose}
            sx={{
              color: SECONDARY_SLATE,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 1,
              "&:hover": { background: "rgba(15, 23, 42, 0.05)" }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSave}
            disabled={specialists.every((s) => s.assignedTasks.length === 0)}
            sx={{
              background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
              color: "#fff",
              fontWeight: 900,
              px: 4,
              py: 1.5,
              borderRadius: "14px",
              boxShadow: "0 10px 20px -5px rgba(10, 15, 25, 0.25)",
              textTransform: "none",
              fontSize: "1rem",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 15px 30px -5px rgba(10, 15, 25, 0.35)",
              },
              "&:disabled": {
                opacity: 0.2,
                background: "#94a3b8",
                color: "#fff"
              },
            }}
          >
            Deploy Intelligence
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TaskAssignmentModal;
