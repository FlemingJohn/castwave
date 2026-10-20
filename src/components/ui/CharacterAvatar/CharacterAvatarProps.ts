export type CharacterAvatarProps = {
  kind: "narrator" | "character" | "sound";
  initial: string;
  colourNumber: number;
  size: number;
  isLive?: boolean;
};
