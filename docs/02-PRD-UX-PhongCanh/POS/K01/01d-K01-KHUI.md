# 01d-K01-KHUI — Khui vật tư thủ công

> **Phạm vi:** UX khui vật tư phụ, cuộn và tấm.
> **Trở về:** [01-K01-TOPBAR.md](./01-K01-TOPBAR.md)
> **Business:** [STOCK-RULES.md](../../../03-BUSINESS-NghiepVu/Inventory/STOCK-RULES.md)

---

## 1. Mục tiêu

Khui vật tư dùng khi nhân viên bắt đầu dùng một cuộn/tấm mới hoặc cần ghi nhận phần cũ còn lại.

Mục tiêu là vận hành nhanh và chuẩn hóa kho dần:

- mỗi lần khui chỉ xử lý **một vật tư**
- không bắt kiểm toàn bộ kho
- không bắt chọn lô/ngày mua nếu nhiều cuộn cùng loại/cùng khổ
- nếu chưa đủ dữ liệu vật lý thì vẫn cho ghi nhận từ tồn tạm
- phần cũ còn lại do hệ thống gợi ý, nhân viên được sửa theo thực tế

Vật tư phụ như keo/vít/nguồn/LED vẫn đi qua popup khui trong MVP, nhưng chỉ theo quy tắc đơn giản: phần đang dùng dở/cũ được đưa về `0`, rồi ghi nhận lần khui mới.

---

## 2. Vị trí

Nút `Khui vật tư` nằm ở khu vực tiện ích của POS Top Bar, dùng được khi đang bán hàng hoặc khi nhân viên cần chuẩn hóa tồn.

```text
[Tìm hàng...] [Hóa đơn 1] [+] [Khui vật tư] [Tiện ích...]
```

Tên nút trong UI không cần icon chai nếu làm giao diện quản trị gọn hơn; chỉ cần nhất quán với bộ icon chung.

---

## 3. Luồng chung

```text
Chọn vật tư
-> hệ thống nhận dạng normal/roll/sheet
-> chọn khổ/kích thước cần khui
-> nhập phần cũ còn lại nếu có
-> xác nhận
-> ghi stock movement/log; riêng roll/sheet tạo hoặc cập nhật object vật lý
```

Không có bước chọn nhà cung cấp, ngày mua, số lô trong MVP.

---

## 4. Khui vật tư phụ

Áp dụng cho hàng `normal` là vật tư phụ có thể dùng dở: keo, vít, nguồn, LED hoặc vật tư phụ tương tự.

### 4.1. Trường nhập

| Trường | Quy tắc |
|---|---|
| Vật tư | Chỉ chọn sản phẩm `inventory_shape = normal` và thuộc nhóm vật tư phụ |
| Số lượng khui mới | Theo đơn vị tồn hoặc đơn vị quy đổi đang cấu hình |
| Phần dở/cũ còn lại | MVP mặc định `0` |
| Ghi chú | Nên nhập khi bỏ phần cũ do hỏng, khô, rơi vãi hoặc không dùng tiếp |

### 4.2. Quy tắc xử lý

- Khi khui vật tư phụ, phần dở/cũ về `0`.
- Hệ thống ghi log thao tác khui và lý do nếu có.
- Không tạo cuộn/tấm vật lý cho vật tư phụ.
- Nếu tồn không đủ, chỉ cảnh báo nhẹ theo rule tồn âm, vẫn cho ghi nhận nếu người dùng có quyền.

---

## 5. Khui cuộn

### 5.1. Trường nhập

| Trường | Quy tắc |
|---|---|
| Vật tư | Chỉ chọn sản phẩm `inventory_shape = roll` |
| Khổ rộng | Dropdown từ cấu hình sản phẩm / cuộn đã nhập; ví dụ `1.6m`, `2.2m`, `3.2m` |
| Cuộn mới | Mặc định khui `1` cuộn cùng loại/cùng khổ |
| Dài cuộn mới | Tự điền từ dữ liệu nhập vật tư/phiếu nhập nếu có; cho sửa nếu cần |
| Cuộn cũ còn lại | Hệ thống gợi ý, nhân viên được sửa |
| Ghi chú | Không bắt buộc, nhưng nên nhập khi số thực tế khác số hệ thống |

### 5.2. Gợi ý `cuộn cũ còn lại`

| Tình huống | Giá trị mặc định |
|---|---|
| Cuộn cũ đã chuẩn hóa | Chiều dài còn lại hệ thống đang tính |
| Cuộn cũ chưa chuẩn hóa | `0` |
| Nhân viên biết còn dùng được | Nhập số mét còn lại |
| Còn ít, bỏ luôn | Nhập `0` |

Nhập `0` nghĩa là phần cũ hết hoặc bỏ, không tạo object còn dùng.

Nhập lớn hơn `0` nghĩa là phần cũ còn dùng được. Hệ thống giữ lại để sau này gợi ý khổ/cắt và phân tích hao hụt.

Nếu chênh lệch giữa hệ thống và thực tế lớn, vẫn cho lưu nhưng phải ghi log giá trị cũ/mới.

### 5.3. Nguồn cuộn mới

Nếu đã có object cuộn `available` cùng vật tư/khổ:

- chọn khui 1 cuộn bất kỳ cùng loại/cùng khổ
- không bắt nhân viên chọn đúng lô/ngày mua
- backend chọn object phù hợp theo quy tắc đơn giản, ví dụ cuộn chưa dùng cũ nhất

