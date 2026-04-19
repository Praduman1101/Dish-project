import styles from "./SavedRecipes.module.css";

export default function SavedRecipes({ saved, onDelete, onClose }) {
  const getTitle = (recipe) =>
    recipe.title || recipe.content.match(/🍽️\s*\*\*(.*?)\*\*/)?.[1] || "Recipe";

  const getDate = (iso) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span>🔖</span>
            <h2 className={styles.title}>Saved Recipes</h2>
            {saved.length > 0 && (
              <span className={styles.count}>{saved.length}</span>
            )}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* List */}
        <div className={styles.list}>
          {saved.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyIcon}>📌</p>
              <p className={styles.emptyTitle}>No saved recipes yet</p>
              <p className={styles.emptyDesc}>
                Generate a recipe and tap the pin icon to save it here.
              </p>
            </div>
          ) : (
            saved.map((recipe) => (
              <div key={recipe.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <p className={styles.cardTitle}>{getTitle(recipe)}</p>
                  <div className={styles.cardActions}>
                    <span className={styles.cardDate}>{getDate(recipe.savedAt)}</span>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => onDelete(recipe.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p className={styles.cardPreview}>
                  {recipe.content
                    .replace(/[🍽️⭐📝👨‍🍳💡🔄🏷️]/g, "")
                    .replace(/\*\*/g, "")
                    .replace(/---/g, "")
                    .trim()
                    .slice(0, 120)}...
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
