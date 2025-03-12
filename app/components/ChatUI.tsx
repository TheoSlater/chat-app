import { format } from "date-fns";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  TextField,
  IconButton,
  Tooltip,
  Fade,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import MailIcon from "@mui/icons-material/Mail";
import PublicIcon from "@mui/icons-material/Public";
import { ChatProps } from "../types/chat";
import { useEffect, useRef } from "react";

export const ChatUI = ({
  messages,
  name,
  input,
  darkMode,
  typingUsers,
  users,
  selectedUser,
  onSend,
  onTyping,
  onClear,
  onKeyPress,
  onUserSelect,
  messagesEndRef,
}: ChatProps) => {
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 70%, 50%)`;
  };

  // Count unread private messages
  const privateMessageCount = messages.filter(
    (msg) => msg.recipient_name && msg.recipient_name === name
  ).length;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: darkMode ? "background.default" : "#f0f2f5",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
          }}
        >
          <Avatar sx={{ bgcolor: generateAvatarColor(name) }}>
            {name[0].toUpperCase()}
          </Avatar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {name}
          </Typography>
          <Badge badgeContent={privateMessageCount} color="primary">
            <MailIcon />
          </Badge>
        </Box>

        {/* User Selection */}
        <FormControl fullWidth size="small">
          <InputLabel>Send message to</InputLabel>
          <Select
            value={selectedUser || ""}
            onChange={(e) => onUserSelect(e.target.value || null)}
            label="Send message to"
            startAdornment={
              <PublicIcon sx={{ mr: 1, opacity: 0.5 }} fontSize="small" />
            }
          >
            <MenuItem value="">Everyone (Public)</MenuItem>
            <Divider />
            {users
              .filter((user) => user !== name)
              .map((user) => (
                <MenuItem key={user} value={user}>
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      mr: 1,
                      bgcolor: generateAvatarColor(user),
                    }}
                  >
                    {user[0].toUpperCase()}
                  </Avatar>
                  {user}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {messages.map((msg, index) => (
          <Fade in key={msg.id}>
            <Box
              sx={{
                display: "flex",
                justifyContent:
                  msg.sender_name === name ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                gap: 1,
              }}
              ref={index === messages.length - 1 ? lastMessageRef : null}
            >
              {msg.sender_name !== name && (
                <Avatar
                  sx={{
                    bgcolor: generateAvatarColor(msg.sender_name),
                    width: 32,
                    height: 32,
                  }}
                >
                  {msg.sender_name[0].toUpperCase()}
                </Avatar>
              )}
              <Paper
                elevation={1}
                sx={{
                  p: 1.5,
                  maxWidth: "70%",
                  bgcolor:
                    msg.sender_name === name
                      ? msg.recipient_name
                        ? "secondary.main"
                        : "primary.main"
                      : "background.paper",
                  borderRadius: 2,
                }}
              >
                {msg.sender_name !== name && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "primary.main",
                      fontWeight: "medium",
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    {msg.sender_name}
                  </Typography>
                )}
                {msg.recipient_name && (
                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        msg.sender_name === name
                          ? "rgba(255,255,255,0.7)"
                          : "text.secondary",
                      fontStyle: "italic",
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    Private message{" "}
                    {msg.sender_name === name ? `to ${msg.recipient_name}` : ""}
                  </Typography>
                )}
                <Typography
                  sx={{
                    color: msg.sender_name === name ? "#fff" : "text.primary",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.message}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                    display: "block",
                    textAlign: "right",
                    mt: 0.5,
                    color: msg.sender_name === name ? "#fff" : "text.secondary",
                  }}
                >
                  {format(new Date(msg.timestamp), "HH:mm")}
                </Typography>
              </Paper>
            </Box>
          </Fade>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Typing Indicator */}
      <Box sx={{ px: 2, minHeight: 24 }}>
        {typingUsers.length > 0 && (
          <Fade in>
            <Typography
              variant="caption"
              sx={{
                color: "primary.main",
                fontStyle: "italic",
              }}
            >
              {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"}{" "}
              typing...
            </Typography>
          </Fade>
        )}
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          bgcolor: "background.paper",
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            maxWidth: 1200,
            mx: "auto",
          }}
        >
          <TextField
            fullWidth
            value={input}
            autoComplete="off"
            onChange={onTyping}
            onKeyPress={onKeyPress}
            placeholder={`Type a message${
              selectedUser ? ` to ${selectedUser}` : ""
            }`}
            variant="outlined"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                backgroundColor: darkMode
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.05)",
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={(e) =>
              onSend({
                id: new Date().getTime(),
                sender_name: name,
                message: input,
                timestamp: new Date().toISOString(),
              })
            }
            disabled={!input.trim()}
            sx={{
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.1)",
              },
            }}
          >
            <SendIcon />
          </IconButton>
          <Tooltip title="Clear chat">
            <IconButton
              color="error"
              onClick={onClear}
              sx={{
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "error.main",
                  color: "white",
                },
              }}
            >
              <DeleteSweepIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};
