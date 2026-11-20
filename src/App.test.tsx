import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import App from "./App";

afterEach(cleanup);

function sidebar() {
  return within(screen.getByRole("navigation", { name: "Project navigation" }));
}

function clickSidebar(name: string) {
  fireEvent.click(sidebar().getByRole("button", { name }));
}

function editor() {
  return within(screen.getByRole("main", { name: "Document editor" }));
}

function expectDocument(title: string) {
  expect(editor().getByRole("heading", { name: title, level: 1 })).toBeTruthy();
}

function expectDocumentPath(path: string) {
  expect(editor().getByText(path, { selector: ".document-path" })).toBeTruthy();
}

function workspaceTrigger() {
  return screen.getByRole("button", { name: /^Switch workspace/ });
}

function switchWorkspace(name: string) {
  fireEvent.click(workspaceTrigger());
  fireEvent.click(screen.getByRole("menuitemradio", { name }));
}

test("shows courses and files together and opens nested folder homes, notes, and PDF references", () => {
  render(<App />);

  expect(sidebar().getByRole("heading", { name: "Korean" })).toBeTruthy();
  expect(sidebar().getByRole("heading", { name: "Courses" })).toBeTruthy();
  expect(sidebar().getByRole("heading", { name: "Files" })).toBeTruthy();
  expectDocument("Korean");
  expectDocumentPath("Korean");

  clickSidebar("Intermediate Grammar");
  expectDocument("Intermediate Grammar");
  expectDocumentPath("Korean/Courses/Intermediate Grammar");
  expect(
    editor().getByText("Lessons are unavailable in this version."),
  ).toBeTruthy();

  const grammar = sidebar().getByRole("button", {
    name: "Grammar Notes",
  });
  expect(sidebar().queryByRole("button", { name: "Practice" })).toBeNull();
  fireEvent.click(grammar);
  expectDocument("Grammar Notes");
  expectDocumentPath("Korean/Grammar Notes");
  expect(grammar.getAttribute("aria-current")).toBe("true");
  expect(grammar.getAttribute("aria-expanded")).toBe("false");
  expect(sidebar().queryByRole("button", { name: "Practice" })).toBeNull();
  fireEvent.click(grammar);
  expect(grammar.getAttribute("aria-expanded")).toBe("true");
  expect(
    sidebar().queryByRole("button", { name: "Folder Home: Grammar Notes" }),
  ).toBeNull();

  clickSidebar("Practice");
  expectDocument("Practice");
  expectDocumentPath("Korean/Grammar Notes/Practice");
  clickSidebar("Expand Practice");
  expectDocument("Practice");
  clickSidebar("Sentence Drills");
  expectDocument("Sentence Drills");
  expectDocumentPath("Korean/Grammar Notes/Practice/Sentence Drills");

  fireEvent.click(grammar);
  expectDocument("Grammar Notes");
  expect(grammar.getAttribute("aria-expanded")).toBe("true");
  fireEvent.click(grammar);
  expect(
    sidebar().queryByRole("button", { name: "Sentence Drills" }),
  ).toBeNull();

  clickSidebar("Expand Resources");
  expectDocument("Grammar Notes");
  clickSidebar("Grammar Reference.pdf");
  expectDocument("Grammar Reference.pdf");
  expectDocumentPath("Korean/Resources/Grammar Reference.pdf");
  expect(
    editor().getByText("PDF viewing is unavailable in this version."),
  ).toBeTruthy();
});

test("keeps the active document and its tabs when the sidebar changes projects", () => {
  render(<App />);

  clickSidebar("Hanja");
  const hanja = editor().getByRole("tab", { name: "Hanja" });
  clickSidebar("Back to projects");

  const overviewHeading = sidebar().getByRole("heading", { name: "Projects" });
  expect(document.activeElement).toBe(overviewHeading);
  expect(sidebar().getByRole("button", { name: "Korean" })).toBeTruthy();
  expect(
    sidebar().getByRole("button", { name: "3D Integration" }),
  ).toBeTruthy();
  expect(editor().queryByRole("button", { name: "IC Devices" })).toBeNull();
  expectDocument("Hanja");

  clickSidebar("IC Devices");
  const projectHeading = sidebar().getByRole("heading", { name: "IC Devices" });
  expect(document.activeElement).toBe(projectHeading);
  expectDocument("Hanja");
  expectDocumentPath("Korean/Courses/Hanja");
  expect(editor().getByRole("tab", { name: "Korean" })).toBeTruthy();
  expect(hanja.getAttribute("aria-selected")).toBe("true");

  clickSidebar("Project Home");
  expectDocument("IC Devices");
  fireEvent.click(hanja);
  expectDocument("Hanja");
  expect(sidebar().getByRole("heading", { name: "IC Devices" })).toBeTruthy();
});

test("opens one shared Through-Silicon Via tab from both project trees", () => {
  render(<App />);

  clickSidebar("Back to projects");
  clickSidebar("IC Devices");
  clickSidebar("Through-Silicon Via");
  const sharedTab = editor().getByRole("tab", { name: "Through-Silicon Via" });
  expectDocument("Through-Silicon Via");
  expectDocumentPath("IC Devices/Through-Silicon Via");

  clickSidebar("Back to projects");
  clickSidebar("3D Integration");
  clickSidebar("Project Home");
  expectDocument("3D Integration");
  clickSidebar("Through-Silicon Via");

  expect(editor().getAllByRole("tab", { name: "Through-Silicon Via" })).toEqual(
    [sharedTab],
  );
  expect(sharedTab.getAttribute("aria-selected")).toBe("true");
  expectDocument("Through-Silicon Via");
  expectDocumentPath("IC Devices/Through-Silicon Via");
});

