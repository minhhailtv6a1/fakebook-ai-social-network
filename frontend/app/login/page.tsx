"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import type { LoginResponse, ToastType } from "@/lib/types";
import Toast, { type ToastState } from "@/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [openRegister, setOpenRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  const [toast, setToast] = useState<ToastState | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (message: string, type: ToastType) => {
    setToastVisible(false);
    setToast({ message, type });

    window.setTimeout(() => setToastVisible(true), 20);
    window.setTimeout(() => {
      setToastVisible(false);
      window.setTimeout(() => setToast(null), 300);
    }, 3000);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showToast("Vui lòng nhập email và mật khẩu.", "error");
      return;
    }

    setLoginLoading(true);

    try {
      const response = await api.post<LoginResponse>("/auth/login", {
        email: email.trim(),
        password,
      });

      localStorage.setItem("token", response.data.access_token);
      showToast("Đăng nhập thành công.", "success");

      window.setTimeout(() => {
        router.push("/feed");
      }, 700);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Email hoặc mật khẩu không đúng.",
      );
      showToast(message === "Invalid credentials" ? "Email hoặc mật khẩu không đúng." : message, "error");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !registerEmail.trim() || !registerPassword || !confirmPassword) {
      showToast("Vui lòng nhập đầy đủ thông tin.", "error");
      return;
    }

    if (username.trim().length < 3) {
      showToast("Tên người dùng phải có ít nhất 3 ký tự.", "error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerEmail.trim())) {
      showToast("Email không hợp lệ.", "error");
      return;
    }

    if (registerPassword.length < 6) {
      showToast("Mật khẩu phải có ít nhất 6 ký tự.", "error");
      return;
    }

    if (registerPassword !== confirmPassword) {
      showToast("Mật khẩu nhập lại không khớp.", "error");
      return;
    }

    setRegisterLoading(true);

    try {
      await api.post("/auth/register", {
        username: username.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
      });

      showToast("Tạo tài khoản thành công.", "success");
      setUsername("");
      setRegisterEmail("");
      setRegisterPassword("");
      setConfirmPassword("");
      window.setTimeout(() => setOpenRegister(false), 700);
    } catch (error) {
      const message = getApiErrorMessage(error, "Đăng ký thất bại.");

      if (message.toLowerCase().includes("email")) {
        showToast("Email đã tồn tại.", "error");
      } else if (message.toLowerCase().includes("username")) {
        showToast("Tên người dùng đã tồn tại.", "error");
      } else {
        showToast(message, "error");
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <>
      <Toast toast={toast} visible={toastVisible} />

      <main className="min-h-screen bg-[#f0f2f5] px-4 py-8 sm:px-6 lg:flex lg:items-center lg:justify-center lg:py-0">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <section className="text-center lg:text-left">
            <h1 className="text-5xl font-bold leading-none text-[#1877f2] sm:text-6xl lg:text-[64px]">
              Fakebook
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-xl leading-8 text-[#1c1e21] sm:text-2xl lg:mx-0 lg:text-[28px] lg:leading-9">
              Kết nối, chia sẻ và khám phá nội dung an toàn hơn với hỗ trợ AI.
            </p>
          </section>

          <section className="mx-auto w-full max-w-[420px]">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_8px_28px_rgba(0,0,0,0.12)] sm:p-5">
              <div className="flex flex-col gap-3">
                <label className="sr-only" htmlFor="login-email">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void handleLogin();
                  }}
                  className="auth-input h-14 w-full text-base"
                  autoComplete="email"
                />

                <label className="sr-only" htmlFor="login-password">
                  Mật khẩu
                </label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void handleLogin();
                  }}
                  className="auth-input h-14 w-full text-base"
                  autoComplete="current-password"
                />

                <button
                  onClick={() => void handleLogin()}
                  disabled={loginLoading}
                  className="auth-button h-14 w-full text-lg disabled:cursor-not-allowed disabled:opacity-70"
                  type="button"
                >
                  {loginLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>

                <button
                  className="rounded-lg bg-transparent py-2 text-sm font-medium text-[#1877f2] hover:bg-blue-50 hover:underline"
                  type="button"
                >
                  Quên mật khẩu?
                </button>

                <div className="my-1 h-px bg-zinc-200" />

                <button
                  onClick={() => setOpenRegister(true)}
                  className="mx-auto h-12 w-full max-w-[260px] rounded-lg bg-[#42b72a] px-5 text-base font-bold text-white transition hover:bg-[#36a420] focus-visible:ring-4 focus-visible:ring-green-100"
                  type="button"
                >
                  Tạo tài khoản mới
                </button>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-[#1c1e21]">
              <span className="font-semibold">Fakebook</span> dành cho học tập,
              chia sẻ và thử nghiệm kiểm duyệt nội dung.
            </p>
          </section>
        </div>
      </main>

      {openRegister && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-title"
        >
          <div className="w-full max-w-md animate-modal-in rounded-xl bg-white shadow-2xl">
            <div className="border-b border-zinc-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="register-title" className="text-3xl font-bold text-black">
                    Đăng ký
                  </h2>
                  <p className="text-sm text-zinc-500">Nhanh chóng và dễ dàng.</p>
                </div>

                <button
                  onClick={() => setOpenRegister(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-xl text-zinc-600 transition hover:bg-zinc-200"
                  type="button"
                  aria-label="Đóng đăng ký"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 p-5">
              <input
                type="text"
                placeholder="Họ và tên"
                className="auth-input h-[52px] w-full"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="name"
              />
              <input
                type="email"
                placeholder="Email"
                className="auth-input h-[52px] w-full"
                value={registerEmail}
                onChange={(event) => setRegisterEmail(event.target.value)}
                autoComplete="email"
              />
              <input
                type="password"
                placeholder="Mật khẩu"
                className="auth-input h-[52px] w-full"
                value={registerPassword}
                onChange={(event) => setRegisterPassword(event.target.value)}
                autoComplete="new-password"
              />
              <input
                type="password"
                placeholder="Nhập lại mật khẩu"
                className="auth-input h-[52px] w-full"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void handleRegister();
                }}
                autoComplete="new-password"
              />

              <button
                onClick={() => void handleRegister()}
                disabled={registerLoading}
                className="mt-2 h-[52px] w-full rounded-lg bg-[#42b72a] text-lg font-bold text-white transition hover:bg-[#36a420] disabled:cursor-not-allowed disabled:opacity-70"
                type="button"
              >
                {registerLoading ? "Đang tạo tài khoản..." : "Đăng ký"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
