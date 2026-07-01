# POS-ORDER-LIFECYCLE — Vòng đời đơn hàng POS

> **Trạng thái:** 🔨 Đang xây dựng

---

## 1. MỤC ĐÍCH

Tài liệu này là Source of Truth cho trạng thái đơn hàng POS, gồm hóa đơn nháp, báo giá và hóa đơn bán hàng.

QC-OMS không có nghiệp vụ `Đặt hàng` kiểu KiotViet trong MVP. Luồng bán hàng là **bán đứt**: khi checkout thành công thì sinh hóa đơn bán hàng, trừ kho, ghi nhận tiền/công nợ theo quy tắc checkout.

---

## 2. LOẠI MÃ ĐƠN

| Loại | Mã | Ý nghĩa |
|---|---|---|
| Hóa đơn nháp | Chưa có mã chính thức hoặc dùng tên tab tạm | Đang nhập/sửa trên POS, chưa lưu thành chứng từ bán hàng |
| Báo giá | `BG...` | Đơn hàng ở trạng thái báo giá, dùng để gửi giá cho khách |
| Hóa đơn bán hàng | `HD...` | Đơn hàng đã xác nhận bán/thanh toán |

---

## 3. QUY TẮC HÓA ĐƠN NHÁP

### BR-ORD-01: Nháp POS không phải chứng từ bán hàng

Hóa đơn nháp trên POS là trạng thái làm việc tạm thời của máy bán hàng.

Nháp chưa có mã chứng từ chính thức và chưa phát sinh doanh thu, kho, sổ quỹ hoặc công nợ.

### BR-ORD-02: Nháp được giữ theo máy POS

Mỗi máy POS có bộ nháp riêng.

Nháp đang mở trên máy A không tự xuất hiện trên máy B.

Nháp được giữ lại để nhân viên không mất dữ liệu khi reload, đóng trình duyệt hoặc khởi động lại máy.

### BR-ORD-03: Nháp bị xóa khi đóng tab hoặc hoàn tất chứng từ

Nháp chỉ bị xóa khỏi vùng làm việc khi:

- nhân viên chủ động đóng tab và xác nhận nếu tab có dữ liệu
- báo giá/hóa đơn liên quan đã được xử lý xong và nhân viên đóng tab
- thanh toán hóa đơn thành công

### BR-ORD-04: Một khách có thể có nhiều nháp

Một khách hàng có thể có nhiều hóa đơn nháp cùng lúc trên cùng máy POS.

Khi cần thêm dữ liệu vào nháp của khách mà khách có nhiều nháp, nhân viên phải chọn nháp cần thêm hoặc tạo nháp mới.

---

## 4. QUY TẮC BÁO GIÁ

### BR-QUOTE-00: Phạm vi Phase 3A

Phase 3A làm báo giá như một nhánh từ đơn nháp POS:

```text
POS draft -> Thanh toán -> HD...
POS draft -> Lưu báo giá -> BG...
```

Phase 3A chỉ chốt các năng lực:

- lưu báo giá từ POS với mã `BG...`
- xem danh sách/chi tiết báo giá trong Sales Documents bằng bộ lọc `Báo giá`
- mở lại báo giá vào POS như một nháp local để sửa hoặc checkout
- checkout từ báo giá sang hóa đơn `HD...`

Không bao gồm trong Phase 3A:

- Bill Preview/in báo giá
- gửi báo giá tự động
- menu/module báo giá riêng ngoài danh sách chứng từ
- tự hủy/hết hạn báo giá theo thời gian
- hủy báo giá thủ công
- giữ hàng
- trừ kho
- ghi tiền, công nợ hoặc doanh thu
- tạo production job/lệnh sản xuất
- delivery/COD/kênh bán/VAT/HĐĐT

Bill Preview/in báo giá tách sang Phase 3B. Owner đã chốt Phase 3B làm đơn giản trước: một mẫu báo giá mặc định để xem/in/gửi thủ công, chưa làm nhiều mẫu bill hoặc tự gửi.

