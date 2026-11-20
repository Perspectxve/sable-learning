export type Document =
  | { id: string; kind: "note"; title: string; paragraphs: readonly string[] }
  | { id: string; kind: "course"; title: string; description: string }
  | { id: string; kind: "pdf"; title: string; description: string }
  | { id: string; kind: "project-home"; title: string; projectId: string }
  | {
      id: string;
      kind: "folder-home";
      title: string;
      folderId: string;
    };

export type FileEntry =
  { kind: "folder"; id: string } | { kind: "document"; id: string };

export interface Folder {
  id: string;
  name: string;
  description: string;
  homeDocumentId?: string;
  entries: readonly FileEntry[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  homeDocumentId: string;
  courseIds: readonly string[];
  files: readonly FileEntry[];
}

export interface Workspace {
  id: string;
  name: string;
  projects: readonly Project[];
  folders: Readonly<Record<string, Folder>>;
  documents: Readonly<Record<string, Document>>;
  initialProjectId?: string;
}

export function getDocumentPath(workspace: Workspace, document: Document) {
  function findFilePath(
    entries: readonly FileEntry[],
    parentPath: string,
  ): string | undefined {
    for (const entry of entries) {
      if (entry.kind === "document") {
        if (entry.id === document.id) return `${parentPath}/${document.title}`;
        continue;
      }

      const folder = workspace.folders[entry.id];
      const folderPath = `${parentPath}/${folder.name}`;
      if (folder.homeDocumentId === document.id) return folderPath;

      const path = findFilePath(folder.entries, folderPath);
      if (path) return path;
    }
  }

  // A shared document uses its first location in the workspace catalog.
  for (const project of workspace.projects) {
    if (project.homeDocumentId === document.id) return project.name;
    if (project.courseIds.includes(document.id)) {
      return `${project.name}/Courses/${document.title}`;
    }

    const path = findFilePath(project.files, project.name);
    if (path) return path;
  }
}
