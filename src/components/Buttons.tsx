interface ButtonProps {
  type?: "button" | "submit" | "reset";
  label: string;
  isLoading: boolean;
  isDisabled: boolean;
  styleType?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "light"
    | "dark";
}

const Buttons = ({
  type = "button",
  label,
  styleType = "primary",
  isDisabled = false,
  isLoading = false,
}: ButtonProps) => {
  const colorCode = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    success: "btn-success",
    danger: "btn-danger",
    warning: "btn-warning",
    info: "btn-info",
    light: "btn-light",
    dark: "btn-dark",
  };

  return (
    <button
      type={type}
      className={`btn ${colorCode[styleType]}`}
      disabled={isDisabled || isLoading}
    >
      {label}
    </button>
  );
};

export default Buttons;
