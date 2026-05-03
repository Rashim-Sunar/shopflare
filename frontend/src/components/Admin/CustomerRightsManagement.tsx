import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCloudUploadAlt,
  FaFilePdf,
  FaTimes,
  FaCheckCircle,
  FaClock,
  FaCog,
  FaExclamationTriangle,
} from "react-icons/fa";

/**
 * @fileoverview Admin customer-rights management page for uploading policy PDFs and tracking ingestion.
 */

interface PolicyDocument {
  _id: string;
  name: string;
  version: string;
  isActive: boolean;
  originalName: string;
  fileName: string;
  status: "queued" | "processing" | "completed" | "failed";
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
}

/* ─── Animation Variants ─── */
const pageVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const rowVariant = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0 },
};

/* ─── Status Badge Component ─── */
const StatusBadge = ({ status }: { status: PolicyDocument["status"] }) => {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode; pulse?: boolean }> = {
    completed: { bg: "bg-emerald-50", text: "text-emerald-700", icon: <FaCheckCircle className="text-[10px]" /> },
    processing: { bg: "bg-amber-50", text: "text-amber-700", icon: <FaCog className="animate-spin text-[10px]" />, pulse: true },
    failed: { bg: "bg-red-50", text: "text-red-700", icon: <FaExclamationTriangle className="text-[10px]" /> },
    queued: { bg: "bg-sky-50", text: "text-sky-700", icon: <FaClock className="text-[10px]" /> },
  };

  const { bg, text, icon, pulse } = config[status] ?? config.queued;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${bg} ${text} ${pulse ? "animate-pulse" : ""}`}>
      {icon}
      <span className="capitalize">{status}</span>
    </span>
  );
};

/**
 * Function: CustomerRightsManagement
 * ----------------------------------------
 * Purpose:
 *   Lets admins upload policy PDFs and inspect the ingestion queue history.
 *
 * Inputs:
 *   - React state for the selected PDF, document name, version, and activation flag.
 *
 * Outputs:
 *   - Upload form, progress indicator, and document metadata table.
 */
const CustomerRightsManagement = () => {
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);
  const [name, setName] = useState("Customer Rights Policy");
  const [version, setVersion] = useState("1.0.0");
  const [isActive, setIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const authHeaders = {
    Authorization: `Bearer ${localStorage.getItem("userToken")}`,
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/customer-rights`, {
        headers: authHeaders,
      });
      setDocuments(response.data.documents ?? []);
    } catch (loadError: any) {
      toast.error(loadError.response?.data?.message || "Failed to load customer rights documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processFile = useCallback((file: File | null) => {
    setError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    processFile(file);
  };

  /* ─── Drag & Drop Handlers ─── */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    processFile(file);
  }, [processFile]);

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!selectedFile) {
      setError("Choose a PDF file before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("policyPdf", selectedFile);
    formData.append("name", name);
    formData.append("version", version);
    formData.append("isActive", String(isActive));

    try {
      setUploading(true);
      setProgress(0);

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/admin/customer-rights/upload`, formData, {
        headers: {
          ...authHeaders,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) {
            return;
          }

          const nextProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(nextProgress);
        },
      });

      toast.success("Policy uploaded and queued for ingestion");
      setSelectedFile(null);
      setProgress(100);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadDocuments();
    } catch (uploadError: any) {
      const message = uploadError.response?.data?.message || "Failed to upload policy PDF";
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div variants={pageVariant} initial="hidden" animate="visible" className="space-y-8 max-w-6xl mx-auto">
      {/* ─── Page Header ─── */}
      <motion.div variants={cardVariant}>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
            <FaFilePdf className="text-lg" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent">
              Customer Rights
            </h1>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500 ml-[52px]">
          Upload policy PDFs and queue them for the customer-rights RAG pipeline.
        </p>
      </motion.div>

      {/* ─── Upload Form ─── */}
      <motion.form
        variants={cardVariant}
        onSubmit={handleUpload}
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] space-y-6"
      >
        {/* Form fields */}
        <div className="grid gap-5 md:grid-cols-3">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Document Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Customer Rights Policy"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Version</span>
            <input
              value={version}
              onChange={(event) => setVersion(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              placeholder="1.0.0"
            />
          </label>

          <label className="flex items-end">
            <div
              onClick={() => setIsActive(!isActive)}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                isActive
                  ? "border-indigo-200 bg-indigo-50/50"
                  : "border-gray-200 bg-gray-50/50"
              }`}
            >
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${
                  isActive
                    ? "border-indigo-600 bg-indigo-600"
                    : "border-gray-300 bg-white"
                }`}
              >
                {isActive && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className={`text-sm font-medium ${isActive ? "text-indigo-800" : "text-gray-600"}`}>
                Mark as active policy
              </span>
            </div>
          </label>
        </div>

        {/* ─── Drag & Drop Zone ─── */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
            isDragging
              ? "border-indigo-400 bg-indigo-50/60 scale-[1.01]"
              : selectedFile
                ? "border-emerald-300 bg-emerald-50/30"
                : "border-gray-200 bg-gray-50/30 hover:border-indigo-300 hover:bg-indigo-50/20"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <AnimatePresence mode="wait">
            {selectedFile ? (
              <motion.div
                key="file-selected"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <FaFilePdf className="text-2xl" />
                </div>
                <p className="text-sm font-semibold text-gray-800">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Ready to upload
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="mt-1 flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100"
                >
                  <FaTimes className="text-[10px]" />
                  Remove
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="no-file"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center gap-2"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${isDragging ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400"}`}>
                  <FaCloudUploadAlt className="text-2xl" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    {isDragging ? "Drop your PDF here" : "Drag & drop your PDF here"}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">or click to browse • PDF files only</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Error Message ─── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <FaExclamationTriangle className="flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Upload Progress ─── */}
        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-600">Uploading...</span>
                <span className="font-bold text-indigo-600">{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Actions ─── */}
        <div className="flex items-center gap-3">
          <motion.button
            type="submit"
            disabled={uploading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {uploading ? (
              <>
                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <FaCloudUploadAlt />
                Upload Policy PDF
              </>
            )}
          </motion.button>

          <button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              setError(null);
              setProgress(0);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </motion.form>

      {/* ─── Documents Table ─── */}
      <motion.section variants={cardVariant} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)]">
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Uploaded Documents</h2>
              <p className="mt-0.5 text-sm text-gray-500">Newest documents appear first. Active policies are used by the RAG pipeline.</p>
            </div>
            <span className="flex h-8 items-center rounded-full bg-indigo-50 px-3 text-xs font-semibold text-indigo-600">
              {documents.length} {documents.length === 1 ? "document" : "documents"}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center px-6 py-16">
            <div className="flex flex-col items-center gap-3">
              <svg className="h-8 w-8 animate-spin text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm text-gray-500">Loading documents...</p>
            </div>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-300">
              <FaFilePdf className="text-3xl" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No policies uploaded yet</p>
            <p className="mt-1 text-xs text-gray-400">Upload your first customer rights PDF to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Name</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Version</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Active</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((document, index) => (
                  <motion.tr
                    key={document._id}
                    variants={rowVariant}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.05 }}
                    className="group border-t border-gray-50 transition-colors hover:bg-indigo-50/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-50 to-red-100 text-red-500">
                          <FaFilePdf className="text-sm" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{document.name}</p>
                          <p className="text-[11px] text-gray-400">{document.originalName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-mono font-semibold text-gray-600">
                        v{document.version}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={document.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-2.5 w-2.5 rounded-full ${document.isActive ? "bg-emerald-500" : "bg-gray-300"}`} />
                        <span className={`text-xs font-medium ${document.isActive ? "text-emerald-700" : "text-gray-400"}`}>
                          {document.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(document.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      <span className="ml-1 text-[11px] text-gray-400">
                        {new Date(document.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.section>
    </motion.div>
  );
};

export default CustomerRightsManagement;
