# ENVIRONMENTS & CI/CD — Nền tảng triển khai QC-OMS

> **Trạng thái:** ✅ Chốt cho Giai đoạn 0
> **Phạm vi:** Local, staging, production baseline và pipeline.

---

## 1. MÔ HÌNH MÔI TRƯỜNG

| Môi trường | Frontend | Backend/Database | Mục đích |
|---|---|---|---|
| Local | Vite dev server | Supabase Cloud dev/staging by default; Supabase local only for migration/isolation work | Phát triển hằng ngày và test tự động |
| Preview | Vercel Preview | Không được tự động dùng production | Review UI theo Pull Request |
| Staging | Vercel project/domain staging | Supabase project staging | Demo, E2E và Owner acceptance |
| Production | Vercel project/domain production | Supabase project production | Vận hành thật |

Staging và production phải dùng project, Database, Auth user, secret và URL riêng biệt.

Preview mặc định dùng Backend staging chỉ khi thay đổi tương thích và dữ liệu test được cô lập. Thay đổi migration chưa deploy staging phải được test bằng Supabase local hoặc một môi trường preview được phê duyệt riêng.

---

## 2. BIẾN MÔI TRƯỜNG

Frontend được phép có:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`
- `VITE_APP_ENV`

Backend secret gồm:

- Supabase project URL/key do runtime cung cấp;
- Service Role Key;
- cấu hình CORS và rate limit;
- secret tích hợp bên ngoài khi có.

Quy tắc:

- Chỉ biến prefix `VITE_` mới được đưa vào bundle trình duyệt.
- Không đặt Service Role Key trong biến Frontend hoặc Vercel client environment.
- Repository chỉ chứa `.env.example`, không chứa giá trị thật.
- Secret production chỉ người/quy trình deploy production được truy cập.
- `VITE_API_BASE_URL` phải là Edge Functions root, ví dụ `https://<project>.supabase.co/functions/v1`. Không thêm `/api` vì client tự gọi `/api/v1/...`.

---

## 3. LOCAL DEVELOPMENT

Yêu cầu công cụ:

- Node.js bản LTS đang được dự án pin;
- `npm`;
- Supabase CLI và Docker chỉ bắt buộc khi chạy Supabase local/migration isolation.

Luồng khởi động chuẩn hiện tại:

```text
1. Cài dependency
2. Tạo .env.local trỏ Supabase Cloud dev/staging
3. Chạy Vite dev server
4. Chạy smoke test đăng nhập
```

Khi thay đổi migration, RLS, hoặc logic cần DB cô lập, dùng Supabase local như một operator/test path riêng: khởi động Supabase local, chạy migration + seed, chạy Edge Function API local, rồi smoke test.

---

## 4. BRANCH VÀ PROMOTION

| Sự kiện | Kết quả |
|---|---|
| Mở/cập nhật Pull Request | Chạy CI, tạo Vercel Preview nếu phù hợp |
| Merge vào `main` | Deploy staging sau khi CI thành công |
| Owner chấp nhận staging | Promote đúng commit đã test sang production bằng bước thủ công |
| Production lỗi | Rollback ứng dụng về commit trước; Database dùng corrective migration nếu cần |

Không build lại source khác khi promote từ staging sang production nếu pipeline hỗ trợ tái sử dụng artifact. Ít nhất phải giữ nguyên Git SHA đã được nghiệm thu.

---

## 5. CI PIPELINE

Mỗi Pull Request chạy tối thiểu:

1. Cài dependency bằng lockfile.
2. Lint.
3. Typecheck.
4. Unit/component test.
5. Build production Frontend.
6. Kiểm tra format/migration Database.
7. Khởi tạo Supabase local sạch, apply toàn bộ migration.
8. Integration test Backend/RLS.
9. Secret scan và dependency security check phù hợp.

E2E smoke test chạy trên staging sau deploy, tối thiểu:

```text
Đăng nhập → gọi /me → chọn máy trạm → mở POS Shell → đăng xuất
```

Deploy staging/production thất bại nếu bước bắt buộc trước đó thất bại.

---

## 6. DATABASE MIGRATION

- Migration được commit trong `supabase/migrations/` và chạy theo thứ tự.
- Không sửa migration đã chạy trên staging/production; tạo migration mới để điều chỉnh.
- Migration phải chạy được trên Database sạch trong CI.
- Thay đổi phá vỡ tương thích phải theo chiến lược expand/migrate/contract.
- Backup trước migration production có rủi ro cao.
- Rollback Database ưu tiên corrective forward migration; không tự động down migration làm mất dữ liệu.

---

## 7. CORS VÀ NETWORK

- Local API chỉ cho origin local đã cấu hình.
- Staging API chỉ cho domain staging/preview được phê duyệt.
- Production API chỉ cho domain production và các origin tích hợp đã chốt.
- Không dùng wildcard `*` cho endpoint có credential trong production.
- Mọi endpoint công khai dùng HTTPS.

---

## 8. LOG VÀ HEALTH

Giai đoạn 0 thu thập tối thiểu:

- Edge Function request count, error rate và latency;
- deployment status;
- Auth failure bất thường;
- API `GET /api/v1/health`;
- log có trace ID để đối chiếu lỗi FE–BE.

Không log password, access token, refresh token, Service Role Key hoặc request body nhạy cảm.

Dashboard, retention và alert nâng cao hoàn thiện ở Giai đoạn 8.

---

## 9. BACKUP VÀ RESTORE BASELINE

- Staging và production dùng khả năng backup phù hợp của Supabase project.
- Trước production phải ghi nhận rõ lịch backup hiện có và người chịu trách nhiệm kiểm tra.
- Restore drill đầy đủ, RPO và RTO được chốt ở Giai đoạn 8.
- Seed local/staging không được chạy tự động trên production.

---

## 10. ĐIỀU KIỆN SẴN SÀNG GIAI ĐOẠN 0

- Local có thể dựng từ repository sạch.
- Migration Foundation chạy thành công trên Database sạch.
- Staging Frontend gọi đúng staging API/Database.
- Không có production secret trong source hoặc Preview.
- CI chặn merge khi lint, typecheck, test hoặc build thất bại.
- Smoke test đăng nhập chạy thành công sau deploy staging.
