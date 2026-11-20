import { useLayoutEffect, type ReactNode, type RefObject } from "react";
import {
  getDocumentPath,
  type Document,
  type FileEntry,
  type Workspace,
} from "../learning/catalog";
import { Icon, type IconName } from "./Icon";
import { documentIcons } from "./documentIcons";
import { documentPanelId, tabElementId } from "./TabStrip";

interface DocumentPaneProps {
  workspace: Workspace;
  document: Document | undefined;
  panelRef: RefObject<HTMLDivElement | null>;
  onOpenDocument: (id: string) => void;
}

interface HomeLink {
  id: string;
  title: string;
  icon: IconName;
  targetId?: string;
}

function toHomeLinks(
  workspace: Workspace,
  entries: readonly FileEntry[],
): HomeLink[] {
  return entries.map((entry) => {
    if (entry.kind === "folder") {
      const folder = workspace.folders[entry.id];
      return {
        id: folder.id,
        title: folder.name,
        icon: "folder",
        targetId: folder.homeDocumentId,
      };
    }

    const document = workspace.documents[entry.id];
    return {
      id: document.id,
      title: document.title,
      icon: documentIcons[document.kind],
      targetId: document.id,
    };
  });
}

function HomeSection({
  title,
  links,
  onOpenDocument,
}: {
  title: string;
  links: readonly HomeLink[];
  onOpenDocument: (id: string) => void;
}) {
  return (
    <section className="home-section">
      <h2>{title}</h2>
      {links.length > 0 ? (
        <ul className="home-links">
          {links.map(({ id, title, icon, targetId }) => (
            <li key={id}>
              {targetId ? (
                <button
                  type="button"
                  className="home-link"
                  onClick={() => onOpenDocument(targetId)}
                >
                  <Icon name={icon} />
                  <span>{title}</span>
                  <Icon name="chevron" />
                </button>
              ) : (
                <div className="home-link">
                  <Icon name={icon} />
                  <span>{title}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="home-empty">No {title.toLowerCase()} in this project.</p>
      )}
    </section>
  );
}

function DocumentHeader({
  path,
  category,
  title,
  icon,
  children,
}: {
  path: string | undefined;
  category: string;
  title: string;
  icon: IconName;
  children?: ReactNode;
}) {
  return (
    <header className="document-header">
      {path && <p className="document-path">{path}</p>}
      <p className="document-context">
        <Icon name={icon} />
        {category}
      </p>
      <h1>{title}</h1>
      {children}
    </header>
  );
}

function DocumentContent({
  workspace,
  document,
  onOpenDocument,
}: Omit<DocumentPaneProps, "document" | "panelRef"> & { document: Document }) {
  const path = getDocumentPath(workspace, document);

  switch (document.kind) {
    case "project-home": {
      const project = workspace.projects.find(
        ({ id }) => id === document.projectId,
      );
      if (!project) return null;
      const courseLinks = project.courseIds.map((id) => {
        const course = workspace.documents[id];
        return {
          id,
          title: course.title,
          icon: documentIcons[course.kind],
          targetId: id,
        };
      });
      return (
        <>
          <DocumentHeader
            path={path}
            category="Project Home"
            title={document.title}
            icon="home"
          >
            <p className="document-description">{project.description}</p>
          </DocumentHeader>
          <div className="home-sections">
            <HomeSection
              title="Courses"
              links={courseLinks}
              onOpenDocument={onOpenDocument}
            />
            <HomeSection
              title="Files"
              links={toHomeLinks(workspace, project.files)}
              onOpenDocument={onOpenDocument}
            />
          </div>
        </>
      );
    }
    case "folder-home": {
      const folder = workspace.folders[document.folderId];
      return (
        <>
          <DocumentHeader
            path={path}
            category="Folder Home"
            title={document.title}
            icon="folder"
          >
            <p className="document-description">{folder.description}</p>
          </DocumentHeader>
          <HomeSection
            title="Contents"
            links={toHomeLinks(workspace, folder.entries)}
            onOpenDocument={onOpenDocument}
          />
        </>
      );
    }
    case "note":
      return (
        <>
          <DocumentHeader
            path={path}
            category="Sample note · Read-only"
            title={document.title}
            icon="note"
          />
          <div className="document-body">
            {document.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </>
      );
    case "course":
    case "pdf": {
      const isCourse = document.kind === "course";
      return (
        <>
          <DocumentHeader
            path={path}
            category={isCourse ? "Course preview" : "PDF reference"}
            title={document.title}
            icon={documentIcons[document.kind]}
          >
            <p className="document-description">{document.description}</p>
          </DocumentHeader>
          <p className="document-notice">
            {isCourse
              ? "Lessons are unavailable in this version."
              : "PDF viewing is unavailable in this version."}
          </p>
        </>
      );
    }
  }
}

export function DocumentPane({
  workspace,
  document,
  panelRef,
  onOpenDocument,
}: DocumentPaneProps) {
  useLayoutEffect(() => {
    if (panelRef.current) panelRef.current.scrollTop = 0;
  }, [panelRef, workspace.id, document?.id]);

  return (
    <div
      ref={panelRef}
      className="document-pane"
      id={documentPanelId}
      role={document ? "tabpanel" : undefined}
      aria-labelledby={document ? tabElementId(document.id) : undefined}
      tabIndex={0}
    >
      {document ? (
        <article key={`${workspace.id}/${document.id}`} className="document">
          <DocumentContent
            workspace={workspace}
            document={document}
            onOpenDocument={onOpenDocument}
          />
        </article>
      ) : (
        <div className="empty-editor">
          <Icon name="note" />
          <h1>No open documents</h1>
          <p>Open a project home, course, or file from the sidebar.</p>
        </div>
      )}
    </div>
  );
}
