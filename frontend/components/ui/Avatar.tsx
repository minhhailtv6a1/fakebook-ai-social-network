import type { User } from "@/lib/types";

interface AvatarProps {
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-9 w-9 text-sm",
  md: "h-11 w-11 text-base",
  lg: "h-12 w-12 text-lg",
};

export default function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "F";

  return (
    <div
      className={`${sizeClasses[size]} flex shrink-0 items-center justify-center rounded-full bg-[#1877f2] font-bold text-white shadow-sm ${className}`}
      aria-label={name ? `${name} avatar` : "User avatar"}
    >
      {initial}
    </div>
  );
}

export function UserAvatar({ user, size = "md" }: { user: User | null; size?: AvatarProps["size"] }) {
  return <Avatar name={user?.username} size={size} />;
}
