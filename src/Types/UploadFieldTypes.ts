import { Upload } from "@aws-sdk/lib-storage";

export type UploadedFile = {
  url: string;
  type: string;
  name: string;
};

export type InFlightUpload = {
  id: string;
  name: string;
  type: string;
  progress: number;
  status: "uploading" | "error";
  upload: Upload;
};

export type UploadFieldProps = {
  name: string;
  required?: boolean;
  maxItems?: number;
  rules?: any;
  removeDelete?: boolean;
  label: string;
  avtarSize?: number;
  parentLoading?: (loading: boolean) => void;
};
