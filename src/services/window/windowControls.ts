import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

function currentWindow() {
  return getCurrentWindow();
}

export function isDesktopRuntime(): boolean {
  return isTauri();
}

export async function minimizeWindow(): Promise<void> {
  if (!isDesktopRuntime()) {
    return;
  }
  await currentWindow().minimize();
}

export async function toggleMaximizeWindow(): Promise<void> {
  if (!isDesktopRuntime()) {
    return;
  }
  await currentWindow().toggleMaximize();
}

export async function closeWindow(): Promise<void> {
  if (!isDesktopRuntime()) {
    return;
  }
  await currentWindow().close();
}
