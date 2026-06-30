# STOCK-RULES — Chính sách tồn kho và trừ kho

> **Trạng thái:** 🔨 Đang xây dựng
> **Phạm vi:** Business rule cho tồn kho MVP, hàng thường, hàng cuộn, hàng tấm, tấm lỡ và thời điểm trừ kho

---

## 1. Mục tiêu

Tài liệu này chốt cách QC-OMS quản lý tồn kho ở mức nghiệp vụ:

- khi nào tồn kho bị trừ
- có cho tồn âm hay không
- phân biệt hàng thường, hàng cuộn và hàng tấm
- cách tự động tạo tấm lỡ
- quan hệ giữa tồn kho chính thức và dữ liệu máy sản xuất

---

## 2. Phân loại hình dạng tồn kho

### BR-INV-01: Inventory shape

Mỗi sản phẩm/vật tư có một nhóm hình dạng tồn kho:

| `inventory_shape` | Ý nghĩa | Ví dụ |
|---|---|---|
| `normal` | Hàng thường, không cần quản lý theo đối tượng vật lý riêng | giấy ram/tờ, keo, mực, linh kiện |
| `roll` | Vật tư dạng cuộn, cần quản lý từng cuộn nhập kho | bạt, decal, PP, canvas |
| `sheet` | Vật tư dạng tấm, cần quản lý tấm nguyên/tấm dở/tấm lỡ | alu, fomex, mica, PVC, tấm nhựa |

Tổng tồn của `roll` và `sheet` chỉ là số tổng hợp từ các đối tượng vật lý bên dưới, không phải con số được sửa trực tiếp.

---

## 3. Thời điểm trừ kho

### BR-INV-02: Mốc trừ kho MVP

Trong MVP, khi đơn bán được tạo/lưu chính thức và có dòng hàng cần trừ kho, hệ thống ghi nhận bút toán kho ngay tại thời điểm đó.

Mục tiêu là giữ thao tác đơn giản:

```text
Tạo/lưu đơn bán chính thức -> ghi stock movement -> cập nhật tồn kho
```

Không tách sổ kho thành hai lớp `dự kiến` và `thực tế` trong MVP.

### BR-INV-03: Không dùng dữ liệu máy sản xuất để tự trừ kho MVP

Dữ liệu máy sản xuất không tự sinh bút toán kho trong MVP.

Nếu máy sản xuất chạy khác với bill/đơn, phần lệch chỉ thể hiện trong báo cáo đối soát, không tự sửa tồn kho.

Sau MVP, nếu có quy trình match file máy sản xuất với bill đủ chắc, sẽ mở spec riêng để thay đổi thời điểm trừ kho.

---

## 4. Tồn âm

### BR-INV-04: Cảnh báo thiếu tồn nhưng vẫn cho bán

Khi bán hàng mà tồn không đủ, hệ thống cảnh báo nhưng vẫn cho bán tiếp.

Hệ quả:

- stock movement có thể làm tồn kho âm
- báo cáo tồn kho phải hiển thị rõ các mặt hàng tồn âm
- tồn âm là tín hiệu cần xử lý sau, không khóa quy trình bán hàng

---

## 5. Hàng thường

### BR-INV-05: Hàng thường quản lý theo tồn chính

Hàng `normal` được quản lý theo một đơn vị tồn chính.

Khi bán bằng đơn vị phụ, hệ thống quy đổi về đơn vị tồn chính để trừ kho.

Ví dụ:

```text
1 ram giấy = 500 tờ
```

Nếu tồn chính là `ram`, bán `tờ` sẽ quy đổi số tờ về ram để ghi stock movement.

---

## 6. Hàng dạng cuộn

### BR-INV-06: Cuộn là đối tượng tồn kho vật lý

Vật tư dạng cuộn không được quản lý bằng một tổng `m2` gộp như KiotViet.

Mỗi cuộn nhập kho phải được quản lý như một đối tượng tồn kho vật lý riêng.

Mỗi cuộn cần biết tối thiểu:

- sản phẩm/vật tư
- khổ rộng
- chiều dài ban đầu
- diện tích ban đầu nếu cần tính nhanh
- chiều dài còn lại
- diện tích còn lại
- trạng thái: còn dùng, hết, hủy/lỗi nếu cần

