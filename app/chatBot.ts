import { supabase } from "./lib/supabaseClient";

// Track the last message ID we've responded to
let lastRespondedMessageId: number | null = null;

async function fetchLatestMessage(): Promise<{
  id: number;
  message: string;
} | null> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, sender_name, message")
    .order("timestamp", { ascending: false })
    .limit(1);

  if (error) {
    console.error("❌ Error fetching latest message:", error);
    return null;
  }

  if (!data || data.length === 0) return null;

  // Don't respond to our own messages
  if (data[0].sender_name === "John Doe (Bot)") return null;

  return {
    id: data[0].id,
    message: `${data[0].sender_name}: ${data[0].message}`,
  };
}

async function generateAIResponse(latestMessage: string): Promise<string> {
  const prompt = `Someone just sent this message:\n"${latestMessage}"\n\nReply naturally.`;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama3.2", prompt, stream: false }),
    });

    const text = await response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Invalid AI response format");
    }

    const data = JSON.parse(jsonMatch[0]);

    if (!data || !data.response) {
      return "";
    }

    return data.response.trim();
  } catch (error) {
    console.error("❌ Error generating AI response:", error);
    return "Sorry, I couldn't process that.";
  }
}

async function sendAIMessage() {
  try {
    const latestMessage = await fetchLatestMessage();
    if (!latestMessage) return;

    // Check if we've already responded to this message
    if (lastRespondedMessageId === latestMessage.id) {
      return;
    }

    const aiMessage = await generateAIResponse(latestMessage.message);

    await supabase.from("messages").insert([
      {
        sender_name: "John Doe (Bot)",
        message: aiMessage,
        timestamp: new Date().toISOString(),
      },
    ]);

    // Update the last responded message ID
    lastRespondedMessageId = latestMessage.id;
    console.log("🤖 AI Bot replied:", aiMessage);
  } catch (error) {
    console.error("❌ Error sending AI message:", error);
  }
}

// Start AI bot
console.log("🤖 AI Chatbot started...");
setInterval(sendAIMessage, 5000);

// Handle shutdown
process.on("SIGINT", async () => {
  console.log("🛑 AI Bot shutting down...");
  process.exit(0);
});
