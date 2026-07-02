# WORKFLOW-SPEC-IMPLEMENT — Quy ước phối hợp đặc tả và implement

> **Trạng thái:** Source of Truth điều phối
> **Owner:** Người dùng trực tiếp quyết định thứ tự và nghiệp vụ cuối cùng
> **Cập nhật:** 2026-07-02

---

## 1. Mục tiêu

Tài liệu này giúp hai luồng Codex không quên cách phối hợp sau vài task.

Luồng **Spec** giữ Source of Truth nghiệp vụ, rà KiotViet, ghi docs và review implementation theo nghiệp vụ.

Luồng **Implement** thi công code, test, PR/deploy và phản hồi blocker kỹ thuật/nghiệp vụ.

Quy trình tự động giao việc, tự review, checklist từng giai đoạn nằm tại
[WORKFLOW-AUTO-SPEC-IMPLEMENT.md](./WORKFLOW-AUTO-SPEC-IMPLEMENT.md).

---

## 2. Thứ tự ưu tiên Source of Truth

Khi có khác nhau giữa tài liệu, code và chat, dùng thứ tự sau:

1. Quyết định mới nhất của Owner trong chat.
2. Docs/spec đã commit trên branch spec hoặc `main`.
3. Implementation plan đã ghi trong `docs/superpowers/plans`.
4. Code hiện tại.

Nếu code lệch docs hoặc quyết định Owner, coi là implementation drift cho tới khi Spec/Owner chốt lại.

---

## 3. Trước khi implement một slice mới

Implement phải ghi rõ:

- slice đang làm
- branch/PR hiện tại
- file/commit SoT đang theo
- phần nào trong scope
- phần nào ngoài scope

Nếu đụng một trong các nhóm sau và chưa rõ, Implement phải hỏi Spec/Owner trước khi code sâu:

- tiền/quỹ/công nợ
- kho/stock movement
- hóa đơn/báo giá/chứng từ
- dữ liệu khó sửa sau khi đã ghi DB
- API/schema dùng lâu dài

Với wording nhỏ hoặc layout nhỏ, Implement có thể chọn cách đơn giản và ghi rõ trong PR.

---

## 4. Trong khi implement

Implement không cần chờ Spec nếu slice đã rõ.

Implement không tự mở scope ngoài SoT.

Khi phát hiện thiếu spec, câu hỏi gửi lại phải cụ thể:

- file/API/table/component nào bị ảnh hưởng
- có những lựa chọn nào
- lựa chọn nào Implement đề xuất
- nếu không chốt sẽ có rủi ro gì

---

## 5. Spec review gate

Mỗi PR/slice quan trọng cần được Spec review theo nghiệp vụ trước khi gọi là đúng.

Spec phân loại phát hiện:

| Loại | Ý nghĩa |
|---|---|
| Must fix before merge/deploy | Sai tiền, kho, công nợ, chứng từ, dữ liệu khó sửa, hoặc trái quyết định Owner |
| Follow-up acceptable | UI chưa đủ đẹp/đủ sâu nhưng không làm sai dữ liệu và đã ghi rõ là foundation |
| Future scope | Đúng là chưa làm vì nằm ngoài slice đã chốt |

Review nghiệp vụ không thay thế test kỹ thuật. Implement vẫn phải chạy verification theo plan.

---

## 6. Handoff từ Spec sang Implement

Chỉ handoff khi docs/spec liên quan đã được push hoặc đã nằm trên remote.

Format khuyến nghị:

```text
[Spec -> Implement handoff]

Remote branch/commit:
- ...

What changed in SoT:
- ...

Files updated:
- ...

Implementation impact:
- ...

Spec validation:
- ...
```

---

## 7. Handoff từ Implement sang Spec/Owner

Khi cần review hoặc nghiệm thu, Implement gửi:

```text
[Implement -> Spec review request]

Branch/PR/commit:
- ...

Scope implemented:
- ...

SoT followed:
- ...

Verification:
- ...

Known gaps:
- ...

Questions:
- ...
```

---

## 8. Ưu tiên sửa lệch hiện tại

Trước khi mở nhiều feature mới, ưu tiên sửa các điểm nền đã được Spec review:

1. POS phải gửi và lưu `width_m`, `height_m`, `linear_m` khi lưu báo giá và checkout.
2. Stock movement không được dùng `-quantity` chung cho mọi cách bán; m2/m tới/cuộn/tấm phải có rule đúng hoặc bị giới hạn scope rõ ràng.
3. Thu nợ độc lập không được tạo hóa đơn `HD...` giả; phải tạo phiếu thu, phân bổ công nợ và sổ quỹ đúng nghiệp vụ.
4. POS old-debt payment UX/payload phải rõ tổng tiền thực nhận và phần cấn nợ cũ, tránh làm hóa đơn mới bị nợ ngoài ý muốn.
5. PriceBook formula UI chưa được coi là MVP hoàn chỉnh nếu chưa đủ input công thức tối thiểu đã chốt.

---

## 9. Những điều không tự mở

Không tự mở các scope sau nếu Owner chưa chốt:

- auto-match file máy sản xuất với hóa đơn
- tự trừ kho từ dữ liệu máy sản xuất
- sửa/hủy hóa đơn có đảo kho/tiền/công nợ
- HĐĐT/VAT
- delivery/COD/kênh online
- product group schema cho PriceBook formula slice đầu

---

## 10. Quy tắc nhớ

Nếu một luồng bị mất mạch, đọc lại theo thứ tự:

1. File này.
2. [WORKFLOW-AUTO-SPEC-IMPLEMENT.md](./WORKFLOW-AUTO-SPEC-IMPLEMENT.md).
3. [PHASE-CHECKLIST.md](./PHASE-CHECKLIST.md).
4. Docs SoT theo module đang làm.
5. Plan trong `docs/superpowers/plans`.
