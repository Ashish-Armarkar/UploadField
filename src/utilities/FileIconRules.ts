export const FILE_ICON_RULES: {
  test: (type: string) => boolean;
  label: string;
  className: string;
}[] = [
  { test: (t) => t === "application/pdf", label: "PDF", className: "pdf" },
  {
    test: (t) =>
      t.includes("word") ||
      t ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    label: "DOC",
    className: "doc",
  },
  {
    test: (t) =>
      t.includes("excel") ||
      t === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    label: "XLS",
    className: "excel",
  },
  {
    test: (t) =>
      t.includes("powerpoint") ||
      t ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    label: "PPT",
    className: "ppt",
  },
  {
    test: (t) =>
      t.includes("zip") || t.includes("compressed") || t.includes("rar"),
    label: "ZIP",
    className: "zip",
  },
  { test: (t) => t.startsWith("video/"), label: "🎥", className: "video" },
];
