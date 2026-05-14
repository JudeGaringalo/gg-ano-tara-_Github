"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import {
  Upload,
  FileText,
  Clock,
  Home,
  BrainCircuit,
  Sparkles,
  LogOut,
  Files,
  Search,
  CheckCircle2,
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Layers,
  Mic2,
  AudioLines,
  Wand2,
  Camera,
  Image as ImageIcon,
  FolderOpen,
  RefreshCcw,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ReactLenis, useLenis } from "@studio-freight/react-lenis";

type TabType = "home" | "files" | "exam" | "exam-results" | "skim-sync";

interface StudyFile {
  id: string;
  name: string;
  date: string;
  size: string;
  format: string;
  load: "Low" | "Medium" | "High";
  duration: string;
  filePath?: string;
}

type LongDocumentWarning = {
  files: StudyFile[];
  totalWordCount: number;
  longFiles: {
    name: string;
    wordCount: number;
  }[];
};

type RejectedUpload = {
  fileName: string;
  reason: string;
};

const ACCEPTED_UPLOAD_TYPES =
  ".pdf,.docx,.xlsx,.xls,.txt,image/jpeg,image/jpg,image/png,image/webp";

const IMAGE_FORMATS = ["JPG", "JPEG", "PNG", "WEBP"];

function getFileExtension(file: File) {
  const fileNameExt = file.name.split(".").pop()?.toLowerCase();

  if (fileNameExt && fileNameExt !== file.name.toLowerCase()) {
    return fileNameExt;
  }

  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf",
    "text/plain": "txt",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.ms-excel": "xls",
  };

  return mimeToExt[file.type] || "txt";
}

function getFileDisplayName(file: File, extension: string) {
  if (file.name && file.name.trim()) return file.name;

  const isImage = file.type.startsWith("image/");

  return isImage
    ? `Camera capture ${new Date().toISOString()}.${extension}`
    : `Uploaded file ${new Date().toISOString()}.${extension}`;
}

