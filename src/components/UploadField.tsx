import React, { useRef, useState, useCallback, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import "./UploadField.css";
import { Upload } from "@aws-sdk/lib-storage";
import { s3Client } from "../AWS/aws";
import useToast from "../Hooks/useToast";
import type {
  InFlightUpload,
  UploadedFile,
  UploadFieldProps,
} from "../Types/UploadFieldTypes";
import { FILE_ICON_RULES } from "../utilities/FileIconRules";
import { PreviewModal } from "./PreviewModal";

const FileThumbnail: React.FC<{
  type: string;
  url: string;
  name: string;
  size: number;
}> = ({ type, url, name, size }) => {
  if (!url) {
    return <>Uploading...</>;
  }
  if (type.startsWith("image/")) {
    return (
      <img
        src={url}
        alt={name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          cursor: "pointer",
        }}
      />
    );
  }

  const rule = FILE_ICON_RULES.find((r) => r.test(type));
  return (
    <div
      style={{ width: size, height: size }}
      className={`file-icon ${rule?.className ?? "file"}`}
    >
      {rule?.label ?? "FILE"}
    </div>
  );
};

const UploadField: React.FC<UploadFieldProps> = ({
  name,
  required = false,
  maxItems = 1,
  rules = {},
  label,
  avtarSize = 100,
  removeDelete = false,
  parentLoading,
}) => {
  const { control } = useFormContext();
  const [preview, setPreview] = useState<UploadedFile | null>(null);
  const showToast = useToast();

  const [inFlight, setInFlight] = useState<Record<string, InFlightUpload>>({});

  const dragCounter = useRef(0);
  const [isDragActive, setIsDragActive] = useState(false);

  const currentValueRef = useRef<UploadedFile[]>([]);

  const updateInFlight = useCallback(
    (id: string, patch: Partial<InFlightUpload>) => {
      setInFlight((prev) => {
        if (!prev[id]) return prev;
        return { ...prev, [id]: { ...prev[id], ...patch } };
      });
    },
    [],
  );

  const removeInFlight = useCallback((id: string) => {
    setInFlight((prev) => {
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const wasLoadingRef = useRef(false);

  useEffect(() => {
    const isLoading = Object.keys(inFlight).length > 0;
    if (isLoading !== wasLoadingRef.current) {
      wasLoadingRef.current = isLoading;
      parentLoading?.(isLoading);
    }
  }, [inFlight, parentLoading]);

  useEffect(() => {
    return () => {
      if (wasLoadingRef.current) {
        parentLoading?.(false);
      }
    };
  }, []);

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: required ? "This field is required" : false,
        ...rules,
      }}
      render={({ field: { value = [], onChange }, fieldState: { error } }) => {
        // Keep the ref in sync with whatever RHF currently reports as the
        // field value, on every render.
        currentValueRef.current = value;

        const slotsRemaining =
          maxItems - value.length - Object.keys(inFlight).length;

        const startUpload = (file: File) => {
          const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
          const key = `uploads/${Date.now()}-${file.name}`;

          const upload = new Upload({
            client: s3Client,
            params: {
              Bucket: import.meta.env.VITE_AWS_BUCKET_NAME,
              Key: key,
              Body: file,
              ContentType: file.type,
            },
            queueSize: 4,
            partSize: 5 * 1024 * 1024,
            leavePartsOnError: false,
            tags: [],
          });

          setInFlight((prev) => ({
            ...prev,
            [id]: {
              id,
              name: file.name,
              type: file.type,
              progress: 0,
              status: "uploading",
              upload,
            },
          }));

          upload.on("httpUploadProgress", (progressEvent) => {
            const percent = Math.round(
              ((progressEvent.loaded || 0) /
                (progressEvent.total || file.size)) *
                100,
            );
            updateInFlight(id, { progress: percent });
          });

          upload
            .done()
            .then(() => {
              const fileUrl = `https://${import.meta.env.VITE_AWS_BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/${key}`;
              const uploadedFile: UploadedFile = {
                url: fileUrl,
                type: file.type,
                name: file.name,
              };
              const nextValue = [...currentValueRef.current, uploadedFile];
              currentValueRef.current = nextValue;
              onChange(nextValue);
              removeInFlight(id);
              showToast({
                message: `${file.name} uploaded successfully`,
                status: "success",
              });
            })
            .catch((error: any) => {
              if (
                error?.name === "AbortError" ||
                /abort/i.test(error?.message ?? "")
              ) {
                removeInFlight(id);
                return;
              }
              console.error("Upload failed:", error);
              updateInFlight(id, { status: "error" });
              showToast({
                message: error?.message || `Failed to upload ${file.name}`,
                status: "error",
              });
              removeInFlight(id);
            });
        };

        const handleFilesSelected = (files: FileList | null) => {
          if (!files || files.length === 0) return;
          const room = Math.max(0, slotsRemaining);

          if (room === 0) {
            showToast({
              message: `You can only upload up to ${maxItems} file${maxItems === 1 ? "" : "s"}`,
              status: "warning",
            });
            return;
          }

          if (files.length > room) {
            showToast({
              message: `Only ${room} of ${files.length} files were added (limit: ${maxItems})`,
              status: "warning",
            });
          }

          Array.from(files)
            .slice(0, room)
            .forEach((file) => startUpload(file));
        };

        const handleCancel = (id: string) => {
          const entry = inFlight[id];
          if (!entry) return;
          entry.upload.abort().catch(() => {
            // abort() rejects in some SDK versions even on success; ignore.
          });
          removeInFlight(id);
          showToast({
            message: `Cancelled upload of ${entry.name}`,
            status: "info",
          });
        };

        const handleRemove = (url: string) => {
          onChange(value.filter((item: UploadedFile) => item.url !== url));
        };

        const handleDragEnter = (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          if (slotsRemaining <= 0) return;
          dragCounter.current += 1;
          if (e.dataTransfer.types.includes("Files")) {
            setIsDragActive(true);
          }
        };

        const handleDragLeave = (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          dragCounter.current -= 1;
          if (dragCounter.current <= 0) {
            dragCounter.current = 0;
            setIsDragActive(false);
          }
        };

        const handleDragOver = (e: React.DragEvent) => {
          // Required: without preventDefault here, onDrop never fires.
          e.preventDefault();
          e.stopPropagation();
        };

        const handleDrop = (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          dragCounter.current = 0;
          setIsDragActive(false);
          if (slotsRemaining <= 0) return;
          handleFilesSelected(e.dataTransfer.files);
        };

        return (
          <div className="upload-container">
            {label && (
              <label className="input-label">
                {label}
                {required && <span className="required">*</span>}
              </label>
            )}

            <div
              className={`upload-grid${isDragActive ? " upload-grid--drag-active" : ""}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {slotsRemaining > 0 && (
                <label
                  className={`upload-box${isDragActive ? " upload-box--drag-active" : ""}`}
                >
                  <input
                    type="file"
                    hidden
                    multiple={slotsRemaining > 1}
                    onChange={(e) => {
                      handleFilesSelected(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <span>{isDragActive ? "Drop to upload" : "+ Upload"}</span>
                </label>
              )}
            </div>

            {error && <p className="error">{error.message}</p>}

            <div className="display-thumnails" >
              {Object.values(inFlight).map((entry) => (
                <div key={entry.id} className="upload-item">
                  <div
                    className="upload-card upload-card--pending"
                    style={{ width: avtarSize, height: avtarSize }}
                  >
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => handleCancel(entry.id)}
                      aria-label={`Cancel upload of ${entry.name}`}
                      title="Cancel upload"
                    >
                      ✕
                    </button>

                    <div className="upload-progress-card">
                      <FileThumbnail
                        type={entry.type}
                        url=""
                        name={entry.name}
                        size={avtarSize * 0.5}
                      />
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${entry.progress}%` }}
                        />
                      </div>
                      <p className="progress-label">{entry.progress}%</p>
                    </div>
                  </div>

                  <span className="upload-item-name" title={entry.name}>
                    {entry.name}
                  </span>
                </div>
              ))}

              {value.map((file: UploadedFile, index: number) => (
                <div key={file.url ?? index} className="upload-item">
                  <div
                    className="upload-card"
                    style={{ width: avtarSize, height: avtarSize }}
                  >
                    <div
                      className="file-thumbnail"
                      onClick={() => setPreview(file)}
                      style={{
                        width: "100%",
                        height: "100%",
                        cursor: "pointer",
                      }}
                    >
                      <FileThumbnail
                        type={file.type}
                        url={file.url}
                        name={file.name}
                        size={avtarSize}
                      />
                    </div>

                    <div className="overlay">
                      <button type="button" onClick={() => setPreview(file)}>
                        View
                      </button>
                      {!removeDelete && (
                        <button
                          type="button"
                          onClick={() => handleRemove(file.url)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  <span className="upload-item-name" title={file.name}>
                    {file.name}
                  </span>
                </div>
              ))}
            </div>

            {preview && (
              <PreviewModal file={preview} onClose={() => setPreview(null)} />
            )}
          </div>
        );
      }}
    />
  );
};

export default UploadField;
