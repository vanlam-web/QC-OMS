# PHẦN 7: TRIỂN KHAI (DEPLOYMENT)

> **Source of Truth** cho việc triển khai và vận hành hệ thống QC-OMS.

---

## Mục đích

Folder này trả lời các câu hỏi:

- Hệ thống được triển khai như thế nào?
- Môi trường chạy gồm những gì?
- Quy trình Build và Deploy ra sao?
- Hệ thống được giám sát và sao lưu như thế nào?

---

## Phạm vi tầng

| Phân loại | Nội dung |
|-----------|----------|
| **CHỈ GHI** | Deployment Architecture · Docker / Container · VPS / Server · Domain / DNS / SSL · Environment (Dev / Staging / Production) · CI/CD Pipeline · Monitoring · Logging · Backup / Restore · Disaster Recovery |
| **THAM CHIẾU** | Business · Database · Backend · Integration — chỉ để giải thích cách triển khai |
| **KHÔNG GHI** | Vision · Feature Specification · UI/Wireframe · Business Rule · Database Schema · API Specification · Backend Workflow · Source Code |

---

## Thứ tự phát triển

Thiết kế triển khai domain chỉ hoàn thiện khi Backend/Integration tương ứng đã chốt. Riêng baseline local, staging và CI/CD được thiết kế từ Giai đoạn 0 để mỗi vertical slice đều deploy và kiểm thử được.

Điều kiện cho deployment domain:

1. 05-BACKEND đã chốt API tương ứng.
2. 06-INTEGRATION đã chốt cấu hình kết nối liên quan.

---

## Nội dung đã có

| File | Mô tả | Trạng thái |
|------|--------|------------|
| `DEPLOYMENT_CONVENTIONS.md` | Quy ước chung: Docker, CI/CD, Backup, Monitoring, DR | ✅ Hoàn tất |
| `PHASE-0-RUNBOOK.md` | Runbook kiểm thử và vận hành Phase 0 | ✅ Hoàn tất |
| [ENVIRONMENTS-CI.md](./ENVIRONMENTS-CI.md) | Local, staging, production baseline và CI/CD | ✅ Chốt Giai đoạn 0 |

---

## Nội dung dự kiến

| Môi trường | Mô tả | Trạng thái |
|------------|--------|------------|
| **Dev** | Cấu hình local, Supabase local | ✅ Baseline Giai đoạn 0 |
| **Staging** | Vercel + Supabase staging, smoke test | ✅ Baseline Giai đoạn 0 |
| **Production** | Cấu hình production, monitoring, alert | ⬜ Chi tiết sắp tới |

> Baseline xem tại `ENVIRONMENTS-CI.md`; tài liệu vận hành production chi tiết sẽ được bổ sung khi đủ nội dung.

---

← [ Quay về README chính](../README.md)
