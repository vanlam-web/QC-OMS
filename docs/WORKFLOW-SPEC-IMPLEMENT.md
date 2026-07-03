# WORKFLOW-SPEC-IMPLEMENT — Quy ước phối hợp các luồng Codex

> **Trạng thái:** Source of Truth điều phối
> **Owner:** Người dùng trực tiếp quyết định thứ tự và nghiệp vụ cuối cùng
> **Cập nhật:** 2026-07-03

---

## 1. Mục tiêu

Tài liệu này giúp các luồng Codex không quên cách phối hợp sau vài task.

Luồng **Spec** giữ Source of Truth nghiệp vụ, rà KiotViet, ghi docs và review implementation theo nghiệp vụ.

Luồng **Implement** thi công code, test, PR/deploy và phản hồi blocker kỹ thuật/nghiệp vụ.

Luồng **Review** kiểm tra dự án khi Owner yêu cầu, chạy test/build/lint, review rủi ro và chuẩn bị tài liệu/handoff để Spec và Implement tiếp tục làm việc.

Quy trình tự động giao việc, tự review, checklist từng giai đoạn nằm tại
[WORKFLOW-AUTO-SPEC-IMPLEMENT.md](./WORKFLOW-AUTO-SPEC-IMPLEMENT.md).

Nguyên tắc phối hợp bắt buộc: luồng nào nhận việc từ luồng khác thì phải báo cáo lại trực tiếp cho luồng đó khi xong, khi bị block, hoặc khi quyết định defer. Owner không phải làm người nhắc hộ hay chuyển lời giữa các luồng.

Bảng điều phối việc đang làm nằm tại [PROJECT-COORDINATION.md](./PROJECT-COORDINATION.md). Spec giữ bảng này đủ mới cho các slice/PR quan trọng; Review có quyền flag nếu bảng không khớp thực tế.

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

Review Thread có thể kiểm tra độc lập trước hoặc sau Spec review, nhưng kết quả Review không tự thay thế quyết định nghiệp vụ của Spec/Owner.

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

Current owner:
- Spec

Next owner:
- Implement

Next action:
- ...
```

Sau khi nhận handoff, Implement phải trả lời lại Spec bằng `[Implement -> Spec]` khi:

- đã mở PR/commit cần Spec review
- phát hiện blocker/spec thiếu cần Spec chốt
- quyết định defer hoặc tách scope

Nếu handoff đến từ Review hoặc ảnh hưởng issue trong [REVIEW-ISSUES.md](./REVIEW-ISSUES.md), Implement cũng phải gửi `[Implement -> Review]`.

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

Current owner:
- Implement

Next owner:
- Spec / Review / Owner

Next action:
- ...

Owner decision needed:
- Yes / No
```

Spec phải trả lời trực tiếp bằng `[Spec -> Implement]` sau khi review nghiệp vụ:

- Must fix before merge/deploy
- Follow-up acceptable
- Future scope
- Owner decision needed

Nếu review này liên quan issue Review giao, Spec cũng phải gửi `[Spec -> Review]` để Review re-check và cập nhật tracker.

Nếu Spec approve và việc cần Review gate, report phải ghi `Next owner: Review`. Nếu Spec trả must-fix, report phải ghi `Next owner: Implement`.

---

## 8. Review Thread

Owner có thể yêu cầu Review Thread kiểm tra toàn bộ dự án hoặc một slice cụ thể bất kỳ lúc nào.

Review Thread chịu trách nhiệm:

- đọc trạng thái repo hiện tại
- chạy kiểm tra phù hợp: lint, typecheck, build, unit test, database test, function test, e2e nếu môi trường cho phép
- phân biệt lỗi code, lỗi test, lỗi cấu hình, lỗi docs/spec drift
- giải thích vấn đề bằng ngôn ngữ dễ hiểu khi Owner yêu cầu
- chuẩn bị báo cáo/handoff cho Spec hoặc Implement
- ghi các issue đã giao cho luồng khác vào [REVIEW-ISSUES.md](./REVIEW-ISSUES.md)
- kiểm tra lại issue sau khi luồng phụ trách báo đã fix hoặc đã quyết định

Khi Review giao issue cho Spec hoặc Implement, Review phải ghi rõ thread nào cần báo lại. Luồng nhận việc phải gửi `[Spec -> Review]` hoặc `[Implement -> Review]` trực tiếp sau khi xử lý; không chờ Owner nhắc.

Format khuyến nghị:

```text
[Review -> Owner/Spec/Implement]

Scope checked:
- ...

Commands run:
- ...

Result:
- ...

Findings:
- ...

Likely impact:
- ...

Recommended next action:
- ...

Review issue IDs:
- ...

Needs Spec:
- ...

Needs Implement:
- ...

Current owner:
- Review

Next owner:
- Spec / Implement / Owner

Next action:
- ...
```

---

## 9. Ưu tiên sửa lệch hiện tại

Trước khi mở nhiều feature mới, ưu tiên sửa các điểm nền đã được Spec review:

1. POS phải gửi và lưu `width_m`, `height_m`, `linear_m` khi lưu báo giá và checkout.
2. Stock movement không được dùng `-quantity` chung cho mọi cách bán; m2/m tới/cuộn/tấm phải có rule đúng hoặc bị giới hạn scope rõ ràng.
3. Thu nợ độc lập không được tạo hóa đơn `HD...` giả; phải tạo phiếu thu, phân bổ công nợ và sổ quỹ đúng nghiệp vụ.
4. POS old-debt payment UX/payload phải rõ tổng tiền thực nhận và phần cấn nợ cũ, tránh làm hóa đơn mới bị nợ ngoài ý muốn.
5. PriceBook formula UI chưa được coi là MVP hoàn chỉnh nếu chưa đủ input công thức tối thiểu đã chốt.

---

## 10. Những điều không tự mở

Không tự mở các scope sau nếu Owner chưa chốt:

- auto-match file máy sản xuất với hóa đơn
- tự trừ kho từ dữ liệu máy sản xuất
- sửa/hủy hóa đơn có đảo kho/tiền/công nợ
- HĐĐT/VAT
- delivery/COD/kênh online
- product group schema cho PriceBook formula slice đầu

---

## 11. Quy tắc nhớ

Nếu một luồng bị mất mạch, đọc lại theo thứ tự:

1. File này.
2. [WORKFLOW-AUTO-SPEC-IMPLEMENT.md](./WORKFLOW-AUTO-SPEC-IMPLEMENT.md).
3. [REVIEW-ISSUES.md](./REVIEW-ISSUES.md) nếu đang xử lý lỗi do Review giao.
4. [PHASE-CHECKLIST.md](./PHASE-CHECKLIST.md).
5. Docs SoT theo module đang làm.
6. Plan trong `docs/superpowers/plans`.
