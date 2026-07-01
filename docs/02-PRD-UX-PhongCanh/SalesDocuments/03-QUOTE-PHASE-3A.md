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
- checkout từ nháp mở lại thành hóa đơn `HD...`

Không gồm:

- Bill Preview/in báo giá
- gửi báo giá tự động
- module/menu báo giá riêng ngoài chứng từ bán hàng
- tự hủy/hết hạn báo giá theo thời gian
- hủy báo giá thủ công
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

## 5. Lưu lại báo giá sau khi sửa

Nếu mở lại báo giá, sửa nội dung rồi bấm `[BÁO GIÁ]`, hệ thống tạo revision mới:

```text
BG000123 -> BG000123.01
```

Không ghi đè snapshot báo giá cũ.

Phase 3A chỉ cần audit tối thiểu: ai tạo, lúc nào, trạng thái và liên kết revision. Màn diff chi tiết để sau.

Nếu báo giá gốc đã `converted`, không tạo revision từ báo giá đó trong Phase 3A. Nhân viên phải tạo báo giá/đơn mới để tránh làm mơ hồ hóa đơn đã sinh từ bản báo giá nào.

Nếu muốn thao tác gọn hơn ở UI, Phase 3A có thể ẩn nút `Lưu lại báo giá` sau khi mở từ báo giá và chỉ ưu tiên `Thanh toán`. Rule revision vẫn là chuẩn nếu sau này cho lưu lại bản báo giá đã sửa.

---

## 6. Checkout từ báo giá

Khi checkout từ nháp có nguồn báo giá:

- tạo hóa đơn `HD...`
- lưu `source_quote_id` và `source_quote_code`
- hóa đơn dùng snapshot cuối cùng trên POS tại thời điểm checkout
- báo giá nguồn đổi sang `converted`
- không cho checkout lại từ báo giá đã `converted`

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

Lý do: báo giá không phát sinh dữ liệu liên kết nên để nguyên không gây ảnh hưởng nghiệp vụ. Sau này có thể dùng lại nội dung báo giá cũ để tạo báo giá tương tự cho khách khác nếu mở chức năng sao chép.

### 6.2. Sao chép báo giá

Owner chốt hướng future: có nút `Sao chép báo giá`.

Hành vi:

1. Người dùng mở một báo giá cũ.
2. Bấm `Sao chép báo giá`.
3. Hệ thống mở nội dung báo giá cũ thành một POS draft mới.
4. Nhân viên có thể chọn/đổi khách hàng khác, sửa dòng hàng/giá/ghi chú nếu cần.
5. Khi bấm `[BÁO GIÁ]`, hệ thống tạo mã `BG...` mới độc lập.

Quy tắc:

- Không phải revision `BG000123.01`.
- Không đổi trạng thái báo giá gốc.
- Không liên kết như `source_quote_id` của hóa đơn.
- Báo giá gốc chỉ là nguồn sao chép/tham khảo.
- Chức năng này là future phase, không bắt buộc trong Phase 3A.

---

## 7. Acceptance Criteria Phase 3A

- Lưu báo giá tạo mã `BG...`, trạng thái `active`, không tạo stock/cash/debt/revenue.
- Sales Documents tìm được báo giá theo mã exact dù filter thời gian mặc định đang che kết quả.
- Không có menu/module báo giá riêng; báo giá nằm trong danh sách chứng từ với bộ lọc `Báo giá`.
- Chi tiết báo giá hiển thị snapshot, không tự cập nhật theo danh mục/bảng giá hiện tại.
- Mở lại báo giá tạo POS draft local, không tạo bản ghi server draft.
- Reopen giữ giá snapshot mặc định và trả cảnh báo nếu giá hiện tại khác.
- Dòng sản phẩm inactive/missing không bị mất khỏi nháp, nhưng checkout bị chặn cho tới khi dòng được xử lý.
- Lưu lại báo giá đã sửa tạo revision `BG...01`, không ghi đè báo giá cũ.
- Checkout từ báo giá tạo `HD...`, lưu `source_quote_id/source_quote_code`, đổi quote sang `converted` trong cùng transaction.
- Báo giá đã `converted` không checkout lại và không tạo revision trong Phase 3A.
- Báo giá không tự hết hạn/hủy theo thời gian.
- Phase 3A không có nút hủy báo giá thủ công.
