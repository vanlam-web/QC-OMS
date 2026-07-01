# 03-QUOTE-PHASE-3A — Báo giá BG từ đơn nháp POS

> **Trạng thái:** Source of Truth cho Phase 3A
> **Business:** [POS-ORDER-LIFECYCLE.md](../../03-BUSINESS-NghiepVu/Sales/POS-ORDER-LIFECYCLE.md#4-quy-tắc-báo-giá)

---

## 1. Phạm vi Phase 3A

Phase 3A làm báo giá như một nhánh đơn giản từ đơn nháp POS:

```text
POS draft
  -> bấm Thanh toán: tạo hóa đơn HD...
  -> bấm Lưu báo giá: tạo báo giá BG...
```

Phạm vi gồm:

- lưu báo giá từ POS draft với mã `BG...`
- hiển thị báo giá trong danh sách chứng từ/hóa đơn bằng bộ lọc `Báo giá`
- chi tiết báo giá readonly trong màn chứng từ
- bấm báo giá để mở lại vào POS như nháp local
- từ nháp mở lại, nhân viên có thể lưu thành báo giá mới hoặc thanh toán thành hóa đơn như nháp bình thường

Không gồm:

- Bill Preview/in báo giá
- gửi báo giá tự động
- module/menu báo giá riêng ngoài chứng từ bán hàng
- tự hủy/hết hạn báo giá theo thời gian
- hủy báo giá thủ công
- sao chép báo giá như một chức năng riêng
- sửa báo giá kiểu revision `BG...01`
- đổi báo giá sang trạng thái `converted`
- sửa/hủy hóa đơn
- giữ hàng, trừ kho, công nợ, doanh thu hoặc sổ quỹ khi chỉ lưu báo giá

---

## 2. Lưu báo giá tại POS

Trong POS draft, nút `[BÁO GIÁ]` là lựa chọn thay thế cho `[THANH TOÁN]`.

```text
Đơn nháp đang nhập
  -> [BÁO GIÁ] lưu BG...
  -> [THANH TOÁN] lưu HD...
```

Nút `[BÁO GIÁ]` lưu giỏ hàng hiện tại thành chứng từ `BG...`.

Sau khi lưu thành công:

- hiển thị mã báo giá đã tạo
- không tự mở Bill Preview trong Phase 3A
- nháp POS hiện tại có thể giữ lại hoặc đóng theo lựa chọn UI, nhưng báo giá đã được lưu server

Báo giá có thể lưu với khách lẻ nếu chưa chọn khách.

---

## 3. Danh sách và chi tiết báo giá

Không có menu/mục báo giá riêng trong MVP.

Sales Documents/danh sách hóa đơn-chứng từ hiển thị báo giá cùng nhóm chứng từ bán hàng. Người dùng xem báo giá bằng bộ lọc loại chứng từ `Báo giá`.

Bộ lọc cần hỗ trợ:

- loại chứng từ: báo giá/hóa đơn/tất cả
- trạng thái: active cho báo giá MVP
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

Khi người dùng nhấp vào một báo giá trong danh sách chứng từ, màn chi tiết báo giá có thao tác `Tạo hóa đơn` hoặc `Mở tại POS`.

Khi bấm thao tác đó:

1. hệ thống tải snapshot báo giá
2. tạo một tab/nháp POS local trên máy hiện tại
3. điền khách, bảng giá, dòng hàng, ghi chú theo snapshot
4. giữ nguyên đơn giá snapshot mặc định
5. hiển thị cảnh báo nếu giá/sản phẩm hiện tại khác snapshot

Không tạo server draft trong Phase 3A. POS chỉ nhận lại snapshot báo giá thành một nháp local để nhân viên kiểm tra/sửa lần cuối.

### 4.1. Cảnh báo khi mở lại

UI phải gom cảnh báo ở đầu nháp hoặc trên từng dòng, không tự sửa dữ liệu thay người dùng.

| Mã cảnh báo | Khi nào | Hành vi Phase 3A |
|---|---|---|
| `CURRENT_PRICE_DIFFERS` | Giá hiện tại theo bảng giá khác giá snapshot | Giữ giá snapshot; hiển thị nút/tuỳ chọn cập nhật thủ công nếu UI có |
| `PRODUCT_INACTIVE` | Sản phẩm còn tồn tại nhưng đã ngưng bán | Hiển thị dòng snapshot; không cho checkout cho tới khi thay dòng hoặc xử lý sản phẩm |
| `PRODUCT_MISSING` | Sản phẩm không còn tìm thấy trong danh mục | Hiển thị dòng snapshot; không cho checkout cho tới khi thay dòng |
| `PRICE_LIST_INACTIVE` | Bảng giá snapshot không còn active | Giữ giá snapshot; cảnh báo để nhân viên biết |
| `CUSTOMER_CHANGED` | Hồ sơ khách hiện tại khác snapshot đáng kể hoặc khách đã inactive | Giữ snapshot; cho nhân viên chọn lại khách nếu cần |

Không cần chặn lưu lại báo giá chỉ vì `CURRENT_PRICE_DIFFERS` hoặc `PRICE_LIST_INACTIVE`. Chỉ chặn checkout khi còn dòng `PRODUCT_INACTIVE` hoặc `PRODUCT_MISSING` chưa xử lý.

Nếu sản phẩm inactive/missing:

- vẫn hiển thị dòng snapshot để nhân viên biết báo giá cũ có gì
- không cho checkout âm thầm
- nhân viên phải thay thế dòng hoặc xử lý sản phẩm trước khi chốt

---

## 5. Hướng xử lý nháp mở từ báo giá

Mở báo giá cũ không phải là sửa báo giá và cũng không phải sao chép chứng từ có quan hệ.

```text
BG000123 -> Mở tại POS -> POS draft local
```

Từ nháp POS đó có 3 hướng:

- bấm `[BÁO GIÁ]`: tạo một báo giá mới độc lập với mã `BG...` mới
- bấm `[THANH TOÁN]`: tạo hóa đơn `HD...` như đơn hàng bình thường
- bấm `X`/đóng tab: không ghi gì thêm, báo giá gốc giữ nguyên

Quy tắc:

- không ghi đè snapshot báo giá cũ
- không tạo revision `BG000123.01`
- không tạo liên kết copy/source giữa báo giá cũ và báo giá mới
- không đổi trạng thái báo giá gốc
- báo giá gốc vẫn `active` để tra cứu hoặc mở lại làm mẫu nội dung về sau

## 6. Thanh toán từ nháp mở lại

Khi nhân viên mở báo giá cũ vào POS draft rồi bấm `[THANH TOÁN]`:

- tạo hóa đơn `HD...`
- hóa đơn dùng snapshot cuối cùng trên POS tại thời điểm checkout
- xử lý kho/tiền/công nợ/doanh thu giống checkout POS bình thường
- báo giá gốc không đổi trạng thái và không bị khóa dùng lại

Báo giá không giữ hàng và không tạo sản xuất; nếu khách đồng ý thì checkout mới là mốc trừ kho/tiền/công nợ theo rule hóa đơn.

---

## 6.1. Báo giá không dùng nữa

Nếu khách không làm nữa, Phase 3A không cần thao tác gì.

Quy tắc:

- không tự hủy
- không bắt nhân viên bấm hủy
- không xóa báo giá
- không ảnh hưởng kho/tiền/công nợ/doanh thu
- báo giá cũ vẫn nằm trong danh sách để tra cứu

Lý do: báo giá không phát sinh dữ liệu liên kết nên để nguyên không gây ảnh hưởng nghiệp vụ. Nếu sau này muốn dùng lại nội dung báo giá cũ, chỉ cần mở báo giá đó vào POS draft, sửa nếu cần, rồi lưu báo giá mới hoặc thanh toán.

### 6.2. Không làm chức năng sao chép báo giá riêng

Owner chốt bỏ thao tác `Sao chép báo giá`.

Không cần nút/endpoint/flow copy riêng vì `Mở tại POS` đã đủ đơn giản:

- mở báo giá cũ thành POS draft
- sửa khách/dòng/giá/ghi chú nếu cần
- bấm `[BÁO GIÁ]` để tạo báo giá mới độc lập
- hoặc bấm `[THANH TOÁN]` để tạo hóa đơn
- đóng bằng `X` thì không làm gì

---

## 7. Acceptance Criteria Phase 3A

- Lưu báo giá tạo mã `BG...`, trạng thái `active`, không tạo stock/cash/debt/revenue.
- Sales Documents tìm được báo giá theo mã exact dù filter thời gian mặc định đang che kết quả.
- Không có menu/module báo giá riêng; báo giá nằm trong danh sách chứng từ với bộ lọc `Báo giá`.
- Chi tiết báo giá hiển thị snapshot, không tự cập nhật theo danh mục/bảng giá hiện tại.
- Mở lại báo giá tạo POS draft local, không tạo bản ghi server draft.
- Reopen giữ giá snapshot mặc định và trả cảnh báo nếu giá hiện tại khác.
- Dòng sản phẩm inactive/missing không bị mất khỏi nháp, nhưng checkout bị chặn cho tới khi dòng được xử lý.
- Bấm `[BÁO GIÁ]` từ nháp mở lại tạo báo giá mới độc lập, không revision/copy link.
- Bấm `[THANH TOÁN]` từ nháp mở lại tạo hóa đơn như checkout POS bình thường.
- Đóng nháp bằng `X` không ghi gì thêm.
- Báo giá không tự hết hạn/hủy theo thời gian.
- Phase 3A không có nút hủy báo giá thủ công.
