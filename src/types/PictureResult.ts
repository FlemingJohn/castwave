export type PictureResult =
  { status: "ready"; url: string } | { status: "skipped" } | { status: "failed"; message: string };
