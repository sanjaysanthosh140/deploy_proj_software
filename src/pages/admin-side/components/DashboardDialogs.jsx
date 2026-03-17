import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Box,
  Fade,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import { glassEffect, iPhoneGlassButton } from "./SharedStyles";

const DashboardDialogs = ({
  // User Dialog Props
  openUserDialog,
  handleUserDialogClose,
  editingUser,
  userForm,
  setUserForm,
  handleUserSubmit,
  DEPARTMENTS,

  // Responsible Dialog Props
  openResponsibleDialog,
  handleResponsibleDialogClose,
  responsibleForm,
  setResponsibleForm,
  handleResponsibleSubmit,
  POSTS,

  // Department Dialog Props
  openDeptDialog,
  handleDeptDialogClose,
  editingDept,
  deptForm,
  setDeptForm,
  handleDeptSubmit,

  // Delete Dialog Props
  openDeleteDialog,
  cancelDeleteUser,
  userToDelete,
  confirmDeleteUser,
}) => {
  return (
    <>
      {/* USER DIALOG */}
      <Dialog
        open={openUserDialog}
        onClose={handleUserDialogClose}
        TransitionComponent={Fade}
        transitionDuration={400}
        PaperProps={{
          sx: {
            ...glassEffect,
            background: "rgba(255, 255, 255, 0.4)",
            backdropFilter: "blur(50px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            borderRadius: "32px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2)",
            overflow: "hidden"
          },
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{
          p: 3,
          fontWeight: 900,
          fontSize: "1.25rem",
          color: "rgba(0,0,0,0.85)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
        }}>
          {editingUser ? "Edit Profile" : "New Onboarding"}
        </DialogTitle>
        <DialogContent sx={{ p: 4, mt: 1 }}>
          <Stack spacing={3}>
            <TextField
              label="Full Name"
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  background: "rgba(255, 255, 255, 0.3)",
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.4)" },
                },
                "& .MuiInputBase-input": {
                  color: "#000",
                  fontWeight: 800,
                },
              }}
            />
            <TextField
              label="Email Address"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  background: "rgba(255, 255, 255, 0.3)",
                },
                "& .MuiInputBase-input": {
                  color: "#000",
                  fontWeight: 800,
                },
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={userForm.department}
                onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                label="Department"
                sx={{
                  borderRadius: "14px",
                  background: "rgba(255, 255, 255, 0.3)",
                  "& .MuiSelect-select": {
                    color: "#000",
                    fontWeight: 800,
                  }
                }}
              >
                {DEPARTMENTS.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {!editingUser && (
              <TextField
                label="Access Key"
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    background: "rgba(255, 255, 255, 0.3)",
                  },
                  "& .MuiInputBase-input": {
                    color: "#000",
                    fontWeight: 800,
                  },
                }}
              />
            )}
            <Button
              variant="contained"
              onClick={handleUserSubmit}
              fullWidth
              sx={{
                ...iPhoneGlassButton,
                height: 50,
                background: "rgba(0,0,0,0.8)",
                color: "#fff",
                "&:hover": { background: "#000" }
              }}
            >
              {editingUser ? "Push Updates" : "Initialize Agent"}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* RESPONSIBLE DIALOG */}
      <Dialog
        open={openResponsibleDialog}
        onClose={handleResponsibleDialogClose}
        TransitionComponent={Fade}
        transitionDuration={400}
        PaperProps={{
          sx: {
            ...glassEffect,
            background: "rgba(255, 255, 255, 0.4)",
            backdropFilter: "blur(50px) saturate(180%)",
            borderRadius: "32px",
          },
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ p: 3, fontWeight: 900, borderBottom: "1px solid rgba(255, 255, 255, 0.3)" }}>
          Node_init • Responsible
        </DialogTitle>
        <DialogContent sx={{ p: 4, mt: 1 }}>
          <Stack spacing={3}>
            <TextField
              label="Full Name"
              value={responsibleForm.name}
              onChange={(e) => setResponsibleForm({ ...responsibleForm, name: e.target.value })}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "14px", background: "rgba(255, 255, 255, 0.3)" },
                "& .MuiInputBase-input": { color: "#000", fontWeight: 800 }
              }}
            />
            <TextField
              label="Gmail Address"
              value={responsibleForm.email}
              onChange={(e) => setResponsibleForm({ ...responsibleForm, email: e.target.value })}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "14px", background: "rgba(255, 255, 255, 0.3)" },
                "& .MuiInputBase-input": { color: "#000", fontWeight: 800 }
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Role Designation</InputLabel>
              <Select
                value={responsibleForm.post}
                onChange={(e) => setResponsibleForm({ ...responsibleForm, post: e.target.value })}
                label="Role Designation"
                sx={{
                  borderRadius: "14px",
                  background: "rgba(255, 255, 255, 0.3)",
                  "& .MuiSelect-select": { color: "#000", fontWeight: 800 }
                }}
              >
                {POSTS.map((post) => (
                  <MenuItem key={post} value={post}>
                    {post.charAt(0).toUpperCase() + post.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={responsibleForm.department}
                onChange={(e) => setResponsibleForm({ ...responsibleForm, department: e.target.value })}
                label="Department"
                sx={{
                  borderRadius: "14px",
                  background: "rgba(255, 255, 255, 0.3)",
                  "& .MuiSelect-select": { color: "#000", fontWeight: 800 }
                }}
              >
                {DEPARTMENTS.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Secure Access Key"
              type="password"
              value={responsibleForm.password}
              onChange={(e) => setResponsibleForm({ ...responsibleForm, password: e.target.value })}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "14px", background: "rgba(255, 255, 255, 0.3)" },
                "& .MuiInputBase-input": { color: "#000", fontWeight: 800 }
              }}
            />
            <Button
              variant="contained"
              onClick={handleResponsibleSubmit}
              fullWidth
              sx={{
                ...iPhoneGlassButton,
                height: 50,
                background: "rgba(0,0,0,0.8)",
                color: "#fff",
                "&:hover": { background: "#000" }
              }}
            >
              Deploy Command Node
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* DEPARTMENT DIALOG */}
      <Dialog
        open={openDeptDialog}
        onClose={handleDeptDialogClose}
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            ...glassEffect,
            background: "rgba(255, 255, 255, 0.4)",
            backdropFilter: "blur(50px) saturate(180%)",
            borderRadius: "32px",
          },
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ p: 3, fontWeight: 900, borderBottom: "1px solid rgba(255, 255, 255, 0.3)" }}>
          {editingDept ? "Configure Cluster" : "Provision Cluster"}
        </DialogTitle>
        <DialogContent sx={{ p: 4, mt: 1 }}>
          <Stack spacing={3}>
            <TextField
              label="Cluster ID"
              value={deptForm.id || deptForm.Dep_id}
              onChange={(e) => setDeptForm({ ...deptForm, id: e.target.value })}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "14px", background: "rgba(255, 255, 255, 0.3)" },
                "& .MuiInputBase-input": { color: "#000", fontWeight: 800 }
              }}
            />
            <TextField
              label="Title"
              value={deptForm.title}
              onChange={(e) => setDeptForm({ ...deptForm, title: e.target.value })}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "14px", background: "rgba(255, 255, 255, 0.3)" },
                "& .MuiInputBase-input": { color: "#000", fontWeight: 800 }
              }}
            />
            <TextField
              label="Visual Accent (Hex)"
              value={deptForm.color}
              onChange={(e) => setDeptForm({ ...deptForm, color: e.target.value })}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "14px", background: "rgba(255, 255, 255, 0.3)" },
                "& .MuiInputBase-input": { color: "#000", fontWeight: 800 }
              }}
            />
            <TextField
              label="Description"
              value={deptForm.description}
              multiline
              rows={3}
              onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "14px", background: "rgba(255, 255, 255, 0.3)" },
                "& .MuiInputBase-input": { color: "#000", fontWeight: 800 }
              }}
            />
            <Button
              variant="contained"
              onClick={handleDeptSubmit}
              fullWidth
              sx={{
                ...iPhoneGlassButton,
                height: 50,
                background: "rgba(0,0,0,0.8)",
                color: "#fff",
                "&:hover": { background: "#000" }
              }}
            >
              Verify Configuration
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog
        open={openDeleteDialog}
        onClose={cancelDeleteUser}
        PaperProps={{
          sx: {
            ...glassEffect,
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(60px)",
            borderRadius: "32px",
            p: 2
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#e11d48",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            fontWeight: 900,
          }}
        >
          <WarningIcon /> Security Override
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "rgba(0,0,0,0.6)", fontWeight: 700, mb: 2 }}>
            Confirm immediate deletion of <b>{userToDelete?.name}</b>. This state change is permanent.
          </Typography>
          <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              onClick={cancelDeleteUser}
              sx={{ color: "rgba(0,0,0,0.4)", fontWeight: 800 }}
            >
              Abort
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: "rgba(225, 29, 72, 0.1)",
                color: "#e11d48",
                fontWeight: 900,
                "&:hover": { bgcolor: "rgba(225, 29, 72, 0.2)" }
              }}
              onClick={confirmDeleteUser}
            >
              Execute Deletion
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardDialogs;
