import type { Document } from "../learning/catalog";
import type { IconName } from "./Icon";

export const documentIcons: Record<Document["kind"], IconName> = {
  "project-home": "home",
  "folder-home": "folder",
  course: "book",
  note: "note",
  pdf: "pdf",
};
