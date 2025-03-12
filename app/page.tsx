"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "./lib/supabaseClient";
import { RealtimeChannel } from "@supabase/supabase-js";
import {
  Box,
  ThemeProvider,
  CssBaseline,
  useMediaQuery,
  Snackbar,
  Alert,
  Paper,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { ChatUI } from "./components/ChatUI";
import { Message } from "./types/chat";
import { createChatTheme } from "./theme/chatTheme";
import { useTyping } from "./hooks/useTyping";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const { handleTyping } = useTyping(channelRef, name);
  const theme = createChatTheme(darkMode);

  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);

  useEffect(() => {
    if (!nameSubmitted) return;

    const setupChat = async () => {
      try {
        // Fetch existing messages
        const { data, error: fetchError } = await supabase
          .from("messages")
          .select("*")
          .order("timestamp", { ascending: true });

        if (fetchError) throw fetchError;

        // Filter messages to show only relevant ones
        const filteredMessages = (data || []).filter(
          (msg) =>
            !msg.recipient_name || // public messages
            msg.recipient_name === name || // messages to current user
            msg.sender_name === name // messages from current user
        );

        setMessages(filteredMessages);

        // Set up realtime channel
        const channel = supabase
          .channel("chat_room", {
            config: {
              broadcast: { self: true },
              presence: { key: name },
            },
          })
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "messages" },
            (payload) => {
              const newMessage = payload.new as Message;
              if (
                !newMessage.recipient_name ||
                newMessage.recipient_name === name ||
                newMessage.sender_name === name
              ) {
                setMessages((prev) => [...prev, newMessage]);
              }
            }
          )
          .on("presence", { event: "sync" }, () => {
            const state = channel.presenceState();

            // Update online users
            const onlineUsers = Object.values(state)
              .flat()
              .map((user: any) => user.username)
              .filter((username) => username !== name);
            setUsers(onlineUsers);

            // Update typing users
            const typingUsersList = Object.values(state)
              .flat()
              .filter((user: any) => user.isTyping)
              .map((user: any) => user.username)
              .filter((username) => username !== name);
            setTypingUsers(typingUsersList);
          });

        channelRef.current = channel;
        await channel.subscribe();

        // Track presence
        await channel.track({
          username: name,
          isTyping: false,
          online_at: new Date().toISOString(),
        });
      } catch (err: any) {
        setError(err.message);
      }
    };

    setupChat();

    return () => {
      if (channelRef.current) {
        channelRef.current.untrack();
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [nameSubmitted, name]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    handleTyping(e.target.value);
  };

  const sendMessage = async () => {
    if (!input.trim() || !name.trim()) return;

    try {
      const { error: sendError } = await supabase.from("messages").insert([
        {
          sender_name: name,
          recipient_name: selectedUser,
          message: input.trim(),
          timestamp: new Date().toISOString(),
        },
      ]);

      if (sendError) throw sendError;
      setInput("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const clearChat = async () => {
    try {
      const { error: clearError } = await supabase
        .from("messages")
        .delete()
        .neq("id", 0);

      if (clearError) throw clearError;
      setMessages([]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSetName = () => {
    if (name.trim()) {
      setNameSubmitted(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleUserSelect = (user: string | null) => {
    setSelectedUser(user);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        {!nameSubmitted ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 3,
            }}
          >
            <Paper
              elevation={3}
              sx={{ p: 4, maxWidth: 400, width: "100%", textAlign: "center" }}
            >
              <Typography variant="h6" gutterBottom>
                Welcome to Chat
              </Typography>
              <TextField
                label="Enter your name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSetName()}
                margin="normal"
                variant="outlined"
                sx={{ mb: 3 }}
              />
              <Button
                variant="contained"
                fullWidth
                onClick={handleSetName}
                size="large"
              >
                Join Chat
              </Button>
            </Paper>
          </Box>
        ) : (
          <ChatUI
            messages={messages}
            name={name}
            input={input}
            darkMode={darkMode}
            typingUsers={typingUsers}
            onSend={sendMessage}
            onTyping={handleInputChange}
            onClear={clearChat}
            onKeyPress={handleKeyPress}
            messagesEndRef={messagesEndRef}
            users={users}
            selectedUser={selectedUser}
            onUserSelect={handleUserSelect}
          />
        )}
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