### BR-INV-07: Đề xuất cuộn/khổ khi xuất vật tư cuộn

Khi xuất vật tư dạng cuộn, nhân viên là người chọn cuộn bị trừ.

Hệ thống phải có đề xuất mặc định theo công thức tối ưu hao hụt:

1. Lọc các cuộn có khổ đủ để in/cắt kích thước tiêu hao.
2. Trong các cuộn đủ khổ, ưu tiên phương án hao hụt ngang ít nhất.
3. Nếu nhiều cuộn cùng hao hụt, ưu tiên cuộn đang dùng dở/đã khui trước.
4. Nếu vẫn bằng nhau, ưu tiên cuộn có chiều dài còn lại phù hợp để giảm mảnh lẻ.

Nhân viên được sửa đề xuất:

- chọn khổ/cuộn khác
- giảm hoặc tăng biên chừa
- chọn phương án không tối ưu nếu thực tế sản xuất cần

Khi nhân viên override, hệ thống lưu snapshot đề xuất và lựa chọn thực tế.

---

## 7. Hàng dạng tấm

### BR-INV-08: Tấm quản lý theo tấm nguyên và tấm lỡ

Hàng `sheet` được quản lý theo:

- tấm nguyên
- tấm dở đang dùng nếu cần
- tấm lỡ/tấm thừa còn dùng được

Không sửa tổng tồn trực tiếp cho hàng dạng tấm.

### BR-INV-09: Tự động tạo tấm lỡ

Không bắt buộc nhân viên xác nhận tấm lỡ sau mỗi lần cắt vì thao tác này rườm rà.

Hệ thống tự động tạo tấm lỡ theo rule mặc định:

1. Khi đơn hàng cắt/bán làm tồn đến hàng `sheet`, hệ thống tính phần tiêu hao theo kích thước và biên cắt hao đã áp dụng.
2. Hệ thống ưu tiên chọn tấm lỡ phù hợp nhỏ nhất trước; nếu không có tấm lỡ phù hợp thì dùng tấm nguyên.
3. Sau khi trừ phần tiêu hao, hệ thống tự sinh tấm lỡ mới từ phần còn lại nếu phần còn lại đạt ngưỡng giữ lại.
4. Dưới `0.3m2` thì mặc định bỏ, không tạo tấm lỡ.
5. Nếu thực tế mảnh nhỏ vẫn tận dụng được, nhân viên có thể sửa hoặc tạo tấm lỡ thủ công để giữ lại.
6. MVP chỉ lưu tối đa 1-2 mảnh thừa lớn nhất sau một lần cắt để tránh rác dữ liệu.

Mỗi tấm lỡ cần lưu:

- sản phẩm/vật tư
- kích thước dài/rộng
- diện tích
- nguồn gốc từ đơn/dòng hàng nếu có
- trạng thái: `available`, `used`, `discarded`

Nhân viên có thể sửa hoặc xóa tấm lỡ sau khi hệ thống tạo.

Mọi thao tác sửa/xóa tấm lỡ phải có log tối thiểu: ai sửa, lúc nào, giá trị cũ/mới, lý do nếu có.

---

## 8. Hàng ngưng bán còn tồn

### BR-INV-10: Inactive product vẫn xử lý kho được

Sản phẩm ngưng bán:

- không được tìm thấy trong POS bán hàng
- vẫn hiển thị trong trang Hàng hóa/Kho qua bộ lọc trạng thái
- vẫn hiển thị trong báo cáo tồn kho
- vẫn được phép xử lý kho như điều chỉnh, kiểm kho, xuất hủy hoặc chuyển đổi nếu người dùng có quyền

---

## 9. Acceptance Criteria

- Bán thiếu tồn hiển thị cảnh báo nhưng vẫn cho tiếp tục.
- Tạo/lưu đơn bán chính thức có dòng cần trừ kho tạo stock movement.
- Dữ liệu máy sản xuất không tự tạo stock movement trong MVP.
- Hàng `normal` cho sửa tổng tồn.
- Hàng `roll` không cho sửa tổng tồn, phải sửa theo từng cuộn.
- Hàng `sheet` không cho sửa tổng tồn, phải sửa theo tấm nguyên/tấm lỡ/tấm dở.
- Tấm lỡ dưới `0.3m2` không tự tạo, trừ khi nhân viên tạo/sửa thủ công.