### BR-QUOTE-01: Báo giá vẫn lưu trong đơn hàng

Báo giá được lưu trong nhóm dữ liệu đơn hàng/chứng từ để dễ quản lý, tra cứu và mở lại.

Không làm một module báo giá riêng trong MVP. Người dùng tìm báo giá trong danh sách chứng từ/hóa đơn bằng bộ lọc loại chứng từ `Báo giá`.

Báo giá không phải hóa đơn bán hàng hoàn thành.

Báo giá cũng không phải đơn đặt hàng:

- không giữ hàng
- không tạo vận đơn/giao hàng
- không tạo lệnh sản xuất
- không phát sinh doanh thu, tiền, kho hoặc công nợ

### BR-QUOTE-02: Không phát sinh kho và tiền

Khi tạo báo giá:

- Không trừ kho.
- Không ghi sổ quỹ.
- Không ghi công nợ.
- Không ghi doanh thu.

### BR-QUOTE-03: Mở lại báo giá

Khi mở lại báo giá, hệ thống đưa snapshot báo giá trở lại màn hình POS như một hóa đơn nháp local trên máy đang thao tác.

Backend không tạo server draft khi mở lại báo giá trong Phase 3A.

Nhân viên được sửa dòng hàng, khách hàng, bảng giá, giá bán và ghi chú như đơn nháp bình thường. Giá trong nháp mở lại mặc định giữ đúng giá snapshot đã lưu trong báo giá, không tự resolve lại theo bảng giá hiện tại.

Nếu giá hiện tại khác giá snapshot, UI chỉ cảnh báo/gợi ý; nhân viên quyết định giữ giá cũ hoặc cập nhật thủ công.

Nếu sản phẩm trong báo giá đã `inactive`, POS vẫn hiển thị dòng từ snapshot để kiểm tra nhưng phải cảnh báo. Checkout không được âm thầm bán sản phẩm inactive/missing; nhân viên phải thay thế dòng hoặc kích hoạt/xử lý sản phẩm theo quyền phù hợp trước khi chốt.

### BR-QUOTE-04: Chuyển báo giá thành hóa đơn

Khi khách đồng ý, báo giá được mở lại thành đơn nháp để kiểm tra/sửa lần cuối rồi thanh toán.

Khi thanh toán thành công, hệ thống tạo hóa đơn bán hàng với mã `HD...`; mã `BG...` vẫn được giữ trong lịch sử để truy vết nguồn gốc báo giá.

Không có bước đặt hàng/giao hàng trung gian giữa báo giá và hóa đơn trong MVP.

Hóa đơn sinh từ báo giá phải lưu `source_quote_id` và `source_quote_code`.

Mặc định chỉ cho checkout một lần từ một báo giá `active`. Sau khi checkout thành công, báo giá đổi sang trạng thái `converted`. Nếu cần bán lại cùng nội dung, nhân viên tạo báo giá/đơn mới từ thao tác sao chép ở future phase, không checkout lặp từ cùng báo giá.

### BR-QUOTE-05: Snapshot báo giá

Khi lưu báo giá, hệ thống lưu snapshot dữ liệu tại thời điểm báo giá, gồm tối thiểu:

- khách hàng hoặc thông tin khách lẻ tại thời điểm báo giá
- nhóm khách và bảng giá áp dụng tại thời điểm báo giá nếu có
- mã/tên sản phẩm tại thời điểm báo giá
- đơn vị bán và cách tính bán
- số lượng, kích thước hoặc mét tới nếu có
- đơn giá đã áp dụng
- chiết khấu dòng/chứng từ nếu có
- nguồn giá: bảng giá chung, bảng giá nhóm, fallback hoặc giá sửa tay
- cờ giá sửa tay nếu nhân viên sửa khác giá mặc định
- ghi chú dòng và ghi chú đơn
- thành tiền dòng và tổng tiền báo giá

