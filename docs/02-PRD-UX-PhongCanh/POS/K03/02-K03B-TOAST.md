# 02-K03B-TOAST.md — K03-B: NHẮC BỔ SUNG THÔNG TIN KHÁCH HÀNG

> **Trạng thái:** 🔨 Đang xây dựng
> **Phần:** 2.1
> **Trở về:** [01-POS-LAYOUT.md](../01-POS-LAYOUT.md)

---

## I. GIAO DIỆN

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│  [K03-A: Hồ sơ đối tác]                                                                       │
│                                                                                               │
│                                    ┌────────────────────────────────────────┐                 │
│                                    │ ⚠ Bổ sung SĐT khách hàng              │                 │
│                                    │ [Bỏ qua]                         [🗑] │                 │
│                                    └────────────────────────────────────────┘                 │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

- Mỗi lần chỉ hiển thị một cảnh báo để không làm gián đoạn thao tác bán hàng.
- Cảnh báo hiển thị cạnh K03-A, không phát âm thanh.
- Khi rê chuột vào cảnh báo, hiển thị nút `[Bỏ qua]` và một icon thùng rác/hủy nhỏ.
- Icon thùng rác/hủy được đặt tách khỏi nút `[Bỏ qua]` và có kích thước nhỏ để hạn chế bấm nhầm.
- Khi rê vào icon, tooltip hiển thị `Không nhắc lại cảnh báo này`.
- Cảnh báo tự ẩn sau 8 giây nếu người dùng không tương tác và được xử lý như thao tác `[Bỏ qua]`.
- Khi rê chuột vào cảnh báo hoặc khi pop-over đang mở, bộ đếm tự ẩn tạm dừng; khi rời chuột và pop-over đã đóng, bộ đếm tiếp tục.

### I.1. Pop-over nhập nhanh

Nhấp vào cảnh báo mở pop-over ngay cạnh cảnh báo:

```
┌──────────────────────────────────────────┐
│ Bổ sung [Tên trường đang cảnh báo]       │
│ [Ô nhập giá trị.......................]  │
│ [⌄ Xem thêm các trường còn thiếu]        │
│                         [Bỏ qua] [Lưu]   │
└──────────────────────────────────────────┘
```

- Khi xổ phần thông tin còn thiếu, mỗi trường còn thiếu hiển thị trên một dòng riêng trong cùng pop-over.
- Pop-over dùng chung cho SĐT, ID nhóm Zalo và link Facebook; nhãn và quy tắc kiểm tra thay đổi theo trường đang cảnh báo.

---

## II. THỨ TỰ ƯU TIÊN

Khi chọn khách hàng đã tồn tại, hệ thống kiểm tra lần lượt và chỉ hiển thị cảnh báo đầu tiên còn thiếu:

1. SĐT.
2. ID nhóm Zalo, chỉ kiểm tra khi đã có SĐT.
3. Link Facebook, chỉ kiểm tra khi đã có SĐT và ID nhóm Zalo.

- Khách hàng mới không dùng cảnh báo thiếu SĐT vì SĐT là trường bắt buộc khi tạo.
- Các loại cảnh báo khác sẽ được bổ sung sau và không được tự chen vào thứ tự trên khi chưa có đặc tả.

---

## III. GIÃN CÁCH VÀ KÍCH HOẠT CẢNH BÁO

- Sau khi một cảnh báo xuất hiện, hệ thống không hiển thị bất kỳ cảnh báo bổ sung thông tin khách hàng nào khác trong 5 phút.
- Trong thời gian 5 phút, các cảnh báo khác được bỏ qua, không xếp hàng để hiện dồn sau đó.
- Hết 5 phút không tự động hiển thị cảnh báo. Hệ thống chỉ kiểm tra khi người dùng thực hiện hành động chọn khách hàng.
- Nếu người dùng chọn lại đúng khách hàng đã được cảnh báo sau ít nhất 5 phút, hệ thống mới được phép nhắc lại cùng cảnh báo đó nếu trường vẫn còn thiếu.
- Nếu người dùng chọn một khách hàng khác sau ít nhất 5 phút, hệ thống kiểm tra hồ sơ của khách mới và hiển thị tối đa một cảnh báo theo thứ tự ưu tiên.
- Nếu hết 5 phút nhưng người dùng không chọn khách hàng nào đang thiếu thông tin thì không hiển thị cảnh báo.
- Không tự chuyển sang cảnh báo khác, không gộp nhiều cảnh báo và không hiển thị bù những cảnh báo đã bỏ qua trong thời gian giãn cách.
- `[Bỏ qua]` chỉ đóng cảnh báo hiện tại. Cảnh báo đó chỉ có thể xuất hiện lại sau ít nhất 5 phút và khi người dùng chọn lại khách hàng tương ứng.
- Icon thùng rác/hủy tắt riêng cảnh báo của trường đang thiếu đối với khách hàng đó, được hiểu là không nhắc lại cảnh báo này nữa. Các trường khác không bị tắt vĩnh viễn nhưng vẫn tuân theo thời gian giãn cách 5 phút.
- Khi trường bị thiếu đã được bổ sung, trạng thái không nhắc lại của trường đó không còn ý nghĩa.

---

## IV. NHẬP NHANH TỪ CẢNH BÁO

- Nhấp vào cảnh báo mở ô nhập nhanh đúng trường đang được nhắc: SĐT, ID nhóm Zalo hoặc link Facebook.
- Pop-over nhập nhanh có nút xổ xuống để hiển thị thêm các trường còn thiếu của khách hàng.
- Người dùng có thể chỉ nhập trường đang được cảnh báo hoặc mở rộng để nhập nhiều trường còn thiếu trong cùng một lần.
- `[Lưu]` ghi nhận các giá trị hợp lệ và đóng pop-over.
- `[Bỏ qua]` đóng pop-over mà không lưu; cảnh báo đó vẫn tuân theo thời gian giãn cách 5 phút.
- Lỗi định dạng hiển thị ngay dưới trường tương ứng, không tạo thêm Toast.

---

← [Quay về Master Map](../01-POS-LAYOUT.md)
