# AI-OPERATING-RULES — Luật vận hành ngắn gọn

> **Trạng thái:** Source of Truth điều phối ngắn gọn
> **Owner:** Owner nói yêu cầu; Codex điều phối và chịu trách nhiệm làm thông suốt
> **Cập nhật:** 2026-07-03

---

## 1. Mô hình làm việc

Owner chỉ làm việc với một đầu mối Codex trong chat hiện tại.

Đầu mối Codex chịu trách nhiệm:

- hiểu yêu cầu nghiệp vụ của Owner
- chốt lại mục tiêu bằng ngôn ngữ dễ hiểu
- quyết định việc nào cần Spec, Implement, Review
- giao việc và theo dõi đến khi có kết quả
- báo Owner cần kiểm tra ở đâu, không bắt Owner chuyển lời giữa các luồng

Các luồng Spec, Implement, Review là vai trò nội bộ. Owner không phải quản lý ba luồng này.

---

## 2. Trách nhiệm từng vai

| Vai | Trách nhiệm chính | Không được làm |
|---|---|---|
| Spec | Chốt nghiệp vụ, UX, Source of Truth, acceptance | Tự đổi nghiệp vụ lớn hoặc code âm thầm |
| Implement | Code, test, PR, sửa feedback | Mở scope ngoài spec hoặc bỏ qua test lỗi |
| Review | Kiểm tra PR, regression, docs drift, rủi ro | Tự merge/sửa feature nếu chỉ được yêu cầu review |
| Coordinator | Điều phối, giao việc, giữ owner/next action rõ | Để Owner phải hỏi ai đang giữ việc |

Một thread có thể hỗ trợ kỹ thuật nhỏ để mở đường cho Owner test, nhưng phải nói rõ đó là hỗ trợ kiểm thử, không phải đổi nghiệp vụ.

---

## 3. Luật bắt buộc cho mọi việc quan trọng

Mọi slice/PR/blocker quan trọng phải có:

- `Current owner`
- `Next owner`
- `Next action`
- `Owner decision needed: Yes/No`
- link branch/PR/commit nếu có
- kiểm tra đã chạy hoặc lý do chưa chạy

Nếu Owner phải hỏi "ai đang làm?", "làm chưa?", "tiếp theo là gì?" thì đó là lỗi điều phối.

---

## 4. Vòng lặp chuẩn

1. Owner nói vấn đề/nghiệp vụ.
2. Coordinator chốt lại mục tiêu và phạm vi.
3. Nếu cần code, Coordinator giao rõ cho Implement.
4. Implement làm xong báo lại Spec/Review trực tiếp.
5. Review kiểm tra và báo lại trực tiếp.
6. Coordinator báo Owner kết quả và nơi cần kiểm tra nghiệp vụ.
7. Nếu kết quả chưa tốt, cập nhật luật/handoff để lần sau tốt hơn.

Owner không chuyển lời giữa các luồng.

---

## 5. Khi nào dùng một luồng, khi nào dùng ba vai

Việc nhỏ, ít rủi ro:

- một thread có thể làm nhanh
- vẫn phải báo rõ kết quả và kiểm tra

Việc đụng dữ liệu/nghiệp vụ/schema/tiền/kho/công nợ/chứng từ:

- phải có Spec rõ
- Implement làm trên branch/PR
- Review kiểm tra trước khi merge

Ba vai chỉ có ích nếu giảm việc cho Owner. Nếu làm Owner mệt hơn, phải sửa cách điều phối.

---

## 6. Luật học từ lỗi

Sau mỗi lần Owner thấy quy trình không thông suốt, Coordinator phải ghi lại bài học:

- lỗi điều phối là gì
- lần sau đổi luật/handoff/board ra sao
- ai đang giữ next action

Không chỉ sửa code; phải sửa cả cách làm việc.

---

## 7. Báo cáo tối thiểu

Mọi báo cáo quan trọng phải kết thúc bằng:

```text
Status:
- ...

Current owner:
- ...

Next owner:
- ...

Next action:
- ...

Owner decision needed:
- Yes / No
```

Nếu có PR, thêm:

```text
Branch / PR / commit:
- ...

Verification:
- ...
```

---

## 8. Vệ sinh tài liệu

Không để AI phải đọc dài dòng hoặc đọc nhầm tài liệu lỗi thời.

Luật tài liệu:

- Chỉ giữ một đường đọc chính cho luật vận hành: file này trước, workflow dài sau.
- Tài liệu lỗi thời và không còn giá trị trace phải được xóa bằng PR cleanup riêng.
- Tài liệu còn giá trị lịch sử nhưng không còn là policy phải ghi rõ `Historical` ở đầu file.
- Draft/spec/plan cũ không được xem là Source of Truth nếu chưa được promote vào docs chính.
- Khi tạo luật mới, phải cập nhật index để AI tìm đúng nơi đọc.
- Khi thấy hai tài liệu mâu thuẫn, Coordinator phải chốt tài liệu nào active, rồi sửa/xóa/đánh dấu historical tài liệu còn lại.

Nếu Owner phải nhắc "đọc nhầm tài liệu" hoặc "tài liệu dài quá", đó là lỗi điều phối tài liệu.
