import { useState } from "react";
import Header from "./components/Header";
import ChatWindow from "./components/ChatWindow";
import IngredientBuilder from "./components/IngredientBuilder";
import PreferencePanel from "./components/PreferencePanel";
import SavedRecipes from "./components/SavedRecipes";
import { useRecipeChat, useSavedRecipes } from "./hooks/useRecipes";
import { useSocket } from "./hooks/useSocket";
import "./App.css";

const DEFAULT_PREFS = {
  cuisine: "any",
  diet: "none",
  difficulty: "medium",
  mood: "comfort",
};

export default function App() {
  const [ingredients, setIngredients] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [showSaved, setShowSaved] = useState(false);
  const [savedSnippets, setSavedSnippets] = useState(new Set());

  const { messages, loading, generateRecipe, sendChat } = useRecipeChat(prefs);
  const { saved, saveRecipe, deleteRecipe } = useSavedRecipes();

  // ── Socket.IO ──────────────────────────────────────────────
  const {
    isConnected,
    userCount,
    peerRecipe,
    peerGenerating,
    emitRecipe,
    emitGenerating,
    emitDone,
    clearPeerRecipe,
  } = useSocket();

  const addIngredient = (ing) => {
    const lower = ing.trim().toLowerCase();
    if (lower && !ingredients.includes(lower)) {
      setIngredients((prev) => [...prev, lower]);
    }
    setInputValue("");
  };

  const removeIngredient = (ing) => {
    setIngredients((prev) => prev.filter((i) => i !== ing));
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0 || loading) return;
    emitGenerating(ingredients); // tell other laptop "generating..."
    const reply = await generateRecipe(ingredients);
    emitDone();
    if (reply) emitRecipe(reply); // broadcast recipe to other laptops
    setIngredients([]);
  };

  const handleSaveRecipe = (content) => {
    saveRecipe(content);
    setSavedSnippets((prev) => new Set([...prev, content.slice(0, 80)]));
  };

  return (
    <div className="app">
      {/* Ambient background blobs */}
      <div className="blob blob1" />
      <div className="blob blob2" />
      <div className="blob blob3" />

      <Header
        onToggleSaved={() => setShowSaved(true)}
        savedCount={saved.length}
      />

      {/* ── Socket status bar ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "6px 24px",
        background: isConnected ? "rgba(0,200,100,0.08)" : "rgba(255,80,80,0.08)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        fontSize: "13px",
        color: isConnected ? "#4cffaa" : "#ff6b6b",
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: isConnected ? "#4cffaa" : "#ff6b6b",
          boxShadow: isConnected ? "0 0 6px #4cffaa" : "none",
          display: "inline-block"
        }} />
        {isConnected
          ? `Connected · ${userCount} laptop${userCount !== 1 ? "s" : ""} online`
          : "Not connected to server — run: npm run server"}

        {peerGenerating && (
          <span style={{ marginLeft: "auto", color: "#ffd700", fontSize: "12px" }}>
            ⚡ Other laptop is generating a recipe...
          </span>
        )}
      </div>

      {/* ── Peer recipe notification ── */}
      {peerRecipe && (
        <div style={{
          margin: "10px 24px 0",
          padding: "12px 16px",
          background: "linear-gradient(135deg, rgba(233,69,96,0.15), rgba(22,33,62,0.4))",
          border: "1px solid rgba(233,69,96,0.4)",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "13px",
          color: "#f0f0f0",
        }}>
          <span>📥 <strong>New recipe from another laptop:</strong> {peerRecipe.title}</span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => { handleSaveRecipe(peerRecipe.content); clearPeerRecipe(); }}
              style={{
                padding: "4px 12px", borderRadius: "6px", border: "none",
                background: "#e94560", color: "white", cursor: "pointer", fontSize: "12px"
              }}>
              Save It
            </button>
            <button
              onClick={clearPeerRecipe}
              style={{
                padding: "4px 12px", borderRadius: "6px", border: "1px solid #555",
                background: "transparent", color: "#aaa", cursor: "pointer", fontSize: "12px"
              }}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main className="main">
        {/* Left column: Chat */}
        <section className="chatCol">
          <ChatWindow
            messages={messages}
            loading={loading}
            onFollowUp={sendChat}
            onSaveRecipe={handleSaveRecipe}
            savedIds={savedSnippets}
          />
        </section>

        {/* Right column: Controls */}
        <aside className="controlCol">
          <IngredientBuilder
            ingredients={ingredients}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onAdd={addIngredient}
            onRemove={removeIngredient}
            onGenerate={handleGenerate}
            loading={loading}
          />
          <PreferencePanel prefs={prefs} onChange={setPrefs} />
        </aside>
      </main>

      <footer className="footer">
        Rectify · AI Recipe Studio · Powered by Claude © 2026
      </footer>

      {showSaved && (
        <SavedRecipes
          saved={saved}
          onDelete={deleteRecipe}
          onClose={() => setShowSaved(false)}
        />
      )}
    </div>
  );
}
