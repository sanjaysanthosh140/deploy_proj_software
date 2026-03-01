
/**
 * AntyGravity Instruction:
 * Apply rules from /docs/component_analysis_prompt.md
 */import React, { useState } from 'react';
import { AppBar, Toolbar, Box, InputBase, IconButton, Badge, Typography, Menu, MenuItem, Avatar } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmailIcon from '@mui/icons-material/Email';
import { styled, alpha } from '@mui/material/styles';

const PRIMARY_SLATE = "#0f172a";
const SECONDARY_SLATE = "#475569";
const INDIGO_ACCENT = "#4f46e5";
const GLASS_BG = "rgba(255, 255, 255, 0.75)";
const GLASS_BORDER = "rgba(10, 15, 25, 0.08)";

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: '16px',
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    '&:hover': {
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        border: `1px solid ${alpha(PRIMARY_SLATE, 0.1)}`,
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
    border: `1px solid ${GLASS_BORDER}`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: alpha(SECONDARY_SLATE, 0.5),
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: PRIMARY_SLATE,
    fontWeight: 500,
    '& .MuiInputBase-input': {
        padding: theme.spacing(1.2, 1, 1.2, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        fontSize: '0.9rem',
        '&::placeholder': {
            color: alpha(SECONDARY_SLATE, 0.5),
            opacity: 1,
        },
        [theme.breakpoints.up('md')]: {
            width: '45ch',
        },
    },
}));

const Topbar = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar
            position="sticky"
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                background: GLASS_BG,
                backdropFilter: 'blur(48px) saturate(180%)',
                boxShadow: '0 4px 20px rgba(10, 15, 25, 0.03)',
                borderBottom: `1px solid ${GLASS_BORDER}`,
                color: PRIMARY_SLATE,
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', minHeight: 74 }}>
                <Box />

                {/* Center Search */}
                <Search>
                    <SearchIconWrapper>
                        <SearchIcon />
                    </SearchIconWrapper>
                    <StyledInputBase
                        placeholder="Search projects, tasks, or team members..."
                        inputProps={{ 'aria-label': 'search' }}
                    />
                </Search>

                {/* Right Icons */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <IconButton size="large" sx={{ color: alpha(SECONDARY_SLATE, 0.6) }}>
                        <Badge badgeContent={4} sx={{ '& .MuiBadge-badge': { background: '#ef4444', color: '#fff' } }}>
                            <EmailIcon />
                        </Badge>
                    </IconButton>

                    <IconButton size="large" sx={{ color: alpha(SECONDARY_SLATE, 0.6) }}>
                        <Badge badgeContent={12} sx={{ '& .MuiBadge-badge': { background: INDIGO_ACCENT, color: '#fff' } }}>
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>

                    <Box
                        onClick={handleMenuClick}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            cursor: 'pointer',
                            ml: 2,
                            p: 0.5,
                            pr: 1.5,
                            borderRadius: '24px',
                            background: 'rgba(15, 23, 42, 0.04)',
                            border: `1px solid ${alpha(PRIMARY_SLATE, 0.05)}`,
                            transition: 'all 0.2s ease',
                            '&:hover': { background: 'rgba(15, 23, 42, 0.08)' }
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 34,
                                height: 34,
                                bgcolor: alpha(INDIGO_ACCENT, 0.1),
                                color: INDIGO_ACCENT,
                                fontSize: '0.9rem',
                                fontWeight: 800,
                                border: `1px solid ${alpha(INDIGO_ACCENT, 0.2)}`
                            }}
                            src="/path-to-avatar.jpg"
                        >
                            A
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: PRIMARY_SLATE }}>
                            Alkor
                        </Typography>
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Topbar;
