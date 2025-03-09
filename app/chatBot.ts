import { supabase } from "./lib/supabaseClient";

const randomMessages = [
  "👋 Hello there!",
  "🤔 How's everyone doing?",
  "🌞 Beautiful day, isn't it?",
  "💭 Anyone want to chat?",
  "❤️ I love this chat app!",
  "🆕 What's new?",
  "📝 Just checking in...",
  "🌟 Hope you're all having a great day!",
  "☕ Time for coffee!",
  "💡 Interesting conversation!",
  "🎮 Anyone playing any good games lately?",
  "📚 Just finished reading a great book!",
  "🎵 Music recommendations anyone?",
  "🍕 Pizza time!",
  "🤖 Beep boop... I mean, hello!",
  "🌈 Spreading some positivity today!",
  "💪 Keep up the great work everyone!",
  "🎉 Happy coding!",
  "🤓 Did you know? TypeScript is awesome!",
  "🌍 Greetings from the internet!",
];

async function sendRandomMessage() {
  const randomMessage =
    randomMessages[Math.floor(Math.random() * randomMessages.length)];

  try {
    await supabase.from("messages").insert([
      {
        sender_name: "John Doe (Bot)",
        message: randomMessage,
        timestamp: new Date().toISOString(),
      },
    ]);
    console.log("🤖 Bot message sent:", randomMessage);
  } catch (error) {
    console.error("❌ Error sending bot message:", error);
  }
}

// Start the bot
console.log("🤖 Bot started...");
setInterval(sendRandomMessage, 60000); // Send message every 15 seconds
sendRandomMessage(); // Send first message immediately

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("🛑 Bot shutting down...");
  process.exit(0);
});