Snapshot giúp báo giá mở lại hoặc in lại đúng nội dung đã gửi, kể cả khi bảng giá hoặc tên sản phẩm thay đổi sau đó.

BOM phát sinh trên dòng chưa bắt buộc trong Phase 3A nếu phase BOM chưa implement. Nếu payload POS đã có BOM snapshot, báo giá được phép lưu kèm như dữ liệu snapshot, nhưng không deep-scan/trừ kho cho tới phase BOM.

### BR-QUOTE-06: Trạng thái báo giá MVP

Trạng thái báo giá MVP:

| Trạng thái | Ý nghĩa | Phase |
|---|---|---|
| `active` | Báo giá còn mở lại/checkout được | Phase 3A |
| `converted` | Đã checkout thành hóa đơn `HD...` | Phase 3A |
| `cancelled` | Đã hủy do revision hoặc future phase nếu sau này cần | Future/optional |

Không dùng `sent/accepted/expired` làm state nghiệp vụ trong MVP. Gửi cho khách là thao tác ngoài hệ thống hoặc thuộc bill/send phase sau; khách đồng ý được thể hiện bằng checkout thành hóa đơn.

MVP không có tự hết hạn báo giá. Nếu sau này cần hạn hiệu lực, chỉ hiển thị/cảnh báo trước; không tự hủy báo giá nếu Owner chưa chốt lại.

Nếu khách không làm nữa, không cần thao tác hủy báo giá trong Phase 3A. Báo giá không phát sinh kho/tiền/công nợ nên để nguyên không ảnh hưởng gì.

Owner chốt hướng future: sau này có nút `Sao chép báo giá` để dùng lại nội dung báo giá cũ cho khách khác. Sao chép mở báo giá cũ thành POS draft mới, cho chọn/đổi khách và khi lưu sẽ tạo mã `BG...` mới độc lập; không phải revision và không đổi trạng thái báo giá gốc.

### BR-QUOTE-07: Sửa báo giá dùng revision, không ghi đè snapshot cũ

Báo giá đã lưu không bị sửa đè trực tiếp.

Khi mở lại báo giá và nhân viên bấm lưu báo giá sau khi sửa, hệ thống tạo báo giá revision mới:

```text
BG000123 -> BG000123.01 -> BG000123.02
```

Revision mới giữ `base_code` của báo giá gốc và `revision_no` tăng dần. Báo giá cũ không bị xóa; nếu cần loại khỏi danh sách active thì chuyển `cancelled` với lý do `revised` hoặc trạng thái tương đương đã được schema hỗ trợ.

Trong Phase 3A, audit tối thiểu là `created_by`, `created_at`, status history và liên kết revision. Chưa cần màn diff chi tiết từng thay đổi.

---

## 5. QUY TẮC HÓA ĐƠN BÁN HÀNG

### BR-INV-01: Hóa đơn bán hàng sinh từ checkout thành công

Hóa đơn bán hàng mã `HD...` chỉ được tạo khi checkout thành công.

Checkout thất bại không được tạo hóa đơn bán hàng dở dang.

### BR-INV-02: Hóa đơn giữ snapshot bán hàng

Hóa đơn bán hàng phải giữ snapshot dòng hàng tương tự báo giá, để lịch sử bán hàng không thay đổi khi danh mục, bảng giá hoặc hồ sơ khách hàng thay đổi sau này.

### BR-INV-03: Hóa đơn từ báo giá giữ liên kết nguồn

Nếu hóa đơn được tạo từ báo giá, hóa đơn phải giữ liên kết đến báo giá nguồn.

Mã `BG...` không bị mất khi đã tạo `HD...`.

### BR-INV-04: Sửa hóa đơn đã chốt tạo chứng từ mới

Hóa đơn đã checkout thành công không bị sửa đè trực tiếp.

Khi nhân viên sửa hóa đơn đã chốt:

