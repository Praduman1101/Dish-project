import { useState, useCallback } from "react";
import { sendMessage } from "../api/claudeApi";
import { INITIAL_MESSAGE } from "../constants";

export function useRecipeChat(preferences) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [lastRecipe, setLastRecipe] = useState(null);

  const sendChat = useCallback(
    async (userText) => {
      if (!userText.trim() || loading) return;

      const userMsg = { role: "user", content: userText };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      const newHistory = [...history, { role: "user", content: userText }];

      try {
        const reply = await sendMessage(newHistory, preferences);
        const assistantMsg = { role: "assistant", content: reply };
        setMessages((prev) => [...prev, assistantMsg]);
        setHistory([...newHistory, { role: "assistant", content: reply }]);
        setLastRecipe(reply);
        return reply;
      } catch (err) {
        const errMsg = {
          role: "assistant",
          content: err?.message?.includes("Missing API key")
            ? "🔑 **API key missing!**\n\nCreate a `.env` file in the project root:\n\nVITE_GEMINI_API_KEY=your-gemini-key-here\n\nGet your key at console.cloud.google.com, then restart with `npm run dev`."
            : `⚠️ Error: ${err?.message || "Something went wrong. Check your API key and try again."}`,
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setLoading(false);
      }
    },
    [loading, history, preferences]
  );

  const generateRecipe = useCallback(
    async (ingredients) => {
      const prompt = `I have these ingredients: ${ingredients.join(", ")}. Please create a delicious recipe for me!`;
      return sendChat(prompt);
    },
    [sendChat]
  );

  const clearChat = useCallback(() => {
    setMessages([INITIAL_MESSAGE]);
    setHistory([]);
    setLastRecipe(null);
  }, []);

  return { messages, loading, lastRecipe, sendChat, generateRecipe, clearChat };
}

export function useSavedRecipes() {
  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("rectify_saved") || "[]");
    } catch {
      return [];
    }
  });

  const saveRecipe = useCallback((content) => {
    const recipe = {
      id: Date.now(),
      content,
      savedAt: new Date().toISOString(),
      title: content.match(/🍽️\s*\*\*(.*?)\*\*/)?.[1] || "Recipe",
    };
    setSaved((prev) => {
      const next = [recipe, ...prev].slice(0, 20);
      localStorage.setItem("rectify_saved", JSON.stringify(next));
      return next;
    });
    return recipe;
  }, []);

  const deleteRecipe = useCallback((id) => {
    setSaved((prev) => {
      const next = prev.filter((r) => r.id !== id);
      localStorage.setItem("rectify_saved", JSON.stringify(next));
      return next;
    });
  }, []);

  return { saved, saveRecipe, deleteRecipe };
}
