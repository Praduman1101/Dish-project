import { useRef, useState } from "react";
import { INGREDIENTS_SUGGESTIONS, EMOJI_MAP } from "../constants";
import styles from "./IngredientBuilder.module.css";

export default function IngredientBuilder({
  ingredients,
  inputValue,
  setInputValue,
  onAdd,
  onRemove,
  onGenerate,
  loading,
}) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);

  const unusedSuggestions = INGREDIENTS_SUGGESTIONS.filter(
    (s) => !ingredients.includes(s.label)
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) onAdd(inputValue);
    }
    if (e.key === "Backspace" && !inputValue && ingredients.length > 0) {
      onRemove(ingredients[ingredients.length - 1]);
    }
  };

  return (
    <div className={styles.container}>
      {/* Title Row */}
      <div className={styles.titleRow}>
        <div className={styles.titleLeft}>
          <span className={styles.titleIcon}>🛒</span>
          <h2 className={styles.title}>Ingredients</h2>
          {ingredients.length > 0 && (
            <span className={styles.badge}>{ingredients.length}</span>
          )}
        </div>
        {ingredients.length > 0 && (
          <button
            className={styles.clearBtn}
            onClick={() => ingredients.forEach(onRemove)}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Input Area with chips inside */}
      <div
        className={`${styles.inputWrap} ${focused ? styles.focused : ""}`}
        onClick={() => inputRef.current?.focus()}
      >
        <div className={styles.chipRow}>
          {ingredients.map((ing) => (
            <div key={ing} className={styles.chip}>
              <span>{EMOJI_MAP[ing] || "🌿"}</span>
              <span className={styles.chipLabel}>{ing}</span>
              <button
                className={styles.removeBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(ing);
                }}
              >
                ×
              </button>
            </div>
          ))}
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={
              ingredients.length === 0
                ? "Type ingredients... (Enter to add)"
                : "Add more..."
            }
            className={styles.input}
          />
        </div>
      </div>

      {/* Suggestion Pills */}
      <div className={styles.suggestions}>
        <p className={styles.suggestLabel}>Quick add ↓</p>
        <div className={styles.suggestList}>
          {unusedSuggestions.slice(0, 14).map((s) => (
            <button
              key={s.label}
              className={styles.suggestChip}
              onClick={() => onAdd(s.label)}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        className={styles.generateBtn}
        onClick={onGenerate}
        disabled={ingredients.length === 0 || loading}
      >
        {loading ? (
          <span className={styles.loadingContent}>
            <span className={styles.spinner} />
            Crafting your recipe...
          </span>
        ) : (
          <span className={styles.btnContent}>
            <span className={styles.btnSpark}>✨</span>
            Generate My Recipe
            {ingredients.length > 0 && (
              <span className={styles.countBadge}>{ingredients.length} ingredients</span>
            )}
          </span>
        )}
      </button>
    </div>
  );
}