test("restores each workspace's own sidebar and tabs when switching between workspaces", () => {
  render(<App />);

  clickSidebar("Expand Grammar Notes");
  clickSidebar("Connective Endings");
  switchWorkspace("Studio");

  expect(sidebar().getByRole("heading", { name: "Projects" })).toBeTruthy();
  expect(sidebar().queryByRole("button", { name: "Korean" })).toBeNull();
  expect(editor().queryByRole("tab")).toBeNull();
  expectDocument("No open documents");

  clickSidebar("Design Studies");
  clickSidebar("Project Home");
  clickSidebar("Typography Notes");
  switchWorkspace("Self Teaching");

  expect(sidebar().getByRole("heading", { name: "Korean" })).toBeTruthy();
  expect(
    sidebar()
      .getByRole("button", { name: "Collapse Grammar Notes" })
      .getAttribute("aria-expanded"),
  ).toBe("true");
  expect(
    editor()
      .getAllByRole("tab")
      .map((tab) => tab.textContent),
  ).toEqual(["Korean", "Connective Endings"]);
  expectDocument("Connective Endings");

  switchWorkspace("Studio");
  expect(
    sidebar().getByRole("heading", { name: "Design Studies" }),
  ).toBeTruthy();
  expect(
    editor()
      .getAllByRole("tab")
      .map((tab) => tab.textContent),
  ).toEqual(["Design Studies", "Typography Notes"]);
  expectDocument("Typography Notes");
  expectDocumentPath("Design Studies/Typography Notes");
});

test("shows the active workspace and supports keyboard navigation and dismissal", () => {
  render(<App />);

  const trigger = workspaceTrigger();
  trigger.focus();
  fireEvent.keyDown(trigger, { key: "ArrowDown" });
  const current = screen.getByRole("menuitemradio", {
    name: "Self Teaching",
    checked: true,
  });
  const studio = screen.getByRole("menuitemradio", { name: "Studio" });
  expect(document.activeElement).toBe(current);

  fireEvent.keyDown(current, { key: "ArrowDown" });
  expect(document.activeElement).toBe(studio);
  fireEvent.keyDown(studio, { key: "Escape" });
  expect(screen.queryByRole("menu")).toBeNull();
  expect(document.activeElement).toBe(trigger);
  expectDocument("Korean");

  fireEvent.click(trigger);
  fireEvent.pointerDown(screen.getByRole("main"));
  expect(screen.queryByRole("menu")).toBeNull();

  switchWorkspace("Studio");
  expect(screen.queryByRole("menu")).toBeNull();
  expect(document.activeElement).toBe(workspaceTrigger());
  fireEvent.click(workspaceTrigger());
  expect(
    screen.getByRole("menuitemradio", { name: "Studio", checked: true }),
  ).toBe(document.activeElement);
});

test("collapsing and hiding the sidebar preserve the selected project and active tab", () => {
  render(<App />);
  clickSidebar("Study Plan");

  fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
  expect(sidebar().queryByRole("heading", { name: "Files" })).toBeNull();
  expect(
    sidebar().getByRole("button", { name: "Open Korean Project Home" }),
  ).toBeTruthy();
  expectDocument("Study Plan");

  fireEvent.click(screen.getByRole("button", { name: "Hide sidebar" }));
  expect(
    screen.queryByRole("navigation", { name: "Project navigation" }),
  ).toBeNull();
  expectDocument("Study Plan");

  fireEvent.click(screen.getByRole("button", { name: "Show sidebar" }));
  expect(sidebar().getByRole("heading", { name: "Korean" })).toBeTruthy();
  expectDocument("Study Plan");
});

test("supports keyboard selection and closing tabs while keeping focus in the editor", () => {
  render(<App />);
  clickSidebar("Hanja");
  clickSidebar("Study Plan");
  const hanja = editor().getByRole("tab", { name: "Hanja" });
  const study = editor().getByRole("tab", { name: "Study Plan" });
  study.focus();

  fireEvent.keyDown(study, { key: "ArrowLeft" });
  expect(document.activeElement).toBe(hanja);
  expectDocument("Hanja");

  fireEvent.keyDown(hanja, { key: "Delete" });
  expect(document.activeElement).toBe(study);
  expect(editor().queryByRole("tab", { name: "Hanja" })).toBeNull();
  expectDocument("Study Plan");

  fireEvent.click(editor().getByRole("button", { name: "Close Korean" }));
  expectDocument("Study Plan");

  fireEvent.click(editor().getByRole("button", { name: "Close Study Plan" }));
  expect(document.activeElement?.id).toBe("document-panel");
  expect(editor().queryByRole("tablist")).toBeNull();
  expectDocument("No open documents");
});

test("home links open the same documents as the sidebar and keep focus in the document pane", () => {
  render(<App />);

  const pane = editor().getByRole("tabpanel", { name: "Korean" });
  const folderLink = within(pane).getByRole("button", {
    name: "Grammar Notes",
  });
  folderLink.focus();
  fireEvent.click(folderLink);
  expectDocument("Grammar Notes");
  expect(document.activeElement).toBe(
    editor().getByRole("tabpanel", { name: "Grammar Notes" }),
  );

  clickSidebar("Grammar Notes");
  expect(editor().getAllByRole("tab", { name: "Grammar Notes" })).toHaveLength(
    1,
  );

  const noteLink = within(editor().getByRole("tabpanel")).getByRole("button", {
    name: "Connective Endings",
  });
  fireEvent.click(noteLink);
  expectDocument("Connective Endings");
});
