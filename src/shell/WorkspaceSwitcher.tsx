import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { Workspace } from "../learning/catalog";
import { Icon } from "./Icon";

interface WorkspaceSwitcherProps {
  workspaces: readonly Workspace[];
  activeWorkspaceId: string;
  onSwitchWorkspace: (id: string) => void;
}

export function WorkspaceSwitcher({
  workspaces,
  activeWorkspaceId,
  onSwitchWorkspace,
}: WorkspaceSwitcherProps) {
  const [menuStart, setMenuStart] = useState<
    "current" | "first" | "last" | null
  >(null);
  const switcherRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const menuId = useId();
  const activeWorkspace = workspaces.find(({ id }) => id === activeWorkspaceId);
  const isOpen = menuStart !== null;

  useEffect(() => {
    if (!menuStart) return;

    const items =
      menuRef.current?.querySelectorAll<HTMLButtonElement>("button");
    if (items?.length) {
      const index =
        menuStart === "last"
          ? items.length - 1
          : menuStart === "first"
            ? 0
            : workspaces.findIndex(({ id }) => id === activeWorkspaceId);
      (items[index] ?? items[0]).focus();
    }

    function closeOnOutsideClick(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !switcherRef.current?.contains(event.target)
      ) {
        setMenuStart(null);
      }
    }

    window.document.addEventListener("pointerdown", closeOnOutsideClick);
    return () =>
      window.document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [activeWorkspaceId, menuStart, workspaces]);

  function closeMenu() {
    triggerRef.current?.focus();
    setMenuStart(null);
  }

  function handleMenuKey(event: KeyboardEvent<HTMLUListElement>) {
    if (event.key === "Escape" || event.key === "Tab") {
      if (event.key === "Escape") event.preventDefault();
      closeMenu();
      return;
    }

    const items = Array.from(event.currentTarget.querySelectorAll("button"));
    const current = items.findIndex((item) => item === event.target);
    let next: number;

    switch (event.key) {
      case "ArrowDown":
        next = (current + 1) % items.length;
        break;
      case "ArrowUp":
        next = (current - 1 + items.length) % items.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = items.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    items[next]?.focus();
  }

  return (
    <div
      className="workspace-switcher"
      ref={switcherRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setMenuStart(null);
      }}
    >
      <button
        type="button"
        className="workspace-trigger"
        ref={triggerRef}
        aria-label={`Switch workspace, ${activeWorkspace?.name}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => setMenuStart(isOpen ? null : "current")}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setMenuStart(event.key === "ArrowDown" ? "first" : "last");
          }
        }}
      >
        <Icon name="workspace" />
        <span>{activeWorkspace?.name}</span>
        <Icon name="down" />
      </button>
      {isOpen && (
        <ul
          id={menuId}
          ref={menuRef}
          className="workspace-menu"
          role="menu"
          aria-label="Workspaces"
          onKeyDown={handleMenuKey}
        >
          {workspaces.map(({ id, name }) => (
            <li key={id} role="none">
              <button
                type="button"
                className="workspace-option"
                role="menuitemradio"
                aria-checked={id === activeWorkspaceId}
                tabIndex={-1}
                onClick={() => {
                  onSwitchWorkspace(id);
                  closeMenu();
                }}
              >
                <Icon name="workspace" />
                <span>{name}</span>
                {id === activeWorkspaceId && <Icon name="check" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
