# 02-SYSTEM-SETTINGS — Thiết lập hệ thống

> **Trạng thái:** 🔨 Đang xây dựng  
> **Nguồn tham khảo:** KiotViet `Settings` audit ngày `2026-07-01`

---

## 1. Mục tiêu

Trang Thiết lập gom các cấu hình nền cần cho vận hành QC-OMS.

Mục tiêu là đủ dùng cho xưởng quảng cáo Văn Lâm, không bê nguyên toàn bộ thiết lập retail của KiotViet.

---

## 2. Nhóm Thiết Lập Giữ Lại

| Nhóm | Nội dung giữ | Ghi chú |
|---|---|---|
| Thông tin cửa hàng | Tên cửa hàng/xưởng, điện thoại, địa chỉ, logo nếu cần | Dùng cho bill, báo cáo và thông tin nội bộ |
| Người dùng & quyền | Tài khoản, trạng thái, permission, lịch sử đổi quyền | Chi tiết ở `01-USERS-PERMISSIONS.md` |
| Chi nhánh | Giữ nền tảng chi nhánh, nhưng MVP có thể chỉ có `Chi nhánh trung tâm` | Không thiết kế luồng chuyển hàng liên chi nhánh trong MVP |
| Bảo mật | Xác thực khi xuất file, cảnh báo đăng nhập lạ, 2FA nếu triển khai được | Không hiển thị token/mật khẩu/key trong UI/log |
| Tài khoản quỹ | Tiền mặt và từng tài khoản ngân hàng | Nằm trong Finance/Sổ quỹ; không dùng ví điện tử MVP |
| Mẫu in/bill | Mẫu bill thường, chọn/in lại bill | Không phải HĐĐT |
| Hàng hóa nền | Đơn vị tính, nhóm hàng, phương pháp giá vốn tham khảo, cấu hình sản xuất/BOM sau MVP | Chi tiết nằm ở Inventory/PriceBook/BOM |
| Lịch sử thao tác | Xem audit log thao tác quan trọng | Không cho sửa/xóa log từ UI thường |

---

## 3. Nhóm Thiết Lập Loại Khỏi QC-OMS Hiện Tại

| KiotViet | Quyết định QC-OMS |
|---|---|
| Giao hàng, đối tác vận chuyển, COD | Bỏ. QC-OMS chỉ bán đứt tại xưởng |
| Thanh toán QR ting ting, đăng ký bank partner, NAPAS, ví MoMo/ZaloPay | Bỏ khỏi MVP. QC-OMS chỉ ghi nhận tiền mặt/chuyển khoản vào tài khoản ngân hàng đã khai báo |
| Gửi SMS/Zalo theo nhà cung cấp marketing | Bỏ. QC-OMS chỉ hỗ trợ mở/copy/gửi ảnh bill theo cấu hình khách đã chốt trong POS |
| Thuế & Kế toán, VAT | Bỏ |
| Hóa đơn điện tử | Bỏ |
| Ngoại tệ và tỷ giá | Bỏ. Mặc định dùng VND |
| Đặt hàng, trả hàng, thu khác kiểu retail, chặn HĐĐT | Bỏ theo scope bán đứt/no-HĐĐT |
| Tích điểm, voucher, coupon, khuyến mại campaign | Bỏ khỏi MVP |
| Bảo hành/bảo trì/sửa chữa retail | Bỏ |
| Thương hiệu/thuộc tính retail | Không tạo module riêng; nếu cần ghi trong tên/mã/nhóm hàng |
| Xóa dữ liệu gian hàng theo lịch | Không làm UI thường. Nếu cần reset dữ liệu phải là runbook kỹ thuật có backup và quyền đặc biệt |
| Cân điện tử | Bỏ hiện tại, vì xưởng chưa có nghiệp vụ cân bán hàng |

---

## 4. Quy Tắc UX

- Trang Settings chỉ hiển thị nhóm cấu hình có trong scope QC-OMS.
- Không hiện các menu đã loại để tránh người dùng tưởng hệ thống có nghiệp vụ đó.
- Cấu hình ảnh hưởng tiền/kho/quyền phải ghi audit log.
- Thao tác nguy hiểm như vô hiệu hóa tài khoản quản trị cuối cùng, xóa dữ liệu, hoặc xóa tài khoản ngân hàng đang có giao dịch phải bị chặn.
- Nếu cấu hình đang được chứng từ sử dụng, UI cho đổi trạng thái `inactive` thay vì xóa vật lý.

---

## 5. Acceptance Criteria UX

1. Admin xem và sửa được thông tin cửa hàng cơ bản.
2. Admin quản lý được tài khoản/quyền từ nhóm System.
3. Admin quản lý được danh sách tài khoản ngân hàng từ Finance hoặc link nhanh trong Settings.
4. Settings không hiển thị giao hàng/COD/online/VAT/HĐĐT/QR partner/ví điện tử/ngoại tệ.
5. Các thay đổi cấu hình quan trọng có audit log.
6. Không có thao tác xóa dữ liệu hàng loạt trong UI vận hành thường ngày.

---

← [Quay về System README](./README.md)
