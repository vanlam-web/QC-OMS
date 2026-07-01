# BOM API — Backend contract mức khung

> **Trạng thái:** Draft kỹ thuật từ Source of Truth nghiệp vụ
> **Business:** [BOM-RULES.md](../../03-BUSINESS-NghiepVu/BOM/BOM-RULES.md)

---

## 1. Endpoints tối thiểu

| Method | Path | Mục đích |
|---|---|---|
| `GET` | `/v1/products/{product_id}/bom` | Lấy BOM active của sản phẩm |
| `POST` | `/v1/products/{product_id}/bom` | Tạo BOM/version mới |
| `GET` | `/v1/boms/{bom_id}` | Chi tiết BOM/version |
| `POST` | `/v1/boms/{bom_id}/activate` | Đặt version làm active |
| `POST` | `/v1/boms/preview` | Deep-scan BOM để xem vật tư lá/chi phí tham khảo |
| `POST` | `/v1/boms/validate` | Kiểm tra vòng lặp, thiếu cấu hình, độ sâu |

---

## 2. Checkout contract

Checkout/POS cần gửi hoặc tham chiếu BOM theo 2 cách:

| Trường hợp | Contract |
|---|---|
| Dùng BOM chuẩn | Gửi `bom_id`/`version` hoặc backend resolve active BOM tại thời điểm checkout |
| BOM phát sinh trên dòng | Gửi `line_bom_snapshot` trong order item payload |

Backend phải lưu snapshot BOM đã dùng vào chứng từ trước khi tạo stock movement.

---

## 3. Deep-scan

Backend deep-scan BOM:

1. bắt đầu từ BOM của dòng bán
2. nhân định mức theo số lượng dòng
3. nếu component có BOM con, tiếp tục mở rộng
4. dừng ở vật tư lá cuối cùng
5. gom các vật tư cùng sản phẩm/đơn vị nếu hợp lệ
6. trả về danh sách tiêu hao để checkout tạo stock movement

Validation:

- chặn vòng lặp
- tối đa 5 cấp mặc định
- thiếu BOM con thì trả warning/flag; không chặn checkout trong MVP nếu nghiệp vụ cho phép bán tiếp

---

## 4. Inventory integration

BOM API chỉ tính vật tư cần trừ. Việc chọn cuộn/tấm nào và ghi stock movement vẫn theo Inventory service/rules.

Không được trừ tổng `m2` trực tiếp cho hàng `roll` hoặc `sheet`.
