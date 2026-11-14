import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE = "https://backend-3-axez.onrender.com";
const API = `${API_BASE}/api/banners`;
const MAX_BANNERS = 5;
const MAX_SIZE_MB = 5;

// /uploads/xyz.jpg -> full backend URL, http link ko waise hi rehne do
const getImageUrl = (img) => {
  if (!img) return "";
  return img.startsWith("http") ? img : `${API_BASE}${img}`;
};

const uid = () => Math.random().toString(36).slice(2, 10);

const inputClass =
  "w-full bg-slate-950/70 border border-slate-700/70 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition";
const labelClass = "block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1";

const AdminBannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Upload queue (naye selected images)
  const [queue, setQueue] = useState([]);
  const [progress, setProgress] = useState(null); // { current, total }
  const [dragOver, setDragOver] = useState(false);

  // Busy state (delete / move / replace)
  const [busy, setBusy] = useState(false);

  // Edit modal
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ tagline: "", title: "", specs: "" });
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState("");
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const editFileRef = useRef(null);
  const queueRef = useRef([]);
  queueRef.current = queue;

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  // ---------- Fetch ----------
  const fetchBanners = async () => {
    try {
      const { data } = await axios.get(API);
      if (data.success) {
        const list = data.banners || [];
        setBanners(list);
        setSelectedId((prev) =>
          list.some((b) => b._id === prev) ? prev : list[0]?._id || null
        );
      }
    } catch (error) {
      toast.error("Failed to load banners");
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    fetchBanners();
    // unmount par saare preview URLs free karo
    return () => queueRef.current.forEach((q) => URL.revokeObjectURL(q.preview));
  }, []);

  // Edit modal: naye selected file ka preview
  useEffect(() => {
    if (!editFile) {
      setEditPreview("");
      return;
    }
    const url = URL.createObjectURL(editFile);
    setEditPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [editFile]);

  // Esc se modal band
  useEffect(() => {
    if (!editing) return;
    const onKey = (e) => e.key === "Escape" && closeEdit();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing]);

  // ---------- Helpers ----------
  const validateFile = (file) => {
    if (!file) return false;
    if (!file.type.startsWith("image/")) {
      toast.error(`"${file.name}" image nahi hai`);
      return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`"${file.name}" ${MAX_SIZE_MB}MB se badi hai`);
      return false;
    }
    return true;
  };

  const slotsLeft = MAX_BANNERS - banners.length - queue.length;
  const full = slotsLeft <= 0;

  // ---------- Multiple image select ----------
  const addFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    if (full) {
      toast.error(`Maximum ${MAX_BANNERS} banners allowed. Pehle koi banner delete karein.`);
      return;
    }

    const valid = files.filter(validateFile);
    if (valid.length > slotsLeft) {
      toast(`Sirf ${slotsLeft} image add ho sakti hain, baaki skip ki gayi`, { icon: "ℹ️" });
    }

    const picked = valid.slice(0, slotsLeft).map((file) => ({
      id: uid(),
      file,
      preview: URL.createObjectURL(file),
      tagline: "",
      title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
      specs: "",
    }));
    setQueue((prev) => [...prev, ...picked]);
  };

  const openPicker = () => {
    if (full) {
      toast.error("Saare 5 slots bhar gaye hain. Pehle koi banner delete karein.");
      return;
    }
    fileInputRef.current?.click();
  };

  const handlePick = (e) => {
    addFiles(e.target.files);
    e.target.value = ""; // same files dobara select kar sako
  };

  const updateQueueItem = (id, field, value) => {
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  };

  const removeQueueItem = (id) => {
    setQueue((prev) => {
      const item = prev.find((q) => q.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((q) => q.id !== id);
    });
  };

  const clearQueue = () => {
    queue.forEach((q) => URL.revokeObjectURL(q.preview));
    setQueue([]);
  };

  // ---------- Upload all (ek ek karke) ----------
  const uploadAll = async () => {
    if (!queue.length || progress) return;
    if (queue.some((q) => !q.title.trim())) {
      toast.error("Har image ka title bharna zaroori hai");
      return;
    }

    const items = [...queue];
    let done = 0;
    try {
      for (const item of items) {
        setProgress({ current: done + 1, total: items.length });
        const body = new FormData();
        body.append("tagline", item.tagline);
        body.append("title", item.title);
        body.append("specs", item.specs);
        body.append("order", banners.length + done);
        body.append("image", item.file);

        await axios.post(API, body, { headers: authHeaders() });

        URL.revokeObjectURL(item.preview);
        setQueue((prev) => prev.filter((q) => q.id !== item.id));
        done++;
      }
      toast.success(`${done} banner${done > 1 ? "s" : ""} uploaded!`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Upload failed");
    } finally {
      setProgress(null);
      fetchBanners();
    }
  };

  // ---------- Delete ----------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      setBusy(true);
      const { data } = await axios.delete(`${API}/${id}`, { headers: authHeaders() });
      if (data.success) {
        toast.success("Banner deleted!");
        fetchBanners();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete banner");
    } finally {
      setBusy(false);
    }
  };

  // ---------- Slide order (left / right) ----------
  const moveBanner = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= banners.length || busy) return;

    const next = [...banners];
    [next[index], next[target]] = [next[target], next[index]];

    try {
      setBusy(true);
      const changed = next
        .map((b, i) => ({ b, i }))
        .filter(({ b, i }) => b.order !== i);

      await Promise.all(
        changed.map(({ b, i }) => {
          const body = new FormData();
          body.append("order", i);
          return axios.put(`${API}/${b._id}`, body, { headers: authHeaders() });
        })
      );
      setBanners(next.map((b, i) => ({ ...b, order: i })));
    } catch (error) {
      toast.error(error.response?.data?.message || "Order change failed");
      fetchBanners();
    } finally {
      setBusy(false);
    }
  };

  // ---------- Replace image (selected banner) ----------
  const selectedBanner = banners.find((b) => b._id === selectedId) || null;

  const handleReplaceImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!validateFile(file) || !selectedBanner) return;

    try {
      setBusy(true);
      const body = new FormData();
      body.append("image", file);
      const { data } = await axios.put(`${API}/${selectedBanner._id}`, body, {
        headers: authHeaders(),
      });
      if (data.success) {
        toast.success("Image replaced!");
        fetchBanners();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to replace image");
    } finally {
      setBusy(false);
    }
  };

  // ---------- Edit modal ----------
  const openEdit = (banner) => {
    setEditing(banner);
    setEditFile(null);
    setEditForm({
      tagline: banner.tagline || "",
      title: banner.title || "",
      specs: banner.specs || "",
    });
  };

  const closeEdit = () => {
    setEditing(null);
    setEditFile(null);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) {
      toast.error("Title zaroori hai");
      return;
    }
    try {
      setSaving(true);
      const body = new FormData();
      body.append("tagline", editForm.tagline);
      body.append("title", editForm.title);
      body.append("specs", editForm.specs);
      if (editFile) body.append("image", editFile);

      const { data } = await axios.put(`${API}/${editing._id}`, body, {
        headers: authHeaders(),
      });
      if (data.success) {
        toast.success("Banner updated!");
        closeEdit();
        fetchBanners();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // ---------- UI ----------
  const slots = Array.from({ length: MAX_BANNERS }, (_, i) => {
    if (i < banners.length) return { type: "banner", data: banners[i], index: i };
    if (i < banners.length + queue.length) return { type: "pending", data: queue[i - banners.length] };
    return { type: "empty" };
  });

  return (
    <div className="w-full p-3 sm:p-6 text-slate-100 font-sans">
      {/* Apna dark background: parent light ho tab bhi text saaf dikhega */}
      <div className="max-w-6xl mx-auto rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-8 space-y-6 sm:space-y-8 shadow-2xl">
        {/* ===== Header ===== */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400">
              Admin · Homepage
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
              Hero Banner Studio
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Ek saath kai images chuniye, text bhariye aur homepage slider live kijiye.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 w-full md:w-auto">
            <div className="flex items-center justify-between gap-6 text-xs font-semibold">
              <span className="text-slate-300">Slots used</span>
              <span className={full ? "text-red-400" : "text-amber-400"}>
                {banners.length + queue.length} / {MAX_BANNERS}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {Array.from({ length: MAX_BANNERS }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 md:w-9 md:flex-none rounded-full transition-all ${
                    i < banners.length
                      ? "bg-amber-400"
                      : i < banners.length + queue.length
                      ? "bg-indigo-400/70"
                      : "bg-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>
        </header>

        {/* ===== Upload zone ===== */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6">
          <div
            role="button"
            tabIndex={0}
            onClick={openPicker}
            onKeyDown={(e) => e.key === "Enter" && openPicker()}
            onDragOver={(e) => {
              e.preventDefault();
              if (!full) setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`rounded-2xl border-2 border-dashed px-4 py-8 sm:py-10 text-center transition-all ${
              full
                ? "border-slate-800 opacity-60 cursor-not-allowed"
                : dragOver
                ? "border-amber-400 bg-amber-400/10 scale-[1.01] cursor-copy"
                : "border-slate-700 hover:border-amber-400/70 hover:bg-slate-800/40 cursor-pointer"
            }`}
          >
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
              🖼️
            </div>
            <p className="mt-4 text-base sm:text-lg font-bold text-white">
              {full ? "Saare 5 slots bhar gaye" : "Drop images here ya click karke chuniye"}
            </p>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {full
                ? "Naya add karne ke liye pehle koi banner delete karein"
                : `Ek saath ${slotsLeft} tak images select kar sakte hain · PNG, JPG, WEBP · max ${MAX_SIZE_MB}MB each`}
            </p>
            {!full && (
              <span className="inline-block mt-4 px-5 py-2 rounded-xl bg-amber-400 text-slate-950 text-sm font-bold shadow-lg shadow-amber-500/20">
                Choose Images
              </span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePick}
            className="hidden"
          />

          {/* Queue */}
          {queue.length > 0 && (
            <div className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-bold text-white">
                  Ready to upload{" "}
                  <span className="text-slate-400 font-medium">({queue.length})</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openPicker}
                    disabled={!!progress || full}
                    className="px-3 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ＋ Add more images
                  </button>
                  <button
                    type="button"
                    onClick={clearQueue}
                    disabled={!!progress}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-red-400 transition cursor-pointer disabled:opacity-50"
                  >
                    Clear all
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {queue.map((q, i) => (
                  <div
                    key={q.id}
                    className="relative flex flex-col sm:flex-row gap-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-3 sm:p-4"
                  >
                    <div className="relative w-full sm:w-36 h-44 sm:h-36 shrink-0 rounded-xl bg-white/5 overflow-hidden flex items-center justify-center">
                      <img src={q.preview} alt="preview" className="w-full h-full object-contain p-1.5" />
                      <span className="absolute top-2 left-2 text-[10px] font-bold bg-slate-950/80 border border-slate-700 rounded-md px-2 py-0.5">
                        New #{banners.length + i + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 grid gap-3 content-start">
                      <div>
                        <label className={labelClass}>Title *</label>
                        <input
                          value={q.title}
                          onChange={(e) => updateQueueItem(q.id, "title", e.target.value)}
                          placeholder="Special Combination Plier"
                          className={inputClass}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Tagline</label>
                          <input
                            value={q.tagline}
                            onChange={(e) => updateQueueItem(q.id, "tagline", e.target.value)}
                            placeholder="Heavy-Duty Series"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Specs</label>
                          <input
                            value={q.specs}
                            onChange={(e) => updateQueueItem(q.id, "specs", e.target.value)}
                            placeholder="8″ · Drop Forged"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeQueueItem(q.id)}
                      disabled={!!progress}
                      title="Remove"
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow-lg cursor-pointer disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={uploadAll}
                disabled={!!progress}
                className="mt-5 w-full sm:w-auto sm:min-w-[260px] px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 disabled:opacity-60 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition cursor-pointer"
              >
                {progress
                  ? `Uploading ${progress.current} / ${progress.total}...`
                  : `Upload ${queue.length} Banner${queue.length > 1 ? "s" : ""}`}
              </button>
            </div>
          )}
        </section>

        {/* ===== Live preview + slots ===== */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Live Slides</h3>
            <span className="text-xs text-slate-400">{banners.length} published</span>
          </div>

          {/* Preview */}
          {!loaded ? (
            <div className="h-64 rounded-2xl bg-slate-800/50 animate-pulse" />
          ) : selectedBanner ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center rounded-2xl bg-slate-950/50 border border-slate-800 p-4 sm:p-6">
              <div className="lg:col-span-5 order-2 lg:order-1 text-center lg:text-left">
                {selectedBanner.tagline && (
                  <span className="inline-block text-[11px] font-semibold px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300">
                    {selectedBanner.tagline}
                  </span>
                )}
                <h4 className="text-xl sm:text-3xl font-extrabold mt-3 leading-tight text-white">
                  {selectedBanner.title}
                </h4>
                {selectedBanner.specs && (
                  <p className="text-sm text-slate-400 mt-2">{selectedBanner.specs}</p>
                )}

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => replaceInputRef.current?.click()}
                    disabled={busy}
                    className="px-3 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                  >
                    🔄 Replace Image
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(selectedBanner)}
                    className="px-3 py-2.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-semibold transition cursor-pointer"
                  >
                    ✏️ Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedBanner._id)}
                    disabled={busy}
                    className="px-3 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 order-1 lg:order-2 relative">
                <div className="relative w-full aspect-[4/3] max-w-lg mx-auto rounded-3xl bg-white shadow-2xl overflow-hidden flex items-center justify-center p-4">
                  <img
                    key={selectedBanner._id + selectedBanner.image}
                    src={getImageUrl(selectedBanner.image)}
                    alt={selectedBanner.title}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://placehold.co/800x600?text=Image+Not+Found";
                    }}
                  />
                  {busy && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center text-sm font-semibold text-white">
                      Please wait...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-10 sm:p-14 text-center text-slate-400 text-sm">
              Abhi koi banner live nahi hai. Upar se images chuniye aur upload kijiye.
            </div>
          )}

          <input
            ref={replaceInputRef}
            type="file"
            accept="image/*"
            onChange={handleReplaceImage}
            className="hidden"
          />

          {/* Slots strip */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {slots.map((slot, i) => {
              if (slot.type === "banner") {
                const b = slot.data;
                const active = b._id === selectedId;
                return (
                  <div
                    key={b._id}
                    onClick={() => setSelectedId(b._id)}
                    className={`relative rounded-2xl p-2 cursor-pointer transition-all border bg-slate-950/60 ${
                      active
                        ? "border-amber-400 ring-2 ring-amber-400/30"
                        : "border-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <div className="aspect-square rounded-xl bg-white/5 overflow-hidden flex items-center justify-center">
                      <img
                        src={getImageUrl(b.image)}
                        alt={b.title}
                        className="w-full h-full object-contain p-1.5"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://placehold.co/200x200?text=No+Image";
                        }}
                      />
                    </div>

                    <span className="absolute top-3 left-3 text-[10px] font-bold bg-slate-950/80 border border-slate-700 rounded-md px-1.5 py-0.5">
                      #{i + 1}
                    </span>

                    <p className="text-[11px] font-semibold mt-2 px-1 line-clamp-1 text-white">{b.title}</p>

                    <div className="flex items-center justify-between mt-1.5 px-1">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBanner(slot.index, -1);
                          }}
                          disabled={slot.index === 0 || busy}
                          title="Move left"
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs disabled:opacity-30 cursor-pointer"
                        >
                          ◀
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBanner(slot.index, 1);
                          }}
                          disabled={slot.index === banners.length - 1 || busy}
                          title="Move right"
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs disabled:opacity-30 cursor-pointer"
                        >
                          ▶
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(b._id);
                      }}
                      disabled={busy}
                      title="Delete banner"
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow-lg cursor-pointer disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </div>
                );
              }

              if (slot.type === "pending") {
                return (
                  <div
                    key={slot.data.id}
                    className="relative rounded-2xl p-2 border-2 border-dashed border-indigo-400/50 bg-indigo-500/5"
                  >
                    <div className="aspect-square rounded-xl bg-white/5 overflow-hidden flex items-center justify-center">
                      <img src={slot.data.preview} alt="pending" className="w-full h-full object-contain p-1.5 opacity-80" />
                    </div>
                    <span className="absolute top-3 left-3 text-[10px] font-bold bg-indigo-500 text-white rounded-md px-1.5 py-0.5">
                      Pending
                    </span>
                    <p className="text-[11px] font-semibold mt-2 px-1 line-clamp-1 text-indigo-200">
                      {slot.data.title || "Untitled"}
                    </p>
                    <p className="text-[10px] text-slate-500 px-1">Upload baaki hai</p>
                  </div>
                );
              }

              return (
                <button
                  key={`empty-${i}`}
                  type="button"
                  onClick={openPicker}
                  className="rounded-2xl border-2 border-dashed border-slate-700 hover:border-amber-400/70 hover:bg-slate-800/40 text-slate-500 hover:text-amber-300 transition flex flex-col items-center justify-center gap-1 aspect-square sm:aspect-auto sm:min-h-[150px] cursor-pointer"
                >
                  <span className="text-3xl leading-none">＋</span>
                  <span className="text-[11px] font-semibold">Add image</span>
                  <span className="text-[10px] opacity-70">Slot #{i + 1}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* ===== Edit modal ===== */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm sm:p-4"
          onClick={closeEdit}
        >
          <form
            onSubmit={saveEdit}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-slate-700 bg-slate-900 text-slate-100 p-5 sm:p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Edit Banner</h3>
              <button
                type="button"
                onClick={closeEdit}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="relative w-full h-48 rounded-2xl bg-white/5 border border-slate-800 overflow-hidden flex items-center justify-center">
              <img
                src={editPreview || getImageUrl(editing.image)}
                alt="preview"
                className="w-full h-full object-contain p-2"
              />
              {editFile && (
                <button
                  type="button"
                  onClick={() => setEditFile(null)}
                  title="Remove new image"
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white text-sm font-bold flex items-center justify-center shadow-lg cursor-pointer"
                >
                  ✕
                </button>
              )}
              <button
                type="button"
                onClick={() => editFileRef.current?.click()}
                className="absolute bottom-2 right-2 bg-slate-950/85 border border-slate-700 text-xs px-3 py-1.5 rounded-lg cursor-pointer"
              >
                {editFile ? "Change image" : "Replace image"}
              </button>
            </div>
            <input
              ref={editFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (validateFile(f)) setEditFile(f);
                e.target.value = "";
              }}
            />

            <div className="grid gap-3 mt-4">
              <div>
                <label className={labelClass}>Title *</label>
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Tagline</label>
                <input
                  value={editForm.tagline}
                  onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Specs</label>
                <input
                  value={editForm.specs}
                  onChange={(e) => setEditForm({ ...editForm, specs: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={closeEdit}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-950 text-sm font-bold cursor-pointer"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminBannerManager;
