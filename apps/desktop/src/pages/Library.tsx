import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Star,
  Trash2,
  X,
  Copy,
  FolderOpen,
  ChevronDown,
  SearchX,
  Check,
  Ruler,
  HardDrive,
  Clock,
  Folder,
  Image as ImageIcon,
  Plus,
} from "lucide-react";
import { useI18n } from "../i18n";
import {
  type CaptureMeta,
  fileSrc,
} from "../lib/bridge";
import { formatBytes, formatBytesShort, formatCapturedAt, timeAgoFromSecs } from "../lib/format";

type Filter = "all" | "favorites";
type Sort = "newest" | "largest" | "name";

interface LibraryProps {
  captures: CaptureMeta[];
  selectedPath: string | null;
  onSelect: (path: string | null) => void;
  onToggleFavorite: (cap: CaptureMeta) => void;
  onDelete: (cap: CaptureMeta) => void;
  onDeleteMany: (items: CaptureMeta[]) => void;
  onCopyImage: (cap: CaptureMeta) => void;
  onOpenFile: (cap: CaptureMeta) => void;
  onQuickCapture: () => void;
}

export function Library({
  captures,
  selectedPath,
  onSelect,
  onToggleFavorite,
  onDelete,
  onDeleteMany,
  onCopyImage,
  onOpenFile,
  onQuickCapture,
}: LibraryProps) {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [selected, setSelected] = useState<string[]>([]);

  // Close the detail panel when the selected file was deleted
  useEffect(() => {
    if (selectedPath && !captures.some((c) => c.path === selectedPath)) onSelect(null);
  }, [captures, selectedPath, onSelect]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = captures.filter((c) => {
      if (filter === "favorites" && !c.favorite) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
    switch (sort) {
      case "largest":
        list = [...list].sort((a, b) => b.sizeBytes - a.sizeBytes);
        break;
      case "name":
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break; // already newest-first from the backend
    }
    return list;
  }, [captures, query, filter, sort]);

  const selectedCapture = captures.find((c) => c.path === selectedPath) ?? null;

  const toggleSelected = (path: string) =>
    setSelected((prev) =>
      prev.includes(path) ? prev.filter((s) => s !== path) : [...prev, path],
    );

  const selectedItems = useMemo(
    () => captures.filter((c) => selected.includes(c.path)),
    [captures, selected],
  );

  const filterChips: { id: Filter; label: string }[] = [
    { id: "all", label: t.library.all },
    { id: "favorites", label: t.library.favorites },
  ];

  const folderBase = (dir: string) =>
    dir.split(/[\\/]/).filter(Boolean).pop() ?? dir;

  return (
    <div className="flex min-h-0 flex-1">
      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header + toolbar */}
        <div className="border-b border-line p-5 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">{t.library.title}</h1>
              <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {visible.length} / {captures.length} {t.library.countSuffix}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selected.length > 0 && (
                <button
                  onClick={() => {
                    onDeleteMany(selectedItems);
                    setSelected([]);
                  }}
                  className="btn btn-coral rounded-xl px-3 py-2 text-[11px] uppercase tracking-wide"
                >
                  <Trash2 size={13} strokeWidth={2.6} />
                  {t.library.delete} ({selected.length})
                </button>
              )}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  aria-label="Sort"
                  className="appearance-none rounded-xl bg-card-2 py-2.5 pl-4 pr-9 text-[11px] font-bold outline-none transition-shadow focus:shadow-[0_0_0_2px_hsl(var(--gold))]"
                >
                  <option value="newest">{t.library.sortNewest}</option>
                  <option value="largest">{t.library.sortLargest}</option>
                  <option value="name">{t.library.sortName}</option>
                </select>
                <ChevronDown
                  size={13}
                  strokeWidth={2.5}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search
              size={16}
              strokeWidth={2.4}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.library.searchPlaceholder}
              className="h-12 w-full rounded-2xl bg-card pl-11 pr-12 text-sm font-medium outline-none transition-shadow placeholder:text-muted-foreground/60 focus:shadow-[0_0_0_2px_hsl(var(--gold))]"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear"
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-card-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X size={14} strokeWidth={2.6} />
              </button>
            )}
          </div>

          {/* Filter chips */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {filterChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => setFilter(chip.id)}
                aria-pressed={filter === chip.id}
                className={`rounded-full px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                  filter === chip.id
                    ? "bg-gold text-[#1a1710]"
                    : "bg-card-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {captures.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-line p-12 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-card-2 text-gold">
                <ImageIcon size={26} strokeWidth={1.8} />
              </span>
              <h3 className="text-xl font-extrabold tracking-tight">{t.library.emptyAll}</h3>
              <p className="max-w-xs font-mono text-[10px] font-medium leading-relaxed text-muted-foreground">
                {t.library.emptyAllDesc}
              </p>
              <button
                onClick={onQuickCapture}
                className="btn btn-gold rounded-xl px-5 py-3 text-[11px] uppercase tracking-wide"
              >
                <Plus size={15} strokeWidth={2.75} />
                {t.library.captureNow}
              </button>
            </div>
          ) : visible.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-12 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-card-2 text-muted-foreground">
                <SearchX size={26} strokeWidth={1.8} />
              </span>
              <h3 className="text-xl font-extrabold tracking-tight">{t.library.emptyTitle}</h3>
              <p className="max-w-xs font-mono text-[10px] font-medium leading-relaxed text-muted-foreground">
                {t.library.emptyDesc.replace("{query}", query)}
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
                className="btn btn-tonal rounded-xl px-4 py-2.5 text-[11px] uppercase tracking-wide"
              >
                {t.library.clearSearch}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
              {visible.map((cap) => {
                const isChecked = selected.includes(cap.path);
                const isActive = selectedPath === cap.path;
                return (
                  <div
                    key={cap.path}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(isActive ? null : cap.path)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(isActive ? null : cap.path);
                      }
                    }}
                    className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-card text-left outline-none transition-all focus-visible:shadow-[0_0_0_2px_hsl(var(--gold))] ${
                      isActive
                        ? "shadow-[0_0_0_2px_hsl(var(--gold))]"
                        : "hover:shadow-[var(--shadow-sm)]"
                    }`}
                  >
                    <div className="relative aspect-[16/10] w-full bg-card-2">
                      <img
                        src={fileSrc(cap.path)}
                        alt={cap.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      {/* Select checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelected(cap.path);
                        }}
                        aria-label={isChecked ? "Deselect" : "Select"}
                        aria-pressed={isChecked}
                        style={{ width: 22, height: 22 }}
                        className={`absolute left-2 top-2 flex items-center justify-center rounded-md transition-all ${
                          isChecked
                            ? "bg-gold text-[#1a1710] opacity-100"
                            : "bg-black/45 text-transparent opacity-0 backdrop-blur-sm group-hover:opacity-100"
                        }`}
                      >
                        <Check size={13} strokeWidth={4} />
                      </button>
                      {/* Favorite star */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(cap);
                        }}
                        aria-label="Favorite"
                        aria-pressed={cap.favorite}
                        className="absolute right-2 top-2 rounded-full bg-black/45 p-1.5 backdrop-blur-sm transition-colors hover:bg-black/65"
                      >
                        <Star
                          size={13}
                          strokeWidth={2.4}
                          className={cap.favorite ? "fill-gold text-gold" : "text-white/85"}
                        />
                      </button>
                    </div>
                    <div className="p-2.5">
                      <p className="truncate text-[11px] font-extrabold" title={cap.name}>
                        {cap.name}
                      </p>
                      <div className="mt-0.5 flex items-center justify-between gap-2 font-mono text-[8px] font-semibold uppercase text-muted-foreground">
                        <span className="truncate">{timeAgoFromSecs(cap.modifiedSecs, t.library)}</span>
                        <span className="shrink-0 tabular-nums">{formatBytesShort(cap.sizeBytes)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedCapture && (
        <aside className="animate-panel-in flex w-[330px] shrink-0 flex-col overflow-y-auto border-l border-line bg-card">
          <div className="flex items-center justify-between p-4 pb-0">
            <h2 className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
              {t.library.detailTitle}
            </h2>
            <button onClick={() => onSelect(null)} aria-label="Close" className="icon-btn">
              <X size={16} strokeWidth={2.4} />
            </button>
          </div>

          <div className="p-4">
            <div className="overflow-hidden rounded-2xl bg-[#0b0b10]">
              <div className="aspect-[16/10] w-full">
                <img
                  src={fileSrc(selectedCapture.path)}
                  alt={selectedCapture.name}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
            <p className="mt-3 break-words text-[13px] font-extrabold tracking-tight">
              {selectedCapture.name}
            </p>

            {/* Meta */}
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4">
              <div className="flex items-start gap-2">
                <Ruler size={14} strokeWidth={2.2} className="mt-0.5 shrink-0 text-gold" />
                <span className="min-w-0">
                  <span className="block font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {t.library.fieldDimensions}
                  </span>
                  <span className="mt-0.5 block text-[11px] font-bold">
                    {selectedCapture.width && selectedCapture.height
                      ? `${selectedCapture.width} × ${selectedCapture.height}`
                      : "—"}
                  </span>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <HardDrive size={14} strokeWidth={2.2} className="mt-0.5 shrink-0 text-gold" />
                <span className="min-w-0">
                  <span className="block font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {t.library.fieldSize}
                  </span>
                  <span className="mt-0.5 block text-[11px] font-bold">{formatBytes(selectedCapture.sizeBytes)}</span>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Clock size={14} strokeWidth={2.2} className="mt-0.5 shrink-0 text-gold" />
                <span className="min-w-0">
                  <span className="block font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {t.library.fieldCaptured}
                  </span>
                  <span className="mt-0.5 block text-[11px] font-bold">
                    {formatCapturedAt(selectedCapture.modifiedSecs, lang)}
                  </span>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Folder size={14} strokeWidth={2.2} className="mt-0.5 shrink-0 text-gold" />
                <span className="min-w-0">
                  <span className="block font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {t.library.fieldFolder}
                  </span>
                  <button
                    onClick={() => onOpenFile(selectedCapture)}
                    className="mt-0.5 block max-w-full truncate text-[11px] font-bold underline decoration-dotted underline-offset-2 hover:text-gold"
                    title={selectedCapture.path}
                  >
                    {folderBase(selectedCapture.path.replace(/[\\/][^\\/]+$/, "")) || "…"}
                  </button>
                </span>
              </div>
            </dl>

            {/* Actions */}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => onCopyImage(selectedCapture)}
                className="btn btn-gold justify-center rounded-2xl px-3 py-3 text-[10px] uppercase tracking-wide"
              >
                <Copy size={13} strokeWidth={2.6} />
                {t.library.copyImage}
              </button>
              <button
                onClick={() => onOpenFile(selectedCapture)}
                className="btn btn-tonal justify-center rounded-2xl px-3 py-3 text-[10px] uppercase tracking-wide"
              >
                <FolderOpen size={13} strokeWidth={2.6} />
                {t.dashboard.openShort}
              </button>
            </div>
            <button
              onClick={() => onDelete(selectedCapture)}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-[hsl(var(--coral)/0.12)] px-3 py-3 text-[10px] font-extrabold uppercase tracking-wide text-coral transition-colors hover:bg-[hsl(var(--coral)/0.2)]"
            >
              <Trash2 size={13} strokeWidth={2.6} />
              {t.library.deleteOne}
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
