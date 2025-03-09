import { format } from "date-fns";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { ChatProps } from "../types/chat";

export const ChatUI = ({
  messages,
  name,
  input,
  darkMode,
  typingUsers,
  onSend,
  onTyping,
  onClear,
  onKeyPress,
  messagesEndRef,
}: ChatProps) => {
  const generateAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 70%, 50%)`;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Messages area */}
      <Box sx={{ flex: 1, p: 2, overflow: "auto" }}>
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: "flex",
              justifyContent:
                msg.sender_name === name ? "flex-end" : "flex-start",
              mb: 2,
            }}
          >
            {msg.sender_name !== name && (
              <Avatar
                sx={{ bgcolor: generateAvatarColor(msg.sender_name), mr: 1 }}
              >
                {msg.sender_name[0].toUpperCase()}
              </Avatar>
            )}
            <Paper
              sx={{
                p: 2,
                maxWidth: "70%",
                bgcolor:
                  msg.sender_name === name
                    ? "primary.main"
                    : "background.paper",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                {msg.sender_name}
              </Typography>
              <Typography>{msg.message}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {format(new Date(msg.timestamp), "HH:mm")}
              </Typography>
            </Paper>
            {msg.sender_name === name && (
              <Avatar
                sx={{ bgcolor: generateAvatarColor(msg.sender_name), ml: 1 }}
              >
                {msg.sender_name[0].toUpperCase()}
              </Avatar>
            )}
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <Typography variant="caption" sx={{ pl: 2, color: "text.secondary" }}>
          {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"}{" "}
          typing...
        </Typography>
      )}

      {/* Input area */}
      <Box sx={{ p: 2, bgcolor: "background.paper" }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            value={input}
            onChange={onTyping}
            onKeyPress={onKeyPress}
            placeholder="Type a message..."
            variant="outlined"
            size="small"
          />
          <IconButton
            color="primary"
            onClick={() =>
              onSend({
                id: Date.now(),
                sender_name: name,
                message: input,
                timestamp: new Date().toISOString(),
              })
            }
            disabled={!input.trim()}
          >
            <SendIcon />
          </IconButton>
          <Tooltip title="Clear chat">
            <IconButton color="error" onClick={onClear}>
              <DeleteSweepIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};
