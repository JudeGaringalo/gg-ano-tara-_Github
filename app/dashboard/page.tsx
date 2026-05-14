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

const BRAND_PURPLE = "#5A22C3";

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

  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [files, setFiles] = useState<StudyFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info";
  } | null>(null);

  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedLoads, setSelectedLoads] = useState<string[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [examSelectedFiles, setExamSelectedFiles] = useState<StudyFile[]>([]);
  const [examUploadedFiles, setExamUploadedFiles] = useState<StudyFile[]>([]);
  const [skimSyncFiles, setSkimSyncFiles] = useState<StudyFile[]>([]);

  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [confidenceRating, setConfidenceRating] = useState<number | null>(null);
  const [recentlyUploaded, setRecentlyUploaded] = useState<StudyFile[]>([]);

  const [isCameraOpen, setIsCameraOpen] = useState(false);

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

  const handleUploadFiles = async (
    incomingFiles: FileList | File[],
    source: "browse" | "camera" = "browse"
  ) => {
    const uploadedFilesRaw = Array.from(incomingFiles || []);

    if (!uploadedFilesRaw.length || !session) return;

    setIsUploading(true);

    showToast(
      source === "camera"
        ? "Uploading captured image..."
        : `Uploading ${uploadedFilesRaw.length} file(s) to Supabase...`,
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

        newUploads.push(newFile);
      }

      setFiles((prev) => [...newUploads, ...prev]);
      setRecentlyUploaded(newUploads);

      showToast(
        source === "camera"
          ? "Image captured and uploaded."
          : "Upload complete."
      );
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

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleStartSkimSync = (fileOrFiles: StudyFile | StudyFile[]) => {
    const targetFiles = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];

    setSkimSyncFiles(targetFiles);
    setActiveTab("skim-sync");
    setRecentlyUploaded([]);
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

        <div className="min-h-screen bg-white font-sans text-gray-900 relative overflow-hidden">
          <nav className="sticky top-0 z-40 flex items-center justify-between px-6 md:px-12 py-5 bg-white border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-6">
              <div className="flex items-center w-20 md:w-24 h-auto">
                <img
                  src="/images/logo.png"
                  alt="Echo Logo"
                  className="w-full h-auto object-contain"
                  style={{
                    filter:
                      "invert(18%) sepia(88%) saturate(4535%) hue-rotate(262deg) brightness(82%) contrast(92%)",
                  }}
                />
              </div>

              <div className="h-4 w-[1px] bg-gray-200" />

              <button
                onClick={() => setActiveTab("home")}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2"
              >
                <Home size={16} />
                Dashboard
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-red-500 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </nav>

          <main className="p-4 sm:p-6 md:p-8 lg:p-12 relative">
            <SkimSyncView
              files={skimSyncFiles}
              onBack={() => setActiveTab("home")}
            />
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

      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col relative selection:bg-gray-200">
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
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-[#5A22C3] text-white px-6 py-4 rounded-lg shadow-sm"
            >
              <CheckCircle2 size={18} className="text-[#F3E8FF]" />

              <span className="font-medium text-sm tracking-tight">
                {toast.message}
              </span>

              <button
                onClick={() => setToast(null)}
                className="ml-4 text-white/70 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {recentlyUploaded.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl bg-white border border-gray-200 shadow-sm rounded-xl p-6"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="text-[#5A22C3]" size={18} />

                    <h3 className="font-semibold tracking-tight text-lg text-gray-900">
                      What should we do with{" "}
                      {recentlyUploaded.length > 1
                        ? "these files"
                        : "this file"}
                      ?
                    </h3>
                  </div>

                  <p className="text-sm text-gray-500">
                    {recentlyUploaded.length > 1
                      ? `You just uploaded ${recentlyUploaded.length} files.`
                      : `You just uploaded ${recentlyUploaded[0].name}.`}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => setRecentlyUploaded([])}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Dismiss
                  </button>

                  <button
                    onClick={() => handleStartSkimSync(recentlyUploaded)}
                    className="flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-[#5A22C3] hover:bg-[#4a1ca3] transition-all shadow-md"
                  >
                    {recentlyUploaded.length > 1
                      ? "Combine & Skim-Sync"
                      : "Start Skim-Sync"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="sticky top-0 z-40 flex items-center justify-between px-6 md:px-10 py-4 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center w-20 md:w-24 h-auto">
            <img
              src="/images/logo.png"
              alt="Echo Logo"
              className="w-full h-auto object-contain"
              style={{
                filter:
                  "invert(18%) sepia(88%) saturate(4535%) hue-rotate(262deg) brightness(82%) contrast(92%)",
              }}
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 font-medium text-sm border border-gray-300 hover:border-[#5A22C3] hover:text-[#5A22C3] hover:bg-gray-50 transition-all cursor-pointer bg-white"
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
                    className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-lg shadow-sm py-2 z-20 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 mb-1 bg-gray-50/50">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Account
                      </p>

                      <p className="text-sm font-medium text-gray-900 mt-1 truncate">
                        {userProfile?.nickname ||
                          session?.user?.email ||
                          "User"}
                      </p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50 transition-colors"
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

        <div className="flex flex-col md:flex-row flex-1 min-h-0">
          <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-col p-4 md:p-6 shrink-0 overflow-hidden z-30">
            <nav className="flex flex-col gap-1">
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
            className="flex-1 min-h-0 p-4 sm:p-6 md:p-8 lg:p-12 relative"
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
                    selectedFormats={selectedFormats}
                    setSelectedFormats={setSelectedFormats}
                    selectedLoads={selectedLoads}
                    setSelectedLoads={setSelectedLoads}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    onStartSkimSync={handleStartSkimSync}
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

          await onCapture(blob);
          setIsCapturing(false);
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
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-white/20"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Capture study material
            </h2>

            <p className="text-sm text-gray-500">
              Take a photo of notes, slides, books, or whiteboard content.
            </p>
          </div>

          <button
            onClick={handleClose}
            className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="bg-gray-950 relative aspect-[4/3] sm:aspect-video">
          {cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <Camera size={42} className="text-white/40 mb-4" />

              <p className="text-white font-medium mb-2">
                Camera unavailable
              </p>

              <p className="text-white/60 text-sm max-w-md">{cameraError}</p>

              <button
                onClick={() => startCamera(facingMode)}
                className="mt-6 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors"
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
                className="h-full w-full object-cover"
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

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 bg-white">
          <button
            onClick={handleSwitchCamera}
            disabled={isCapturing}
            className="w-full sm:w-auto rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#5A22C3] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <RefreshCcw size={16} />
            Switch Camera
          </button>

          <div className="flex w-full sm:w-auto items-center gap-3">
            <button
              onClick={handleClose}
              disabled={isCapturing}
              className="flex-1 sm:flex-none rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleCapture}
              disabled={!isCameraReady || isCapturing || !!cameraError}
              className="flex-1 sm:flex-none rounded-lg bg-[#5A22C3] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#4a1ca3] transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
            >
              <Camera size={16} />
              {isCapturing ? "Capturing..." : "Capture Image"}
            </button>
          </div>
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

  const displayTitle =
    files.length > 1
      ? `Combined Skim-Sync (${files.length} Files)`
      : files[0]?.name;

  useEffect(() => {
    const fetchScript = async () => {
      try {
        setIsLoading(true);

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
            }),
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => null);
            console.error("Server returned an error:", res.status, errorData);
            combinedScript += `I could not process ${file.name}. `;
            continue;
          }

          const data = await res.json();
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
  }, [files]);

  useEffect(() => {
    return () => {
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
    const lines: typeof lyricWords[] = [];

    for (let i = 0; i < lyricWords.length; i += 4) {
      lines.push(lyricWords.slice(i, i + 4));
    }

    return lines;
  }, [lyricWords]);

  const activeLineIndex = Math.floor(currentWordIndex / 4);

  const progress =
    lyricWords.length > 0
      ? Math.min(
          100,
          Math.round(((currentWordIndex + 1) / lyricWords.length) * 100)
        )
      : 0;

  const currentLine = lyricLines[activeLineIndex] || lyricLines[0] || [];
  const nextLine = lyricLines[activeLineIndex + 1] || [];
  const previousLine = lyricLines[activeLineIndex - 1] || [];

  const togglePlay = () => {
    if (!aiScript || isLoading) return;

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      return;
    }

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    } else {
      window.speechSynthesis.cancel();

      utteranceRef.current = new SpeechSynthesisUtterance(aiScript);

      utteranceRef.current.onboundary = (event) => {
        if (event.name === "word") {
          setCurrentCharIndex(event.charIndex);
        }
      };

      utteranceRef.current.onend = () => {
        setIsPlaying(false);
        setCurrentCharIndex(aiScript.length);
      };

      window.speechSynthesis.speak(utteranceRef.current);
    }

    setIsPlaying(true);
  };

  return (
    <div className="mx-auto max-w-[1180px] pb-[132px] relative">
      <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500"
          >
            <AudioLines size={14} className="text-[#5A22C3]" />
            Lyric Summary Mode
          </motion.div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            {displayTitle}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500">
            Your summary appears in short spoken phrases while Echo reads it
            aloud.
          </p>
        </div>

        <button
          onClick={onBack}
          className="w-fit rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#5A22C3] transition-colors"
        >
          Close Session
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-4">
          <div className="sticky top-28 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="relative mb-8 mt-4 flex h-64 w-64 items-center justify-center">
                <motion.div
                  animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute h-56 w-56 rounded-full border border-dashed border-[#5A22C3]/30"
                />

                <motion.div
                  animate={isPlaying ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute h-64 w-64 rounded-full border border-[#5A22C3]/10"
                />

                <div className="absolute h-[214px] w-[214px] rounded-full bg-white" />

                <motion.div
                  animate={
                    isPlaying ? { scale: [1, 1.02, 0.98, 1] } : { scale: 1 }
                  }
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative flex h-44 w-44 items-center justify-center rounded-full border border-[#5A22C3]/20 bg-[#F3E8FF]/50"
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
                  className={`absolute z-10 h-12 w-12 transition-colors ${
                    isPlaying ? "text-[#5A22C3]" : "text-gray-400"
                  }`}
                />
              </div>

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-700">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isPlaying ? "animate-pulse bg-green-500" : "bg-gray-400"
                  }`}
                />

                {isLoading ? "Preparing" : isPlaying ? "Speaking" : "Ready"}
              </div>

              <h2 className="text-xl font-semibold text-gray-900">
                {isPlaying ? "Echo is live" : "Press play to start"}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {files.length > 1
                  ? `Synthesizing ${files.length} sources`
                  : isImageFile(files[0])
                  ? "AI voice summary loaded from your image"
                  : "AI voice summary loaded from your document"}
              </p>

              <div className="mt-8 grid w-full grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-left">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#5A22C3]">
                    Words
                  </p>

                  <p className="text-xl font-bold text-gray-900">
                    {lyricWords.length}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-left">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#5A22C3]">
                    Progress
                  </p>

                  <p className="text-xl font-bold text-gray-900">{progress}%</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-8">
          <div className="relative min-h-[620px] overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
            {isLoading ? (
              <div className="relative z-10 flex min-h-[540px] flex-col items-center justify-center text-center text-gray-400">
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

                <p className="text-lg font-medium text-gray-600">
                  AI is reading and parsing your file...
                </p>

                <p className="mt-2 text-sm text-gray-400">
                  Your lyric summary will appear here.
                </p>
              </div>
            ) : (
              <div className="relative z-10 flex min-h-[540px] flex-col justify-between">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3E8FF] text-[#5A22C3] border border-[#5A22C3]/20">
                      <Wand2 size={18} />
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Now Showing
                      </p>

                      <p className="text-sm font-medium text-gray-700">
                        4-word lyric phrases
                      </p>
                    </div>
                  </div>

                  <div className="hidden rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:block">
                    Line {Math.min(activeLineIndex + 1, lyricLines.length)} /{" "}
                    {Math.max(lyricLines.length, 1)}
                  </div>
                </div>

                <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center py-10 text-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeLineIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="w-full"
                    >
                      <div className="mb-6 min-h-[32px] text-lg font-medium text-gray-300 sm:text-xl">
                        {previousLine.map((word) => word.text).join(" ")}
                      </div>

                      <div className="relative rounded-xl border border-[#5A22C3]/10 bg-[#F3E8FF]/20 px-6 py-10 sm:px-10 sm:py-14">
                        <div className="relative flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:gap-x-4">
                          {currentLine.map((word, index) => {
                            const hasBeenSpoken = word.id <= currentWordIndex;
                            const isCurrent = word.id === currentWordIndex;

                            return (
                              <motion.span
                                key={`${word.id}-${word.text}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{
                                  opacity:
                                    hasBeenSpoken || !isPlaying ? 1 : 0.3,
                                  y: 0,
                                }}
                                transition={{
                                  delay: index * 0.05,
                                  duration: 0.2,
                                  ease: "easeOut",
                                }}
                                className={`inline-block text-3xl font-semibold leading-tight transition-colors sm:text-4xl lg:text-5xl ${
                                  isCurrent
                                    ? "text-[#5A22C3]"
                                    : hasBeenSpoken || !isPlaying
                                    ? "text-gray-800"
                                    : "text-gray-300"
                                }`}
                              >
                                {word.text}
                              </motion.span>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-6 min-h-[32px] text-lg font-medium text-gray-300 sm:text-xl">
                        {nextLine.map((word) => word.text).join(" ")}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-[#5A22C3]">
                    <span>Summary Flow</span>
                    <span>{progress}%</span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <motion.div
                      className="h-full rounded-full bg-[#5A22C3]"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-[400px] -translate-x-1/2 sm:bottom-10">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
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
              className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#5A22C3] text-white transition-colors hover:bg-[#4a1ca3] disabled:bg-gray-300 shadow-md"
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
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-200 ${
        active
          ? "bg-[#F3E8FF] font-medium text-[#5A22C3]"
          : "text-gray-500 hover:bg-gray-50 hover:text-[#5A22C3]"
      }`}
    >
      {icon}
      <span className="text-[14px]">{label}</span>
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
    <div className="w-full max-w-[1000px] mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">
          Exam Mode
        </h1>

        <p className="text-gray-500 text-sm">
          {selectedFiles.length === 0
            ? "Select, upload, or capture study materials to generate study briefs"
            : `${selectedFiles.length} documents selected`}
        </p>
      </header>

      <div className="w-full border border-dashed border-gray-300 rounded-xl bg-gray-50 p-8 flex flex-col items-center justify-center mb-10 hover:border-[#5A22C3] hover:bg-[#F3E8FF]/30 transition-colors group">
        <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-4 text-[#5A22C3] group-hover:bg-[#F3E8FF] group-hover:border-[#F3E8FF] transition-colors">
          <Upload size={20} />
        </div>

        <h3 className="text-lg font-medium mb-1">Upload Study Materials</h3>

        <p className="text-gray-500 text-sm mb-5 text-center">
          Use PDFs, Word Docs, notes, screenshots, or camera captures.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onBrowse}
            className="bg-[#5A22C3] text-white px-5 py-2 rounded-lg font-medium text-sm hover:bg-[#4a1ca3] shadow-md transition-colors flex items-center gap-2"
          >
            <FolderOpen size={16} />
            Browse Files
          </button>

          <button
            onClick={onCapture}
            className="bg-white text-gray-800 border border-gray-200 px-5 py-2 rounded-lg font-medium text-sm hover:bg-gray-50 hover:text-[#5A22C3] shadow-sm transition-colors flex items-center gap-2"
          >
            <Camera size={16} />
            Use Camera
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
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
              className="px-4 py-2 bg-[#5A22C3] text-white rounded-lg font-medium text-sm hover:bg-[#4a1ca3] transition-colors flex items-center gap-2 shadow-md"
            >
              <Sparkles size={16} />
              Generate Flashcards
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      className={`bg-white border rounded-xl p-4 transition-colors flex items-center justify-between gap-4 cursor-pointer ${
        isSelected
          ? "border-[#5A22C3] bg-[#F3E8FF]/30"
          : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div
          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
            isSelected ? "bg-[#5A22C3] border-[#5A22C3]" : "border-gray-300"
          }`}
        >
          {isSelected && <CheckCircle2 size={14} className="text-white" />}
        </div>

        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 text-gray-600 shrink-0">
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
            className={`font-medium text-[14px] truncate mb-0.5 ${
              isSelected ? "text-[#5A22C3]" : "text-gray-900"
            }`}
          >
            {file.name}
          </h4>

          <div className="flex items-center gap-2 text-gray-500 text-[11px] uppercase tracking-wider font-medium">
            <span>{file.format}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
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
    <div className="w-full max-w-[1000px] mx-auto">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">
            Study Session Active
          </h1>

          <p className="text-gray-500 text-sm">Master your extracted insights</p>
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:text-[#5A22C3] transition-colors text-sm"
        >
          End Session
        </button>
      </header>

      <div className="mb-12 flex flex-col items-center">
        <p className="text-[#5A22C3] font-medium mb-6 uppercase tracking-wider text-xs">
          Tap card to flip
        </p>

        {allHighlights.length > 0 ? (
          <div className="w-full max-w-2xl flex flex-col items-center">
            <div className="w-full perspective mb-8">
              <motion.div
                onClick={() => toggleFlip(currentCardIndex)}
                className="w-full h-[350px] cursor-pointer relative preserve-3d transition-transform duration-500 ease-out"
                animate={{
                  rotateY: flippedCards.has(currentCardIndex) ? 180 : 0,
                }}
              >
                <div className="absolute inset-0 backface-hidden bg-white rounded-2xl border border-gray-200 p-10 flex flex-col items-center justify-center text-center shadow-md hover:border-[#5A22C3]/50 transition-colors">
                  <div className="text-2xl font-semibold text-gray-900">
                    {allHighlights[currentCardIndex].title}
                  </div>

                  <div className="absolute bottom-6 text-gray-400 text-xs font-medium uppercase tracking-wider">
                    Front
                  </div>
                </div>

                <div className="absolute inset-0 backface-hidden bg-[#5A22C3] rounded-2xl p-10 flex flex-col items-center justify-center text-center transform rotate-y-180 shadow-md">
                  <div className="text-xl font-medium leading-relaxed text-white">
                    {allHighlights[currentCardIndex].content}
                  </div>

                  <div className="absolute bottom-6 text-white/50 text-xs font-medium uppercase tracking-wider">
                    Back
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center gap-4 bg-white border border-gray-200 p-2 rounded-full shadow-sm">
              <button
                onClick={() =>
                  setCurrentCardIndex(Math.max(0, currentCardIndex - 1))
                }
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-[#F3E8FF] hover:text-[#5A22C3] text-gray-700 transition-colors"
              >
                <SkipBack size={16} />
              </button>

              <span className="font-medium text-gray-500 text-sm min-w-[3rem] text-center">
                {currentCardIndex + 1} / {allHighlights.length}
              </span>

              <button
                onClick={() =>
                  setCurrentCardIndex(
                    Math.min(allHighlights.length - 1, currentCardIndex + 1)
                  )
                }
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#5A22C3] hover:bg-[#4a1ca3] text-white transition-colors shadow-sm"
              >
                <SkipForward size={16} />
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-12 font-medium">
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
}: any) {
  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">
            Vault
          </h1>

          <p className="text-gray-500 text-sm">
            {files.length} documents and images securely stored
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your vault..."
            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 w-full md:w-64 focus:outline-none focus:border-[#5A22C3] focus:ring-1 focus:ring-[#5A22C3] transition-all"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file: StudyFile) => (
          <div
            key={file.id}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#5A22C3]/50 transition-colors flex flex-col"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#F3E8FF]/50 border border-[#F3E8FF] text-[#5A22C3] flex items-center justify-center">
                {isImageFile(file) ? (
                  <ImageIcon size={18} />
                ) : (
                  <FileText size={18} />
                )}
              </div>

              <span className="bg-gray-100 px-2 py-1 rounded text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                {file.format}
              </span>
            </div>

            <h3 className="font-medium text-[15px] text-gray-900 leading-tight mb-1 line-clamp-2">
              {file.name}
            </h3>

            <div className="text-[12px] text-gray-500 mb-6 mt-auto flex items-center gap-1.5">
              <Clock size={12} />
              {file.date} • {file.size}
            </div>

            <button
              onClick={() => onStartSkimSync(file)}
              className="w-full py-2.5 bg-white border border-gray-200 hover:bg-[#F3E8FF] hover:border-[#F3E8FF] hover:text-[#5A22C3] text-gray-900 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles size={14} />
              Skim-Sync
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomeView({
  files,
  onBrowse,
  onCapture,
  isUploading,
  onStartSkimSync,
}: any) {
  return (
    <div className="max-w-[900px] mx-auto">
      <header className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">
          Welcome back.
        </h1>

        <p className="text-gray-500 text-sm">
          Upload a document, browse files, or capture notes with your camera.
        </p>
      </header>

      <div className="w-full border border-dashed border-gray-300 bg-gray-50 rounded-xl p-10 flex flex-col items-center justify-center mb-12 hover:border-[#5A22C3] hover:bg-[#F3E8FF]/30 transition-colors group">
        <div className="w-14 h-14 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-4 group-hover:border-[#5A22C3]/30 transition-colors">
          <Upload
            size={24}
            className={`text-gray-600 group-hover:text-[#5A22C3] transition-colors ${
              isUploading ? "animate-bounce" : ""
            }`}
          />
        </div>

        <h3 className="text-lg font-medium mb-1 text-gray-900">
          {isUploading ? "Uploading to secure vault..." : "Add study material"}
        </h3>

        <p className="text-gray-500 text-sm mb-5 text-center max-w-md">
          Upload PDFs, Docs, spreadsheets, text files, screenshots, or take a
          photo of notes and let Echo summarize it.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            disabled={isUploading}
            onClick={onBrowse}
            className="bg-[#5A22C3] text-white px-5 py-2 rounded-lg font-medium text-sm hover:bg-[#4a1ca3] transition-colors shadow-md flex items-center gap-2 disabled:bg-gray-300"
          >
            <FolderOpen size={16} />
            Browse Files
          </button>

          <button
            disabled={isUploading}
            onClick={onCapture}
            className="bg-white text-gray-800 border border-gray-200 px-5 py-2 rounded-lg font-medium text-sm hover:bg-gray-50 hover:text-[#5A22C3] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Camera size={16} />
            Use Camera
          </button>
        </div>

        <p className="mt-4 text-[11px] text-gray-400 text-center">
          Camera capture works on supported desktop browsers, phones, and
          tablets.
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900 flex items-center gap-2">
          <Clock size={18} className="text-[#5A22C3]" />
          Recent Activity
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {files.slice(0, 4).map((file: StudyFile) => (
          <FileRow
            key={file.id}
            file={file}
            onStartSkimSync={onStartSkimSync}
          />
        ))}
      </div>
    </div>
  );
}

function FileRow({
  file,
  onStartSkimSync,
}: {
  file: StudyFile;
  onStartSkimSync: (file: StudyFile) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#5A22C3]/50 flex items-center justify-between transition-colors cursor-default group">
      <div className="flex items-center gap-4 min-w-0 pr-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-50 border border-gray-100 text-gray-600 group-hover:bg-[#F3E8FF] group-hover:text-[#5A22C3] transition-colors shrink-0">
          {isImageFile(file) ? <ImageIcon size={18} /> : <FileText size={18} />}
        </div>

        <div className="min-w-0">
          <h4 className="font-medium text-[14px] text-gray-900 group-hover:text-[#5A22C3] transition-colors truncate mb-0.5">
            {file.name}
          </h4>

          <span className="text-[11px] text-gray-500 tracking-wider uppercase">
            {file.format} • {file.date}
          </span>
        </div>
      </div>

      <button
        onClick={() => onStartSkimSync(file)}
        className="w-8 h-8 shrink-0 bg-gray-50 border border-gray-200 hover:bg-[#5A22C3] hover:border-[#5A22C3] hover:text-white text-gray-500 rounded-full flex items-center justify-center transition-colors shadow-sm"
      >
        <Play size={14} className="ml-0.5 fill-current" />
      </button>
    </div>
  );
}