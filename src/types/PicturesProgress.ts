export type PicturesProgress = {
  status: "painting" | "done" | "off";
  done: number;
  failed: number;
  total: number;
};
