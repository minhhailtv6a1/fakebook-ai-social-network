"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Gamepad2,
  Home,
  ImageIcon,
  LogOut,
  MessageCircle,
  MessageSquare,
  Search,
  Share,
  ShieldCheck,
  Store,
  ThumbsUp,
  Tv,
  User as UserIcon,
  Users,
  X,
} from "lucide-react";
import api from "@/lib/api";
import { getApiErrorMessage, isUnauthorizedError } from "@/lib/errors";
import type {
  ImageModerationLabel,
  ModerationLabel,
  Post,
  ToastType,
  User,
} from "@/lib/types";
import Avatar from "@/components/ui/Avatar";
import Toast, { type ToastState } from "@/components/ui/Toast";
import { FeedSkeleton } from "@/components/ui/Skeleton";

const API_BASE_URL = "http://127.0.0.1:8000";

const TEXT_LABELS: Record<ModerationLabel, { label: string; className: string }> = {
  clean: { label: "Sạch", className: "bg-green-100 text-green-700" },
  offensive: { label: "Công kích", className: "bg-yellow-100 text-yellow-700" },
  hate: { label: "Thù ghét", className: "bg-red-100 text-red-700" },
  scam: { label: "Lừa đảo", className: "bg-purple-100 text-purple-700" },
};

const IMAGE_LABELS: Record<ImageModerationLabel, { label: string; className: string }> = {
  "non-violence": { label: "Không bạo lực", className: "bg-green-100 text-green-700" },
  violence: { label: "Bạo lực", className: "bg-orange-100 text-orange-700" },
};

