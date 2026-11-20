import type { Workspace } from "../learning/catalog";
import { Icon } from "./Icon";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import type { SidebarVisibility } from "./navigation";

interface TopBarProps {
  workspaces: readonly Workspace[];
  activeWorkspaceId: string;
  sidebarVisibility: SidebarVisibility;
  onSwitchWorkspace: (id: string) => void;
  onSetSidebarVisibility: (visibility: SidebarVisibility) => void;
}

export function TopBar({
  workspaces,
  activeWorkspaceId,
  sidebarVisibility,
  onSwitchWorkspace,
  onSetSidebarVisibility,
}: TopBarProps) {
  const sidebarVisible = sidebarVisibility !== "hidden";
  const sidebarExpanded = sidebarVisibility === "expanded";
  const resizeLabel = sidebarExpanded ? "Collapse sidebar" : "Expand sidebar";
  const visibilityLabel = sidebarVisible ? "Hide sidebar" : "Show sidebar";

  return (
    <header className="top-bar">
      <div className="brand">
        <img src="/sable.svg" width="28" height="28" alt="Sable" />
      </div>
      <WorkspaceSwitcher
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSwitchWorkspace={onSwitchWorkspace}
      />
      <div className="sidebar-controls">
        {sidebarVisible && (
          <button
            type="button"
            className="icon-button"
            aria-label={resizeLabel}
            title={resizeLabel}
            aria-controls="workspace-sidebar"
            aria-expanded={sidebarExpanded}
            onClick={() =>
              onSetSidebarVisibility(sidebarExpanded ? "collapsed" : "expanded")
            }
          >
            <Icon name={sidebarExpanded ? "collapse" : "expand"} />
          </button>
        )}
        <button
          type="button"
          className="icon-button"
          aria-label={visibilityLabel}
          title={visibilityLabel}
          aria-controls={sidebarVisible ? "workspace-sidebar" : undefined}
          aria-expanded={sidebarVisible}
          onClick={() =>
            onSetSidebarVisibility(sidebarVisible ? "hidden" : "expanded")
          }
        >
          <Icon name="sidebar" />
        </button>
      </div>
    </header>
  );
}
