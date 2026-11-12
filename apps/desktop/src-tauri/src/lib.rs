// Scrynx — Tauri entry point.
// Real, local-first screen capture: no mocks, no cloud required.

use std::fs;
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;

use base64::Engine as _;
use chrono::Local;
use serde::Serialize;
use screenshots::image::{DynamicImage, ImageFormat, image_dimensions};
use screenshots::Screen;

/* ---------------------------------- Types ---------------------------------- */

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CaptureInfo {
    /// Absolute path — also used as the unique id.
    pub path: String,
    pub name: String,
    pub size_bytes: u64,
    pub width: Option<u32>,
    pub height: Option<u32>,
    /// Seconds since Unix epoch.
    pub modified_secs: u64,
}

/// Frozen snapshot of the primary screen, used by the capture overlay.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FrozenShot {
    /// Base64-encoded JPEG of the primary screen at capture time.
    pub image_base64: String,
    /// MIME type of `image_base64` (image/jpeg or image/png).
    pub mime: String,
    pub width: u32,
    pub height: u32,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FolderStats {
    pub count: u64,
    pub total_bytes: u64,
}

/* --------------------------------- Helpers --------------------------------- */

fn primary_screen() -> Result<Screen, String> {
    let screens = Screen::all().map_err(|e| format!("Falha ao enumerar telas: {e}"))?;
    screens
        .iter()
        .find(|s| s.display_info.is_primary)
        .copied()
        .or_else(|| screens.first().copied())
        .ok_or_else(|| "Nenhuma tela encontrada.".to_string())
}

/// Shared save logic for full-screen and region captures.
fn save_capture(
    rgba: screenshots::image::RgbaImage,
    folder: &Path,
    format: &str,
    quality: u8,
) -> Result<CaptureInfo, String> {
    let fmt = format.to_ascii_lowercase();
    let (ext, image_format) = match fmt.as_str() {
        "jpeg" | "jpg" => ("jpg", ImageFormat::Jpeg),
        "webp" => ("webp", ImageFormat::WebP),
        _ => ("png", ImageFormat::Png),
    };

    let stamp = Local::now().format("%Y-%m-%d_%H-%M-%S");
    let filename = format!("scrynx_{stamp}.{ext}");
    let path = folder.join(&filename);

    let dyn_img = DynamicImage::ImageRgba8(rgba);
    if image_format == ImageFormat::Jpeg {
        // JPEG has no alpha channel — flatten to RGB with quality control
        use screenshots::image::codecs::jpeg::JpegEncoder;
        use screenshots::image::ColorType;
        let rgb = dyn_img.into_rgb8();
        let (width, height) = rgb.dimensions();
        let file = fs::File::create(&path)
            .map_err(|e| format!("Falha ao criar o arquivo: {e}"))?;
        let mut writer = std::io::BufWriter::new(file);
        let mut encoder = JpegEncoder::new_with_quality(&mut writer, quality.clamp(10, 100));
        encoder
            .encode(rgb.as_raw(), width, height, ColorType::Rgb8)
            .map_err(|e| format!("Falha ao salvar JPEG: {e}"))?;
    } else {
        dyn_img
            .save_with_format(&path, image_format)
            .map_err(|e| format!("Falha ao salvar a captura: {e}"))?;
    }

    capture_info(&path).ok_or_else(|| "Captura salva, mas não foi possível lê-la.".into())
}

const IMAGE_EXTENSIONS: [&str; 5] = ["png", "jpg", "jpeg", "webp", "bmp"];

fn is_supported_image(path: &Path) -> bool {
    path.extension()
        .and_then(|e| e.to_str())
        .map(|e| IMAGE_EXTENSIONS.contains(&e.to_ascii_lowercase().as_str()))
        .unwrap_or(false)
}

