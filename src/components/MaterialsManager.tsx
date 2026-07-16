import React, { useState, useEffect } from "react";
import { User, Material } from "../types";
import { Plus, FolderDown, FileText, Globe, Video, ExternalLink, Trash2, CheckCircle2 } from "lucide-react";

interface MaterialsManagerProps {
  user: User;
  activeClassId: string;
}

export default function MaterialsManager({ user, activeClassId }: MaterialsManagerProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [type, setType] = useState<"pdf" | "doc" | "link" | "video">("pdf");

  const isStudent = user.role === "student";

  const loadMaterials = () => {
    if (!activeClassId) return;
    fetch(`/api/materials?classId=${activeClassId}`)
      .then((res) => res.json())
      .then((data) => setMaterials(data))
      .catch((err) => console.error("Error loading materials:", err));
  };

  useEffect(() => {
    loadMaterials();
  }, [activeClassId]);

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStudent) return;

    if (!title || !fileUrl) {
      setError("Title and file URL/name are required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          fileUrl,
          uploadedBy: user.id,
          classId: activeClassId,
          type,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to catalog material.");
      }

      setTitle("");
      setDescription("");
      setFileUrl("");
      setShowAddForm(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      loadMaterials();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMaterialIcon = (matType: string) => {
    if (matType === "pdf") return <FileText className="w-5 h-5 text-rose-400" />;
    if (matType === "video") return <Video className="w-5 h-5 text-indigo-400" />;
    if (matType === "link") return <Globe className="w-5 h-5 text-cyan-400" />;
    return <FileText className="w-5 h-5 text-amber-400" />;
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight uppercase font-mono">Academic Materials Hub</h2>
          <p className="text-slate-400 text-xs mt-1">
            {isStudent 
              ? "Download worksheets, slide presentations, or watch assigned course video links." 
              : "Upload handouts, lecture summaries, slides, or syllabus updates for students."}
          </p>
        </div>

        {!isStudent && (
          <button
            onClick={() => { setShowAddForm(!showAddForm); setError(""); }}
            id="add-material-trigger"
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Resource</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Resource uploaded successfully!</span>
        </div>
      )}

      {/* Add Handout Form */}
      {showAddForm && !isStudent && (
        <div id="add-material-form-panel" className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <FolderDown className="w-4 h-4 text-cyan-400" />
            Catalog Educational Material
          </h3>
          <form onSubmit={handleUploadMaterial} className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Document Title *</label>
              <input
                type="text"
                id="mat-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Special Relativity Lecture Slides"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-white outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Resource Type</label>
              <select
                id="mat-type-select"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none"
              >
                <option value="pdf">PDF Handout</option>
                <option value="doc">Word Document / Sheet</option>
                <option value="link">External Web URL</option>
                <option value="video">Screencast / Video Lesson</option>
              </select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Short Description</label>
              <input
                type="text"
                id="mat-desc-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail what this resource covers (e.g. Planck's constant calculations and formulas)"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-white outline-none"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">File Path / URL Link *</label>
              <input
                type="text"
                id="mat-url-input"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="e.g. relativity_lecture_v1.pdf"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-white outline-none"
                required
              />
            </div>
            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                id="mat-submit-btn"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
              >
                {loading ? "Cataloging..." : "Add Resource to Hub"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Materials List Display */}
      {materials.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/10 border border-slate-850 rounded-3xl text-slate-500">
          <span className="text-sm">No educational materials catalogs found in this classroom hub.</span>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((mat) => (
            <div 
              key={mat.id} 
              className="bg-slate-900/30 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between hover:border-cyan-500/20 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    {getMaterialIcon(mat.type)}
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-[9px] font-bold font-mono text-slate-500 uppercase">
                    {mat.type}
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white tracking-tight group-hover:text-cyan-400 transition-colors">
                    {mat.title}
                  </h4>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-medium line-clamp-2">
                    {mat.description || "No dynamic overview specified."}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>{new Date(mat.uploadedAt).toLocaleDateString()}</span>
                
                {/* Real Dynamic File Download */}
                <a
                  href={`/api/materials/download/${mat.id}`}
                  download
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-cyan-500 hover:text-slate-950 rounded-xl border border-slate-800 hover:border-transparent transition-all text-xs font-bold font-sans cursor-pointer text-slate-300"
                >
                  <FolderDown className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
