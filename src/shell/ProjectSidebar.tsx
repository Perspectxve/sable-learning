import { useLayoutEffect, useRef } from "react";
import type {
  Document,
  FileEntry,
  Project,
  Workspace,
} from "../learning/catalog";
import { Icon } from "./Icon";
import { documentIcons } from "./documentIcons";

interface ProjectSidebarProps {
  workspace: Workspace;
  project: Project | undefined;
  collapsed: boolean;
  expandedFolderIds: readonly string[];
  activeTabId: string | null;
  onShowProject: (id: string) => void;
  onShowOverview: () => void;
  onToggleFolder: (id: string) => void;
  onOpenDocument: (id: string) => void;
  onExpand: () => void;
}

interface DocumentLinkProps {
  document: Document;
  activeTabId: string | null;
  onOpenDocument: (id: string) => void;
  label?: string;
}

function DocumentLink({
  document,
  activeTabId,
  onOpenDocument,
  label = document.title,
}: DocumentLinkProps) {
  return (
    <button
      type="button"
      className="sidebar-row document-link"
      aria-current={document.id === activeTabId ? "true" : undefined}
      title={label}
      onClick={() => onOpenDocument(document.id)}
    >
      <Icon name={documentIcons[document.kind]} />
      <span>{label}</span>
    </button>
  );
}

interface FileTreeProps extends Pick<
  ProjectSidebarProps,
  | "workspace"
  | "expandedFolderIds"
  | "activeTabId"
  | "onToggleFolder"
  | "onOpenDocument"
> {
  entries: readonly FileEntry[];
}

function FileTree({ entries, ...props }: FileTreeProps) {
  const {
    workspace,
    expandedFolderIds,
    activeTabId,
    onToggleFolder,
    onOpenDocument,
  } = props;

  return (
    <ul className="file-tree">
      {entries.map((entry) => {
        if (entry.kind === "document") {
          return (
            <li key={entry.id}>
              <DocumentLink
                document={workspace.documents[entry.id]}
                activeTabId={activeTabId}
                onOpenDocument={onOpenDocument}
              />
            </li>
          );
        }

        const folder = workspace.folders[entry.id];
        const expanded = expandedFolderIds.includes(folder.id);
        const childrenId = `folder-children-${folder.id}`;
        const homeId = folder.homeDocumentId;
        const homeIsActive = homeId === activeTabId;
        const labelToggles = !homeId || homeIsActive;
        const toggleFolder = () => onToggleFolder(folder.id);

        return (
          <li key={folder.id}>
            <div className="folder-row" data-active={homeIsActive}>
              <button
                type="button"
                className="folder-toggle"
                aria-label={`${expanded ? "Collapse" : "Expand"} ${folder.name}`}
                aria-expanded={expanded}
                aria-controls={expanded ? childrenId : undefined}
                onClick={toggleFolder}
              >
                <Icon name={expanded ? "down" : "chevron"} />
              </button>
              <button
                type="button"
                className="sidebar-row folder-label"
                aria-current={homeIsActive ? "true" : undefined}
                aria-expanded={labelToggles ? expanded : undefined}
                aria-controls={
                  labelToggles && expanded ? childrenId : undefined
                }
                title={folder.name}
                onClick={
                  labelToggles ? toggleFolder : () => onOpenDocument(homeId)
                }
              >
                <Icon name="folder" />
                <span>{folder.name}</span>
              </button>
            </div>
            {expanded && (
              <div id={childrenId} className="folder-children">
                <FileTree entries={folder.entries} {...props} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function ProjectSidebar({
  workspace,
  project,
  collapsed,
  expandedFolderIds,
  activeTabId,
  onShowProject,
  onShowOverview,
  onToggleFolder,
  onOpenDocument,
  onExpand,
}: ProjectSidebarProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusHeading = useRef(false);

  useLayoutEffect(() => {
    if (focusHeading.current) {
      headingRef.current?.focus();
      focusHeading.current = false;
    }
  }, [project, collapsed]);

  return (
    <nav
      id="workspace-sidebar"
      aria-label="Project navigation"
      className="sidebar"
    >
      {collapsed ? (
        <div className="sidebar-rail">
          <button
            type="button"
            className="icon-button"
            title="Open project navigator"
            aria-label="Open project navigator"
            onClick={() => {
              focusHeading.current = true;
              onExpand();
            }}
          >
            <Icon name="project" />
          </button>
          {project && (
            <button
              type="button"
              className="icon-button"
              title={`Open ${project.name} Project Home`}
              aria-label={`Open ${project.name} Project Home`}
              aria-current={
                project.homeDocumentId === activeTabId ? "true" : undefined
              }
              onClick={() => onOpenDocument(project.homeDocumentId)}
            >
              <Icon name="home" />
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="sidebar-heading">
            {project && (
              <button
                type="button"
                className="icon-button"
                aria-label="Back to projects"
                title="Back to projects"
                onClick={() => {
                  focusHeading.current = true;
                  onShowOverview();
                }}
              >
                <Icon name="back" />
              </button>
            )}
            <h2 ref={headingRef} tabIndex={-1}>
              {project?.name ?? "Projects"}
            </h2>
          </div>
          <div className="sidebar-content">
            {project ? (
              <>
                <DocumentLink
                  document={workspace.documents[project.homeDocumentId]}
                  activeTabId={activeTabId}
                  onOpenDocument={onOpenDocument}
                  label="Project Home"
                />
                <section
                  className="sidebar-section"
                  aria-labelledby="sidebar-courses"
                >
                  <h3 id="sidebar-courses">Courses</h3>
                  {project.courseIds.length ? (
                    <ul>
                      {project.courseIds.map((id) => (
                        <li key={id}>
                          <DocumentLink
                            document={workspace.documents[id]}
                            activeTabId={activeTabId}
                            onOpenDocument={onOpenDocument}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="sidebar-empty">No courses</p>
                  )}
                </section>
                <section
                  className="sidebar-section"
                  aria-labelledby="sidebar-files"
                >
                  <h3 id="sidebar-files">Files</h3>
                  {project.files.length ? (
                    <FileTree
                      workspace={workspace}
                      entries={project.files}
                      expandedFolderIds={expandedFolderIds}
                      activeTabId={activeTabId}
                      onToggleFolder={onToggleFolder}
                      onOpenDocument={onOpenDocument}
                    />
                  ) : (
                    <p className="sidebar-empty">No files</p>
                  )}
                </section>
              </>
            ) : (
              <ul>
                {workspace.projects.map(({ id, name }) => (
                  <li key={id}>
                    <button
                      type="button"
                      className="sidebar-row project-link"
                      onClick={() => {
                        focusHeading.current = true;
                        onShowProject(id);
                      }}
                    >
                      <Icon name="project" />
                      <span>{name}</span>
                      <Icon name="chevron" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </nav>
  );
}