fn meta_secs(meta: &fs::Metadata) -> u64 {
    meta.modified()
        .ok()
        .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

fn capture_info(path: &Path) -> Option<CaptureInfo> {
    let meta = fs::metadata(path).ok()?;
    let (width, height) = image_dimensions(path).ok().unzip();
    Some(CaptureInfo {
        path: path.to_string_lossy().into_owned(),
        name: path.file_name()?.to_string_lossy().into_owned(),
        size_bytes: meta.len(),
        width,
        height,
        modified_secs: meta_secs(&meta),
    })
}

/// Ensure the capture directory exists and return it.
fn ensure_dir(dir: &str) -> Result<PathBuf, String> {
    let path = PathBuf::from(dir);
    fs::create_dir_all(&path)
        .map_err(|e| format!("Não foi possível criar a pasta de capturas: {e}"))?;
    Ok(path)
}

/* -------------------------------- Commands --------------------------------- */

/// Default folder offered during onboarding: <Pictures>/Scrynx
#[tauri::command]
    async fn default_capture_dir() -> Result<String, String> {
    dirs::picture_dir()
        .map(|p| p.join("Scrynx").to_string_lossy().into_owned())
        .ok_or_else(|| "Não foi possível localizar a pasta de imagens do sistema.".into())
}

/// Ensure the capture directory exists (and is a directory).
/// Returns the canonical path. Used to validate onboarding/settings picks.
#[tauri::command]
    async fn ensure_capture_dir(dir: String) -> Result<String, String> {
    let path = ensure_dir(&dir)?;
    Ok(path
        .canonicalize()
        .unwrap_or(path)
        .to_string_lossy()
        .into_owned())
}

/// Capture the primary screen and save it into `dir`.
/// Returns the saved capture's metadata.
#[tauri::command]
    async fn capture_screen(dir: String, format: String, quality: u8) -> Result<CaptureInfo, String> {
    let folder = ensure_dir(&dir)?;
    let screen = primary_screen()?;
    let rgba = screen.capture().map_err(|e| format!("Falha ao capturar a tela: {e}"))?;
    save_capture(rgba, &folder, &format, quality)
}

/// Freeze the primary screen into an in-memory JPEG (base64) for the capture overlay.
/// Runs on the async runtime — never blocks the UI thread.
#[tauri::command]
async fn capture_screen_frozen() -> Result<FrozenShot, String> {
    use screenshots::image::codecs::jpeg::JpegEncoder;
    use screenshots::image::ColorType;

    let screen = primary_screen()?;
    let rgba = screen.capture().map_err(|e| format!("Falha ao capturar a tela: {e}"))?;
    let (width, height) = (rgba.width(), rgba.height());

    // Flatten to RGB + JPEG q65: orders of magnitude lighter than a raw PNG,
    // and the webview paints the dimmed background instantly.
    let rgb = DynamicImage::ImageRgba8(rgba).into_rgb8();
    let mut buf = Vec::with_capacity(256 * 1024);
    let mut encoder = JpegEncoder::new_with_quality(&mut buf, 65);
    encoder
        .encode(rgb.as_raw(), width, height, ColorType::Rgb8)
        .map_err(|e| format!("Falha ao codificar a tela: {e}"))?;

    use base64::engine::general_purpose::STANDARD;
    Ok(FrozenShot {
        image_base64: STANDARD.encode(&buf),
        mime: "image/jpeg".to_string(),
        width,
        height,
    })
}

/// Capture a region of the primary screen (Snipping-Tool style) and save it into `dir`.
/// `x`, `y`, `width`, `height` are in CSS pixels; `scale` converts them to physical pixels.
#[tauri::command]
    async fn capture_region(
    x: i32,
    y: i32,
    width: u32,
    height: u32,
    scale: f64,
    dir: String,
    format: String,
    quality: u8,
) -> Result<CaptureInfo, String> {
    let folder = ensure_dir(&dir)?;
    let screen = primary_screen()?;

    let px = (x as f64 * scale).round() as i32;
    let py = (y as f64 * scale).round() as i32;
    let pw = ((width as f64 * scale).round() as u32).max(1);
    let ph = ((height as f64 * scale).round() as u32).max(1);

    let rgba = screen
        .capture_area(px, py, pw, ph)
        .map_err(|e| format!("Falha ao capturar a região: {e}"))?;
    save_capture(rgba, &folder, &format, quality)
}

/// List captures in the folder, newest first.
#[tauri::command]
    async fn list_captures(dir: String) -> Result<Vec<CaptureInfo>, String> {
    let folder = PathBuf::from(&dir);
    if !folder.exists() {
        return Ok(Vec::new());
    }
    let mut items: Vec<CaptureInfo> = fs::read_dir(&folder)
        .map_err(|e| format!("Falha ao ler a pasta: {e}"))?
        .filter_map(|entry| entry.ok())
        .map(|entry| entry.path())
        .filter(|path| path.is_file() && is_supported_image(path))
        .filter_map(|path| capture_info(&path))
        .collect();

    items.sort_by(|a, b| b.modified_secs.cmp(&a.modified_secs));
    items.truncate(500);
    Ok(items)
}

/// Delete a capture file (only images, only inside existing paths).
#[tauri::command]
    async fn delete_capture(path: String) -> Result<(), String> {
    let target = PathBuf::from(&path);
    if !target.is_file() || !is_supported_image(&target) {
        return Err("Arquivo inválido para exclusão.".into());
    }
    fs::remove_file(&target).map_err(|e| format!("Falha ao excluir: {e}"))
}

/// Aggregate stats of the capture folder: count + total bytes.
#[tauri::command]
    async fn folder_stats(dir: String) -> Result<FolderStats, String> {
    let folder = PathBuf::from(&dir);
    if !folder.exists() {
        return Ok(FolderStats { count: 0, total_bytes: 0 });
    }
    let mut count = 0u64;
    let mut total_bytes = 0u64;
    for entry in fs::read_dir(&folder).map_err(|e| format!("Falha ao ler a pasta: {e}"))? {
        let Ok(entry) = entry else { continue };
        let path = entry.path();
        if path.is_file() && is_supported_image(&path) {
            count += 1;
            total_bytes += entry.metadata().map(|m| m.len()).unwrap_or(0);
        }
    }
    Ok(FolderStats { count, total_bytes })
}

/// Copy a capture image to the system clipboard.
#[tauri::command]
    async fn copy_image_to_clipboard(path: String) -> Result<(), String> {
    let img = screenshots::image::open(PathBuf::from(&path))
        .map_err(|e| format!("Falha ao abrir a imagem: {e}"))?
        .to_rgba8();

    let (width, height) = img.dimensions();
    let bytes = img.into_raw();

    let mut clipboard =
        arboard::Clipboard::new().map_err(|e| format!("Falha ao acessar a área de transferência: {e}"))?;
    clipboard
        .set_image(arboard::ImageData {
            width: width as usize,
            height: height as usize,
            bytes: std::borrow::Cow::Owned(bytes),
        })
        .map_err(|e| format!("Falha ao copiar a imagem: {e}"))
}

#[tauri::command]
    async fn app_info() -> &'static str {
    "Scrynx 0.1.0"
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            app_info,
            default_capture_dir,
            ensure_capture_dir,
            capture_screen,
            capture_screen_frozen,
            capture_region,
            list_captures,
            delete_capture,
            folder_stats,
            copy_image_to_clipboard
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
