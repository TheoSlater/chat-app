import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { Message } from "../types/chat";

export const useChat = (nameSubmitted: boolean, name: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!nameSubmitted) return;

    async function fetchMessages() {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .order("timestamp", { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (err: any) {
        setError(err.message);
      }
    }
    fetchMessages();

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
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const typingUsersList = Object.values(state)
          .flat()
          .filter((userPresence: any) => userPresence.isTyping)
          .map((userPresence: any) => userPresence.username)
          .filter((username) => username !== name);
        setTypingUsers(typingUsersList);
      });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        channelRef.current = channel;
        await channel.track({
          username: name,
          isTyping: false,
          online_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      if (channelRef.current) {
        channelRef.current.untrack();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [nameSubmitted, name]);

  return { messages, error, typingUsers, channelRef, setError, setMessages };
};
