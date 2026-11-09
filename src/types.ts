export type AppId =
  | 'computer'
  | 'recycle'
  | 'browser'
  | 'notepad'
  | 'paint'
  | 'media'
  | 'calc'
  | 'control'
  | 'minesweeper'
  | 'cmd'
  | 'personalize'
  | 'run'
  | 'help';

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  isMinimized: boolean;
  isMaximized: boolean;
  prevBounds?: WindowBounds;
  zIndex: number;
}

export type SnapPosition = 'none' | 'left' | 'right' | 'top';

export type WallpaperPreset =
  | 'harmony'      // Classic Win 7 blue light
  | 'architecture' // Modern glass architectural curves
  | 'nature'       // Green landscape & grass
  | 'aurora'       // Northern lights blue & cyan
  | 'dark';        // Deep midnight Aero

export type AeroTintColor = 'blue' | 'slate' | 'teal' | 'ruby' | 'frost';

export interface ThemeConfig {
  wallpaper: WallpaperPreset;
  aeroTint: AeroTintColor;
  aeroOpacity: number;
  soundEnabled: boolean;
}

export interface DesktopShortcut {
  id: string;
  appId: AppId;
  name: string;
  icon: string;
  custom?: boolean;
}