function isImageFile(file: StudyFile) {
  return IMAGE_FORMATS.includes(file.format);
}

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const lenis = useLenis();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingLength, setIsCheckingLength] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [files, setFiles] = useState<StudyFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info";
  } | null>(null);

  const [selectedFormats] = useState<string[]>([]);
  const [selectedLoads] = useState<string[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [examSelectedFiles, setExamSelectedFiles] = useState<StudyFile[]>([]);
  const [examUploadedFiles, setExamUploadedFiles] = useState<StudyFile[]>([]);
  const [skimSyncFiles, setSkimSyncFiles] = useState<StudyFile[]>([]);

  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [confidenceRating, setConfidenceRating] = useState<number | null>(null);
  const [recentlyUploaded, setRecentlyUploaded] = useState<StudyFile[]>([]);

  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [longDocumentWarning, setLongDocumentWarning] =
    useState<LongDocumentWarning | null>(null);

  const [rejectedUpload, setRejectedUpload] =
    useState<RejectedUpload | null>(null);

  const hardRefreshDashboard = () => {
    window.speechSynthesis.cancel();
    window.location.reload();
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      const {
        data: { session: activeSession },
      } = await supabase.auth.getSession();

      if (!activeSession) {
        router.push("/login");
        return;
      }

      setSession(activeSession);

      const { data: profileData } = await supabase
        .from("profile")
        .select("nickname, username")
        .eq("id", activeSession.user.id)
        .maybeSingle();

      if (profileData) setUserProfile(profileData);

      const { data: filesData } = await supabase
        .from("files")
        .select("*")
        .eq("user_id", activeSession.user.id)
        .order("created_at", { ascending: false });

      if (filesData) {
        const mappedFiles: StudyFile[] = filesData.map((f: any) => ({
          id: f.id,
          name: f.file_name,
          date: new Date(f.created_at).toISOString().split("T")[0],
          size: (f.file_size / (1024 * 1024)).toFixed(1) + " MB",
          format: String(f.file_type || "").toUpperCase(),
          load: "Medium",
          duration: "Est. 5 min",
          filePath: f.file_path,
        }));

        setFiles(mappedFiles);
      }
    };

    fetchDashboardData();
  }, [router, supabase]);

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }
  }, [activeTab, lenis]);

  const showToast = (
    message: string,
    type: "success" | "info" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const deleteStoredFile = async (file: StudyFile) => {
    try {
      const {
        data: { session: activeSession },
      } = await supabase.auth.getSession();

      if (!activeSession?.access_token) {
        throw new Error("Missing active session.");
      }

      const res = await fetch("/api/delete-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeSession.access_token}`,
        },
        body: JSON.stringify({
          fileId: file.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete rejected file.");
      }

      setFiles((prev) => prev.filter((item) => item.id !== file.id));
      setRecentlyUploaded((prev) =>
        prev.filter((item) => item.id !== file.id)
      );
      setExamSelectedFiles((prev) =>
        prev.filter((item: StudyFile) => item.id !== file.id)
      );
      setExamUploadedFiles((prev) =>
        prev.filter((item: StudyFile) => item.id !== file.id)
      );
      setSkimSyncFiles((prev) => prev.filter((item) => item.id !== file.id));
    } catch (error) {
      console.error("Delete rejected file failed:", error);
    }
  };

  const validateImageFile = async (file: StudyFile) => {
    if (!file.filePath) {
      return {
        accepted: false,
        reason:
          "This image could not be validated because the file path is missing.",
      };
    }

    try {
      const res = await fetch("/api/process-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filePath: file.filePath,
          fileType: file.format,
          validateOnly: true,
        }),
      });

      if (!res.ok) {
        return {
          accepted: false,
          reason:
            "This image could not be validated. Please upload a clearer study document.",
        };
      }

      const data = await res.json();

      if (data.accepted === false || data.rejected === true) {
        return {
          accepted: false,
          reason:
            data.rejectionReason ||
            "This image does not appear to be study material. Please upload notes, slides, textbook pages, worksheets, diagrams, or documents instead.",
        };
      }

      return {
        accepted: true,
        reason: "",
      };
    } catch (error) {
      console.error("Image validation failed:", error);

      return {
        accepted: false,
        reason:
          "This image could not be validated. Please upload notes, slides, textbook pages, worksheets, diagrams, or documents instead.",
      };
    }
  };

  const handleUploadFiles = async (
    incomingFiles: FileList | File[],
    source: "browse" | "camera" = "browse"
  ) => {
    const uploadedFilesRaw = Array.from(incomingFiles || []);

    if (!uploadedFilesRaw.length || !session) return;

    setIsUploading(true);

    showToast(
      source === "camera"
        ? "Checking captured image..."
        : `Checking ${uploadedFilesRaw.length} file(s)...`,
      "info"
    );

    const newUploads: StudyFile[] = [];

    try {
      for (const uploadedFile of uploadedFilesRaw) {
        const fileExt = getFileExtension(uploadedFile);
        const fileName = getFileDisplayName(uploadedFile, fileExt);
        const filePath = `${session.user.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, uploadedFile, {
            contentType: uploadedFile.type || "application/octet-stream",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: dbRecord, error } = await supabase
          .from("files")
          .insert({
            user_id: session.user.id,
            file_name: fileName,
            file_path: filePath,
            file_type: fileExt,
            file_size: uploadedFile.size,
          })
          .select()
          .single();

        if (error) throw error;

        const newFile: StudyFile = {
          id: dbRecord.id,
          name: dbRecord.file_name,
          date: new Date().toISOString().split("T")[0],
          size: (uploadedFile.size / 1024 / 1024).toFixed(1) + " MB",
          format: fileExt.toUpperCase(),
          load: "Medium",
          duration: "Est. 5 min",
          filePath,
        };

        if (isImageFile(newFile)) {
          const validation = await validateImageFile(newFile);

          if (!validation.accepted) {
            await deleteStoredFile(newFile);

            setRejectedUpload({
              fileName: newFile.name,
              reason: validation.reason,
            });

            continue;
          }
        }

        newUploads.push(newFile);
      }

      if (newUploads.length > 0) {
        setFiles((prev) => [...newUploads, ...prev]);
        setRecentlyUploaded(newUploads);

        showToast(
          source === "camera"
            ? "Image captured and uploaded."
            : "Upload complete."
        );
      } else {
        showToast("No valid study documents were uploaded.", "info");
      }
    } catch (err) {
      console.error(err);
      showToast("Upload failed", "info");
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleBrowseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    handleUploadFiles(e.target.files, "browse");
  };

  const handleCapturedImageUpload = async (imageBlob: Blob) => {
    const capturedFile = new File(
      [imageBlob],
      `camera-capture-${Date.now()}.jpg`,
      { type: "image/jpeg" }
    );

    await handleUploadFiles([capturedFile], "camera");
    setIsCameraOpen(false);
  };

  const startSkimSyncNow = (targetFiles: StudyFile[]) => {
    setSkimSyncFiles(targetFiles);
    setActiveTab("skim-sync");
    setRecentlyUploaded([]);
  };

  const handleStartSkimSync = async (fileOrFiles: StudyFile | StudyFile[]) => {
    const targetFiles = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];

    setIsCheckingLength(true);

    try {
      let totalWordCount = 0;

      const longFiles: {
        name: string;
        wordCount: number;
      }[] = [];

      const validFiles: StudyFile[] = [];

      for (const file of targetFiles) {
        if (!file.filePath) continue;

        if (isImageFile(file)) {
          const validation = await validateImageFile(file);

          if (!validation.accepted) {
            await deleteStoredFile(file);

            setRejectedUpload({
              fileName: file.name,
              reason: validation.reason,
            });

            continue;
          }

          validFiles.push(file);
          continue;
        }

        const res = await fetch("/api/process-document", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filePath: file.filePath,
            fileType: file.format,
            checkOnly: true,
          }),
        });

        if (!res.ok) {
          console.error("Could not check document length:", file.name);
          validFiles.push(file);
          continue;
        }

        const data = await res.json();

        if (data.accepted === false || data.rejected === true) {
          await deleteStoredFile(file);

          setRejectedUpload({
            fileName: file.name,
            reason:
              data.rejectionReason ||
              "This file does not appear to be valid study material.",
          });

          continue;
        }

        validFiles.push(file);

        if (typeof data.wordCount === "number") {
          totalWordCount += data.wordCount;

          if (data.wordCount > 500) {
            longFiles.push({
              name: file.name,
              wordCount: data.wordCount,
            });
          }
        }
      }

      if (validFiles.length === 0) {
        showToast("No valid study documents were selected.", "info");
        return;
      }

      if (totalWordCount > 500 || longFiles.length > 0) {
        setLongDocumentWarning({
          files: validFiles,
          totalWordCount,
          longFiles,
        });

        return;
      }

      startSkimSyncNow(validFiles);
    } catch (error) {
      console.error("Length check failed:", error);
      startSkimSyncNow(targetFiles);
    } finally {
      setIsCheckingLength(false);
    }
  };

  const handleConfirmLongDocument = () => {
    if (!longDocumentWarning) return;

    startSkimSyncNow(longDocumentWarning.files);
    setLongDocumentWarning(null);
  };

  const handleCancelLongDocument = () => {
    setLongDocumentWarning(null);
  };

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
  };

  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      const matchesSearch = f.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesFormat =
        selectedFormats.length === 0 || selectedFormats.includes(f.format);

      const matchesLoad =
        selectedLoads.length === 0 || selectedLoads.includes(f.load);

      return matchesSearch && matchesFormat && matchesLoad;
    });
  }, [files, searchQuery, selectedFormats, selectedLoads]);

  if (activeTab === "skim-sync" && skimSyncFiles.length > 0) {
    return (
      <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
        <style>{`
          ::-webkit-scrollbar { display: none; }
          * { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        <div className="relative min-h-screen overflow-hidden bg-white font-sans text-gray-900">
          <nav className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-gray-100 bg-white px-4 py-4 sm:px-6 md:px-12 md:py-5">
            <div className="flex min-w-0 items-center gap-4 sm:gap-6">
              <div className="flex w-20 shrink-0 items-center md:w-24">
                <img
                  src="/images/logo.png"
                  alt="Echo Logo"
                  className="h-auto w-full object-contain"
                  style={{
                    filter:
                      "invert(18%) sepia(88%) saturate(4535%) hue-rotate(262deg) brightness(82%) contrast(92%)",
                  }}
                />
              </div>

              <div className="hidden h-4 w-px bg-gray-200 sm:block" />

              <button
                onClick={hardRefreshDashboard}
                className="flex items-center gap-2 truncate text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
              >
                <Home size={16} />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="flex shrink-0 items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-red-500"
            >
              <LogOut size={16} />
            </button>
          </nav>

          <main className="relative px-4 py-6 sm:px-6 md:p-8 lg:p-12">
            <SkimSyncView files={skimSyncFiles} onBack={hardRefreshDashboard} />
          </main>
        </div>
      </ReactLenis>
    );
  }

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      <style>{`
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="relative flex min-h-screen flex-col bg-gray-50 font-sans text-gray-900 selection:bg-gray-200">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleBrowseUpload}
          className="hidden"
          accept={ACCEPTED_UPLOAD_TYPES}
          multiple
        />

        <AnimatePresence>
          {isCameraOpen && (
            <CameraCaptureModal
              onClose={() => setIsCameraOpen(false)}
              onCapture={handleCapturedImageUpload}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {longDocumentWarning && (
            <LongDocumentWarningModal
              totalWordCount={longDocumentWarning.totalWordCount}
              longFiles={longDocumentWarning.longFiles}
              onCancel={handleCancelLongDocument}
              onProceed={handleConfirmLongDocument}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {rejectedUpload && (
            <RejectedUploadModal
              fileName={rejectedUpload.fileName}
              reason={rejectedUpload.reason}
              onClose={() => setRejectedUpload(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-5 left-4 right-4 z-50 flex items-center gap-3 rounded-xl bg-[#5A22C3] px-4 py-4 text-white shadow-lg sm:bottom-8 sm:left-auto sm:right-8 sm:max-w-md sm:px-6"
            >
              <CheckCircle2 size={18} className="shrink-0 text-[#F3E8FF]" />

              <span className="min-w-0 flex-1 text-sm font-medium tracking-tight">
                {toast.message}
              </span>

              <button
                onClick={() => setToast(null)}
                className="shrink-0 text-white/70 transition-colors hover:text-white"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {recentlyUploaded.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -20, x: "-50%" }}
              className="fixed left-1/2 top-20 z-50 w-[calc(100%-2rem)] max-w-2xl rounded-2xl border border-gray-200 bg-white p-5 shadow-xl sm:top-24 sm:p-6"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <Sparkles className="shrink-0 text-[#5A22C3]" size={18} />

                    <h3 className="truncate text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
                      What should we do with{" "}
                      {recentlyUploaded.length > 1
                        ? "these files"
                        : "this file"}
                      ?
                    </h3>
                  </div>

                  <p className="line-clamp-2 text-sm text-gray-500">
                    {recentlyUploaded.length > 1
                      ? `You just uploaded ${recentlyUploaded.length} files.`
                      : `You just uploaded ${recentlyUploaded[0].name}.`}
                  </p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
                  <button
                    onClick={() => setRecentlyUploaded([])}
                    className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                  >
                    Dismiss
                  </button>

                  <button
                    onClick={() => handleStartSkimSync(recentlyUploaded)}
                    disabled={isCheckingLength}
                    className="rounded-lg bg-[#5A22C3] px-6 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-[#4a1ca3] disabled:bg-gray-300"
                  >
                    {isCheckingLength
                      ? "Checking..."
                      : recentlyUploaded.length > 1
                      ? "Combine & Skim-Sync"
                      : "Start Skim-Sync"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="sticky top-0 z-40 flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-4 sm:px-6 md:px-10">
          <div className="flex w-20 items-center md:w-24">
            <img
              src="/images/logo.png"
              alt="Echo Logo"
              className="h-auto w-full object-contain"
              style={{
                filter:
                  "invert(18%) sepia(88%) saturate(4535%) hue-rotate(262deg) brightness(82%) contrast(92%)",
              }}
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-600 transition-all hover:border-[#5A22C3] hover:bg-gray-50 hover:text-[#5A22C3]"
            >
              {userProfile?.nickname?.charAt(0)?.toUpperCase() || "U"}
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsProfileOpen(false)}
                  />

                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 z-20 mt-3 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
                  >
                    <div className="mb-1 border-b border-gray-100 bg-gray-50/50 px-4 py-3">
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        Account
                      </p>

                      <p className="mt-1 truncate text-sm font-medium text-gray-900">
                        {userProfile?.nickname ||
                          session?.user?.email ||
                          "User"}
                      </p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-gray-50"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <aside className="z-30 flex w-full shrink-0 flex-col overflow-x-auto border-b border-gray-200 bg-white p-3 md:w-64 md:overflow-hidden md:border-b-0 md:border-r md:p-6">
            <nav className="flex min-w-max gap-1 md:min-w-0 md:flex-col">
              <SidebarItem
                icon={<Home size={16} />}
                label="Home"
                active={activeTab === "home"}
                onClick={() => setActiveTab("home")}
              />

              <SidebarItem
                icon={<Files size={16} />}
                label="All files"
                active={activeTab === "files"}
                onClick={() => setActiveTab("files")}
              />

              <SidebarItem
                icon={<BrainCircuit size={16} />}
                label="Exam Mode"
                active={activeTab === "exam"}
                onClick={() => setActiveTab("exam")}
              />
            </nav>
          </aside>

          <main
            className="relative min-h-0 flex-1 p-4 sm:p-6 md:p-8 lg:p-12"
            ref={scrollContainerRef}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {activeTab === "home" && (
                  <HomeView
                    files={files}
                    isUploading={isUploading}
                    isCheckingLength={isCheckingLength}
                    onBrowse={() => fileInputRef.current?.click()}
                    onCapture={() => setIsCameraOpen(true)}
                    onStartSkimSync={handleStartSkimSync}
                  />
                )}

                {activeTab === "files" && (
                  <FilesView
                    files={filteredFiles}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onStartSkimSync={handleStartSkimSync}
                    isCheckingLength={isCheckingLength}
                  />
                )}

                {activeTab === "exam" && (
                  <ExamView
                    files={files}
                    selectedFiles={examSelectedFiles}
                    setSelectedFiles={setExamSelectedFiles}
                    uploadedFiles={examUploadedFiles}
                    setUploadedFiles={setExamUploadedFiles}
                    onViewBriefs={() => setActiveTab("exam-results")}
                    onBrowse={() => fileInputRef.current?.click()}
                    onCapture={() => setIsCameraOpen(true)}
                  />
                )}

                {activeTab === "exam-results" && (
                  <PostBriefView
                    selectedFiles={examSelectedFiles}
                    flippedCards={flippedCards}
                    setFlippedCards={setFlippedCards}
                    confidenceRating={confidenceRating}
                    setConfidenceRating={setConfidenceRating}
                    onBack={() => setActiveTab("exam")}
                    onAction={showToast}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </ReactLenis>
  );
}

function CameraCaptureModal({
  onClose,
  onCapture,
}: {
  onClose: () => void;
  onCapture: (imageBlob: Blob) => Promise<void>;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraReady(false);
  };

  const startCamera = async (mode: "environment" | "user") => {
    try {
      setCameraError(null);
      setIsCameraReady(false);

      stopCamera();

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera access is not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: mode,
          },
          width: {
            ideal: 1920,
          },
          height: {
            ideal: 1080,
          },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraReady(true);
      }
    } catch (error: any) {
      console.error("Camera error:", error);

      if (error?.name === "NotAllowedError") {
        setCameraError(
          "Camera permission was blocked. Please allow camera access in your browser."
        );
      } else if (error?.name === "NotFoundError") {
        setCameraError("No camera was found on this device.");
      } else if (error?.name === "NotReadableError") {
        setCameraError(
          "The camera is already being used by another app or browser tab."
        );
      } else {
        setCameraError("Could not open the camera. Please try again.");
      }
    }
  };

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const handleSwitchCamera = () => {
    setFacingMode((current) =>
      current === "environment" ? "user" : "environment"
    );
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) return;

    try {
      setIsCapturing(true);

      const video = videoRef.current;
      const canvas = canvasRef.current;

      const videoWidth = video.videoWidth || 1280;
      const videoHeight = video.videoHeight || 720;

      canvas.width = videoWidth;
      canvas.height = videoHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Could not create canvas context.");
      }

      context.drawImage(video, 0, 0, videoWidth, videoHeight);

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            setCameraError("Could not capture image. Please try again.");
            setIsCapturing(false);
            return;
          }

          try {
            await onCapture(blob);
          } catch (error) {
            console.error("Capture upload error:", error);
            setCameraError("The image was captured but could not be uploaded.");
          } finally {
            setIsCapturing(false);
          }
        },
        "image/jpeg",
        0.92
      );
    } catch (error) {
      console.error("Capture error:", error);
      setCameraError("Could not capture image. Please try again.");
      setIsCapturing(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
              Capture study material
            </h2>

            <p className="mt-0.5 text-xs leading-relaxed text-gray-500 sm:text-sm">
              Take a photo of notes, slides, books, or whiteboard content.
            </p>
          </div>

          <button
            onClick={handleClose}
            disabled={isCapturing}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative min-h-[280px] flex-1 bg-gray-950 sm:min-h-[360px]">
          {cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <Camera size={42} className="mb-4 text-white/40" />

              <p className="mb-2 font-medium text-white">Camera unavailable</p>

              <p className="max-w-md text-sm text-white/60">{cameraError}</p>

              <button
                onClick={() => startCamera(facingMode)}
                className="mt-6 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full max-h-[58vh] min-h-[280px] w-full object-cover sm:min-h-[360px]"
              />

              {!isCameraReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.4,
                      ease: "linear",
                    }}
                    className="mb-4"
                  >
                    <Camera size={36} className="text-white/50" />
                  </motion.div>

                  <p className="text-sm text-white/70">Opening camera...</p>
                </div>
              )}
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex shrink-0 flex-col gap-3 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <button
            onClick={handleSwitchCamera}
            disabled={isCapturing}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#5A22C3] disabled:opacity-50 sm:w-auto"
          >
            <RefreshCcw size={16} />
            Switch Camera
          </button>

          <div className="flex w-full items-center gap-3 sm:w-auto">
            <button
              onClick={handleClose}
              disabled={isCapturing}
              className="flex-1 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50 sm:flex-none"
            >
              Cancel
            </button>

            <button
              onClick={handleCapture}
              disabled={!isCameraReady || isCapturing || !!cameraError}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#5A22C3] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4a1ca3] disabled:bg-gray-300 sm:flex-none"
            >
              <Camera size={16} />
              {isCapturing ? "Checking..." : "Capture Image"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function LongDocumentWarningModal({
  totalWordCount,
  longFiles,
  onCancel,
  onProceed,
}: {
  totalWordCount: number;
  longFiles: {
    name: string;
    wordCount: number;
  }[];
  onCancel: () => void;
  onProceed: () => void;
}) {
  const hasMultipleLongFiles = longFiles.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.96 }}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#F3E8FF] text-[#5A22C3]">
          <AlertTriangle size={22} />
        </div>

        <h2 className="mb-2 text-xl font-semibold tracking-tight text-gray-900">
          {hasMultipleLongFiles
            ? "These documents are quite long"
            : "This document is quite long"}
        </h2>

        <p className="text-sm leading-relaxed text-gray-500">
          {hasMultipleLongFiles
            ? "These documents may feel overwhelming to review all at once. Do you still want to continue?"
            : "This document may feel overwhelming to review all at once. Do you still want to continue?"}
        </p>

        {totalWordCount > 0 && (
          <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Estimated length
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {totalWordCount.toLocaleString()} words
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Echo recommends extra confirmation for documents over 500 words.
            </p>
          </div>
        )}

        {longFiles.length > 0 && (
          <div className="mt-4 max-h-36 overflow-y-auto rounded-xl border border-gray-100">
            {longFiles.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between gap-3 border-b border-gray-100 px-3 py-2 last:border-b-0"
              >
                <span className="truncate text-xs font-medium text-gray-700">
                  {file.name}
                </span>

                <span className="shrink-0 text-xs text-gray-400">
                  {file.wordCount.toLocaleString()} words
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onCancel}
            className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={onProceed}
            className="rounded-lg bg-[#5A22C3] px-5 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-[#4a1ca3]"
          >
            Continue Anyway
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function RejectedUploadModal({
  fileName,
  reason,
  onClose,
}: {
  fileName: string;
  reason: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.96 }}
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertTriangle size={22} />
        </div>

        <h2 className="mb-2 text-xl font-semibold tracking-tight text-gray-900">
          Only study documents are accepted
        </h2>

        <p className="text-sm leading-relaxed text-gray-500">
          {reason ||
            "This image does not appear to be study material. Please upload notes, slides, textbook pages, worksheets, diagrams, whiteboard content, or documents instead."}
        </p>

        <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Removed file
          </p>

          <p className="mt-1 truncate text-sm font-medium text-gray-800">
            {fileName}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            This file was removed from your vault.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-[#5A22C3] px-5 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-[#4a1ca3]"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SkimSyncView({
  files,
  onBack,
}: {
  files: StudyFile[];
  onBack: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [aiScript, setAiScript] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lyricsScrollRef = useRef<HTMLDivElement | null>(null);
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  const fallbackTimerRef = useRef<number | null>(null);
  const speechStartedAtRef = useRef<number>(0);
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedTimeRef = useRef<number>(0);
  const boundaryHasWorkedRef = useRef(false);

  const displayTitle =
    files.length > 1
      ? `Combined Skim-Sync (${files.length} Files)`
      : files[0]?.name;

  const stopFallbackTimer = () => {
    if (fallbackTimerRef.current !== null) {
      window.clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  };

  const resetSpeechTracking = () => {
    stopFallbackTimer();
    speechStartedAtRef.current = 0;
    pausedAtRef.current = null;
    totalPausedTimeRef.current = 0;
    boundaryHasWorkedRef.current = false;
    setCurrentCharIndex(0);
  };

  useEffect(() => {
    const fetchScript = async () => {
      try {
        setIsLoading(true);
        setIsPlaying(false);
        resetSpeechTracking();
        window.speechSynthesis.cancel();

        let combinedScript = "";

        for (const file of files) {
          if (!file.filePath) continue;

          const res = await fetch("/api/process-document", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              filePath: file.filePath,
              fileType: file.format,
              skipLongDocumentCheck: true,
            }),
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => null);
            console.error("Server returned an error:", res.status, errorData);
            combinedScript += `I could not process ${file.name}. `;
            continue;
          }

          const data = await res.json();

          if (data.accepted === false || data.rejected === true) {
            combinedScript += `I could not process ${file.name} because it is not valid study material. `;
            continue;
          }

          combinedScript += `${data.script || ""} `;
        }

        setAiScript(combinedScript.trim() || "Could not generate summary.");
      } catch (err) {
        console.error("Fetch failed:", err);
        setAiScript("Error connecting to the AI processing server.");
      } finally {
        setIsLoading(false);
      }
    };

    if (files && files.length > 0) {
      fetchScript();
    } else {
      setIsLoading(false);
    }

    return () => {
      stopFallbackTimer();
      window.speechSynthesis.cancel();
    };
  }, [files]);

  useEffect(() => {
    return () => {
      stopFallbackTimer();
      window.speechSynthesis.cancel();
    };
  }, []);

  const lyricWords = useMemo(() => {
    const matches = [...aiScript.matchAll(/\S+/g)];

    return matches.map((match, index) => ({
      id: index,
      text: match[0],
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
    }));
  }, [aiScript]);

  const currentWordIndex = useMemo(() => {
    if (!lyricWords.length) return 0;

    const activeIndex = lyricWords.findIndex(
      (word) => currentCharIndex >= word.start && currentCharIndex <= word.end
    );

    if (activeIndex !== -1) return activeIndex;

    let nearestPastIndex = 0;

    for (let i = 0; i < lyricWords.length; i++) {
      if (currentCharIndex >= lyricWords[i].end) nearestPastIndex = i;
    }

    return Math.max(0, nearestPastIndex);
  }, [lyricWords, currentCharIndex]);

  const lyricLines = useMemo(() => {
    const lines: Array<typeof lyricWords> = [];

    for (let i = 0; i < lyricWords.length; i += 4) {
      lines.push(lyricWords.slice(i, i + 4));
    }

    return lines;
  }, [lyricWords]);

  const activeLineIndex = Math.floor(currentWordIndex / 4);

  useEffect(() => {
    const container = lyricsScrollRef.current;
    const activeLine = activeLineRef.current;

    if (!container || !activeLine) return;

    const targetTop =
      activeLine.offsetTop -
      container.clientHeight / 2 +
      activeLine.clientHeight / 2;

    container.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth",
    });
  }, [activeLineIndex]);

  const progress =
    lyricWords.length > 0
      ? Math.min(
          100,
          Math.round(((currentWordIndex + 1) / lyricWords.length) * 100)
        )
      : 0;

  const startFallbackTimer = () => {
    stopFallbackTimer();

    if (!lyricWords.length || !aiScript) return;

    speechStartedAtRef.current = Date.now();
    pausedAtRef.current = null;
    totalPausedTimeRef.current = 0;

    const estimatedWordsPerMinute = 150;
    const estimatedWordsPerSecond = estimatedWordsPerMinute / 60;

    fallbackTimerRef.current = window.setInterval(() => {
      if (!window.speechSynthesis.speaking || window.speechSynthesis.paused) {
        return;
      }

      const elapsedSeconds =
        (Date.now() -
          speechStartedAtRef.current -
          totalPausedTimeRef.current) /
        1000;

      const estimatedWordIndex = Math.min(
        lyricWords.length - 1,
        Math.floor(elapsedSeconds * estimatedWordsPerSecond)
      );

      const estimatedWord = lyricWords[estimatedWordIndex];

      if (!estimatedWord) return;

      if (!boundaryHasWorkedRef.current) {
        setCurrentCharIndex(estimatedWord.start);
      }
    }, 250);
  };

  const handlePause = () => {
    if (!isPlaying) return;

    pausedAtRef.current = Date.now();
    window.speechSynthesis.pause();
    setIsPlaying(false);
  };

  const handleResume = () => {
    if (pausedAtRef.current) {
      totalPausedTimeRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }

    window.speechSynthesis.resume();
    setIsPlaying(true);
  };

  const handleFreshPlay = () => {
    window.speechSynthesis.cancel();
    resetSpeechTracking();

    const utterance = new SpeechSynthesisUtterance(aiScript);

    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsPlaying(true);
      startFallbackTimer();
    };

    utterance.onboundary = (event) => {
      if (typeof event.charIndex === "number" && event.charIndex >= 0) {
        boundaryHasWorkedRef.current = true;
        setCurrentCharIndex(event.charIndex);
      }
    };

    utterance.onpause = () => {
      if (!pausedAtRef.current) {
        pausedAtRef.current = Date.now();
      }

      setIsPlaying(false);
    };

    utterance.onresume = () => {
      if (pausedAtRef.current) {
        totalPausedTimeRef.current += Date.now() - pausedAtRef.current;
        pausedAtRef.current = null;
      }

      setIsPlaying(true);
    };

    utterance.onend = () => {
      stopFallbackTimer();
      setIsPlaying(false);
      setCurrentCharIndex(aiScript.length);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      stopFallbackTimer();
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const togglePlay = () => {
    if (!aiScript || isLoading) return;

    if (isPlaying) {
      handlePause();
      return;
    }

    if (window.speechSynthesis.paused) {
      handleResume();
      return;
    }

    handleFreshPlay();
  };

  return (
    <div className="relative mx-auto max-w-[1180px] pb-28 sm:pb-32">
      <header className="mb-5 flex flex-col gap-4 lg:mb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500"
          >
            <AudioLines size={14} className="text-[#5A22C3]" />
            Lyric Summary Mode
          </motion.div>

          <h1 className="break-words text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
            {displayTitle}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
            Your summary appears in short spoken phrases while Echo reads it
            aloud.
          </p>
        </div>

        <button
          onClick={onBack}
          className="w-fit rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#5A22C3]"
        >
          Close Session
        </button>
      </header>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12 lg:gap-6">
        <section className="lg:col-span-4">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="relative mb-5 mt-1 flex h-40 w-40 items-center justify-center sm:h-52 sm:w-52 lg:h-56 lg:w-56">
                <motion.div
                  animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute h-36 w-36 rounded-full border border-dashed border-[#5A22C3]/30 sm:h-48 sm:w-48 lg:h-52 lg:w-52"
                />

                <motion.div
                  animate={isPlaying ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute h-40 w-40 rounded-full border border-[#5A22C3]/10 sm:h-52 sm:w-52 lg:h-56 lg:w-56"
                />

                <div className="absolute h-32 w-32 rounded-full bg-white sm:h-40 sm:w-40 lg:h-44 lg:w-44" />

                <motion.div
                  animate={
                    isPlaying ? { scale: [1, 1.02, 0.98, 1] } : { scale: 1 }
                  }
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative flex h-28 w-28 items-center justify-center rounded-full border border-[#5A22C3]/20 bg-[#F3E8FF]/50 sm:h-36 sm:w-36 lg:h-40 lg:w-40"
                />

                <motion.div
                  animate={isPlaying ? { rotate: -360 } : { rotate: 0 }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-5 rounded-full border border-[#5A22C3]/20"
                />

                <Mic2
                  className={`absolute z-10 h-9 w-9 transition-colors sm:h-11 sm:w-11 ${
                    isPlaying ? "text-[#5A22C3]" : "text-gray-400"
                  }`}
                />
              </div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-700">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isPlaying ? "animate-pulse bg-green-500" : "bg-gray-400"
                  }`}
                />

                {isLoading ? "Preparing" : isPlaying ? "Speaking" : "Ready"}
              </div>

              <h2 className="text-lg font-semibold text-gray-900">
                {isPlaying ? "Echo is live" : "Press play to start"}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {files.length > 1
                  ? `Synthesizing ${files.length} sources`
                  : isImageFile(files[0])
                  ? "AI voice summary loaded from your image"
                  : "AI voice summary loaded from your document"}
              </p>

              <div className="mt-5 grid w-full grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-left">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#5A22C3]">
                    Words
                  </p>

                  <p className="text-lg font-bold text-gray-900">
                    {lyricWords.length}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-left">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#5A22C3]">
                    Progress
                  </p>

                  <p className="text-lg font-bold text-gray-900">{progress}%</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-8">
          <div className="relative flex min-h-[430px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:min-h-[468px]">
            {isLoading ? (
              <div className="flex min-h-[390px] flex-1 flex-col items-center justify-center text-center text-gray-400">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "linear",
                  }}
                >
                  <BrainCircuit size={40} className="mb-6 text-[#5A22C3]/50" />
                </motion.div>

                <p className="text-base font-medium text-gray-600 sm:text-lg">
                  AI is reading and parsing your file...
                </p>

                <p className="mt-2 text-sm text-gray-400">
                  Your lyric summary will appear here.
                </p>
              </div>
            ) : (
              <>
                <div className="flex shrink-0 items-center justify-between gap-4 pb-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#5A22C3]/20 bg-[#F3E8FF] text-[#5A22C3]">
                      <Wand2 size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Now Showing
                      </p>

                      <p className="truncate text-sm font-medium text-gray-700">
                        Auto-scrolling lyric phrases
                      </p>
                    </div>
                  </div>

                  <div className="hidden rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:block">
                    Line {Math.min(activeLineIndex + 1, lyricLines.length)} /{" "}
                    {Math.max(lyricLines.length, 1)}
                  </div>
                </div>

                <div className="h-[280px] overflow-hidden rounded-2xl border border-[#5A22C3]/5 bg-[#F3E8FF]/10 sm:h-[300px] lg:h-[302px]">
                  <div
                    ref={lyricsScrollRef}
                    className="h-full w-full overflow-y-auto px-2 py-10 text-center sm:px-4 sm:py-12"
                    style={{
                      WebkitOverflowScrolling: "touch",
                    }}
                  >
                    <div className="flex flex-col gap-4 sm:gap-5">
                      {lyricLines.length > 0 ? (
                        lyricLines.map((line, lineIndex) => {
                          const isActiveLine = lineIndex === activeLineIndex;
                          const isPastLine = lineIndex < activeLineIndex;

                          return (
                            <motion.div
                              key={lineIndex}
                              ref={isActiveLine ? activeLineRef : undefined}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{
                                opacity: isActiveLine
                                  ? 1
                                  : isPastLine
                                  ? 0.28
                                  : 0.18,
                                y: 0,
                                scale: isActiveLine ? 1 : 0.96,
                              }}
                              transition={{
                                duration: 0.25,
                                ease: "easeOut",
                              }}
                              className={`rounded-2xl px-3 py-4 transition-colors sm:px-6 sm:py-5 ${
                                isActiveLine
                                  ? "border border-[#5A22C3]/10 bg-white shadow-sm"
                                  : "border border-transparent"
                              }`}
                            >
                              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 sm:gap-x-3 sm:gap-y-2">
                                {line.map((word) => {
                                  const hasBeenSpoken =
                                    word.id <= currentWordIndex;
                                  const isCurrent =
                                    word.id === currentWordIndex;

                                  return (
                                    <span
                                      key={`${word.id}-${word.text}`}
                                      className={`inline-block font-semibold leading-tight transition-colors ${
                                        isActiveLine
                                          ? "text-2xl sm:text-4xl lg:text-5xl"
                                          : "text-lg sm:text-2xl"
                                      } ${
                                        isCurrent
                                          ? "text-[#5A22C3]"
                                          : hasBeenSpoken
                                          ? "text-gray-800"
                                          : "text-gray-400"
                                      }`}
                                    >
                                      {word.text}
                                    </span>
                                  );
                                })}
                              </div>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="flex h-full items-center justify-center px-4 text-sm text-gray-500">
                          No lyric summary was generated for this file.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pt-4">
                  <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-[#5A22C3]">
                    <span>Summary Flow</span>
                    <span>{progress}%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <motion.div
                      className="h-full rounded-full bg-[#5A22C3]"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-[400px] -translate-x-1/2 sm:bottom-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-xl">
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <button
              disabled={isLoading}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-[#F3E8FF] hover:text-[#5A22C3] disabled:opacity-40"
            >
              <SkipBack size={20} className="fill-current" />
            </button>

            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#5A22C3] text-white shadow-md transition-colors hover:bg-[#4a1ca3] disabled:bg-gray-300"
            >
              {isPlaying ? (
                <Pause size={22} fill="white" />
              ) : (
                <Play size={22} fill="white" className="ml-1" />
              )}
            </button>

            <button
              disabled={isLoading}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-[#F3E8FF] hover:text-[#5A22C3] disabled:opacity-40"
            >
              <SkipForward size={20} className="fill-current" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200 md:w-full ${
        active
          ? "bg-[#F3E8FF] font-medium text-[#5A22C3]"
          : "text-gray-500 hover:bg-gray-50 hover:text-[#5A22C3]"
      }`}
    >
      {icon}
      <span className="whitespace-nowrap text-[14px]">{label}</span>
    </button>
  );
}

function ExamView({
  files,
  selectedFiles,
  setSelectedFiles,
  uploadedFiles,
  onViewBriefs,
  onBrowse,
  onCapture,
}: any) {
  const allFiles = [...files, ...uploadedFiles];

  const toggleFileSelection = (file: StudyFile) => {
    setSelectedFiles((prev: StudyFile[]) => {
      if (prev.some((f: StudyFile) => f.id === file.id)) {
        return prev.filter((f: StudyFile) => f.id !== file.id);
      }

      return [...prev, file];
    });
  };

  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <header className="mb-8">
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Exam Mode
        </h1>

        <p className="text-sm text-gray-500">
          {selectedFiles.length === 0
            ? "Select, upload, or capture study materials to generate study briefs"
            : `${selectedFiles.length} documents selected`}
        </p>
      </header>

      <div className="mb-10 flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:border-[#5A22C3] hover:bg-[#F3E8FF]/30 sm:p-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-[#5A22C3] transition-colors">
          <Upload size={20} />
        </div>

        <h3 className="mb-1 text-lg font-medium">Upload Study Materials</h3>

        <p className="mb-5 text-center text-sm text-gray-500">
          Use PDFs, Word Docs, notes, screenshots, or camera captures.
        </p>

        <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <button
            onClick={onBrowse}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#5A22C3] px-5 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-[#4a1ca3] sm:w-auto"
          >
            <FolderOpen size={16} />
            Browse Files
          </button>

          <button
            onClick={onCapture}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50 hover:text-[#5A22C3] sm:w-auto"
          >
            <Camera size={16} />
            Use Camera
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Layers size={18} className="text-[#5A22C3]" />
          Available Vault
        </h2>

        <AnimatePresence>
          {selectedFiles.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              onClick={onViewBriefs}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#5A22C3] px-4 py-2 text-sm font-medium text-white shadow-md transition-colors hover:bg-[#4a1ca3]"
            >
              <Sparkles size={16} />
              Generate Flashcards
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {allFiles.map((file: StudyFile) => (
          <ExamFileRow
            key={file.id}
            file={file}
            isSelected={selectedFiles.some((f: StudyFile) => f.id === file.id)}
            onSelect={() => toggleFileSelection(file)}
          />
        ))}
      </div>
    </div>
  );
}

function ExamFileRow({
  file,
  isSelected,
  onSelect,
}: {
  file: StudyFile;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border bg-white p-4 transition-colors ${
        isSelected
          ? "border-[#5A22C3] bg-[#F3E8FF]/30"
          : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={onSelect}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
            isSelected ? "border-[#5A22C3] bg-[#5A22C3]" : "border-gray-300"
          }`}
        >
          {isSelected && <CheckCircle2 size={14} className="text-white" />}
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
          {isImageFile(file) ? (
            <ImageIcon
              size={18}
              className={isSelected ? "text-[#5A22C3]" : ""}
            />
          ) : (
            <FileText
              size={18}
              className={isSelected ? "text-[#5A22C3]" : ""}
            />
          )}
        </div>

        <div className="min-w-0">
          <h4
            className={`mb-0.5 truncate text-[14px] font-medium ${
              isSelected ? "text-[#5A22C3]" : "text-gray-900"
            }`}
          >
            {file.name}
          </h4>

          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-gray-500">
            <span>{file.format}</span>
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            <span>{file.date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const generateHighlights = (file: StudyFile) => {
  return [
    {
      type: "definition",
      title: "Key Concept",
      content: "Extracted definition from your document for " + file.name,
    },
    {
      type: "question",
      title: "Test Potential",
      content: "Focus on high-probability exam questions.",
    },
  ];
};

function PostBriefView({
  selectedFiles,
  flippedCards,
  setFlippedCards,
  onBack,
}: any) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const allHighlights = selectedFiles.flatMap((file: StudyFile) => {
    const fileHighlights = generateHighlights(file);

    return fileHighlights
      .filter((h: any) => h.type === "definition")
      .map((h: any) => ({
        ...h,
        fileId: file.id,
        fileName: file.name,
      }));
  });

  const toggleFlip = (index: number) => {
    const newFlipped = new Set(flippedCards);

    if (newFlipped.has(index)) newFlipped.delete(index);
    else newFlipped.add(index);

    setFlippedCards(newFlipped);
  };

  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Study Session Active
          </h1>

          <p className="text-sm text-gray-500">Master your extracted insights</p>
        </div>

        <button
          onClick={onBack}
          className="w-fit rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#5A22C3]"
        >
          End Session
        </button>
      </header>

      <div className="mb-12 flex flex-col items-center">
        <p className="mb-6 text-xs font-medium uppercase tracking-wider text-[#5A22C3]">
          Tap card to flip
        </p>

        {allHighlights.length > 0 ? (
          <div className="flex w-full max-w-2xl flex-col items-center">
            <div className="perspective mb-8 w-full">
              <motion.div
                onClick={() => toggleFlip(currentCardIndex)}
                className="preserve-3d relative h-[320px] w-full cursor-pointer transition-transform duration-500 ease-out sm:h-[350px]"
                animate={{
                  rotateY: flippedCards.has(currentCardIndex) ? 180 : 0,
                }}
              >
                <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-md transition-colors hover:border-[#5A22C3]/50 sm:p-10">
                  <div className="text-xl font-semibold text-gray-900 sm:text-2xl">
                    {allHighlights[currentCardIndex].title}
                  </div>

                  <div className="absolute bottom-6 text-xs font-medium uppercase tracking-wider text-gray-400">
                    Front
                  </div>
                </div>

                <div className="backface-hidden rotate-y-180 absolute inset-0 flex transform flex-col items-center justify-center rounded-2xl bg-[#5A22C3] p-8 text-center shadow-md sm:p-10">
                  <div className="text-lg font-medium leading-relaxed text-white sm:text-xl">
                    {allHighlights[currentCardIndex].content}
                  </div>

                  <div className="absolute bottom-6 text-xs font-medium uppercase tracking-wider text-white/50">
                    Back
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center gap-4 rounded-full border border-gray-200 bg-white p-2 shadow-sm">
              <button
                onClick={() =>
                  setCurrentCardIndex(Math.max(0, currentCardIndex - 1))
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-700 transition-colors hover:bg-[#F3E8FF] hover:text-[#5A22C3]"
              >
                <SkipBack size={16} />
              </button>

              <span className="min-w-[3rem] text-center text-sm font-medium text-gray-500">
                {currentCardIndex + 1} / {allHighlights.length}
              </span>

              <button
                onClick={() =>
                  setCurrentCardIndex(
                    Math.min(allHighlights.length - 1, currentCardIndex + 1)
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5A22C3] text-white shadow-sm transition-colors hover:bg-[#4a1ca3]"
              >
                <SkipForward size={16} />
              </button>
            </div>
          </div>
        ) : (
          <p className="py-12 text-center font-medium text-gray-500">
            No definitions extracted from these files.
          </p>
        )}
      </div>
    </div>
  );
}

function FilesView({
  files,
  searchQuery,
  setSearchQuery,
  onStartSkimSync,
  isCheckingLength,
}: any) {
  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Vault
          </h1>

          <p className="text-sm text-gray-500">
            {files.length} documents and images securely stored
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your vault..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 transition-all focus:border-[#5A22C3] focus:outline-none focus:ring-1 focus:ring-[#5A22C3]"
          />
        </div>
      </header>

      {files.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <p className="text-sm font-medium text-gray-700">No files found.</p>
          <p className="mt-1 text-sm text-gray-400">
            Upload or capture a study material first.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {files.map((file: StudyFile) => (
            <div
              key={file.id}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-[#5A22C3]/50"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F3E8FF] bg-[#F3E8FF]/50 text-[#5A22C3]">
                  {isImageFile(file) ? (
                    <ImageIcon size={18} />
                  ) : (
                    <FileText size={18} />
                  )}
                </div>

                <span className="rounded bg-gray-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                  {file.format}
                </span>
              </div>

              <h3 className="mb-1 line-clamp-2 text-[15px] font-medium leading-tight text-gray-900">
                {file.name}
              </h3>

              <div className="mb-6 mt-auto flex items-center gap-1.5 text-[12px] text-gray-500">
                <Clock size={12} />
                {file.date} • {file.size}
              </div>

              <button
                onClick={() => onStartSkimSync(file)}
                disabled={isCheckingLength}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-900 transition-colors hover:border-[#F3E8FF] hover:bg-[#F3E8FF] hover:text-[#5A22C3] disabled:opacity-50"
              >
                <Sparkles size={14} />
                {isCheckingLength ? "Checking..." : "Skim-Sync"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HomeView({
  files,
  onBrowse,
  onCapture,
  isUploading,
  isCheckingLength,
  onStartSkimSync,
}: any) {
  const isBusy = isUploading || isCheckingLength;

  return (
    <div className="mx-auto max-w-[900px]">
      <header className="mb-8 text-center md:text-left">
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Welcome back.
        </h1>

        <p className="text-sm text-gray-500">
          Upload a document, browse files, or capture notes with your camera.
        </p>
      </header>

      <div className="mb-12 flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:border-[#5A22C3] hover:bg-[#F3E8FF]/30 sm:p-10">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-white transition-colors">
          <Upload
            size={24}
            className={`text-gray-600 transition-colors ${
              isBusy ? "animate-bounce" : ""
            }`}
          />
        </div>

        <h3 className="mb-1 text-lg font-medium text-gray-900">
          {isUploading
            ? "Uploading to secure vault..."
            : isCheckingLength
            ? "Checking document..."
            : "Add study material"}
        </h3>

        <p className="mb-5 max-w-md text-center text-sm text-gray-500">
          Upload PDFs, Docs, spreadsheets, text files, screenshots, or take a
          photo of study material and let Echo summarize it.
        </p>

        <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <button
            disabled={isBusy}
            onClick={onBrowse}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#5A22C3] px-5 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-[#4a1ca3] disabled:bg-gray-300 sm:w-auto"
          >
            <FolderOpen size={16} />
            Browse Files
          </button>

          <button
            disabled={isBusy}
            onClick={onCapture}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50 hover:text-[#5A22C3] disabled:opacity-50 sm:w-auto"
          >
            <Camera size={16} />
            Use Camera
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] text-gray-400">
          Camera capture only accepts study documents, notes, slides,
          whiteboards, worksheets, diagrams, and textbook pages.
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-gray-900">
          <Clock size={18} className="text-[#5A22C3]" />
          Recent Activity
        </h2>
      </div>

      {files.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
          <p className="text-sm font-medium text-gray-700">
            No recent files yet.
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Upload or capture your first study material.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {files.slice(0, 4).map((file: StudyFile) => (
            <FileRow
              key={file.id}
              file={file}
              isCheckingLength={isCheckingLength}
              onStartSkimSync={onStartSkimSync}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FileRow({
  file,
  onStartSkimSync,
  isCheckingLength,
}: {
  file: StudyFile;
  onStartSkimSync: (file: StudyFile) => void;
  isCheckingLength: boolean;
}) {
  return (
    <div className="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:border-[#5A22C3]/50">
      <div className="flex min-w-0 items-center gap-4 pr-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-gray-600 transition-colors group-hover:bg-[#F3E8FF] group-hover:text-[#5A22C3]">
          {isImageFile(file) ? <ImageIcon size={18} /> : <FileText size={18} />}
        </div>

        <div className="min-w-0">
          <h4 className="mb-0.5 truncate text-[14px] font-medium text-gray-900 transition-colors group-hover:text-[#5A22C3]">
            {file.name}
          </h4>

          <span className="text-[11px] uppercase tracking-wider text-gray-500">
            {file.format} • {file.date}
          </span>
        </div>
      </div>

      <button
        onClick={() => onStartSkimSync(file)}
        disabled={isCheckingLength}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500 shadow-sm transition-colors hover:border-[#5A22C3] hover:bg-[#5A22C3] hover:text-white disabled:opacity-50"
      >
        <Play size={14} className="ml-0.5 fill-current" />
      </button>
    </div>
  );
}
