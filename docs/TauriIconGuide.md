# Tauri Icon Regeneration Guide

To fully brand your application as **QuickPoint**, the default icons under `src-tauri/icons/` need to be regenerated using the new QuickPoint logo assets.

## Summary of Icon Files

Here is the breakdown of the icon files in `src-tauri/icons/` and what they are used for:

1. **`icon.ico`** (Windows Application & Taskbar Icon)
   - *Format:* Windows Icon format containing multiple sizes (16x16, 24x24, 32x32, 48x48, 64x64, 128x128, 256x256).
   - *Purpose:* Used as the main application icon for Windows `.exe` and installer packages, and shows up on the taskbar.

2. **`icon.png`** (Windows Tray Icon & Base Asset)
   - *Format:* 512x512 PNG with transparency.
   - *Purpose:* Used as the base asset for generating icons, and is explicitly loaded in `src-tauri/src/lib.rs` for the system tray icon on Windows (since Windows uses colored tray icons).

3. **`icon_tray.png`** (macOS/Linux Tray Icon)
   - *Format:* Monochrome/Template PNG (typically 18x18 or 22x22).
   - *Purpose:* Loaded in `src-tauri/src/lib.rs` for the macOS/Linux system tray, supporting automatic dark/light appearance adaptation (template mode).

4. **`icon_tray_update.png`** (macOS/Linux Tray Icon with Update Status)
   - *Format:* Monochrome/Template PNG with a small badge dot.
   - *Purpose:* Used on macOS/Linux system tray when an update is pending.

5. **`icon.icns`** (macOS Application Icon)
   - *Format:* Apple Icon Image format.
   - *Purpose:* Main application icon for the `.app` bundle on macOS.

---

## How to Regenerate Icons

Tauri provides an official CLI command to regenerate all icon files (`.ico`, `.icns`, `.png`) from a single high-resolution source PNG logo (e.g. 1024x1024 pixels).

### Step-by-Step Instructions:

1. Place your new high-resolution QuickPoint logo (e.g., `qlogo_source.png` or `qlogo.png`, minimum 512x512 but 1024x1024 is recommended) in your project root or an accessible folder.
2. Run the following command in your terminal from the project root:

   ```bash
   npx tauri icon /path/to/your/new_logo.png
   ```

   This command will automatically:
   - Generate `icon.ico` with all required sizes.
   - Generate `icon.icns` for macOS.
   - Generate `icon.png` (512x512) and other helper PNG resolutions.

3. **Updating the Tray Icons:**
   - **Windows:** Since the Windows tray uses `icon.png`, the `tauri icon` tool will automatically update it.
   - **macOS/Linux:** For the monochrome template icons `icon_tray.png` and `icon_tray_update.png`, you should manually export a small template version of the QuickPoint logo (transparency + solid color, 22x22 pixels) and replace those files.
