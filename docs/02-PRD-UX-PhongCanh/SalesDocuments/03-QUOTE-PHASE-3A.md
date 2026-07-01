# 03-QUOTE-PHASE-3A — Báo giá BG và mở lại vào POS

> **Trạng thái:** Source of Truth cho Phase 3A
> **Business:** [POS-ORDER-LIFECYCLE.md](../../03-BUSINESS-NghiepVu/Sales/POS-ORDER-LIFECYCLE.md#4-quy-tắc-báo-giá)

---

## 1. Phạm vi Phase 3A

Phase 3A gồm:

- lưu báo giá từ POS với mã `BG...`
- danh sách báo giá trong Sales Documents
- chi tiết báo giá readonly
- mở lại báo giá vào POS như nháp local
- checkout từ nháp mở lại thành hóa đơn `HD...`

Không gồm:

- Bill Preview/in báo giá
- gửi báo giá tự động
- hủy báo giá thủ công nếu chưa cần cho workflow
- sửa/hủy hóa đơn
- giữ hàng, trừ kho, công nợ, doanh thu hoặc sổ quỹ khi chỉ lưu báo giá

---

## 2. Lưu báo giá tại POS

Nút `[BÁO GIÁ]` lưu giỏ hàng hiện tại thành chứng từ `BG...`.

Sau khi lưu thành công:

- hiển thị mã báo giá đã tạo
- không tự mở Bill Preview trong Phase 3A
- nháp POS hiện tại có thể giữ lại hoặc đóng theo lựa chọn UI, nhưng báo giá đã được lưu server

Báo giá có thể lưu với khách lẻ nếu chưa chọn khách.

---

## 3. Danh sách và chi tiết báo giá

Sales Documents hiển thị báo giá cùng nhóm chứng từ bán hàng.

Bộ lọc cần hỗ trợ:

- loại chứng từ: báo giá/hóa đơn/tất cả
- trạng thái: active/converted/cancelled nếu có
- thời gian
- tìm theo mã `BG...`, khách, SĐT, ghi chú

Tìm exact mã báo giá phải bypass/widen filter thời gian mặc định giống rule chứng từ bán hàng.

Chi tiết báo giá hiển thị snapshot:

- khách hàng/khách lẻ
- nhóm khách/bảng giá tại thời điểm lưu
- dòng hàng, kích thước/m2/mét tới, số lượng
- đơn giá, chiết khấu, thành tiền
- nguồn giá và cờ giá sửa tay
- ghi chú dòng/ghi chú đơn
- lịch sử trạng thái tối thiểu

---

## 4. Mở lại vào POS draft

Khi bấm `Mở tại POS`:

1. hệ thống tải snapshot báo giá
2. tạo một tab/nháp POS local trên máy hiện tại
3. điền khách, bảng giá, dòng hàng, ghi chú theo snapshot
4. giữ nguyên đơn giá snapshot mặc định
5. hiển thị cảnh báo nếu giá/sản phẩm hiện tại khác snapshot

Không tạo server draft trong Phase 3A.

Nếu sản phẩm inactive/missing:

- vẫn hiển thị dòng snapshot để nhân viên biết báo giá cũ có gì
- không cho checkout âm thầm
- nhân viên phải thay thế dòng hoặc xử lý sản phẩm trước khi chốt

---

## 5. Lưu lại báo giá sau khi sửa

Nếu mở lại báo giá, sửa nội dung rồi bấm `[BÁO GIÁ]`, hệ thống tạo revision mới:

```text
BG000123 -> BG000123.01
```

Không ghi đè snapshot báo giá cũ.

Phase 3A chỉ cần audit tối thiểu: ai tạo, lúc nào, trạng thái và liên kết revision. Màn diff chi tiết để sau.

---

## 6. Checkout từ báo giá

Khi checkout từ nháp có nguồn báo giá:

- tạo hóa đơn `HD...`
- lưu `source_quote_id` và `source_quote_code`
- hóa đơn dùng snapshot cuối cùng trên POS tại thời điểm checkout
- báo giá nguồn đổi sang `converted`
- không cho checkout lại từ báo giá đã `converted`

Báo giá không giữ hàng và không tạo sản xuất; nếu khách đồng ý thì checkout mới là mốc trừ kho/tiền/công nợ theo rule hóa đơn.

