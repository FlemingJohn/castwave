import { Chip } from "@/components/ui/Chip/Chip";
import { LENGTHS_IN_MINUTES } from "@/types/sourceLimits";
import type { LengthPickerProps } from "./LengthPickerProps";
import styles from "./LengthPicker.module.css";

export function LengthPicker(props: LengthPickerProps) {
  return (
    <div className={styles.lengths} role="group" aria-label="Length">
      <span className={styles.label}>Length</span>
      {LENGTHS_IN_MINUTES.map((length) => (
        <Chip
          key={length}
          label={`${length} min`}
          isPressed={length === props.minutes}
          onPress={() => props.onPick(length)}
        />
      ))}
      <input type="hidden" name="minutes" value={props.minutes} />
    </div>
  );
}
