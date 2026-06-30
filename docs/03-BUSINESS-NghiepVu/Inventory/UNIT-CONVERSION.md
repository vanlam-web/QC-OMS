# UNIT-CONVERSION — Đơn vị tồn, đơn vị bán và quy đổi

> **Trạng thái:** 🔨 Đang xây dựng
> **Phạm vi:** Quy tắc nghiệp vụ cho đơn vị tồn chính, đơn vị bán phụ, quy đổi đơn giản, cuộn và tấm

---

## 1. Mục tiêu

Tài liệu này chốt cách QC-OMS hiểu đơn vị tính trong kho và bán hàng.

Nguyên tắc chính:

- mỗi sản phẩm có một đơn vị tồn chính
- đơn vị bán phụ chỉ dùng để nhập bán/tính giá
- khi ghi kho, hệ thống quy đổi về đơn vị tồn chính hoặc đối tượng vật lý tương ứng
- không copy nguyên cách KiotViet tạo nhiều dòng sản phẩm chỉ vì khác đơn vị

---

## 2. Đơn vị tồn chính

### BR-UNIT-INV-01: Một đơn vị tồn chính

Mỗi sản phẩm có một đơn vị tồn chính.

Ví dụ:

| Sản phẩm | Đơn vị tồn chính | Đơn vị bán phụ |
|---|---|---|
| Giấy | Ram | Tờ |
| Sắt cây | Cây | Mét |
| Alu/Fomex/Mica | Tấm | Mét tới, m2 |
| Bạt/Decal/PP | Cuộn vật lý hoặc mét dài theo cuộn | m2 |

---

## 3. Đơn vị bán phụ

### BR-UNIT-INV-02: Đơn vị bán phụ phải quy đổi được

POS có thể bán bằng đơn vị khác đơn vị tồn chính nếu có cấu hình quy đổi.

Khi bán bằng đơn vị phụ, stock movement lưu cả:

- số lượng bán theo đơn vị hiển thị
- số lượng đã quy đổi theo đơn vị tồn chính hoặc đối tượng vật lý

Ví dụ:

```text
1 ram = 500 tờ
```

Bán 50 tờ sẽ quy đổi thành `0.1 ram` nếu tồn chính là ram.

---

## 4. Quy cách không phải đơn vị chuẩn

### BR-UNIT-INV-03: Khổ/quy cách nên tách khỏi đơn vị

Các giá trị như `Khổ 91`, `Khổ 127`, `500 Tờ`, `1000 Tờ`, `5 kg`, `10 kg` không nên mặc định là đơn vị chuẩn.

QC-OMS nên tách:

- đơn vị: `m`, `m2`, `tờ`, `ram`, `kg`, `cuộn`, `tấm`
- quy cách/variant: khổ rộng, số tờ đóng gói, trọng lượng đóng gói

Mục tiêu là tránh danh sách đơn vị bị phình to và trùng nghĩa.

---

## 5. Cuộn

### BR-UNIT-INV-04: Cuộn không bán trực tiếp trên POS

POS không bán trực tiếp theo đơn vị `Cuộn`.

Vật tư dạng cuộn được bán theo đơn vị phù hợp, chủ yếu là `m2`.

Khi bán/xuất theo `m2`, hệ thống quy đổi ra chiều dài tiêu hao theo khổ rộng của cuộn cụ thể.

Ví dụ:

```text
diện tích tiêu hao = rộng x dài
chiều dài trừ cuộn = diện tích tiêu hao / khổ rộng cuộn
```

### BR-UNIT-INV-05: Biên chừa cho cuộn

Hàng dạng cuộn có cấu hình biên chừa mặc định.

Gợi ý mặc định ban đầu:

- in bạt thường: `0.1m` mỗi chiều
- decal/PP in dán: `0.05m` mỗi chiều
- in cần gia công/nẹp/căng khung: `0.1m` đến `0.2m` tùy loại việc

Các giá trị này là default để đề xuất, không khóa cứng. Nhân viên được sửa trên từng dòng hàng/đơn hàng.

---

## 6. Tấm

### BR-UNIT-INV-06: Tấm bán theo tấm, mét tới hoặc m2

Tấm chủ yếu bán theo `m tới`.

Ví dụ tấm khổ:

```text
2.44m x 1.22m
```

Bán `1 m tới` nghĩa là bán phần:

```text
1m x 1.22m
```

Với sản phẩm bán theo `m tới`, bảng giá lưu giá theo `1 m tới`, không phải giá theo `m2`.

Tấm vẫn có thể bán nguyên tấm hoặc quy đổi/bán theo `m2` khi nghiệp vụ cần.

### BR-UNIT-INV-07: Biên cắt hao cho tấm

Hàng dạng tấm có cấu hình biên chừa/cắt hao mặc định.

Gợi ý mặc định ban đầu:

- cắt tấm đơn giản: `0.01m` đến `0.02m`
- CNC/cắt cần chính xác: `0.02m` đến `0.05m`

Các giá trị này là default để đề xuất, không khóa cứng. Nhân viên được sửa trên từng dòng hàng/đơn hàng.

---

## 7. Acceptance Criteria

- Mỗi sản phẩm có một đơn vị tồn chính.
- Bán bằng đơn vị phụ phải có quy đổi.
- Quy cách như khổ rộng không làm phình danh mục đơn vị chuẩn.
- Cuộn không bán trực tiếp trên POS.
- Tấm bán được theo nguyên tấm, m tới hoặc m2 theo cấu hình sản phẩm.
