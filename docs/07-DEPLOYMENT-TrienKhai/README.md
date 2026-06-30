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

**07-DEPLOYMENT chỉ được thiết kế khi**:

1. ✅ 05-BACKEND đã có đủ API
2. ✅ 06-INTEGRATION đã có cấu hình kết nối bên ngoài

---

## Nội dung đã có

| File | Mô tả | Trạng thái |
|------|--------|------------|
| `DEPLOYMENT_CONVENTIONS.md` | Quy ước chung: Docker, CI/CD, Backup, Monitoring, DR | ✅ Hoàn tất |
| [PHASE-0-RUNBOOK.md](./PHASE-0-RUNBOOK.md) | Runbook kiểm thử và vận hành Phase 0 | ✅ Hoàn tất |

---

## Nội dung dự kiến

| Môi trường | Mô tả | Trạng thái |
|------------|--------|------------|
| **Dev** | Cấu hình local, Supabase dev instance | ⬜ Chi tiết sắp tới |
| **Staging** | Cấu hình staging, smoke test | ⬜ Chi tiết sắp tới |
| **Production** | Cấu hình production, monitoring, alert | ⬜ Chi tiết sắp tới |

> Chi tiết theo từng môi trường sẽ nằm trong sub-folder khi đủ nội dung.

---

← [ Quay về README chính](../README.md)
