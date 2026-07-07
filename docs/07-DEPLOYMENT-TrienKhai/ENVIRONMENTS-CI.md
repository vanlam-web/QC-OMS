# ENVIRONMENTS & CI/CD — Nền tảng triển khai QC-OMS

> **Mốc cập nhật:** theo quyết định Supabase Cloud backend chính.
> **Phạm vi:** Dev, staging, production baseline và pipeline.

---

## 1. MÔ HÌNH MÔI TRƯỜNG

| Môi trường | Frontend | Backend/Database | Mục đích |
|---|---|---|---|
| Dev thường | Vite dev server trên máy dev | Supabase Cloud staging/dev project | Phát triển hằng ngày, không bắt buộc Docker/máy chủ LAN |
| Local isolated | Vite dev server | Supabase local Docker | Test migration/RLS/DB cô lập khi cần |
| Preview | Vercel Preview | Không được tự động dùng production | Review UI theo Pull Request |
| Staging | Vercel project/domain staging | Supabase project staging | Demo, E2E và Owner acceptance |
| Production | Vercel project/domain production | Supabase project production | Vận hành thật |

Staging và production phải dùng project, Database, Auth user, secret và URL riêng biệt.

Supabase Cloud là hướng backend chính hiện tại cho dev/staging. Developer mới chỉ cần cấu hình `.env.local` trỏ tới Supabase Cloud dev/staging project đã được cấp quyền.

LAN/Tailscale shared-dev server chỉ là phương án phụ/local fallback nội bộ khi cần chạy một Supabase local chung trong mạng. Không xem LAN/Tailscale là mặc định.

Local Docker Supabase chỉ dùng khi cần isolated local database/test, ví dụ test migration, RLS, pgTAP hoặc làm việc offline. Không bắt buộc cho dev frontend/backend thường ngày.

Preview mặc định dùng Backend staging chỉ khi thay đổi tương thích và dữ liệu test được cô lập. Thay đổi migration chưa deploy staging phải được test bằng Supabase Cloud staging/dev project, Supabase local isolated, hoặc một môi trường preview được phê duyệt riêng.

CI bắt buộc chạy lại migration local trước khi chạy function tests:

1. `npm run supabase:start`
2. `npm run supabase:reset`
3. `npm run test:db`
4. `npm run test:functions`

Thứ tự này chặn lỗi deploy function trước schema, ví dụ function đã select cột mới nhưng DB cloud/chạy thử chưa có migration tương ứng.

PWA hiện chỉ là app-shell cache:

- cache file build tĩnh để POS/app mở lại nhanh hơn;
- tự cập nhật service worker khi có bản mới;
- không cam kết lưu hóa đơn/báo giá offline;
- mọi nghiệp vụ bán hàng vẫn phải theo API/server khi ghi dữ liệu.

---

## 2. BIẾN MÔI TRƯỜNG

Frontend được phép có:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`
- `VITE_APP_ENV`
- `VITE_SENTRY_DSN` (tùy chọn)
- `VITE_SENTRY_TRACES_SAMPLE_RATE` (tùy chọn, `0` đến `1`)

Ví dụ `.env.local` cho Supabase Cloud dev/staging:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<cloud-anon-key>
VITE_API_BASE_URL=https://<project-ref>.supabase.co/functions/v1/api
VITE_APP_ENV=staging
VITE_SENTRY_DSN=
VITE_SENTRY_TRACES_SAMPLE_RATE=0
```

`VITE_APP_ENV` nên dùng một trong các giá trị dễ đọc như `development`, `staging`, `production`, hoặc `local-isolated` tùy môi trường đang trỏ tới.

Sentry chỉ bật khi `VITE_SENTRY_DSN` có giá trị. Khi chưa cấu hình DSN, app không gửi event ra Sentry. `VITE_SENTRY_TRACES_SAMPLE_RATE` mặc định là `0` để không bật performance tracing ngoài ý muốn.

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

---

## 3. DEV THƯỜNG VỚI SUPABASE CLOUD

Yêu cầu công cụ:

- Node.js bản LTS đang được dự án pin;
- `npm`;
- `.env.local` trỏ tới Supabase Cloud dev/staging project.

