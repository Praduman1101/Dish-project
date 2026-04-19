import { useState } from "react";
import { getSmartSubstitution, scaleRecipe } from "../api/claudeApi";
import styles from "./RecipeCard.module.css";

function ParsedContent({ content }) {
  const lines = content.split("\n");
  return (
    <div className={styles.parsedContent}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className={styles.spacer} />;

        const isSectionHeader =
          line.startsWith("🍽️") || line.startsWith("⭐") ||
          line.startsWith("📝") || line.startsWith("👨‍🍳") ||
          line.startsWith("💡") || line.startsWith("🔄") ||
          line.startsWith("🏷️") || line.startsWith("---");

        if (line === "---") return <hr key={i} className={styles.divider} />;

        if (line.startsWith("🍽️")) {
          return (
            <h3 key={i} className={styles.recipeTitle}>
              {line.replace(/🍽️\s*\*\*/g, "").replace(/\*\*/g, "")}
            </h3>
          );
        }

        if (line.startsWith("⭐")) {
          return (
            <div key={i} className={styles.metaBar}>
              {line.replace(/\*\*/g, "").split("·").map((part, j) => (
                <span key={j} className={styles.metaPill}>{part.trim()}</span>
              ))}
            </div>
          );
        }

        if (isSectionHeader) {
          return (
            <p key={i} className={styles.sectionHeader}>
              {line.replace(/\*\*/g, "")}
            </p>
          );
        }

        if (/^\d+\./.test(line)) {
          return (
            <div key={i} className={styles.step}>
              <span className={styles.stepNum}>{line.match(/^\d+/)[0]}</span>
              <span className={styles.stepText}>
                {line.replace(/^\d+\.\s*/, "").replace(/\*\*/g, "")}
              </span>
            </div>
          );
        }

        if (line.startsWith("•")) {
          return (
            <div key={i} className={styles.bullet}>
              <span className={styles.bulletDot}>▸</span>
              <span>{line.replace(/^•\s*/, "").replace(/\*\*/g, "")}</span>
            </div>
          );
        }

        if (line.startsWith("#")) {
          return (
            <div key={i} className={styles.tagRow}>
              {line.split(" ").map((tag, j) => (
                <span key={j} className={styles.tag}>{tag}</span>
              ))}
            </div>
          );
        }

        return (
          <p key={i} className={styles.normalText}>
            {line.replace(/\*\*(.*?)\*\*/g, "$1")}
          </p>
        );
      })}
    </div>
  );
}

export default function RecipeCard({ content, onSave, isSaved }) {
  const [copied, setCopied] = useState(false);
  const [substitution, setSubstitution] = useState(null);
  const [subLoading, setSubLoading] = useState(false);
  const [subIngredient, setSubIngredient] = useState("");
  const [showSubForm, setShowSubForm] = useState(false);
  const [servings, setServings] = useState("");
  const [scaledContent, setScaledContent] = useState(null);
  const [scaleLoading, setScaleLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("recipe");

  const displayContent = scaledContent || content;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubstitution = async () => {
    if (!subIngredient.trim()) return;
    setSubLoading(true);
    setSubstitution(null);
    const result = await getSmartSubstitution(subIngredient, content);
    setSubstitution(result);
    setSubLoading(false);
  };

  const handleScale = async () => {
    if (!servings || isNaN(servings)) return;
    setScaleLoading(true);
    const result = await scaleRecipe(content, Number(servings));
    setScaledContent(result);
    setScaleLoading(false);
  };

  return (
    <div className={styles.card}>
      {/* Action Bar */}
      <div className={styles.actionBar}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "recipe" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("recipe")}
          >
            📜 Recipe
          </button>
          <button
            className={`${styles.tab} ${activeTab === "swap" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("swap")}
          >
            🔄 Swap
          </button>
          <button
            className={`${styles.tab} ${activeTab === "scale" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("scale")}
          >
            ⚖️ Scale
          </button>
        </div>

        <div className={styles.actionBtns}>
          <button
            className={`${styles.iconBtn} ${isSaved ? styles.saved : ""}`}
            onClick={onSave}
            title={isSaved ? "Saved!" : "Save recipe"}
          >
            {isSaved ? "🔖" : "📌"}
          </button>
          <button className={styles.iconBtn} onClick={handleCopy} title="Copy">
            {copied ? "✅" : "📋"}
          </button>
        </div>
      </div>

      {/* Recipe Tab */}
      {activeTab === "recipe" && (
        <div className={styles.content}>
          <ParsedContent content={displayContent} />
          {scaledContent && (
            <button
              className={styles.resetBtn}
              onClick={() => setScaledContent(null)}
            >
              ↩ Reset to original
            </button>
          )}
        </div>
      )}

      {/* Smart Swap Tab */}
      {activeTab === "swap" && (
        <div className={styles.aiPanel}>
          <p className={styles.aiTitle}>🔄 Smart Ingredient Substitution</p>
          <p className={styles.aiDesc}>
            Don't have an ingredient? I'll find the best alternatives for your recipe.
          </p>
          <div className={styles.aiInputRow}>
            <input
              className={styles.aiInput}
              placeholder="e.g. heavy cream, parmesan..."
              value={subIngredient}
              onChange={(e) => setSubIngredient(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubstitution()}
            />
            <button
              className={styles.aiBtn}
              onClick={handleSubstitution}
              disabled={subLoading || !subIngredient.trim()}
            >
              {subLoading ? "..." : "Find Swaps"}
            </button>
          </div>
          {subLoading && <p className={styles.aiLoading}>🔍 Finding best alternatives...</p>}
          {substitution && (
            <div className={styles.substitutionResult}>
              {substitution.split("\n").filter(Boolean).map((line, i) => (
                <p key={i} className={styles.subLine}>
                  {line.replace(/\*\*/g, "")}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scale Tab */}
      {activeTab === "scale" && (
        <div className={styles.aiPanel}>
          <p className={styles.aiTitle}>⚖️ Scale This Recipe</p>
          <p className={styles.aiDesc}>
            Adjust ingredient quantities for any number of servings automatically.
          </p>
          <div className={styles.aiInputRow}>
            <input
              className={styles.aiInput}
              placeholder="Number of servings (e.g. 6)"
              type="number"
              min="1"
              max="50"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScale()}
            />
            <button
              className={styles.aiBtn}
              onClick={handleScale}
              disabled={scaleLoading || !servings}
            >
              {scaleLoading ? "..." : "Scale It"}
            </button>
          </div>
          {scaleLoading && (
            <p className={styles.aiLoading}>⚖️ Recalculating ingredients...</p>
          )}
          {scaledContent && (
            <p className={styles.scaledNote}>
              ✅ Scaled to {servings} servings — check the Recipe tab!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
