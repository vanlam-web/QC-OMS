# SUPPLIER-PURCHASE — Nhà cung cấp, nhập hàng và công nợ NCC

> **Trạng thái:** Source of Truth nghiệp vụ
> **Tham khảo:** KiotViet `Nhà cung cấp`, `Nhập hàng`
> **Quyết định Owner:** Có NCC, có nhập hàng mua thật, có công nợ NCC; mua cuộn/tấm theo vật lý, không mua `m2`

---

## 1. Mục tiêu

Purchase/Supplier giúp QC-OMS ghi nhận nguồn hàng mua vào, tăng tồn kho, lưu giá vốn và theo dõi khoản phải trả nhà cung cấp.

Khác KiotViet, QC-OMS không được quản lý hàng cuộn/tấm bằng tổng `m2` gộp. Khi nhập hàng dạng cuộn hoặc tấm, phiếu nhập phải tạo dữ liệu tồn vật lý tương ứng để sau này xuất kho/trừ kho chính xác hơn.

---

## 2. Nhà cung cấp

### BR-PUR-01: Hồ sơ nhà cung cấp

Thông tin tối thiểu:

| Trường | Quy tắc |
|---|---|
| Mã NCC | Bắt buộc, tự sinh nếu người dùng không nhập |
| Tên NCC | Bắt buộc |
| Số điện thoại | Không bắt buộc |
| Email | Không bắt buộc |
| Địa chỉ | Không bắt buộc |
| Mã số thuế | Không bắt buộc; chỉ lưu nội bộ, không mở luồng thuế/HĐĐT |
| Khách hàng liên kết | Không bắt buộc; dùng khi cùng một đối tác vừa là NCC vừa là khách hàng |
| Ghi chú | Không bắt buộc |
| Trạng thái | `active`, `inactive` |

Số điện thoại NCC không chốt unique trong MVP. Nếu sau này cần chống trùng NCC, hệ thống nên cảnh báo mềm thay vì chặn cứng.

NCC và khách hàng là hai vai trò nghiệp vụ khác nhau nhưng có thể liên kết cùng một đối tác. MVP không tự gộp hồ sơ theo số điện thoại/tên để tránh sai dữ liệu; người dùng chọn liên kết thủ công khi biết chắc đó là cùng một bên.

### BR-PUR-02: Tổng mua và công nợ NCC

Danh sách NCC cần hiển thị tối thiểu:

- mã NCC
- tên NCC
- điện thoại
- nợ cần trả hiện tại
- tổng mua
- trạng thái

`Nợ cần trả hiện tại` và `Tổng mua` là số tổng hợp từ phiếu nhập, phiếu chi/trả NCC và các điều chỉnh hợp lệ; không nhập tay trực tiếp trên hồ sơ NCC.

Nếu `Nợ cần trả hiện tại < 0`, không mặc định hiểu là NCC được trả trước. Với QC-OMS, trường hợp thường gặp là đối tác đó cũng là khách hàng và còn khoản phải thu ở phía khách hàng. UI/API cần giữ số âm để đối soát và hiển thị liên kết khách hàng nếu có, nhưng không mở workflow trả trước NCC riêng trong MVP.

---

## 3. Phiếu nhập hàng

### BR-PUR-03: Purchase receipt là luồng nhập chính

Lát cắt Purchase đầu tiên dùng phiếu nhập trực tiếp, không bắt buộc có đặt hàng nhập trước.

Trạng thái phiếu:

| Trạng thái | Ý nghĩa | Ảnh hưởng tồn/công nợ |
|---|---|---|
| `draft` | Phiếu tạm | Chưa tăng tồn, chưa sinh công nợ, chưa ghi sổ quỹ |
| `posted` | Đã nhập hàng | Tăng tồn, ghi giá vốn, sinh công nợ NCC nếu chưa trả đủ, ghi sổ quỹ nếu có trả tiền |
| `cancelled` | Đã hủy | Không còn hiệu lực; nếu đã posted thì phải có bút toán đảo/an toàn, không xóa phiếu cũ |

Phiếu đã posted không sửa phá dữ liệu. Nếu cần sửa, dùng quy tắc chứng từ sửa đã chốt: tạo mã phiên bản mới dạng `MaCu.01`, phiếu cũ chuyển trạng thái hủy/không hiệu lực để kiểm tra lại được.

### BR-PUR-04: Trường dữ liệu phiếu nhập

Thông tin tối thiểu:

| Nhóm | Trường |
|---|---|
| Header | mã phiếu nhập, thời gian nhập, NCC, người nhập, kho, ghi chú |
| Tham chiếu | số hóa đơn/chứng từ NCC nếu có, chỉ là text |
| Dòng hàng | sản phẩm/vật tư, đơn vị mua, số lượng, giá nhập, giảm giá nếu có, thành tiền |
| Thanh toán | tổng tiền hàng, giảm giá phiếu, cần trả NCC, đã trả, còn phải trả |
| Audit | người tạo, ngày tạo, người sửa/hủy, lý do sửa/hủy nếu có |

Không có kênh bán, vận đơn, COD, VAT/HĐĐT trong phiếu nhập QC-OMS.

---

## 4. Nhập theo loại tồn kho

### BR-PUR-05: Hàng thường

Hàng `normal` nhập theo đơn vị tồn chính hoặc đơn vị quy đổi đã cấu hình.

Ví dụ:

```text
1 ram giấy = 500 tờ
Nhập 10 ram -> tăng tồn 10 ram hoặc 5,000 tờ tùy đơn vị tồn chính
```

### BR-PUR-06: Hàng cuộn

