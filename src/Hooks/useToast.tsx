import { toast } from "react-toastify";

type ToastStatus = "success" | "error" | "warning" | "info";

const useToast = () => {
  return ({
    message,
    status = "info",
  }: {
    message?: string;
    status?: ToastStatus;
  }) => {
    toast[status](message);
  };
};

export default useToast;
