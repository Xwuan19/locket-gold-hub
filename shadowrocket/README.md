# Locket VIP — All-In-One Module 🚀

Được phát triển và tối ưu bởi **Xwuan** ([@Xwuan19](https://github.com/Xwuan19)).

Tập trung 1 module VIP duy nhất, đầy đủ các tính năng thực tế đang có:
- **Locket Gold**: Mở khóa Gold vĩnh viễn (`locket_1600_1y`), xem ai đã xem ảnh (views), biểu tượng ứng dụng, huy hiệu Gold.
- **Quay video 30 giây**: Thời lượng quay video 30.0s thực tế (đồng bộ camera & camera_roll).
- **Bộ lọc AI & Photobooth**: Đầy đủ photobooth 2 ảnh, photobooth 4 ảnh (Chiikawa, Hello Kitty, Sinh nhật...), Sticker & Khung ảnh hot trend tiếng Việt, nút Tạo diện mạo (AI Likeness).
- **Khung Widget & Caption VIP**: Khung widget tùy chỉnh và bộ caption tiếng Việt đa chủ đề.
- **Vô hạn bạn bè & Khôi phục Streak**: Bỏ giới hạn bạn bè, khôi phục streak miễn phí.
- **Chặn quảng cáo**: Chặn sạch quảng cáo và telemetry rác (Sentry).

---

## 📲 Cài Đặt Cho Shadowrocket

Dán trực tiếp URL module sau vào mục **Mô-đun (Modules)** trong Shadowrocket:

```text
https://raw.githubusercontent.com/Xwuan19/locket-gold-hub/main/shadowrocket/modules/Locket_VIP.module
```

> [!IMPORTANT]
> **2 BƯỚC BẮT BUỘC ĐỂ KÍCH HOẠT THÀNH CÔNG:**
> 1. Đảm bảo Shadowrocket đã bật **Giải mã HTTPS (HTTPS Decryption / MitM)** và đã **Tin cậy chứng nhận đầy đủ** trong `Cài đặt > Cài đặt chung > Giới thiệu > Cài đặt tin cậy chứng nhận`.
> 2. **XÓA APP LOCKET ĐI TẢI LẠI TỪ APP STORE:** Firebase Remote Config trên iPhone lưu cache SQLite nội bộ (12 tiếng). Bắt buộc xóa app tải lại để Locket kéo cấu hình 30s và AI Filters mới về máy! (Sau này dùng bình thường không cần xóa lại).

---

## Ứng Dụng Khác (Surge / Loon / Quantumult X / Stash)

- **Surge**: `https://raw.githubusercontent.com/Xwuan19/locket-gold-hub/main/shadowrocket/modules/Locket_RemoteConfig.sgmodule`
- **Loon**: `https://raw.githubusercontent.com/Xwuan19/locket-gold-hub/main/shadowrocket/modules/Locket_RemoteConfig.plugin`
- **Quantumult X**: `https://raw.githubusercontent.com/Xwuan19/locket-gold-hub/main/shadowrocket/modules/Locket_RemoteConfig.snippet`
- **Stash**: `https://raw.githubusercontent.com/Xwuan19/locket-gold-hub/main/shadowrocket/modules/Locket_RemoteConfig.stoverride`
