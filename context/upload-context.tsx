"use client";

import type React from "react";
import { createContext, useContext, useState, type ReactNode } from "react";

interface UploadState {
  isUploading: boolean;
  uploadProgress: number;
  uploadMessage: string;
  error: string | null;
}

interface UploadContextType {
  uploadState: UploadState;
  startUpload: (message?: string) => void;
  updateProgress: (progress: number, message?: string) => void;
  completeUpload: () => void;
  setError: (error: string) => void;
  clearError: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error("useUpload must be used within an UploadProvider");
  }
  return context;
};

interface UploadProviderProps {
  children: ReactNode;
}

export const UploadProvider: React.FC<UploadProviderProps> = ({ children }) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    uploadProgress: 0,
    uploadMessage: "",
    error: null,
  });

  const startUpload = (message = "Uploading post...") => {
    setUploadState({
      isUploading: true,
      uploadProgress: 0,
      uploadMessage: message,
      error: null,
    });
  };

  const updateProgress = (progress: number, message?: string) => {
    setUploadState((prev) => ({
      ...prev,
      uploadProgress: progress,
      uploadMessage: message || prev.uploadMessage,
    }));
  };

  const completeUpload = () => {
    setUploadState({
      isUploading: false,
      uploadProgress: 100,
      uploadMessage: "Upload complete!",
      error: null,
    });

    // Clear the completion message after 2 seconds
    setTimeout(() => {
      setUploadState((prev) => ({
        ...prev,
        uploadMessage: "",
        uploadProgress: 0,
      }));
    }, 2000);
  };

  const setError = (error: string) => {
    setUploadState((prev) => ({
      ...prev,
      isUploading: false,
      error,
    }));
  };

  const clearError = () => {
    setUploadState((prev) => ({
      ...prev,
      error: null,
    }));
  };

  return (
    <UploadContext.Provider
      value={{
        uploadState,
        startUpload,
        updateProgress,
        completeUpload,
        setError,
        clearError,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
};
