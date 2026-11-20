import { invoke } from "@tauri-apps/api/core";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import App from "./App";

vi.mock(import("@tauri-apps/api/core"), () => ({ invoke: vi.fn() }));

afterEach(cleanup);

test("displays the greeting returned by Tauri after submitting a name", async () => {
  const greeting = "Hello, Ada! You've been greeted from Rust!";
  vi.mocked(invoke).mockResolvedValue(greeting);
  render(<App />);

  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Ada" } });
  fireEvent.click(screen.getByRole("button", { name: "Greet" }));

  expect(invoke).toHaveBeenCalledExactlyOnceWith("greet", { name: "Ada" });
  await screen.findByText(greeting);
});
