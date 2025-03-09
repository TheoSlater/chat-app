import { useState } from "react";

export const useTyping = (
  channelRef: React.MutableRefObject<any>,
  name: string
) => {
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const handleTyping = async (value: string) => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    if (channelRef.current) {
      await channelRef.current.track({
        username: name,
        isTyping: true,
        online_at: new Date().toISOString(),
      });

      setTypingTimeout(
        setTimeout(async () => {
          if (channelRef.current) {
            await channelRef.current.track({
              username: name,
              isTyping: false,
              online_at: new Date().toISOString(),
            });
          }
        }, 1000)
      );
    }

    return value;
  };

  return { handleTyping };
};
