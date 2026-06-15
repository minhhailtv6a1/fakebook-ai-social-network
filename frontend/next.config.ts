import { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ...giữ nguyên các cấu hình khác của bạn...
  allowedDevOrigins: ["http://192.168.1.9:3000"], // thêm origin bạn đang dùng
};

export default nextConfig;
