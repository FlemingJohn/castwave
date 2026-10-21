export type StoriesMenuProps = {
  currentTitle: string;
  currentSlug: string | undefined;
  onPick: (slug: string) => void;
};
