import React, { useState } from "react";
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
  IconButton,
  InputAdornment,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
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
  editingAdmin,
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

  // Password Dialog Props
  openPasswordDialog,
  handlePasswordDialogClose,
  passwordForm,
  setPasswordForm,
  handlePasswordSubmit,
}) => {
  const [showPasswordUser, setShowPasswordUser] = useState(false);
  const [showPasswordResponsible, setShowPasswordResponsible] = useState(false);
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);

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
                "& .MuiInputLabel-root": { color: "#000", fontWeight: 700 },
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
                "& .MuiInputLabel-root": { color: "#000", fontWeight: 700 },
                "& .MuiInputBase-input": {
                  color: "#000",
                  fontWeight: 800,
                },
              }}
            />
            <FormControl fullWidth>
              <InputLabel sx={{ color: "#000", fontWeight: 700 }}>Department</InputLabel>
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
                label="Password"
                type={showPasswordUser ? "text" : "password"}
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPasswordUser(!showPasswordUser)}
                        edge="end"
                        sx={{ color: "rgba(0,0,0,0.4)" }}
                      >
                        {showPasswordUser ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    background: "rgba(255, 255, 255, 0.3)",
                  },
                  "& .MuiInputLabel-root": { color: "#000", fontWeight: 700 },
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
          {editingAdmin ? "Protocol_Update • Responsible" : "Node_init • Responsible"}
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
                "& .MuiInputLabel-root": { color: "#000", fontWeight: 700 },
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
                "& .MuiInputLabel-root": { color: "#000", fontWeight: 700 },
                "& .MuiInputBase-input": { color: "#000", fontWeight: 800 }
              }}
            />
            <FormControl fullWidth>
              <InputLabel sx={{ color: "#000", fontWeight: 700 }}>Role Designation</InputLabel>
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
              <InputLabel sx={{ color: "#000", fontWeight: 700 }}>Department</InputLabel>
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
            {!editingAdmin && (
              <TextField
                label="Password"
                type={showPasswordResponsible ? "text" : "password"}
                value={responsibleForm.password}
                onChange={(e) => setResponsibleForm({ ...responsibleForm, password: e.target.value })}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPasswordResponsible(!showPasswordResponsible)}
                        edge="end"
                        sx={{ color: "rgba(0,0,0,0.4)" }}
                      >
                        {showPasswordResponsible ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: "14px", background: "rgba(255, 255, 255, 0.3)" },
                  "& .MuiInputLabel-root": { color: "#000", fontWeight: 700 },
                  "& .MuiInputBase-input": { color: "#000", fontWeight: 800 }
                }}
              />
            )}
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
              {editingAdmin ? "Update Configuration" : "Deploy Command Node"}
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
                "& .MuiInputLabel-root": { color: "#000", fontWeight: 700 },
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
                "& .MuiInputLabel-root": { color: "#000", fontWeight: 700 },
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
                "& .MuiInputLabel-root": { color: "#000", fontWeight: 700 },
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
                "& .MuiInputLabel-root": { color: "#000", fontWeight: 700 },
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

      {/* EDIT PASSWORD DIALOG */}
      <Dialog
        open={openPasswordDialog}
        onClose={handlePasswordDialogClose}
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
        maxWidth="xs"
      >
        <DialogTitle sx={{
          p: 3,
          fontWeight: 900,
          fontSize: "1.25rem",
          color: "rgba(0,0,0,0.85)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
        }}>
          Reset Access Key
        </DialogTitle>
        <DialogContent sx={{ p: 4, mt: 1 }}>
          <Stack spacing={3}>
            <TextField
              label="Employee Email"
              value={passwordForm.email}
              fullWidth
              disabled
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  background: "rgba(255, 255, 255, 0.35)",
                  "& fieldset": { borderColor: "rgba(0,0,0,0.05)" },
                },
                "& .MuiInputLabel-root": { color: "#000", fontWeight: 700 },
                "& .MuiInputBase-input": {
                  color: "#000",
                  fontWeight: 800,
                },
                "& .Mui-disabled": {
                  WebkitTextFillColor: "rgba(0,0,0,0.6) !important",
                }
              }}
            />
            <TextField
              label="New Password"
              type={showPasswordEdit ? "text" : "password"}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              fullWidth
              autoFocus
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPasswordEdit(!showPasswordEdit)}
                      edge="end"
                      sx={{ color: "rgba(0,0,0,0.4)" }}
                    >
                      {showPasswordEdit ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  background: "rgba(255, 255, 255, 0.35)",
                  "& fieldset": { borderColor: "rgba(0,0,0,0.05)" },
                },
                "& .MuiInputLabel-root": { color: "#000", fontWeight: 700 },
                "& .MuiInputBase-input": {
                  color: "#000",
                  fontWeight: 800,
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handlePasswordSubmit}
              fullWidth
              sx={{
                ...iPhoneGlassButton,
                height: 50,
                background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
                color: "#fff",
                boxShadow: "0 10px 20px -5px rgba(67, 56, 202, 0.3)",
                "&:hover": { 
                  background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)",
                  transform: "translateY(-2px)"
                }
              }}
            >
              Update Credentials
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardDialogs;