Hàng `roll` phải nhập theo từng cuộn vật lý hoặc nhiều cuộn cùng thông số.

Mỗi cuộn nhập vào cần có:

- sản phẩm/vật tư
- khổ rộng
- chiều dài ban đầu theo mét tới
- chiều dài còn lại ban đầu, mặc định bằng chiều dài nhập
- diện tích tính toán
- giá nhập hoặc phân bổ giá nhập
- NCC/phiếu nhập nguồn
- trạng thái cuộn

Không nhập mua cuộn bằng `m2`. `m2` chỉ là số quy đổi để tính diện tích, giá vốn tham khảo và báo cáo.

Ví dụ:

```text
Nhập bạt 3.2m: 2 cuộn, mỗi cuộn 50m tới
Hệ thống tạo Roll R001 và R002, mỗi cuộn 3.2 x 50 = 160m2
```

### BR-PUR-07: Hàng tấm

Hàng `sheet` phải nhập theo tấm hoặc lô tấm cùng kích thước.

Mỗi lô/tấm nhập cần có:

- sản phẩm/vật tư
- kích thước dài/rộng
- số lượng tấm
- diện tích tính toán
- giá nhập hoặc phân bổ giá nhập
- NCC/phiếu nhập nguồn
- trạng thái tấm

Không nhập mua tấm bằng tổng `m2` nếu thực tế mua theo tấm. `m2` chỉ là số tính toán.

---

## 5. Giá vốn

### BR-PUR-08: Giá vốn từ phiếu nhập phải lưu lại

Mỗi dòng nhập phải lưu giá vốn tại thời điểm nhập. Với cuộn/tấm, giá vốn phải gắn được với object/lô vật lý để sau này đối chiếu tồn và lợi nhuận.

Nguồn giá vốn phục vụ nhiều mục đích:

- lịch sử mua hàng
- báo cáo tồn kho
- báo cáo lợi nhuận khi phương pháp giá vốn đã chốt
- công thức PriceBook theo nhóm hàng trong MVP chỉ đọc `giá nhập cuối`

### BR-PUR-09: PriceBook MVP chỉ dùng giá nhập cuối

PriceBook MVP không chọn nhiều nguồn tính giá để tránh rườm rà.

Nguồn duy nhất cho công thức PriceBook là `giá nhập cuối` của sản phẩm/vật tư.

Khi giá nhập cuối thay đổi, các ô giá đang ở chế độ `theo công thức` trong PriceBook tự tính lại theo giá nhập cuối mới. Các ô đã nhập giá tay không tự đổi. Rule riêng của bảng giá nhóm `0` vẫn lấy động theo giá nhập gần nhất.

---

## 6. Công nợ nhà cung cấp và sổ quỹ

### BR-PUR-10: Công nợ NCC phát sinh từ phiếu nhập chưa trả đủ

Khi phiếu nhập posted:

```text
Còn phải trả = Cần trả NCC - Đã trả ngay
```

Nếu `Còn phải trả > 0`, hệ thống ghi nhận công nợ cần trả NCC.

### BR-PUR-11: Trả tiền NCC ghi vào sổ quỹ

Nếu trả tiền ngay trên phiếu nhập hoặc trả nợ NCC sau đó, hệ thống phải ghi phiếu chi/sổ quỹ theo phương thức:

- tiền mặt
- chuyển khoản và tài khoản nhận/chi tương ứng

MVP ưu tiên một lần trả tiền dùng một phương thức/tài khoản để thao tác gọn. Nếu sau này cần tách nhiều tài khoản trong một lần trả, mở rộng sau.

### BR-PUR-12: Phân bổ trả nợ NCC

Mặc định đề xuất: tiền trả NCC được phân bổ vào phiếu nhập nợ cũ nhất trước. Khi cần, người dùng có thể chọn phiếu cụ thể ở phase nâng cao.

Quy tắc này đi cùng hướng công nợ khách đã chốt: trả nợ theo chứng từ, ưu tiên chứng từ cũ nhất để dễ đối soát.

---

## 7. Không làm trong lát cắt Purchase đầu tiên

| Phần KiotViet | Quyết định QC-OMS |
|---|---|
| Đặt hàng nhập | Không làm trước; nhập trực tiếp khi hàng về |
| Trả hàng nhập | Không làm trước; nếu sai dùng sửa/hủy chứng từ, kiểm kho hoặc điều chỉnh tồn |
| Hóa đơn đầu vào điện tử | Bỏ; chỉ lưu số chứng từ/hóa đơn dạng text nếu cần |
| Mua dịch vụ | Đi qua phiếu chi/sổ quỹ, chưa mở module riêng |
| Báo cáo NCC nâng cao | Làm sau khi Purchase/Supplier có dữ liệu chuẩn |
| Nhóm NCC phức tạp | Chưa cần trong MVP |

---

## 8. Acceptance Criteria

- Tạo NCC bắt buộc có mã và tên; mã tự sinh nếu bỏ trống.
- Danh sách NCC hiển thị tổng mua và nợ hiện tại từ dữ liệu chứng từ.
- Phiếu nhập draft không tăng tồn, không ghi công nợ, không ghi sổ quỹ.
- Phiếu nhập posted tăng tồn đúng theo `inventory_shape`.
- Hàng cuộn/tấm nhập theo đối tượng vật lý, không nhập mua bằng tổng `m2`.
- Phiếu nhập posted lưu được giá vốn tại thời điểm nhập.
- Phiếu nhập trả chưa đủ sinh công nợ NCC.
- Trả tiền NCC tạo phiếu chi/sổ quỹ đúng phương thức tiền.
- Không có luồng HĐĐT/VAT/thuế trong Purchase MVP.