Luồng khởi động chuẩn cho developer mới:

```bash
npm ci
npm run dev
```

Sau đó đăng nhập bằng user test/staging được cấp. Không cần bật Docker, Supabase local, máy chủ LAN hoặc Tailscale để chạy dự án ở chế độ dev thường.

## 4. LOCAL ISOLATED DEVELOPMENT

Yêu cầu công cụ:

- Node.js bản LTS đang được dự án pin;
- `npm`;
- Supabase CLI;
- Docker runtime theo yêu cầu của Supabase local.

Luồng này chỉ dùng khi cần database/test cô lập:

```text
1. Cài dependency
2. Khởi động Supabase local
3. Chạy migration + seed
4. Chạy Edge Function API local
5. Chạy Vite dev server
6. Chạy smoke test đăng nhập
```

Các lệnh thực tế phải được đưa vào `package.json` khi scaffold code, tối thiểu gồm `dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e` và nhóm lệnh Supabase local.

---

## 5. BRANCH VÀ PROMOTION

| Sự kiện | Kết quả |
|---|---|
| Mở/cập nhật Pull Request | Chạy CI, tạo Vercel Preview nếu phù hợp |
| Merge vào `main` | Deploy staging sau khi CI thành công |
| Owner chấp nhận staging | Promote đúng commit đã test sang production bằng bước thủ công |
| Production lỗi | Rollback ứng dụng về commit trước; Database dùng corrective migration nếu cần |

Không build lại source khác khi promote từ staging sang production nếu pipeline hỗ trợ tái sử dụng artifact. Ít nhất phải giữ nguyên Git SHA đã được nghiệm thu.

---

## 6. CI PIPELINE

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

## 7. DATABASE MIGRATION

- Migration được commit trong `supabase/migrations/` và chạy theo thứ tự.
- Không sửa migration đã chạy trên staging/production; tạo migration mới để điều chỉnh.
- Migration phải chạy được trên Database sạch trong CI.
- Thay đổi phá vỡ tương thích phải theo chiến lược expand/migrate/contract.
- Backup trước migration production có rủi ro cao.
- Rollback Database ưu tiên corrective forward migration; không tự động down migration làm mất dữ liệu.

---

## 8. CORS VÀ NETWORK

- Local API chỉ cho origin local đã cấu hình.
- Staging API chỉ cho domain staging/preview được phê duyệt.
- Production API chỉ cho domain production và các origin tích hợp đã chốt.
- Không dùng wildcard `*` cho endpoint có credential trong production.
- Mọi endpoint công khai dùng HTTPS.

---

## 9. LOG VÀ HEALTH

Giai đoạn 0 thu thập tối thiểu:

- Edge Function request count, error rate và latency;
- deployment status;
- Auth failure bất thường;
- API `GET /api/v1/health`;
- log có trace ID để đối chiếu lỗi FE–BE.

Không log password, access token, refresh token, Service Role Key hoặc request body nhạy cảm.

Dashboard, retention và alert nâng cao hoàn thiện ở Giai đoạn 8.

---

## 10. BACKUP VÀ RESTORE BASELINE

- Staging và production dùng khả năng backup phù hợp của Supabase project.
- Trước production phải ghi nhận rõ lịch backup hiện có và người chịu trách nhiệm kiểm tra.
- Restore drill, RPO và RTO baseline xem [BACKUP-RESTORE.md](./BACKUP-RESTORE.md); trước production thật cần xác nhận lại theo hạ tầng đang dùng.
- Seed local/staging không được chạy tự động trên production.

---

## 11. ĐIỀU KIỆN SẴN SÀNG GIAI ĐOẠN 0

- Dev thường có thể chạy từ repository sạch bằng Supabase Cloud dev/staging env.
- Local isolated có thể dựng từ repository sạch khi cần test DB/migration.
- Migration Foundation chạy thành công trên Database sạch.
- Staging Frontend gọi đúng staging API/Database.
- Không có production secret trong source hoặc Preview.
- CI chặn merge khi lint, typecheck, test hoặc build thất bại.
- Smoke test đăng nhập chạy thành công sau deploy staging.
