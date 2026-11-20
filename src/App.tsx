import { useReducer, useRef, type CSSProperties } from "react";
import { sampleWorkspaces } from "./learning/sampleData";
import { DocumentPane } from "./shell/DocumentPane";
import { ProjectSidebar } from "./shell/ProjectSidebar";
import { TabStrip } from "./shell/TabStrip";
import { TopBar } from "./shell/TopBar";
import { createShellState, shellReducer } from "./shell/navigation";
import "./App.css";

function App() {
  const [state, dispatch] = useReducer(
    shellReducer,
    sampleWorkspaces,
    createShellState,
  );
  const editorRef = useRef<HTMLDivElement>(null);
  const workspace = sampleWorkspaces.find(
    ({ id }) => id === state.activeWorkspaceId,
  );
  if (!workspace) return null;

  const session = state.sessions[workspace.id];
  const sidebar = session.sidebar;
  const project =
    sidebar.mode === "project"
      ? workspace.projects.find(({ id }) => id === sidebar.projectId)
      : undefined;
  const tabs = session.openTabs.map((id) => workspace.documents[id]);
  const document = session.activeTabId
    ? workspace.documents[session.activeTabId]
    : undefined;
  const appearanceStyle = {
    "--surface-opacity": state.appearance.surfaceOpacity,
    backgroundImage: state.appearance.backgroundImage ?? undefined,
  } satisfies CSSProperties & { "--surface-opacity": number };

  function openDocument(documentId: string) {
    dispatch({ type: "open-document", documentId });
  }

  return (
    <div
      className="app-shell"
      data-theme={state.appearance.theme}
      style={appearanceStyle}
    >
      <TopBar
        workspaces={sampleWorkspaces}
        activeWorkspaceId={workspace.id}
        sidebarVisibility={state.sidebarVisibility}
        onSwitchWorkspace={(workspaceId) =>
          dispatch({ type: "switch-workspace", workspaceId })
        }
        onSetSidebarVisibility={(visibility) =>
          dispatch({ type: "set-sidebar-visibility", visibility })
        }
      />
      <div className="workbench" data-sidebar={state.sidebarVisibility}>
        {state.sidebarVisibility !== "hidden" && (
          <ProjectSidebar
            workspace={workspace}
            project={project}
            collapsed={state.sidebarVisibility === "collapsed"}
            expandedFolderIds={session.expandedFolderIds}
            activeTabId={session.activeTabId}
            onShowProject={(projectId) =>
              dispatch({ type: "show-project", projectId })
            }
            onShowOverview={() => dispatch({ type: "show-overview" })}
            onToggleFolder={(folderId) =>
              dispatch({ type: "toggle-folder", folderId })
            }
            onOpenDocument={openDocument}
            onExpand={() =>
              dispatch({
                type: "set-sidebar-visibility",
                visibility: "expanded",
              })
            }
          />
        )}
        <main className="editor" aria-label="Document editor">
          <TabStrip
            tabs={tabs}
            activeTabId={session.activeTabId}
            onSelectTab={(tabId) => dispatch({ type: "select-tab", tabId })}
            onCloseTab={(tabId) => dispatch({ type: "close-tab", tabId })}
            onFocusEditor={() => editorRef.current?.focus()}
          />
          <DocumentPane
            workspace={workspace}
            document={document}
            panelRef={editorRef}
            onOpenDocument={(id) => {
              openDocument(id);
              editorRef.current?.focus();
            }}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
