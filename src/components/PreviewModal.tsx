import type { UploadedFile } from "../Types/UploadFieldTypes";
import "./UploadField.css";

export const PreviewModal: React.FC<{
  file: UploadedFile;
  onClose: () => void;
}> = ({ file, onClose }) => {
  const renderBody = () => {
    if (file.type.startsWith("image/")) {
      return <img src={file.url} alt={file.name} />;
    }
    if (file.type === "application/pdf") {
      return <iframe src={file.url} title={file.name} />;
    }
    if (file.type.startsWith("video/")) {
      return (
        <video controls width="90%">
          <source src={file.url} type={file.type} />
        </video>
      );
    }
    return (
      <div style={{ textAlign: "center", padding: "30px" }}>
        <h3>{file.name}</h3>
        <a href={file.url} target="_blank" rel="noopener noreferrer">
          Open File
        </a>
      </div>
    );
  };

  return (
    <div className="preview-overlay" onClick={onClose}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="close-btn"
          onClick={onClose}
          aria-label="Close preview"
        >
          ✕
        </button>
        {renderBody()}
      </div>
    </div>
  );
};
