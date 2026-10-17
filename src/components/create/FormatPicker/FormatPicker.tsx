import { Icon } from "@/components/ui/Icon/Icon";
import type { FormatPickerProps } from "./FormatPickerProps";
import styles from "./FormatPicker.module.css";

export function FormatPicker(props: FormatPickerProps) {
  return (
    <fieldset className={styles.picker}>
      <legend className={styles.legend}>Format</legend>
      <div className={styles.options}>
        {FORMATS.map((format) => (
          <label key={format.value} className={styles.option}>
            <input
              className={styles.radio}
              type="radio"
              name="format"
              value={format.value}
              checked={props.format === format.value}
              onChange={() => props.onPick(format.value)}
            />
            <span className={styles.icon}>
              <Icon name={format.icon} />
            </span>
            <span className={styles.name}>{format.label}</span>
            <span className={styles.description}>{format.description}</span>
            <span className={styles.voices}>
              {format.initials.map((initial, position) => (
                <i key={position} className={styles.voice} style={{ background: `var(--colour-character-${position + 1})` }}>
                  {initial}
                </i>
              ))}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const FORMATS = [
  {
    value: "audiobook",
    label: "Audiobook",
    description: "A narrator plus a separate voice for every character.",
    icon: "book",
    initials: ["N", "H", "W", "M", "D"],
  },
  {
    value: "podcast",
    label: "Podcast",
    description: "Two hosts talk the material through in their own words.",
    icon: "microphone",
    initials: ["M", "D"],
  },
  {
    value: "interactive",
    label: "Interactive",
    description: "The story stops at choices. Click or say what you do next.",
    icon: "branch",
    initials: ["N", "V", "L", "C"],
  },
] as const;
