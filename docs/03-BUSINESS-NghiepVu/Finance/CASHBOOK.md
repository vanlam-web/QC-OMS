# CASHBOOK — Nghiệp vụ sổ quỹ, phiếu thu và phiếu chi

> **Trạng thái:** 🔨 Đang xây dựng
> **Nguồn:** Chốt từ trao đổi Owner 2026-06-30

---

## 1. Mục đích

Tài liệu này là Source of Truth cho nghiệp vụ sổ quỹ của QC-OMS:

- quỹ tiền mặt và tài khoản ngân hàng
- phiếu thu và phiếu chi
- đối soát cuối ngày
- quy tắc sửa phiếu bằng phiên bản mới

---

## 2. Quỹ và tài khoản

### BR-FIN-01: Mỗi dòng tiền thuộc một quỹ/tài khoản

Mọi khoản thu/chi phải ghi vào đúng quỹ hoặc tài khoản.

Các loại quỹ/tài khoản tối thiểu:

- `cash`: tiền mặt/két
- `bank`: tài khoản ngân hàng

Với chuyển khoản, hệ thống bắt buộc biết tiền vào hoặc ra từ tài khoản ngân hàng nào.

### BR-FIN-02: Đối soát theo từng quỹ/tài khoản

Cuối ngày, đối soát được thực hiện theo từng quỹ/tài khoản:

- tiền mặt trong hệ thống phải khớp tiền mặt trong két
- tiền chuyển khoản phải khớp từng tài khoản ngân hàng

Không đối soát chuyển khoản bằng một tổng chung không phân biệt tài khoản.

---

## 3. Phiếu thu và phiếu chi

### BR-FIN-03: Có cả thu và chi trong MVP

MVP quản lý rõ cả phiếu thu và phiếu chi.

Nhóm phiếu thu gồm:

- thu bán hàng
- thu nợ khách
- thu khác

Nhóm phiếu chi gồm:

- chi mua vật tư
- chi hoàn tiền
- chi phí vận hành
- chi khác

### BR-FIN-04: Không duyệt nhiều bước trong MVP

MVP không yêu cầu duyệt nhiều bước cho phiếu thu/chi.

Người có quyền tài chính tạo phiếu thì phiếu được ghi sổ ngay.

Phiếu phải lưu tối thiểu:

- mã phiếu
- loại thu/chi
- quỹ/tài khoản
- số tiền
- người tạo
- thời điểm tạo
- ghi chú/lý do nếu có
- chứng từ liên quan nếu có

---

## 4. Sửa phiếu thu/chi

### BR-FIN-05: Không ghi đè phiếu cũ khi sửa

Mọi phiếu thu/chi đều được phép sửa, nhưng hệ thống không ghi đè dữ liệu phiếu cũ.

Khi sửa:

1. Phiếu cũ chuyển sang trạng thái `cancelled`.
2. Hệ thống tạo phiếu mới với mã dựa trên mã cũ.
3. Phiếu mới liên kết về phiếu cũ hoặc phiếu gốc để truy vết.
4. Sổ quỹ chỉ tính phiếu còn hiệu lực.

Ví dụ phiếu thu:

```text
PT000123      bản gốc
PT000123.01   sửa lần 1
PT000123.02   sửa lần 2
```

Ví dụ phiếu chi:

```text
PC000045      bản gốc
PC000045.01   sửa lần 1
PC000045.02   sửa lần 2
```

Phiếu đã bị hủy do sửa vẫn được giữ để kiểm tra, không xóa vật lý.

### BR-FIN-06: Phiếu sinh từ nghiệp vụ gốc không được sửa lệch nghiệp vụ gốc

Quy tắc sửa phiên bản áp dụng cho tất cả phiếu thu/chi, gồm cả phiếu sinh từ bán hàng hoặc thu nợ.

Tuy nhiên, phiếu sinh từ hóa đơn, thanh toán hoặc công nợ không được sửa rời để làm lệch chứng từ gốc.

Nếu muốn đổi số tiền thanh toán của hóa đơn hoặc thu nợ, phải đi qua luồng sửa/hủy nghiệp vụ gốc tương ứng để hóa đơn, công nợ và sổ quỹ cùng khớp.

---

## 5. Thanh toán POS và sổ quỹ

### BR-FIN-07: Một lần thanh toán chỉ có tối đa một tài khoản chuyển khoản

Trong MVP, một lần thanh toán POS có thể gồm:

- chỉ tiền mặt
- chỉ chuyển khoản vào một tài khoản ngân hàng
- kết hợp tiền mặt và chuyển khoản vào một tài khoản ngân hàng

Không hỗ trợ một lần thanh toán chuyển vào nhiều tài khoản ngân hàng khác nhau.

Nếu có chuyển khoản, bắt buộc chọn tài khoản ngân hàng nhận tiền.

### BR-FIN-08: Sổ quỹ tách dòng theo tiền mặt và tài khoản ngân hàng

Khi thanh toán kết hợp tiền mặt và chuyển khoản, hệ thống ghi sổ quỹ thành các dòng riêng:

- phần tiền mặt vào quỹ tiền mặt
- phần chuyển khoản vào đúng tài khoản ngân hàng đã chọn

Ví dụ:

```text
Tổng thu: 1.000.000
Tiền mặt: 300.000
Chuyển khoản MB Bank: 700.000
```

Sổ quỹ ghi:

```text
+300.000 Quỹ tiền mặt
+700.000 MB Bank
```

---

## 6. Acceptance Criteria nghiệp vụ

1. Mọi phiếu thu/chi phải gắn với một quỹ hoặc tài khoản.
2. Chuyển khoản bắt buộc chọn tài khoản ngân hàng.
3. Đối soát cuối ngày xem được theo tiền mặt và từng tài khoản ngân hàng.
4. Người có quyền tài chính tạo phiếu thu/chi thì phiếu được ghi sổ ngay, không qua duyệt nhiều bước.
5. Sửa phiếu tạo mã phiên bản mới dạng `MaCu.01`, không ghi đè phiếu cũ.
6. Phiếu cũ sau khi sửa chuyển trạng thái `cancelled` và không được tính vào số dư hiệu lực.
7. Phiếu sinh từ hóa đơn/công nợ không được sửa rời để làm lệch chứng từ gốc.
8. Một lần thanh toán POS chỉ được chọn tối đa một tài khoản ngân hàng cho phần chuyển khoản.

---

← [Quay về Finance README](./README.md)
