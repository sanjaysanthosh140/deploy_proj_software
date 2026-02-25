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
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import CloseIcon from "@mui/icons-material/Close";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PersonIcon from "@mui/icons-material/Person";
import ChecklistIcon from "@mui/icons-material/Checklist";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";

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
          background: "linear-gradient(135deg, #020617 0%, #0f172a 100%)",
          borderRadius: 6,
          border: "1px solid rgba(56, 189, 248, 0.2)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          minHeight: "80vh",
          overflow: "hidden", // Ensure the main container doesn't have double scroll
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            variant="rounded"
            sx={{
              bgcolor: "rgba(56, 189, 248, 0.1)",
              color: "#38bdf8",
              width: 50,
              height: 50,
            }}
          >
            <AssignmentIndIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ color: "#f8fafc", fontWeight: 800 }}>
              Orchestrate Assignments
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Project: {projectData.title}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ color: "rgba(255,255,255,0.2)", "&:hover": { color: "#fff" } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4, overflow: "visible" }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "350px 1fr",
              gap: 4,
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
                  sx={{ color: "#f8fafc", fontWeight: 700 }}
                >
                  Backlog Checklist
                </Typography>
              </Box>

              <Droppable droppableId="unassigned">
                {(provided, snapshot) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{
                      bgcolor: snapshot.isDraggingOver
                        ? "rgba(56, 189, 248, 0.05)"
                        : "rgba(15, 23, 42, 0.4)",
                      borderRadius: 4,
                      p: 2,
                      minHeight: "60vh",
                      maxHeight: "65vh",
                      overflowY: "auto",
                      border: "1px dashed rgba(56, 189, 248, 0.2)",
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
                                  ? "rgba(56, 189, 248, 0.3)"
                                  : "rgba(30, 41, 59, 0.8)",
                                backdropFilter: "blur(8px)",
                                border: `1px solid ${snapshot.isDragging ? "#38bdf8" : "rgba(255, 255, 255, 0.05)"}`,
                                borderRadius: 3,
                                boxShadow: snapshot.isDragging
                                  ? "0 15px 40px rgba(0, 0, 0, 0.4)"
                                  : "none",
                                cursor: "grab",
                                width: snapshot.isDragging ? "300px" : "auto", // Maintain width during drag
                                zIndex: 9999,
                                "&:hover": {
                                  borderColor: "rgba(56, 189, 248, 0.4)",
                                },
                              }}
                            >
                              <Typography
                                sx={{
                                  color: "#f1f5f9",
                                  fontWeight: 600,
                                  mb: 1,
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
                                  fontWeight: 700,
                                  bgcolor:
                                    task.priority === "Critical"
                                      ? "#f43f5e20"
                                      : "rgba(255,255,255,0.05)",
                                  color:
                                    task.priority === "Critical"
                                      ? "#f43f5e"
                                      : "#94a3b8",
                                }}
                              />
                              {(task.dueDate || task.duedate) && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#64748b",
                                    display: "block",
                                    mt: 1.5,
                                    fontSize: "0.65rem",
                                    fontWeight: 600,
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
                      <Box sx={{ p: 4, textAlign: "center", color: "#64748b" }}>
                        <Typography variant="body2">
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
                <PersonIcon sx={{ color: "#4ade80" }} />
                <Typography
                  variant="h6"
                  sx={{ color: "#f8fafc", fontWeight: 700 }}
                >
                  Strategic Distribution
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
                                ? "rgba(74, 222, 128, 0.05)"
                                : "rgba(15, 23, 42, 0.4)",
                              borderRadius: 4,
                              p: 2,
                              minHeight: "50vh",
                              border: `2px dashed ${snapshot.isDraggingOver ? "#4ade80" : "rgba(255, 255, 255, 0.05)"}`,
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
                                  width: 32,
                                  height: 32,
                                  bgcolor: "#1e293b",
                                  color: "#4ade80",
                                  border: "1px solid rgba(74, 222, 128, 0.3)",
                                }}
                              >
                                {specialist.name?.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="subtitle2"
                                  sx={{ color: "#f1f5f9", fontWeight: 700 }}
                                >
                                  {specialist.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#64748b" }}
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
                                          ? "rgba(74, 222, 128, 0.3)"
                                          : "rgba(74, 222, 128, 0.03)",
                                        border: `1px solid ${snapshot.isDragging ? "#4ade80" : "rgba(74, 222, 128, 0.2)"}`,
                                        borderRadius: 3,
                                        boxShadow: snapshot.isDragging
                                          ? "0 10px 30px rgba(0, 0, 0, 0.4)"
                                          : "none",
                                        width: snapshot.isDragging
                                          ? "240px"
                                          : "auto", // Stable width
                                        zIndex: 9999,
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: "#f1f5f9",
                                          fontWeight: 600,
                                        }}
                                      >
                                        {task.title}
                                      </Typography>
                                      {(task.dueDate || task.duedate) && (
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "rgba(74, 222, 128, 0.5)",
                                            display: "block",
                                            mt: 1,
                                            fontSize: "0.6rem",
                                            fontWeight: 600,
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
                                    color: "#64748b",
                                    display: "block",
                                    textAlign: "center",
                                    mt: 4,
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
          <Button onClick={onClose} sx={{ color: "#64748b", fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSave}
            disabled={specialists.every((s) => s.assignedTasks.length === 0)}
            sx={{
              background: "linear-gradient(135deg, #4ade80, #22c55e)",
              color: "#020617",
              fontWeight: 800,
              px: 4,
              borderRadius: 3,
              "&:hover": {
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
              },
              "&:disabled": { opacity: 0.3 },
            }}
          >
            Deploy Assignments
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TaskAssignmentModal;
