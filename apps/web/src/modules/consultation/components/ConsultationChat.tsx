import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: string;
  message: string;
  createdAt: string;
}

interface Props {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  currentUserId: string;
}

export default function ConsultationChat({ messages, onSend, currentUserId }: Props) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b font-bold text-gray-900 text-sm">In-call chat</div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px] max-h-[320px]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`text-sm rounded-xl px-3 py-2 max-w-[90%] ${
              m.senderId === currentUserId
                ? "ml-auto bg-primary-600 text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {m.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={submit} className="p-3 border-t flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
        />
        <button
          type="submit"
          className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
