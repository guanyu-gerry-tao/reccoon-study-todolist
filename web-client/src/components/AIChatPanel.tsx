import React, { useState } from "react";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  Avatar
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import '../App.css'

const AIChatPanel = ({ onClose }: { onClose: () => void }) => {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am your AI assistant. How can I help you?",
      sender: "ai"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // 发送消息到后端
  const handleSend = async (text: string) => {
    setMessages(prev => [...prev, { message: text, sender: "user" }]);
    setIsTyping(true);

    // 这里用fetch调用你自己的后端API
    const res = await fetch("/api/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();

    setMessages(prev => [
      ...prev,
      { message: data.reply, sender: "ai" }
    ]);
    setIsTyping(false);
  };

  return (
    <div style={{
      position: "fixed",
      right: "2rem",
      bottom: "5rem",
      zIndex: 2000,
      width: "350px",
      height: "480px",
      boxShadow: "0 2px 16px rgba(0,0,0,0.18)"
    }}>
      <MainContainer>
        <ChatContainer>
          <div style={{ display: "flex", justifyContent: "flex-end", padding: 8 }}>
            <button onClick={onClose}>关闭</button>
          </div>
          <MessageList
            typingIndicator={isTyping ? <TypingIndicator content="AI正在输入..." /> : null}
          >
            {messages.map((msg, idx) => (
              <Message
                key={idx}
                model={{
                  message: msg.message,
                  sentTime: "just now",
                  sender: msg.sender === "user" ? "你" : "AI",
                  direction: msg.sender === "user" ? "outgoing" : "incoming"
                }}
              >
                <Avatar name={msg.sender === "user" ? "你" : "AI"} />
              </Message>
            ))}
          </MessageList>
          <MessageInput placeholder="输入你的问题..." onSend={handleSend} />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default AIChatPanel