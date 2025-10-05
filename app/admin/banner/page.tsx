"use client";
import React, { useEffect, useState } from "react";

type Banner = {
  image: string;
  color: string;
  title: string;
  isActive?: boolean;
};

export default function AdminBannerPage() {
  const [current, setCurrent] = useState<Banner | null>(null);
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#50C878");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/banner", { cache: "no-store" });
        const data = await res.json();
        setCurrent(data);
        if (data?.title) setTitle(data.title);
        if (data?.color) setColor(data.color);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const handleUploadBanner = async (): Promise<string | null> => {
    if (!file) return null;
    setUploading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/banner", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? ""}`,
        },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Upload failed");
      const secureUrl: string = json.secure_url;
      setMessage("Image uploaded.");
      return secureUrl;
    } catch (e: any) {
      console.error(e);
      setMessage(e?.message || "Upload error");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSaveBanner = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const isCloudinaryUrl = (url?: string) =>
        !!url && /https?:\/\/res\.cloudinary\.com\//.test(url);

      let imageUrl = current?.image || "";
      if (file) {
        const uploaded = await handleUploadBanner();
        if (!uploaded) throw new Error("Could not upload image");
        imageUrl = uploaded;
      } else {
        // Require Cloudinary image if no new file selected
        if (!isCloudinaryUrl(imageUrl)) {
          setMessage("Please upload an image to Cloudinary before saving.");
          return;
        }
      }

      const payload: Banner = {
        image: imageUrl,
        color,
        title,
        isActive: true,
      };

      const putRes = await fetch("/api/banner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!putRes.ok) throw new Error("Failed to save banner");
      const saved = await putRes.json();
      setCurrent(saved);
      setMessage("Banner saved and activated.");

      // Optionally export seed file after save
      try {
        await fetch("/api/export-banner-seed", { method: "POST" });
      } catch (e) {
        console.warn("Seed export failed (optional)", e);
      }
    } catch (e: any) {
      console.error(e);
      setMessage(e?.message || "Save error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Admin: Banner Manager</h1>

      {message && (
        <div className="rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2">{message}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              placeholder="Banner title"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Color</span>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-10 p-0 border-none"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 rounded border border-gray-300 px-3 py-2"
                placeholder="#50C878"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 w-full"
            />
          </label>

          <button
            onClick={handleSaveBanner}
            disabled={uploading || saving}
            className="inline-flex items-center justify-center rounded bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 disabled:opacity-60"
          >
            {uploading || saving ? "Saving..." : "Save & Activate"}
          </button>
        </div>

        <div>
          <span className="text-sm font-medium">Current Preview</span>
          <div className="mt-2 rounded border border-gray-200 overflow-hidden">
            <div
              className="p-4"
              style={{ background: current?.color || "#f8fafc" }}
            >
              <h2 className="text-lg font-semibold text-white drop-shadow">
                {current?.title || "No active banner"}
              </h2>
            </div>
            {current?.image && (
              <img src={current.image} alt="Banner" className="w-full object-cover max-h-64" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}