- hệ thống tạo một hóa đơn mới dựa trên nội dung đã sửa
- mã mới dùng mã cũ kèm số lần sửa, ví dụ `HD000123.01`, `HD000123.02`
- hóa đơn cũ chuyển sang trạng thái đã hủy với lý do sửa chứng từ
- hóa đơn cũ không bị xóa vật lý để có thể kiểm tra lại lịch sử
- hóa đơn mới giữ liên kết tới hóa đơn cũ gần nhất và mã gốc

Quy tắc này áp dụng chung cho các phiếu/chứng từ có cơ chế sửa sau chốt; mỗi domain sẽ mô tả chi tiết tác động đảo kho, tiền và công nợ tương ứng.

### BR-INV-05: Sửa chứng từ phải đồng bộ dữ liệu liên kết

Khi sửa/hủy hóa đơn đã phát sinh kho, tiền hoặc công nợ, hệ thống không chỉ sửa nội dung hiển thị của hóa đơn.

Toàn bộ dữ liệu liên kết phải được xử lý đồng bộ trong cùng nghiệp vụ:

- hóa đơn cũ chuyển trạng thái đã hủy vì sửa chứng từ
- bút toán kho của hóa đơn cũ được đảo hoặc bù trừ theo quy tắc Inventory
- phiếu thu/sổ quỹ/công nợ liên quan được đảo hoặc bù trừ theo quy tắc Finance
- hóa đơn mới `MaCu.01` ghi lại kho, tiền, công nợ theo nội dung mới
- lịch sử liên kết giữa chứng từ cũ và mới phải đủ để kiểm tra

Không được để trường hợp hóa đơn đã sửa nhưng tồn kho, sổ quỹ hoặc công nợ vẫn đứng theo bản cũ.

### BR-INV-06: Khóa mềm khi sửa chứng từ

Khi một nhân viên mở chứng từ đã chốt để sửa, hệ thống nên tạo khóa mềm có thời hạn.

Quy tắc mặc định:

- nếu chứng từ đang được người khác sửa, UI cảnh báo tên người/máy đang giữ khóa
- quản lý hoặc người có quyền vẫn có thể mở nếu khóa đã quá hạn hoặc cần tiếp quản
- backend vẫn kiểm tra version khi lưu để tránh ghi đè dữ liệu mới hơn
- nếu version đã đổi, người lưu sau phải tải lại chứng từ và thao tác lại trên bản mới

Khóa mềm giúp giảm xung đột thao tác, nhưng không thay thế kiểm tra version ở backend.

---

## 6. Acceptance Criteria nghiệp vụ

1. Nháp POS chưa có mã chứng từ chính thức và không phát sinh kho/tiền/công nợ/doanh thu.
2. Nháp trên máy POS này không tự xuất hiện trên máy POS khác.
3. Một khách hàng có thể có nhiều nháp trên cùng máy.
4. Lưu báo giá sinh mã `BG...` và không phát sinh kho/tiền/công nợ/doanh thu.
5. Mở lại báo giá đưa nội dung báo giá trở lại POS như một nháp có thể sửa.
6. Thanh toán báo giá thành công sinh hóa đơn `HD...` và giữ liên kết tới mã `BG...`.
7. Báo giá và hóa đơn bán hàng đều giữ snapshot dòng hàng tại thời điểm lưu.
8. Sửa/lưu lại báo giá không ghi đè báo giá cũ; hệ thống tạo revision dạng `BG000123.01`.
9. Sửa hóa đơn đã chốt không sửa đè hóa đơn cũ; hệ thống tạo mã mới dạng `MaCu.01` và giữ hóa đơn cũ ở trạng thái đã hủy để truy vết.
10. Hệ thống không tạo đơn đặt hàng, vận đơn, COD hoặc kênh bán online trong MVP.
11. Sửa/hủy chứng từ phải xử lý đồng bộ kho, tiền, công nợ và lịch sử liên kết.
12. Khi nhiều người cùng sửa một chứng từ, hệ thống dùng khóa mềm và version check để tránh ghi đè.

---

← [Quay về Sales README](./README.md)