Nếu chưa có object cuộn nhưng còn tồn tạm KiotViet:

- cho khui từ tồn tạm
- tạo object cuộn chuẩn hóa mới theo khổ/dài đã nhập
- giảm phần tồn tạm tương ứng nếu backend đã có cơ chế tách tồn tạm
- nếu chưa có cơ chế giảm tồn tạm, ghi log chuẩn hóa để đối soát, không bịa thêm cuộn khác

---

## 6. Khui tấm

### 6.1. Trường nhập

| Trường | Quy tắc |
|---|---|
| Vật tư | Chỉ chọn sản phẩm `inventory_shape = sheet` |
| Khổ thao tác | Mặc định theo cấu hình, ví dụ `1.2m x 2.4m` |
| Số tấm khui | MVP mặc định `1` |
| Phần tấm cũ còn lại | Có thể nhập kích thước nếu còn dùng |
| Ghi chú | Nên nhập khi bỏ phần cũ hoặc kích thước thực tế khác hệ thống |

QC-OMS dùng khổ thao tác để nhập bán, tính tiền, tính phần còn lại và gợi ý vật tư. Khổ thật như `1.22m x 2.44m` chỉ là thông tin tham khảo nếu có.

### 6.2. Phần tấm cũ còn lại

Nếu phần cũ còn dùng được, nhân viên nhập kích thước thực tế. Ví dụ:

```text
1.2m x 1.9m
0.5m x 0.5m
```

Nếu phần cũ còn quá nhỏ hoặc bỏ đi, nhân viên chọn bỏ phần cũ.

Ngưỡng gợi ý:

- phần còn lại dạng mét tới dưới `0.2m` thì hệ thống đề xuất bỏ
- rẻo nhỏ dưới ngưỡng cấu hình thì hệ thống đề xuất bỏ
- không bỏ âm thầm; nhân viên có thể giữ lại nếu thực tế còn dùng được

---

## 7. Kết quả sau khi xác nhận

### Vật tư phụ

- phần dở/cũ được ghi nhận về `0`
- lần khui mới được ghi log theo vật tư, số lượng, người thao tác và ghi chú
- không tạo dữ liệu cuộn/tấm

### Cuộn

- cuộn mới chuyển sang trạng thái đang dùng / available theo cách backend đang quản lý
- cuộn cũ được cập nhật còn lại hoặc kết thúc
- ghi stock movement/log cho thao tác khui và phần chênh lệch nếu có

### Tấm

- tấm mới hoặc tấm đang dùng được ghi nhận
- phần tấm cũ còn dùng được tạo/cập nhật thành tấm lỡ/tấm dở
- phần bị bỏ ghi log, không tạo dữ liệu rác

### Tồn tạm

Nếu thao tác khui dùng dữ liệu tồn tạm KiotViet, UI phải hiển thị rõ:

```text
Đang chuẩn hóa từ tồn tạm KiotViet
```

Không hiển thị như thể toàn bộ kho đã chuẩn hóa.

---

## 8. Lỗi và cảnh báo

| Tình huống | Hành vi |
|---|---|
| Chưa chọn vật tư | Không cho xác nhận |
| Vật tư không thuộc nhóm khui | Gợi ý dùng điều chỉnh tồn |
| Khổ/kích thước thiếu | Không cho xác nhận |
| Số mét hoặc kích thước <= 0 | Báo lỗi ngay tại ô nhập |
| Không còn object chuẩn hóa để khui | Cho khui từ tồn tạm nếu còn tồn tạm; nếu không có thì cảnh báo thiếu tồn |
| Thiếu tồn hoặc tồn âm | Cảnh báo nhẹ, vẫn cho ghi nhận nếu Owner cho tồn âm theo rule kho |

---

## 9. Không làm trong MVP

- Không chọn lô/ngày mua/nhà cung cấp khi khui.
- Không bắt quản lý mã từng cuộn/tấm trên UI.
- Không tự tối ưu cắt nhiều bước trong popup khui.
- Không tính báo cáo hao hụt đầy đủ ngay trong popup.
- Không dùng khui vật tư để sửa giá vốn kế toán.

---

## 10. Acceptance Criteria

1. Khui vật tư phụ đưa phần dở/cũ về `0` và ghi log.
2. Khui cuộn chỉ cần chọn vật tư, khổ, dài cuộn mới và phần cũ còn lại.
3. Nếu cuộn cũ đã chuẩn hóa, UI gợi ý số còn lại nhưng cho sửa.
4. Nếu cuộn cũ chưa chuẩn hóa, UI mặc định phần cũ còn lại là `0`.
5. Nhập phần cũ còn lại lớn hơn `0` giữ lại object để dùng tiếp.
6. Nhập `0` kết thúc/bỏ phần cũ, không tạo object rác.
7. Khui tấm dùng khổ thao tác như `1.2m x 2.4m`.
8. Rẻo nhỏ hoặc phần m tới dưới `0.2m` chỉ được đề xuất bỏ, không bị bỏ âm thầm.
9. Tất cả thao tác khui ghi log tối thiểu: ai, lúc nào, vật tư, khổ/kích thước, giá trị cũ/mới nếu có.

---

← [Quay về K01 Top Bar](./01-K01-TOPBAR.md)
