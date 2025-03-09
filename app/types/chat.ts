export interface Message {
  id: number;
  sender_name: string;
  message: string;
  timestamp: string;
}

export interface ChatProps {
  messages: Message[];
  name: string;
  input: string;
  darkMode: boolean;
  typingUsers: string[];
  onSend: (message: {
    id: number;
    sender_name: string;
    message: string;
    timestamp: string;
  }) => void;
  onTyping: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}