export default function FeedPage() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [creatingPost, setCreatingPost] = useState(false);
  const [likingPostId, setLikingPostId] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToastVisible(false);
    setToast({ message, type });
    window.setTimeout(() => setToastVisible(true), 20);
    window.setTimeout(() => {
      setToastVisible(false);
      window.setTimeout(() => setToast(null), 300);
    }, 3000);
  }, []);

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("token");
    router.push("/login");
  }, [router]);

  const fetchPosts = useCallback(async () => {
    try {
      const response = await api.get<Post[]>("/posts");
      setPosts(response.data);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        handleUnauthorized();
        return;
      }

      showToast(getApiErrorMessage(error, "Không thể tải bảng tin."), "error");
    }
  }, [handleUnauthorized, showToast]);

  const fetchMe = useCallback(async () => {
    try {
      const response = await api.get<User>("/users/me");
      setUser(response.data);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        handleUnauthorized();
        return;
      }

      showToast(getApiErrorMessage(error, "Không thể tải thông tin người dùng."), "error");
    }
  }, [handleUnauthorized, showToast]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const loadPage = async () => {
      setLoadingFeed(true);
      await Promise.all([fetchPosts(), fetchMe()]);
      setLoadingFeed(false);
    };

    void loadPage();
  }, [fetchMe, fetchPosts, router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleCreatePost = async () => {
    if (!content.trim()) {
      showToast("Vui lòng nhập nội dung bài viết.", "error");
      return;
    }

    setCreatingPost(true);

    try {
      const formData = new FormData();
      formData.append("content", content.trim());

      if (image) {
        formData.append("image", image);
      }

      await api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setContent("");
      setImage(null);
      showToast("Đăng bài thành công.", "success");
      await fetchPosts();
    } catch (error) {
      if (isUnauthorizedError(error)) {
        handleUnauthorized();
        return;
      }

      showToast(getApiErrorMessage(error, "Đăng bài thất bại."), "error");
    } finally {
      setCreatingPost(false);
    }
  };

  const handleLike = async (postId: number) => {
    if (likingPostId !== null) {
      return;
    }

    setLikingPostId(postId);

    try {
      const response = await api.post(`/likes/${postId}`, {});

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                liked: response.data.liked,
                likes_count: response.data.total_likes,
              }
            : post,
        ),
      );
    } catch (error) {
      if (isUnauthorizedError(error)) {
        handleUnauthorized();
        return;
      }

      showToast(getApiErrorMessage(error, "Không thể cập nhật lượt thích."), "error");
    } finally {
      setLikingPostId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Toast toast={toast} visible={toastVisible} />

      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-2 px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <h1 className="shrink-0 text-2xl font-bold text-[#1877f2] sm:text-4xl">
              Fakebook
            </h1>
            <div className="hidden min-w-[220px] items-center gap-2 rounded-full bg-[#f0f2f5] px-4 py-2 md:flex">
              <Search size={18} className="text-zinc-500" />
              <input
                type="text"
                placeholder="Tìm kiếm trên Fakebook"
                className="w-full bg-transparent text-sm text-black outline-none placeholder:text-zinc-500"
                aria-label="Tìm kiếm trên Fakebook"
              />
            </div>
          </div>

          <nav className="hidden items-center gap-2 lg:flex" aria-label="Điều hướng chính">
            <TopIcon icon={<Home />} label="Trang chủ" active />
            <TopIcon icon={<Users />} label="Bạn bè" />
            <TopIcon icon={<Tv />} label="Video" />
            <TopIcon icon={<Store />} label="Marketplace" />
            <TopIcon icon={<Gamepad2 />} label="Trò chơi" />
          </nav>

          <div className="relative flex items-center gap-2 sm:gap-3" ref={dropdownRef}>
            <CircleButton icon={<Search size={19} />} label="Tìm kiếm" className="md:hidden" />
            <CircleButton icon={<MessageCircle size={20} />} label="Tin nhắn" />
            <CircleButton icon={<Bell size={20} />} label="Thông báo" />

            <button
              onClick={() => setDropdownOpen((value) => !value)}
              className="rounded-full outline-none transition hover:brightness-95 focus-visible:ring-4 focus-visible:ring-blue-100"
              type="button"
              aria-haspopup="menu"
              aria-expanded={dropdownOpen}
              aria-label="Mở menu người dùng"
            >
              <Avatar name={user?.username} size="sm" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 top-12 w-[min(20rem,calc(100vw-1.5rem))] animate-dropdown-in rounded-xl border border-zinc-200 bg-white p-2 shadow-2xl"
                role="menu"
              >
                <div className="mb-2 flex items-center gap-3 rounded-lg bg-zinc-50 p-3">
                  <Avatar name={user?.username} size="md" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-black">{user?.username || "Fakebook user"}</p>
                    <p className="truncate text-xs text-zinc-500">{user?.email || "Tài khoản đang đăng nhập"}</p>
                  </div>
                </div>

                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-zinc-100" type="button" role="menuitem">
                  <UserIcon size={20} className="text-zinc-700" />
                  <span className="font-medium text-black">Thông tin người dùng</span>
                </button>

                <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-red-50" type="button" role="menuitem">
                  <LogOut size={20} className="text-red-500" />
                  <span className="font-medium text-red-500">Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-5 px-3 py-4 sm:px-4 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,680px)_300px] xl:gap-6">
        <aside className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-2">
            <LeftItem label="Trang cá nhân" icon={<UserIcon size={22} />} bgColor="bg-blue-500" />
            <LeftItem label="Bạn bè" icon={<Users size={22} />} bgColor="bg-cyan-500" />
            <LeftItem label="Nhóm" icon={<Users size={22} />} bgColor="bg-green-500" />
            <LeftItem label="Marketplace" icon={<Store size={22} />} bgColor="bg-orange-500" />
            <LeftItem label="Video" icon={<Tv size={22} />} bgColor="bg-red-500" />
          </div>
        </aside>

        <main className="mx-auto w-full max-w-2xl">
          <section className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
            <div className="flex gap-3">
              <Avatar name={user?.username} />
              <textarea
                placeholder="Bạn đang nghĩ gì?"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="min-h-[96px] w-full resize-none rounded-xl bg-[#f0f2f5] p-4 text-black outline-none transition focus:bg-white focus:ring-4 focus:ring-blue-100"
                disabled={creatingPost}
              />
            </div>

            {image && (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                <span className="truncate">{image.name}</span>
                <button
                  onClick={() => setImage(null)}
                  className="ml-3 rounded-full p-1 text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-900"
                  type="button"
                  aria-label="Xóa ảnh đã chọn"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3 border-t border-zinc-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 transition hover:bg-zinc-100 sm:justify-start">
                <ImageIcon className="text-green-500" size={20} />
                <span className="text-sm font-medium text-black">Ảnh</span>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  disabled={creatingPost}
                  onChange={(event) => setImage(event.target.files?.[0] || null)}
                />
              </label>

              <button
                onClick={() => void handleCreatePost()}
                disabled={creatingPost}
                className="rounded-lg bg-[#1877f2] px-6 py-3 font-bold text-white transition hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-32"
                type="button"
              >
                {creatingPost ? "Đang kiểm duyệt..." : "Đăng bài"}
              </button>
            </div>
          </section>

          {loadingFeed ? (
            <FeedSkeleton />
          ) : posts.length === 0 ? (
            <div className="mt-6 rounded-xl bg-white p-8 text-center shadow-sm">
              <h2 className="text-lg font-semibold text-black">Chưa có bài viết</h2>
              <p className="mt-2 text-sm text-zinc-500">
                Hãy là người đầu tiên chia sẻ điều gì đó.
              </p>
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-5">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  liking={likingPostId === post.id}
                  onLike={() => void handleLike(post.id)}
                />
              ))}
            </div>
          )}
        </main>

        <aside className="hidden xl:block">
          <div className="sticky top-24 rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-black">Người liên hệ</h2>
            <div className="flex flex-col gap-2">
              {["An", "Nam", "Khoa", "Vy", "Long"].map((name) => (
                <div key={name} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition hover:bg-zinc-100">
                  <Avatar name={name} size="sm" />
                  <span className="font-medium text-black">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function formatFacebookTime(createdAt: string) {
  const postDate = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - postDate.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24 && postDate.getDate() === now.getDate()) return `${diffHours} giờ trước`;

  const timeString = postDate.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (
    postDate.getDate() === yesterday.getDate() &&
    postDate.getMonth() === yesterday.getMonth() &&
    postDate.getFullYear() === yesterday.getFullYear()
  ) {
    return `Hôm qua lúc ${timeString}`;
  }

  const day = String(postDate.getDate()).padStart(2, "0");
  const month = String(postDate.getMonth() + 1).padStart(2, "0");
  return `Ngày ${day} tháng ${month} lúc ${timeString}`;
}

function PostCard({ post, liking, onLike }: { post: Post; liking: boolean; onLike: () => void }) {
  const [showSensitiveImage, setShowSensitiveImage] = useState(false);
  const shouldWarnImage = post.image_label === "violence" && !showSensitiveImage;

  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3 p-4">
        <Avatar name={post.username} />
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-black">{post.username || "Fakebook user"}</h3>
          <p className="text-sm text-zinc-500">{formatFacebookTime(post.created_at)}</p>
        </div>
      </div>

      <div className="px-4 pb-4">
        <p className="whitespace-pre-wrap text-[16px] text-black">{post.content}</p>
        <ModerationSummary post={post} />
      </div>

      {post.image_url && (
        <SensitiveImage
          imageUrl={post.image_url}
          warning={shouldWarnImage}
          onReveal={() => setShowSensitiveImage(true)}
        />
      )}

      <div className="px-4 py-2 text-sm text-zinc-500">{post.likes_count || 0} lượt thích</div>

      <div className="grid grid-cols-3 border-t border-zinc-100 px-2 py-2">
        <button
          onClick={onLike}
          disabled={liking}
          className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition sm:text-base ${
            post.liked ? "bg-blue-50 text-[#1877f2]" : "text-zinc-600 hover:bg-zinc-100"
          } disabled:cursor-not-allowed disabled:opacity-70`}
          type="button"
        >
          <ThumbsUp size={18} fill={post.liked ? "#1877f2" : "none"} />
          Thích
        </button>
        <button className="flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 sm:text-base" type="button">
          <MessageSquare size={18} />
          <span className="hidden sm:inline">Bình luận</span>
          <span className="sm:hidden">Bình</span>
        </button>
        <button className="flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 sm:text-base" type="button">
          <Share size={18} />
          Chia sẻ
        </button>
      </div>
    </article>
  );
}

function SensitiveImage({
  imageUrl,
  warning,
  onReveal,
}: {
  imageUrl: string;
  warning: boolean;
  onReveal: () => void;
}) {
  return (
    <div className="relative overflow-hidden bg-zinc-100">
      <Image
        src={`${API_BASE_URL}${imageUrl}`}
        alt="Ảnh bài viết"
        width={900}
        height={700}
        unoptimized
        className={`max-h-[700px] w-full object-cover transition duration-500 ${
          warning ? "scale-[1.01] blur-xl brightness-75" : "scale-100 blur-0 brightness-100"
        }`}
      />

      {warning && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/45 px-5 text-center backdrop-blur-[2px]">
          <div className="max-w-sm rounded-xl border border-white/20 bg-white/95 p-5 shadow-2xl">
            <p className="text-base font-bold text-zinc-900">
              ⚠ This image may contain violent content.
            </p>
            <button
              onClick={onReveal}
              className="mt-4 rounded-lg bg-[#1877f2] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#166fe5] focus-visible:ring-4 focus-visible:ring-blue-100"
              type="button"
            >
              View Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ModerationSummary({ post }: { post: Post }) {
  const textLabel = getTextLabel(post);
  const finalLabel = getFinalLabel(post);

  return (
    <div className="mt-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-700">
        <ShieldCheck size={16} className="text-[#1877f2]" />
        Kiểm duyệt AI
      </div>
      <div className="flex flex-wrap gap-2">
        {textLabel && <ModerationBadge label={textLabel} prefix="Văn bản" />}
        {post.image_label && <ImageModerationBadge label={post.image_label} prefix="Hình ảnh" />}
        {finalLabel && <ModerationBadge label={finalLabel} prefix="Kết luận" emphasis />}
      </div>
    </div>
  );
}

function ModerationBadge({
  label,
  prefix,
  emphasis = false,
}: {
  label: ModerationLabel;
  prefix: string;
  emphasis?: boolean;
}) {
  const config = TEXT_LABELS[label];

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${config.className} ${emphasis ? "ring-2 ring-blue-100" : ""}`}>
      {prefix}: {config.label}
    </span>
  );
}

