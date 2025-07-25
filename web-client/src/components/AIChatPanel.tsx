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

type Task = {
  id: string;
  title: string;
  description?: string;
};

const AIChatPanel = ({ onClose, onAcceptTask }: { onClose: () => void; onAcceptTask?: (task: Task) => void }) => {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am your AI assistant. How can I help you?",
      sender: "ai"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingTask, setPendingTask] = useState<Task | null>(null);

  // 发送消息到后端
  const handleSend = async (text: string) => {
    setMessages(prev => [...prev, { message: text, sender: "user" }]);
    setIsTyping(true);

    const res = await fetch("/api/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();

    // 检查 AI 回复是否为任务 JSON
    let aiReply = data.reply;
    let taskObj: Task | null = null;
    try {
      const parsed = JSON.parse(aiReply);
      if (parsed && parsed.type === "task" && parsed.title) {
        taskObj = {
          id: parsed.id || Date.now().toString(),
          title: parsed.title,
          description: parsed.description
        };
        setPendingTask(taskObj);
        aiReply = "I've created a new task for you below.";
      }
    } catch {
      // 普通文本回复
    }

    setMessages(prev => [
      ...prev,
      { message: aiReply, sender: "ai" }
    ]);
    setIsTyping(false);
  };

  // 用户接受任务
  const handleAcceptTask = () => {
    if (pendingTask && onAcceptTask) {
      onAcceptTask(pendingTask);
    }
    setPendingTask(null);
    setMessages(prev => [
      ...prev,
      { message: "Task accepted and added to status bar.", sender: "user" }
    ]);
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
            {/* 新增：任务卡片和一键添加按钮 */}
            {pendingTask && (
              <Message
                key="task"
                model={{
                  message: "",
                  sentTime: "just now",
                  sender: "AI",
                  direction: "incoming"
                }}
              >
                <Avatar name="AI" />
                <div style={{
                  background: "#f1f1f1",
                  borderRadius: "8px",
                  padding: "10px",
                  marginTop: "8px",
                  position: "relative"
                }}>
                  <div style={{ fontWeight: "bold", marginBottom: 4 }}>{pendingTask.title}</div>
                  {pendingTask.description && (
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: 8 }}>
                      {pendingTask.description}
                    </div>
                  )}
                  <button
                    onClick={handleAcceptTask}
                    style={{
                      background: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: "14px",
                      position: "absolute",
                      right: "10px",
                      bottom: "10px",
                      outline: "none"
                    }}
                  >
                    一键添加任务
                  </button>
                </div>
              </Message>
            )}
          </MessageList>
          <MessageInput placeholder="输入你的问题..." onSend={handleSend} />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default AIChatPanel