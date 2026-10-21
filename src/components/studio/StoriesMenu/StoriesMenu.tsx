import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon/Icon";
import { loadShowcaseShelf } from "@/services/showcase/loadShowcaseShelf";
import type { ShowcaseEntry } from "@/types/ShowcaseEntry";
import type { StoriesMenuProps } from "./StoriesMenuProps";
import styles from "./StoriesMenu.module.css";

export function StoriesMenu(props: StoriesMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [entries, setEntries] = useState<ShowcaseEntry[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void loadShowcaseShelf().then(setEntries);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const close = (event: MouseEvent | KeyboardEvent) => {
      const isEscape = event instanceof KeyboardEvent && event.key === "Escape";
      const target = event.target instanceof Node ? event.target : null;
      const isOutside = event instanceof MouseEvent && !menuRef.current?.contains(target);
      if (isEscape || isOutside) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [isOpen]);

  const others = entries.filter((entry) => entry.slug !== props.currentSlug);
  return (
    <div className={styles.menu} ref={menuRef}>
      <button type="button" className={styles.trigger} aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <Icon name="book" />
        Stories
      </button>
      {isOpen && (
        <div className={styles.popover} role="dialog" aria-label="Stories">
          <span className={styles.label}>Last story · playing now</span>
          <p className={styles.current}>{props.currentTitle}</p>
          {others.length > 0 && <span className={styles.label}>Showcase stories</span>}
          {others.map((entry) => (
            <button
              key={entry.slug}
              type="button"
              className={styles.story}
              onClick={() => {
                setIsOpen(false);
                props.onPick(entry.slug);
              }}
            >
              <span className={styles.thumb}>{entry.cover && <img src={`/showcase/${entry.cover}`} alt="" />}</span>
              <span>
                <b>{entry.title}</b>
                <small>{entry.format}</small>
              </span>
            </button>
          ))}
          <Link className={styles.create} href="/">
            <Icon name="plus" />
            Make a new story
          </Link>
        </div>
      )}
    </div>
  );
}