function ImageModerationBadge({ label, prefix }: { label: ImageModerationLabel; prefix: string }) {
  const config = IMAGE_LABELS[label];

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}>
      {prefix}: {config.label}
    </span>
  );
}

function getTextLabel(post: Post): ModerationLabel | null {
  if (post.text_label) {
    return post.text_label;
  }

  if (post.sentiment === 0) return "clean";
  if (post.sentiment === 1) return "offensive";
  if (post.sentiment === 2) return "hate";
  if (post.sentiment === 3) return "scam";

  return null;
}

function getFinalLabel(post: Post): ModerationLabel | null {
  return post.final_label || getTextLabel(post);
}

function TopIcon({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button
      className={`flex h-12 w-24 items-center justify-center rounded-lg transition xl:w-28 ${
        active ? "border-b-4 border-[#1877f2] text-[#1877f2]" : "text-zinc-500 hover:bg-zinc-100"
      }`}
      type="button"
      aria-label={label}
    >
      {icon}
    </button>
  );
}

function CircleButton({ icon, label, className = "" }: { icon: React.ReactNode; label: string; className?: string }) {
  return (
    <button
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-[#e4e6eb] text-black transition hover:bg-[#d8dadf] focus-visible:ring-4 focus-visible:ring-blue-100 ${className}`}
      type="button"
      aria-label={label}
    >
      {icon}
    </button>
  );
}

function LeftItem({ label, icon, bgColor }: { label: string; icon: React.ReactNode; bgColor: string }) {
  return (
    <div className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition hover:bg-zinc-200">
      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white shadow ${bgColor}`}>
        {icon}
      </div>
      <span className="font-medium text-black">{label}</span>
    </div>
  );
}
