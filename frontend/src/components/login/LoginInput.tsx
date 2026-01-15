import React from "react";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

interface LoginFormData {
  username: string;
  password: string;
}

// Định nghĩa URL API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const LOGIN_API_URL = `${API_BASE_URL}/api/auth/login`;

export const LoginInputs: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error khi user đang nhập
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setError(null);
  };

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    // Validate username
    if (!formData.username.trim()) {
      errors.username = "Username or email is required";
    } else if (formData.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    // Validate password
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);

    // Validate form trước khi submit
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(LOGIN_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      console.log("response: ", response);
      console.log("data: ", data);

      if (response.ok) {
        // Đăng nhập thành công
        localStorage.setItem("authToken", data.accessToken);

        // Optional: Lưu thông tin user nếu API trả về
        if (data.id && data.username) {
          localStorage.setItem(
            "currentUser",
            JSON.stringify({
              id: data.id,
              username: data.username,
              email: data.email,
              fullName: data.fullName,
            })
          );
        }

        // QUAN TRỌNG: Dùng replace: true để không back về login
        navigate("/home", { replace: true });
      } else {
        // Lỗi từ server (401, 400, etc.)
        // Backend trả về: { "success": false, "message": "Invalid username or password" }
        setError(data.message || "Invalid username or password");
      }
    } catch (err) {
      // Lỗi mạng (Network error)
      setError("Network error or server unreachable. Please try again.");
      console.error("API call error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="caret-transparent flex flex-col" onSubmit={handleSubmit}>
      {/* Global Error Message */}
      {error && (
        <div className="mx-10 mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm text-center">{error}</p>
        </div>
      )}

      <div className="relative items-stretch box-border caret-transparent flex flex-col shrink-0 justify-start mt-6">
        {/* Username Field */}
        <div className="caret-transparent mb-1.5 mx-10">
          <div
            className={`relative items-center bg-zinc-50 box-border caret-transparent flex w-full border rounded-[3px] border-solid ${
              validationErrors.username ? "border-red-500" : "border-zinc-300"
            }`}
          >
            <label className="relative caret-transparent flex basis-0 grow shrink-0 h-9">
              <input
                aria-label="Phone number, username, or email"
                type="text"
                value={formData.username}
                onChange={handleChange}
                name="username"
                className="text-base bg-zinc-50 caret-transparent block grow shrink-0 text-left text-ellipsis pl-2 pr-0 pt-[9px] pb-[7px]"
                placeholder="Username or email"
                disabled={isLoading}
              />
            </label>
            <div className="relative items-center box-border caret-transparent flex shrink-0 h-full align-middle pr-2"></div>
          </div>
          {validationErrors.username && (
            <p className="text-red-500 text-xs mt-1 ml-1">
              {validationErrors.username}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="caret-transparent mb-1.5 mx-10">
          <div
            className={`relative items-center bg-zinc-50 box-border caret-transparent flex w-full border rounded-[3px] border-solid ${
              validationErrors.password ? "border-red-500" : "border-zinc-300"
            }`}
          >
            <div className="relative flex basis-0 grow shrink-0 h-9">
              <input
                aria-label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                name="password"
                className="text-base bg-zinc-50 block grow shrink-0 text-left text-ellipsis pl-2 pr-0 pt-[9px] pb-[7px]"
                placeholder="Password"
                disabled={isLoading}
              />
            </div>
            <div className="relative items-center box-border caret-transparent flex shrink-0 h-full align-middle pr-2"></div>
          </div>
          {validationErrors.password && (
            <p className="text-red-500 text-xs mt-1 ml-1">
              {validationErrors.password}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="relative items-stretch box-border caret-transparent flex flex-col shrink-0 justify-start mx-10 my-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`relative text-white font-semibold bg-indigo-500 caret-transparent block text-center text-ellipsis px-4 py-[7px] rounded-lg transition-opacity ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <div className="relative items-stretch box-border caret-transparent flex flex-col shrink-0 justify-start">
              {isLoading ? "Logging in..." : "Log in"}
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="caret-transparent mt-3.5 mb-[22px] mx-10">
          <div className="caret-transparent flex">
            <div className="relative bg-zinc-300 caret-transparent grow h-px top-[6.3px]"></div>
            <div className="relative text-neutral-500 text-[13px] font-semibold items-stretch box-border caret-transparent flex flex-col shrink-0 leading-[14.9994px] uppercase mx-[18px]">
              or
            </div>
            <div className="relative bg-zinc-300 caret-transparent grow h-px top-[6.3px]"></div>
          </div>
        </div>

        {/* Facebook Login Button */}
        <div className="relative items-stretch box-border caret-transparent flex flex-col shrink-0 justify-start mx-10 my-2">
          <button
            type="button"
            disabled={isLoading}
            className="relative text-indigo-600 font-semibold bg-transparent caret-transparent block text-center text-ellipsis p-0 hover:text-blue-700 hover:border-blue-700 disabled:opacity-50"
          >
            <div className="relative items-center box-border caret-transparent flex shrink-0 justify-center">
              <div className="relative items-stretch box-border caret-transparent flex flex-col shrink-0 justify-start mr-1 px-1">
                <img
                  src="https://c.animaapp.com/mgj5uocgnnR3L8/assets/icon-1.svg"
                  alt="Icon"
                  className="relative text-sky-500 caret-transparent h-5 w-5"
                />
              </div>
              <span className="text-sky-500 caret-transparent block">
                Log in with Facebook
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Forgot Password Link */}
      <div className="content-center items-stretch self-center box-border caret-transparent flex flex-col shrink-0 justify-start mt-3">
        <a
          href="/accounts/password/reset/"
          role="link"
          className="relative text-zinc-950 font-medium items-center box-border caret-transparent flex shrink-0 justify-center list-none text-center text-ellipsis z-0 rounded-sm hover:underline"
        >
          Forgot password?
        </a>
      </div>
    </form>
  );
};