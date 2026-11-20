import { useEffect, useRef, type KeyboardEvent } from "react";
import type { Document } from "../learning/catalog";
import { Icon } from "./Icon";
import { documentIcons } from "./documentIcons";

export const documentPanelId = "document-panel";

export function tabElementId(documentId: string) {
  return `document-tab-${documentId}`;
}

interface TabStripProps {
  tabs: readonly Document[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onFocusEditor: () => void;
}

export function TabStrip({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onFocusEditor,
}: TabStripProps) {
  const tabButtons = useRef(new Map<string, HTMLButtonElement>());

  useEffect(() => {
    if (activeTabId) {
      tabButtons.current
        .get(activeTabId)
        ?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    }
  }, [activeTabId]);

  function closeTab(index: number) {
    const tab = tabs[index];
    const nextTabId =
      tab.id === activeTabId
        ? (tabs[index + 1] ?? tabs[index - 1])?.id
        : activeTabId;

    if (nextTabId) {
      tabButtons.current.get(nextTabId)?.focus();
    } else {
      onFocusEditor();
    }
    onCloseTab(tab.id);
  }

  function handleTabKey(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number;
    switch (event.key) {
      case "ArrowLeft":
        nextIndex = (index - 1 + tabs.length) % tabs.length;
        break;
      case "ArrowRight":
        nextIndex = (index + 1) % tabs.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = tabs.length - 1;
        break;
      case "Delete":
        event.preventDefault();
        closeTab(index);
        return;
      default:
        return;
    }
    event.preventDefault();
    const nextTabId = tabs[nextIndex].id;
    tabButtons.current.get(nextTabId)?.focus();
    onSelectTab(nextTabId);
  }

  return (
    <div className="tab-bar">
      {tabs.length > 0 && (
        <div className="tab-list" role="tablist" aria-label="Open documents">
          {tabs.map((tab, index) => {
            const selected = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                role="presentation"
                className="tab"
                data-active={selected}
              >
                <button
                  ref={(button) => {
                    if (button) tabButtons.current.set(tab.id, button);
                    else tabButtons.current.delete(tab.id);
                  }}
                  id={tabElementId(tab.id)}
                  type="button"
                  role="tab"
                  className="tab-label"
                  aria-selected={selected}
                  aria-controls={documentPanelId}
                  tabIndex={selected ? 0 : -1}
                  title={tab.title}
                  onClick={() => onSelectTab(tab.id)}
                  onKeyDown={(event) => handleTabKey(event, index)}
                >
                  <Icon name={documentIcons[tab.kind]} />
                  <span>{tab.title}</span>
                </button>
                <button
                  type="button"
                  className="tab-close icon-button"
                  aria-label={`Close ${tab.title}`}
                  title={`Close ${tab.title}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => closeTab(index)}
                >
                  <Icon name="close" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
