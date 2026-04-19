import { useRef, useEffect, useState } from "react";
import RecipeCard from "./RecipeCard";
import TypingDots from "./TypingDots";
import styles from "./ChatWindow.module.css";

function AssistantBubble({ content, onSave, isSaved, isRecipe }) {
  if (isRecipe) {
    return <RecipeCard content={content} onSave={onSave} isSaved={isSaved} />;
  }

  // Render welcome/simple messages inline
  const lines = content.split("\n");
  return (
    <div className={styles.plainBubble}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: 4 }} />;
        const clean = line.replace(/\*\*(.*?)\*\*/g, "$1");
        return (
          <p key={i} className={styles.plainText}>
            {clean}
          </p>
        );
      })}
    </div>
  );
}

const isRecipeContent = (content) =>
  content.includes("🍽️") && content.includes("👨‍🍳");

export default function ChatWindow({ messages, loading, onFollowUp, onSaveRecipe, savedIds }) {
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = () => {
    if (chatInput.trim()) {
      onFollowUp(chatInput.trim());
      setChatInput("");
    }
  };

  const QUICK_ACTIONS = [
    "Make it vegetarian 🥗",
    "Add more spice 🌶️",
    "Simplify the steps 📝",
    "Suggest a wine pairing 🍷",
  ];

  return (
    <div className={styles.container}>
      {/* Messages */}
      <div className={styles.messageList}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${styles.messageRow} ${
              msg.role === "user" ? styles.userRow : styles.botRow
            }`}
          >
            {msg.role === "assistant" && (
              <div className={styles.avatar}>🍳</div>
            )}

            <div
              className={`${styles.bubble} ${
                msg.role === "user" ? styles.userBubble : styles.botBubble
              }`}
            >
              {msg.role === "user" ? (
                <span className={styles.userText}>{msg.content}</span>
              ) : (
                <AssistantBubble
                  content={msg.content}
                  isRecipe={isRecipeContent(msg.content)}
                  onSave={() => onSaveRecipe(msg.content)}
                  isSaved={savedIds.has(msg.content.slice(0, 80))}
                />
              )}
            </div>

            {msg.role === "user" && (
              <div className={`${styles.avatar} ${styles.userAvatar}`}>👤</div>
            )}
          </div>
        ))}

        {loading && (
          <div className={`${styles.messageRow} ${styles.botRow}`}>
            <div className={styles.avatar}>🍳</div>
            <div className={`${styles.bubble} ${styles.botBubble} ${styles.loadingBubble}`}>
              <TypingDots />
              <span className={styles.craftingText}>Crafting your recipe...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick action pills */}
      {messages.length > 1 && !loading && (
        <div className={styles.quickActions}>
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a}
              className={styles.quickBtn}
              onClick={() => onFollowUp(a)}
            >
              {a}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className={styles.inputRow}>
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask a follow-up... 'make it gluten-free', 'add dessert'..."
          className={styles.chatInput}
        />
        <button
          onClick={handleSend}
          className={styles.sendBtn}
          disabled={!chatInput.trim() || loading}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
