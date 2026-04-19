import styles from "./Header.module.css";

export default function Header({ onToggleSaved, savedCount }) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logoWrap}>
          <span className={styles.logoEmoji}>🍳</span>
          <div className={styles.logoGlow} />
        </div>
        <div>
          <h1 className={styles.title}>Rectify</h1>
          <p className={styles.sub}>AI Recipe Studio</p>
        </div>
      </div>

      <div className={styles.right}>
        <button className={styles.savedBtn} onClick={onToggleSaved}>
          <span>🔖</span>
          <span>Saved</span>
          {savedCount > 0 && <span className={styles.badge}>{savedCount}</span>}
        </button>
      </div>
    </header>
  );
}
