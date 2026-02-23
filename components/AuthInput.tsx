import React, { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type AuthInputProps = {
  id: string;
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
};

const AuthInput: React.FC<AuthInputProps> = ({
  id,
  label,
  type = "text",
  value,
  placeholder,
  onChange,
  onBlur,
  error,
  touched,
  disabled = false
}) => {
  const hasError = Boolean(error && touched);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = type === "password";
  const inputType = useMemo(() => {
    if (!isPasswordField) return type;
    return isPasswordVisible ? "text" : "password";
  }, [isPasswordField, isPasswordVisible, type]);

  return (
    <div>
      <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 block">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className={`w-full rounded-xl border bg-gray-50/70 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
            hasError ? "border-red-300 focus:ring-red-400" : "border-gray-200 focus:ring-blue-500"
          } ${isPasswordField ? "pr-11" : ""}`}
          required
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            className="absolute inset-y-0 right-3 my-auto text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            title={isPasswordVisible ? "Hide password" : "Show password"}
          >
            {isPasswordVisible ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        )}
      </div>
      {hasError && <p className="text-xs font-semibold text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default AuthInput;
