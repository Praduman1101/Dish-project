import { CUISINES, DIETS, DIFFICULTIES, MOODS } from "../constants";
import styles from "./PreferencePanel.module.css";

function OptionGroup({ label, options, value, onChange, multi = false }) {
  return (
    <div className={styles.group}>
      <p className={styles.groupLabel}>{label}</p>
      <div className={styles.optionRow}>
        {options.map((opt) => {
          const active = multi
            ? (value || []).includes(opt.id)
            : value === opt.id;
          return (
            <button
              key={opt.id}
              className={`${styles.option} ${active ? styles.active : ""}`}
              onClick={() => {
                if (multi) {
                  const curr = value || [];
                  onChange(
                    curr.includes(opt.id)
                      ? curr.filter((v) => v !== opt.id)
                      : [...curr, opt.id]
                  );
                } else {
                  onChange(opt.id);
                }
              }}
              title={opt.desc}
            >
              <span className={styles.optionEmoji}>{opt.emoji}</span>
              <span className={styles.optionLabel}>{opt.label}</span>
              {active && <span className={styles.checkmark}>✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function PreferencePanel({ prefs, onChange }) {
  const set = (key) => (val) => onChange({ ...prefs, [key]: val });

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelIcon}>⚙️</span>
        <h3 className={styles.panelTitle}>Recipe Preferences</h3>
        <p className={styles.panelSub}>Customize your culinary experience</p>
      </div>

      <div className={styles.groups}>
        <OptionGroup
          label="🌍 Cuisine Style"
          options={CUISINES}
          value={prefs.cuisine}
          onChange={set("cuisine")}
        />
        <OptionGroup
          label="🥗 Dietary"
          options={DIETS}
          value={prefs.diet}
          onChange={set("diet")}
        />
        <OptionGroup
          label="📊 Difficulty"
          options={DIFFICULTIES}
          value={prefs.difficulty}
          onChange={set("difficulty")}
        />
        <OptionGroup
          label="🎭 Mood"
          options={MOODS}
          value={prefs.mood}
          onChange={set("mood")}
        />
      </div>
    </div>
  );
}
