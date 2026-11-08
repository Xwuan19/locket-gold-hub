# 💛 Locket Gold Hub (Monorepo)

Monorepo thống nhất toàn bộ giải pháp mở khóa Locket Gold (30s Video Real, Photobooth 4-cut, AI Likeness Filters, Trending Widget Frames):

---

## 🏗️ Cấu Trúc Dự Án

```text
locket-gold-hub/
├── shadowrocket/          # 📱 Cơ chế 1: Client Rules (Shadowrocket / Loon / Surge)
│   ├── js/                # Script xử lý Firebase RemoteConfig & RevenueCat
│   ├── modules/           # Module cấu hình (.sgmodule, .plugin, .module)
│   └── assets/            # Khung ảnh VIP (Low G, Kitty Shin, Citopia)
│
├── proxy/                 # ⚡ Cơ chế 2: Backend TLS MITM Proxy (Go on Fly.io)
│   ├── handler/           # Xử lý tiêm tính năng tương đương Shadowrocket
│   ├── tls/               # Cấp chứng chỉ SSL động (SNI Leaf Forging)
│   └── Dockerfile         # Image deploy Fly.io
│
├── api/                   # 🌐 Serverless API (Vercel)
│   ├── create-account.js  # Tự động cấp tài khoản NextDNS riêng biệt (300k query)
│   ├── check-usage.js     # Theo dõi số lượng query và trạng thái thiết bị
│   └── generate-profile.js# Sinh file .mobileconfig cài đặt trực tiếp
│
├── public/                # 💻 Web Portal (1-Click cài đặt không cần VPN)
├── ca/                    # 🔐 Root CA Certificate
└── fly.toml               # Cấu hình hạ tầng Fly.io
```

---

## 🔄 Quy Trình Phát Triển (Workflow)

1. **Thử nghiệm trên Shadowrocket/Loon (`shadowrocket/js`)**:
   - Viết tính năng mới (filter, frame, bypass payload).
   - Kiểm thử trực tiếp trên điện thoại bằng app proxy client.
2. **Đồng bộ sang Go Proxy (`proxy/handler`)**:
   - Khi logic hoạt động ổn định trên Shadowrocket, chuyển payload tương ứng vào `proxy/handler/firebase.go` hoặc `proxy/handler/revenuecat.go`.
   - Chạy test xác nhận: `go test ./tests/proxy/...`
3. **Deploy đồng bộ**:
   - `shadowrocket`: commit và push lên GitHub (link raw tự động cập nhật).
   - `proxy`: deploy tự động sang Fly.io (`flyctl deploy --app locket-proxy`).
   - `web portal`: deploy tự động sang Vercel (`vercel deploy --prod`).
