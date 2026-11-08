# Locket-XVIP — All-In-One Super VIP Pro Max 🚀

Được phát triển và tối ưu bởi **Xwuan** ([@Xwuan19](https://github.com/Xwuan19)).

Tích hợp hoàn hảo **2 trong 1**:
1. **Lớp Bản Quyền (RevenueCat)**: Mở khóa đặc quyền **Locket Gold** vĩnh viễn (`locket_1600_1y`).
2. **Lớp Cấu Hình Nâng Cao (Firebase Remote Config)**: Đẩy chất lượng ảnh/video lên **Ultra HD**, thời lượng quay **30 giây chuẩn thực tế** (đồng bộ model `camera` & `camera_roll`), **vô hạn bạn bè** (999.999), kích hoạt **Ai đã xem**, **Khôi phục Streak**, **AI Camera Filters**, **Custom Overlays/Captions** và **Chặn 100% quảng cáo**.

---

## 📲 Hướng Dẫn Cài Đặt Cho Từng App

### 1. Shadowrocket (Khuyên dùng)
Bạn có 2 lựa chọn module tùy theo nhu cầu:

#### Lựa chọn A: Bản Super VIP Pro Max (Gold + 30s Video + AI Filters + Vô Hạn Bạn Bè)
- Dán URL sau vào mục **Mô-đun (Modules)** trong Shadowrocket:
```text
https://raw.githubusercontent.com/Xwuan19/Locket-XVIP/main/modules/Locket_XVIP.module
```

#### Lựa chọn B: Bản Gold Thuần Siêu Ổn Định (Pure Gold 30s)
- Nhẹ nhàng, ổn định 100%, chuyên mở khóa Locket Gold qua RevenueCat & Remote Config:
```text
https://raw.githubusercontent.com/Xwuan19/Locket-XVIP/main/modules/Locket_Gold.module
```

> [!IMPORTANT]
> **2 BƯỚC BẮT BUỘC ĐỂ KÍCH HOẠT THÀNH CÔNG:**
> 1. Đảm bảo Shadowrocket đã bật **Giải mã HTTPS (HTTPS Decryption / MitM)** và đã **Tin cậy chứng nhận đầy đủ** trong `Cài đặt > Cài đặt chung > Giới thiệu > Cài đặt tin cậy chứng nhận`.
> 2. **XÓA APP LOCKET ĐI TẢI LẠI TỪ APP STORE:** Firebase Remote Config trên iPhone lưu cache SQLite nội bộ (12 tiếng). Bắt buộc xóa app tải lại để Locket kéo cấu hình 30s và AI Filters mới về máy! (Sau này dùng bình thường không cần xóa lại).

### 2. Surge
- Mở **Surge** > tab **Modules** > **Install New Module**.
- Dán URL:
```text
https://raw.githubusercontent.com/Xwuan19/Locket-XVIP/main/modules/Locket_RemoteConfig.sgmodule
```

### 3. Loon
- Mở **Loon** > tab **Plugin** > bấm dấu `+`.
- Dán URL:
```text
https://raw.githubusercontent.com/Xwuan19/Locket-XVIP/main/modules/Locket_RemoteConfig.plugin
```

### 4. Quantumult X
- Mở **Quantumult X** > mục **Rewrite** > chọn **Snippet**.
- Thêm snippet từ URL:
```text
https://raw.githubusercontent.com/Xwuan19/Locket-XVIP/main/modules/Locket_RemoteConfig.snippet
```

### 5. Stash
- Mở **Stash** > mục **Overrides** > bấm dấu `+`.
- Dán URL:
```text
https://raw.githubusercontent.com/Xwuan19/Locket-XVIP/main/modules/Locket_RemoteConfig.stoverride
```

---

## 🌟 Vì Sao Module Này Toàn Diện Hơn Bản Thông Thường?

| Tính Năng | Locket Miễn Phí | Bản RevenueCat Đơn Thuần | **Locket-XVIP (Bản Này)** |
| :--- | :---: | :---: | :---: |
| **Locket Gold** | ❌ Không | ✅ Có | ✅ **Có (Trọn đời 2099)** |
| **Quay video** | 5 – 10 giây | 10 – 15 giây | 🎬 **30 giây (Chuẩn Nightmarket 30.0s)** |
| **Bộ lọc Camera (AI Filters)** | ❌ Không | ❌ Không | ✨ **Mở khóa 100% Ống kính & AI Filters** |
| **Chất lượng ảnh/video** | Bị nén mờ (1440px) | Bị nén mờ (1440px) | 💎 **Chuẩn gốc (1440px, 100% upload thành công)** |
| **Giới hạn bạn bè** | 20 người | 20 người | 👥 **999.999 người (Vô hạn)** |
| **Ai đã xem ảnh (Views)** | ❌ Không | ❌ Không | 👀 **Hiển thị đầy đủ** |
| **Khôi phục Streak** | Bị tính phí | Bị tính phí | 🔄 **Miễn phí 999 lần** |
| **Chặn quảng cáo** | ❌ Có quảng cáo | ❌ Có quảng cáo | 🚫 **Chặn sạch 100% Ads** |
| **Độ ổn định kết nối** | Mặc định | Mặc định | 🛡️ **Không sửa request Firebase, bảo toàn 100% App Check** |

---

## 🧪 Kiểm Thử Tự Động (Automated Testing)

Toàn bộ script RevenueCat và Firebase Remote Config đã được kiểm thử tự động với Node.js:
```bash
node tests/integration.test.js
```
Kết quả: 100% test case pass, dữ liệu JSON hợp lệ tuyệt đối.
