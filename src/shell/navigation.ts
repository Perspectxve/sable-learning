import type { Workspace } from "../learning/catalog";

type SidebarLocation =
  { mode: "overview" } | { mode: "project"; projectId: string };

interface WorkspaceSession {
  sidebar: SidebarLocation;
  expandedFolderIds: readonly string[];
  openTabs: readonly string[];
  activeTabId: string | null;
}

export type SidebarVisibility = "expanded" | "collapsed" | "hidden";

interface AppearanceSettings {
  theme: "dark";
  backgroundImage: string | null;
  surfaceOpacity: number;
}

interface ShellState {
  activeWorkspaceId: string;
  sessions: Readonly<Record<string, WorkspaceSession>>;
  sidebarVisibility: SidebarVisibility;
  appearance: AppearanceSettings;
}

type ShellAction =
  | { type: "switch-workspace"; workspaceId: string }
  | { type: "show-project"; projectId: string }
  | { type: "show-overview" }
  | { type: "toggle-folder"; folderId: string }
  | { type: "open-document"; documentId: string }
  | { type: "select-tab"; tabId: string }
  | { type: "close-tab"; tabId: string }
  | { type: "set-sidebar-visibility"; visibility: SidebarVisibility };

export function createShellState(workspaces: readonly Workspace[]): ShellState {
  const sessions = Object.fromEntries(
    workspaces.map((workspace): [string, WorkspaceSession] => {
      const project = workspace.projects.find(
        ({ id }) => id === workspace.initialProjectId,
      );
      return [
        workspace.id,
        {
          sidebar: project
            ? { mode: "project", projectId: project.id }
            : { mode: "overview" },
          expandedFolderIds: [],
          openTabs: project ? [project.homeDocumentId] : [],
          activeTabId: project?.homeDocumentId ?? null,
        },
      ];
    }),
  );

  return {
    activeWorkspaceId: workspaces[0].id,
    sessions,
    sidebarVisibility: "expanded",
    appearance: { theme: "dark", backgroundImage: null, surfaceOpacity: 1 },
  };
}

export function shellReducer(
  state: ShellState,
  action: ShellAction,
): ShellState {
  if (action.type === "switch-workspace") {
    return { ...state, activeWorkspaceId: action.workspaceId };
  }
  if (action.type === "set-sidebar-visibility") {
    return { ...state, sidebarVisibility: action.visibility };
  }

  const workspaceId = state.activeWorkspaceId;
  return {
    ...state,
    sessions: {
      ...state.sessions,
      [workspaceId]: updateSession(state.sessions[workspaceId], action),
    },
  };
}

function updateSession(
  session: WorkspaceSession,
  action: Exclude<
    ShellAction,
    { type: "switch-workspace" | "set-sidebar-visibility" }
  >,
): WorkspaceSession {
  switch (action.type) {
    case "show-project":
      return {
        ...session,
        sidebar: { mode: "project", projectId: action.projectId },
      };
    case "show-overview":
      return { ...session, sidebar: { mode: "overview" } };
    case "toggle-folder":
      return {
        ...session,
        expandedFolderIds: session.expandedFolderIds.includes(action.folderId)
          ? session.expandedFolderIds.filter((id) => id !== action.folderId)
          : [...session.expandedFolderIds, action.folderId],
      };
    case "open-document":
      return {
        ...session,
        activeTabId: action.documentId,
        openTabs: session.openTabs.includes(action.documentId)
          ? session.openTabs
          : [...session.openTabs, action.documentId],
      };
    case "select-tab":
      return { ...session, activeTabId: action.tabId };
    case "close-tab": {
      const index = session.openTabs.indexOf(action.tabId);
      if (index === -1) return session;

      const openTabs = session.openTabs.filter((id) => id !== action.tabId);
      return {
        ...session,
        openTabs,
        activeTabId:
          session.activeTabId === action.tabId
            ? (openTabs[index] ?? openTabs[index - 1] ?? null)
            : session.activeTabId,
      };
    }
  }
}
