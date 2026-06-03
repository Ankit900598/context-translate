use arboard::Clipboard;
use enigo::{Direction, Enigo, Key, Keyboard, Settings};
use std::thread;
use std::time::Duration;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

#[tauri::command]
fn grab_selected_text() -> Result<String, String> {
    let mut clipboard = Clipboard::new().map_err(|e| e.to_string())?;
    let original = clipboard.get_text().ok();

    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;
    enigo
        .key(Key::Control, Direction::Press)
        .map_err(|e| e.to_string())?;
    enigo
        .key(Key::Layout('c'), Direction::Click)
        .map_err(|e| e.to_string())?;
    enigo
        .key(Key::Control, Direction::Release)
        .map_err(|e| e.to_string())?;

    thread::sleep(Duration::from_millis(180));

    let copied = clipboard.get_text().map_err(|e| e.to_string())?;

    if let Some(orig) = original {
        let _ = clipboard.set_text(orig);
    }

    Ok(copied)
}

#[tauri::command]
fn read_clipboard_text() -> Result<String, String> {
    let clipboard = Clipboard::new().map_err(|e| e.to_string())?;
    clipboard.get_text().map_err(|e| e.to_string())
}

#[tauri::command]
fn write_clipboard_text(text: String) -> Result<(), String> {
    let mut clipboard = Clipboard::new().map_err(|e| e.to_string())?;
    clipboard.set_text(text).map_err(|e| e.to_string())
}

fn register_shortcuts(app: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let translate_shortcut =
        Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyT);
    app.global_shortcut().register(translate_shortcut)?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        let _ = app.emit("translate-selection", ());
                    }
                })
                .build(),
        )
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![
            grab_selected_text,
            read_clipboard_text,
            write_clipboard_text
        ])
        .setup(|app| {
            let translate_clipboard =
                MenuItem::with_id(app, "translate_clipboard", "Translate clipboard", true, None::<&str>)?;
            let settings_item =
                MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
            let quit = PredefinedMenuItem::quit(app, Some("Quit"))?;
            let menu = Menu::with_items(app, &[&translate_clipboard, &settings_item, &quit])?;

            let tray_app = app.handle().clone();
            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .tooltip("Context Translate — Ctrl+Shift+T")
                .on_menu_event(move |app, event| match event.id.as_ref() {
                    "translate_clipboard" => {
                        let _ = app.emit("translate-clipboard", ());
                    }
                    "settings" => {
                        let _ = app.emit("open-settings", ());
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let _ = tray.app_handle().emit("translate-selection", ());
                    }
                })
                .build(app)?;

            register_shortcuts(&tray_app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
