# PROJECT-COORDINATION — Board Điều Phối

> **Vai trò:** Board cho việc đang mở giữa các luồng Spec / Implement / Review.
> **Cập nhật:** 2026-07-05.

File này chỉ dùng khi có item đang cần nhiều luồng phối hợp. Nếu không có item đang mở, xem queue sống ở [PHASE-CHECKLIST.md](./PHASE-CHECKLIST.md) và issue review ở [REVIEW-ISSUES.md](./REVIEW-ISSUES.md).

---

## Mục Đích

Board này giúp Owner không phải tự chuyển lời giữa các luồng.

Mỗi việc đang mở phải trả lời được:

- mục tiêu nghiệp vụ là gì
- luồng nào đang giữ việc
- luồng nào nhận bước tiếp theo
- branch / PR / commit liên quan
- có cần Owner quyết định hay không

---

## Mẫu Item

```text
Việc:
- ID:
- Mục tiêu nghiệp vụ:
- Luồng đang giữ: Spec / Implement / Review / Owner
- Luồng nhận tiếp: Spec / Implement / Review / Owner
- Tình trạng: Drafting / Implementing / Waiting Spec / Waiting Review / Must Fix / Ready to Merge / Merged / Blocked / Deferred
- Branch / PR / commit:
- Source of Truth:
- Báo cáo gần nhất:
- Bước tiếp theo:
- Cần Owner quyết định: Có / Không
- Rủi ro:
```

Không xem là đã handoff nếu thiếu `Luồng đang giữ`, `Luồng nhận tiếp`, hoặc `Bước tiếp theo`.

---

## Board Đang Mở

Không có item đang mở.

---

## Mẫu Báo Cáo Giữa Luồng

```text
Tình trạng:
- ...

Luồng đang giữ:
- Spec / Implement / Review / Owner

Luồng nhận tiếp:
- Spec / Implement / Review / Owner

Bước tiếp theo:
- ...

Cần Owner quyết định:
- Có / Không
```

Nếu cần Owner quyết định, chỉ hỏi một câu nghiệp vụ ngắn và kèm đề xuất mặc định.

---

## Khi Nào Xoá Khỏi Board

Một item rời board khi:

- đã merge và đã report lại đúng luồng
- đã defer có lý do và trigger quay lại
- bị block bởi quyết định Owner và đã báo rõ
- được thay bằng item mới có link/reference
