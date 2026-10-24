"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AlertCircle, Plus } from "lucide-react";

export interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCourseModal({ isOpen, onClose, onSuccess }: CreateCourseModalProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [days2h, setDays2h] = useState("60");
  const [days3h, setDays3h] = useState("40");
  const [days4h, setDays4h] = useState("30");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          tracks: [
            { daily_hours: 2, total_days: parseInt(days2h, 10) || 60 },
            { daily_hours: 3, total_days: parseInt(days3h, 10) || 40 },
            { daily_hours: 4, total_days: parseInt(days4h, 10) || 30 },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMsg(data.error || "Failed to create course");
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setErrorMsg("Network error creating course");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Course Track" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-500 flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-black uppercase text-black font-mono mb-1">
            Course Title
          </label>
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. Distributed Systems in Go"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-black font-mono mb-1">
            URL Slug
          </label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="distributed-systems-go"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-black font-mono mb-1">
            Curriculum Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Rigorous architectural principles, consensus protocols..."
            required
            rows={3}
            className="w-full border-2 border-black p-2.5 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-black font-mono mb-2">
            Pacing Track Total Days
          </label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[11px] font-mono font-bold block mb-1">2H Track</span>
              <Input
                type="number"
                value={days2h}
                onChange={(e) => setDays2h(e.target.value)}
                min="1"
                required
              />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold block mb-1">3H Track</span>
              <Input
                type="number"
                value={days3h}
                onChange={(e) => setDays3h(e.target.value)}
                min="1"
                required
              />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold block mb-1">4H Track</span>
              <Input
                type="number"
                value={days4h}
                onChange={(e) => setDays4h(e.target.value)}
                min="1"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-black/10">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="yellow" size="sm" type="submit" disabled={isSubmitting}>
            <Plus className="w-4 h-4 mr-1 text-black" />
            {isSubmitting ? "Publishing..." : "Publish Course"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
