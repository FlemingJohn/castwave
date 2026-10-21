"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CharacterAvatar } from "@/components/ui/CharacterAvatar/CharacterAvatar";
import { Icon } from "@/components/ui/Icon/Icon";
import { useStoredScript } from "@/hooks/useStoredScript";
import { getPictureJob } from "@/services/pictures/getPictureJob";
import { loadShowcaseShelf } from "@/services/showcase/loadShowcaseShelf";
import { loadShowcaseStory } from "@/services/showcase/loadShowcaseStory";
import { getVoicingJob } from "@/services/voicing/getVoicingJob";
import type { ShowcaseEntry } from "@/types/ShowcaseEntry";
import styles from "./ShowcaseShelf.module.css";

export function ShowcaseShelf() {
  const router = useRouter();
  const { saveScript } = useStoredScript();
  const [entries, setEntries] = useState<ShowcaseEntry[]>([]);
  const [openingSlug, setOpeningSlug] = useState("");

  useEffect(() => {
    void loadShowcaseShelf().then(setEntries);
  }, []);

  async function open(slug: string) {
    setOpeningSlug(slug);
    const story = await loadShowcaseStory(slug).catch(() => null);
    if (!story) {
      setOpeningSlug("");
      return;
    }
    saveScript(story.script);
    getVoicingJob(story.script).requestAutoplay();
    getPictureJob(story.script);
    router.push("/studio");
  }

  if (entries.length === 0) {
    return null;
  }
  return (
    <section className={styles.shelf} aria-labelledby="showcase-title">
      <div className={styles.head}>
        <h2 id="showcase-title" className={styles.title}>
          Hear one now
        </h2>
        <span className={styles.note}>Made earlier with Castwave. Plays instantly, no waiting.</span>
      </div>
      <ul className={styles.stories}>
        {entries.map((entry) => (
          <li key={entry.slug}>
            <button
              type="button"
              className={styles.story}
              onClick={() => void open(entry.slug)}
              disabled={openingSlug !== ""}
            >
              <span className={styles.cover}>
                {entry.cover && <img src={`/showcase/${entry.cover}`} alt="" />}
                <span className={styles.format}>{entry.format}</span>
              </span>
              <span className={styles.body}>
                <span className={styles.name}>{entry.title}</span>
                <span className={styles.details}>{entry.details.join(" · ")}</span>
                <span className={styles.cast} aria-label={`Cast: ${entry.cast.join(", ")}`}>
                  {entry.cast.map((name, position) => (
                    <CharacterAvatar
                      key={name}
                      kind={name === "Narrator" ? "narrator" : "character"}
                      initial={name.slice(0, 1)}
                      colourNumber={(position % 6) + 1}
                      size={26}
                    />
                  ))}
                </span>
                <span className={styles.play}>
                  <Icon name="play" />
                  {openingSlug === entry.slug ? "Opening…" : "Play instantly"}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className={styles.divider}>or make your own</p>
    </section>
  );
}
