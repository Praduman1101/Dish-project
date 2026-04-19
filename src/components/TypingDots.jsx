import styles from "./TypingDots.module.css";

export default function TypingDots() {
  return (
    <div className={styles.wrapper}>
      {[0, 1, 2].map((i) => (
        <div key={i} className={styles.dot} style={{ animationDelay: `${i * 0.18}s` }} />
      ))}
    </div>
  );
}
