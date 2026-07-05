# AUDIT-V2 — Đối chiếu audit & checklist patch

> **Status:** Historical/completed audit trace. This file records the 2026-06-27 Cursor/Codex comparison and patch waves; it is not active workflow policy.
>
> **Ngày đối chiếu:** 2026-06-27
> **Phạm vi:** Đối chiếu giữa 2 audit độc lập (Cursor & Codex) trên `docs/`
> **File tham chiếu:** `docs/AUDIT_REPORT.md` (giữ nguyên, không ghi đè)
> **Người lập:** Cursor

---

## 1. TÓM TẮT ĐỐI CHIẾU

| Tiêu chí | Cursor | Codex | Ai thắng |
|---|---|---|---|
| Precision (đúng khi claim) | 7.9/10 | 10.0/10 | 🟢 Codex |
| Recall (phát hiện vấn đề mới) | 8.0/10 | 4.0/10 | 🔵 Cursor |
| Tự phản biện | 6.0/10 | 9.0/10 | 🟢 Codex |
| Đề xuất cụ thể | 7.5/10 | 9.0/10 | 🟢 Codex |
| **Tổng có trọng số** | **7.46/10** | **8.4/10** | 🟢 Codex (+1) |

**Kết luận đối chiếu:**
- Codex thắng precision: phản biện ít hơn nhưng đúng evidence, ít suy diễn.
- Cursor thắng recall: phát hiện nhiều finding mà Codex sót, nhưng có 5 finding ban đầu sai evidence hoặc quá rộng.
- Bản đúng nhất = **hợp nhất**: giữ finding Cursor phát hiện và đã verify, bỏ finding Cursor sai.

---

## 2. FINDING GIỮ (đã verify evidence)

Đây là các finding đã đối chiếu, cả hai bên đồng ý giữ. Đưa vào patch queue.

| # | Finding | File vi phạm | Mức | Đề xuất |
|---|---|---|---|---|
| F-01 | Trùng `BR-01` giữa 2 file | `docs/03-BUSINESS-NghiepVu/Sales/POS-ORDER-CALC.md` + `docs/03-BUSINESS-NghiepVu/Sales/POS-CHECKOUT.md` | Trùng ID / SoT tham chiếu | Đổi namespace: `BR-CALC-*` cho POS-ORDER-CALC, `BR-CHK-*` cho POS-CHECKOUT |
| F-02 | F8 nhắc trong Business nhưng PRD chưa định nghĩa | `docs/03-BUSINESS-NghiepVu/Sales/POS-CHECKOUT.md` + PRD-UX | Spec thiếu | Định nghĩa F8 trong PRD-UX hoặc đổi shortcut trong Business |
| F-03 | Duplicate shortcut matrix giữa Top Bar và Profile/Shortcuts | `docs/02-PRD-UX-PhongCanh/POS/K01/01-K01-TOPBAR.md` + `docs/02-PRD-UX-PhongCanh/POS/K01/01b-K01-PROFILE-SHORTCUTS.md` | SoT không rõ | `01b-K01-PROFILE-SHORTCUTS.md` là **Source of Truth**. Top Bar chỉ tham chiếu |
| F-04 | K02-D thiếu spec cho icon khui động `[⚠️ 🍾]` | `docs/02-PRD-UX-PhongCanh/POS/K02/04-K02D-HANG-DOI.md` (thiếu) | Spec thiếu | Bổ sung spec khui động hoặc defer sang `01d-K01-KHUI.md` |
| F-05 | Wireframe K01 lỗi render (nhãn + wireframe bị trộn) | `docs/02-PRD-UX-PhongCanh/POS/K01/01-K01-TOPBAR.md` dòng 13-19 | Lỗi render | Tách dòng nhãn (`II.1 — Search`, `II.2 — Tab Đa HĐ`, ...) ra khỏi wireframe |
| F-06 | Top Bar trong 02c khác với Top Bar chính thức K01 | `docs/02-PRD-UX-PhongCanh/POS/K02/02c-K02A-M2-KHUI.md` dòng 104-107 vs `01-K01-TOPBAR.md` dòng 13-19 | Không đồng nhất | 02c phải dùng cùng 4 khu vực như K01, hoặc ghi rõ là "Wireframe giả định — xem K01" |

---

## 3. FINDING LOẠI (Cursor đã nhận sai)

Đây là các finding ban đầu của Cursor đã bị Codex phản biện đúng bằng evidence. **Không đưa vào patch queue.**

| # | Finding ban đầu của Cursor | Lý do loại | Ai đúng |
|---|---|---|---|
| R-01 | "01c-K01-ARCH-SAFETY.md trỏ đến lib/pos/calc.ts, src/stores/posStore.ts" | File chỉ là bảng tham chiếu sang Backend; code nằm ở `05-BACKEND/POS/ARCHITECTURE.md:70` | 🟢 Codex |
| R-02 | "K02-B mâu thuẫn K01 search về 500 ký tự" | K01 search không có giới hạn 500; grep "500" trong `01a-K01-SEARCH-TABS.md` = 0 matches | 🟢 Codex |
| R-03 | "Đường dẫn `../../../03-BUSINESS...` sai" | 3 cấp từ `docs/02-PRD-UX/POS/K02/` về `docs/` đúng | 🟢 Codex |
| R-04 | "Validation trong PRD đều là nghiệp vụ AC" | File `03-K02B-GHI-CHU.md` phân tách đúng UI behavior (PRD) vs lưu trữ (Database) | 🟢 Codex |
| R-05 | "03-K02B-GHI-CHU.md tự mâu thuẫn" | File xử lý đúng cách — UI ở PRD, lưu trữ defer sang Database | 🟢 Codex |
| R-06 | "§1, §2, §3 không theo số tầng" | § là số mục tài liệu, không phải số tầng | 🟢 Codex |
| R-07 | "00-OVERVIEW dùng Phần II/III gây lệch" | Overview dùng số tầng 0-7; "Phần II/III" chỉ là heading con | 🟢 Codex |

### Finding hòa (giữ nhưng chẩn đoán khác)

| # | Finding | Chẩn đoán Cursor | Chẩn đoán Codex | Chốt |
|---|---|---|---|---|
| H-01 | `02b-K02A-BOM-NESTED.md` lấn tầng Logic Trừ Kho (dòng 39) | Sai phạm vi vì "thuộc K02-A" | K02-A có quyền có file con; vấn đề thật ở parent `02-K02A-DONG-SP.md` dòng 65-68 nhắc lại 4 rule nghiệp vụ dài | **Cả hai đúng một nửa**: lỗi tồn tại ở `02b` dòng 39; nguyên nhân sâu là parent `02-K02A-DONG-SP.md` nhắc rule |

---

## 4. SOURCE OF TRUTH ĐÃ CHỐT

| Chủ đề | File SoT | File tham chiếu |
|---|---|---|
| Phím tắt POS (F1-F12) | `01b-K01-PROFILE-SHORTCUTS.md` | `01-K01-TOPBAR.md` (chỉ link), các file Business (chỉ gọi tên shortcut) |
| Top Bar 4 khu vực | `01-K01-TOPBAR.md` | `02c-K02A-M2-KHUI.md` (phải dùng cùng 4 khu vực) |
| Icon khui động `[⚠️ 🍾]` | `01d-K01-KHUI.md` §IX (canonical) + `02c-K02A-M2-KHUI.md` §3 (logic chi tiết) | `04-K02D-HANG-DOI.md` (chỉ tham chiếu §IV, KHÔNG định nghĩa lại) |
| BR ID namespace | Theo file: `BR-CALC-*`, `BR-CHK-*`, `BR-VAT-*`, ... | Audit mọi BR trùng prefix khi patch |
| AI tổ chức & quyền | `AI_TEAM_RULES.md` | Cursor/Gemini đọc; bypass phải log vào `docs/CHANGELOG-AI.md` |

---

## 5. THỨ TỰ PATCH

### Đợt 1 — An toàn UI/spec consistency ✅ ĐÃ HOÀN THÀNH 2026-06-27
**Rủi ro thấp**, không động đến nghiệp vụ PRD/Business. Chỉ sửa wireframe render + Top Bar đồng nhất + status.

- ~~**P-01**~~ ✅ Sửa wireframe K01 lỗi render — tách dòng nhãn `II.1 — Search ... II.4 — Tiện ích` ra khỏi wireframe
- ~~**P-02**~~ ✅ Ghi rõ wireframe Top Bar trong `02c-K02A-M2-KHUI.md` là rút gọn, tham chiếu về wireframe chính thức ở K01
- ~~**P-03**~~ ✅ Sửa bảng trạng thái trong `POS/README.md` (bỏ `||` thừa) + ghi chú K01 không có README riêng

### Đợt 1B — Metadata/status ✅ ĐÃ HOÀN THÀNH 2026-06-27
**Rủi ro rất thấp**, chỉ sửa trạng thái, không đụng nghiệp vụ. Có thể chạy độc lập, không phụ thuộc UI.

- ~~**P-13**~~ ✅ Cập nhật trạng thái tầng 3-5 (Business/Database/Backend) trong `docs/README.md` từ ⬜ → 🔨 + sửa lỗi markdown `||` thừa
- ~~**P-14**~~ ✅ Cập nhật `docs/AUDIT_REPORT.md` — bổ sung dòng timestamp 2026-06-27
- ~~**P-15**~~ ✅ Sửa heading lỗi dòng 1 của 3 file conventions

### Đợt 2 — SoT & shortcut ✅ ĐÃ HOÀN THÀNH 2026-06-27
**Rủi ro trung bình**, đụng đến 2 file PRD.

- **P-04** Đánh dấu `01b-K01-PROFILE-SHORTCUTS.md` là SoT shortcut (F-03)
- **P-05** Bỏ bảng shortcut khỏi `01-K01-TOPBAR.md`, chỉ tham chiếu
- **P-06** Định nghĩa F8 trong PRD (F-02) — đề xuất thêm vào `01b-K01-PROFILE-SHORTCUTS.md`

### Đợt 3 — BR ID namespace ✅ ĐÃ HOÀN THÀNH 2026-06-27
**Rủi ro trung bình**, đụng nhiều file Business.

- **P-07** Đổi `BR-01`...`BR-NN` trong `POS-ORDER-CALC.md` → `BR-CALC-01`... (F-01)
- **P-08** Đổi tương tự trong `POS-CHECKOUT.md` → `BR-CHK-*`
- **P-09** Audit các file khác dùng cùng `BR-NN`, đổi theo namespace file

### Đợt 4 — Spec thiếu (K02-D)
**Rủi ro cao**, đụng đến hành vi nghiệp vụ.

- **P-10** Viết spec cho icon `[⚠️ 🍾]` trong `04-K02D-HANG-DOI.md` hoặc defer hẳn về `01d-K01-KHUI.md` (F-04)

### Đợt 5 — Sửa lỗi phụ (nếu có)
**Rủi ro thấp** (chỉ sau khi đợt 1-4 đã ổn định).

- **P-11** Sửa `02b-K02A-BOM-NESTED.md` dòng 39 (Logic Trừ Kho lấn tầng) (H-01)
- **P-12** Sửa `02-K02A-DONG-SP.md` dòng 65-68 (parent nhắc lại rule nghiệp vụ) (H-01)

---

## 6. CHECKLIST TRƯỚC KHI BẮT ĐẦU PATCH

- [ ] Đã đọc `docs/DOCUMENT_RULES.md` §6 (Quy tắc chỉnh sửa) + §7 (Quy tắc tạo tài liệu) nếu tạo file mới
- [ ] Đã xác định đợt patch sẽ chạy
- [ ] Đã xác nhận từng file thật sự tồn tại trước khi patch (tránh tạo path ảo)
- [ ] Đã có người duyệt AUDIT-V2.md này (bạn — đã xong)
- [ ] Sau mỗi đợt, cập nhật lại AUDIT-V2.md để đánh dấu P-XX done

---

## 7. TIẾN ĐỘ PATCH

| Đợt | Patch | Trạng thái |
|---|---|---|
| Đợt 1B | P-13 (docs/README: tầng 3-5 ⬜→🔨 + sửa \|\| thừa) | ✅ Đã xong |
| Đợt 1B | P-14 (AUDIT_REPORT timestamp) | ✅ Đã xong |
| Đợt 1B | P-15 (3 conventions heading) | ✅ Đã xong |
| Đợt 1 | P-01 (wireframe K01 tách nhãn) | ✅ Đã xong |
| Đợt 1 | P-02 (02c Top Bar: ghi rõ wireframe rút gọn) | ✅ Đã xong |
| Đợt 1 | P-03 (POS/README: sửa \|\| thừa + ghi chú K01) | ✅ Đã xong |
| Đợt 2 | P-04 (01b: đánh dấu SoT shortcut) | ✅ Đã xong |
| Đợt 2 | P-05 (TOPBAR §IV: bỏ bảng trùng, chỉ tham chiếu) | ✅ Đã xong |
| Đợt 2 | P-06 (F8 mở bảng giá K03-A trong 01b) | ✅ Đã xong |
| Đợt 3 | P-07 (POS-ORDER-CALC: BR-* → BR-CALC-*) | ✅ Đã xong |
| Đợt 3 | P-08 (POS-CHECKOUT: BR-* → BR-CHK-* + 4 tham chiếu nội bộ) | ✅ Đã xong |
| Đợt 3 | P-09 (01-K02-GIO-HANG: đổi link BR-02/BR-03 → BR-CALC-02/03) | ✅ Đã xong |
| Đợt 4A | P-AI-01..04 (Sửa `AI_TEAM_RULES.md`: thêm Owner Emergency Override, Gemini Parallel Analysis, sửa ASCII layout, thêm Questions; tạo `docs/CHANGELOG-AI.md` log bypass #1-#4) | ✅ Đã xong |
| Đợt 4 | P-10 (04-K02D-HANG-DOI: thêm §IV tham chiếu icon khui động về 01d §IX + 02c §3, không copy logic) | ✅ Đã xong |
| Đợt 5 | P-11 (02b-K02A-BOM-NESTED dòng 39: đổi "Logic Trừ Kho" → mô tả UI `Diện tích tiêu hao` + defer Backend) + P-12 (02-K02A-DONG-SP rule #4/#7/#8/#9: thêm tag `*(Backend xử lý)*`; giữ #10 Khui động tự do vì là UI). Không tạo file Inventory mới. | ✅ Đã xong |

**Tiếp theo:** Audit nhóm giữa (Đợt 1 → Đợt 5) **HOÀN TẤT**. Pattern "Xử lý ngầm" chi tiết Backend trong `01d-K01-KHUI.md` + `02c-K02A-M2-KHUI.md` ghi nhận là backlog/future audit — mở đợt mới khi cần tạo domain Inventory.
**Lưu ý governance:** Khi Codex online lại, Codex review 4 bypass trong `docs/CHANGELOG-AI.md` (Bypass #1: Đợt 1, #2: Đợt 2, #3: Đợt 3, #4: Đợt 4A).

---

## 8. LỊCH SỬ

| Ngày | Sự kiện |
|---|---|
| 2026-06-26 (chiều) | Cursor hoàn tất `AUDIT_REPORT.md` (đợt 1) |
| 2026-06-27 (sáng) | Cursor + Codex đối chiếu, chốt 6 finding giữ + 7 finding loại + 1 hòa |
| 2026-06-27 | Tạo `AUDIT-V2.md` (file này) — đóng băng checklist, chờ patch |
| 2026-06-27 | Sửa `AUDIT-V2.md` theo phản hồi: P-03 path, đổi tên Đợt 1, F-01 mức, §6/§7 checklist, bổ sung Đợt 1B (P-13/P-14/P-15) |
| 2026-06-27 | Sửa P-15: thay §6/§8 (sai vì §8 = độ dài) bằng 3 file conventions thật có heading lỗi dòng 1: BACKEND/INTEGRATION/DEPLOYMENT_CONVENTIONS.md |
| 2026-06-27 | **Đợt 1 HOÀN TẤT**: P-01 (K01 wireframe tách nhãn II.1-II.4) + P-02 (02c Top Bar: ghi rõ wireframe rút gọn, triển khai dùng K01) + P-03 (POS/README: sửa `\|\|` thừa + ghi chú K01 không có README riêng) — Xong 6/15 patch |
| 2026-06-27 | **Đợt 2 HOÀN TẤT**: P-04 (01b: đánh dấu SoT shortcut + cấm định nghĩa lại ở file khác) + P-05 (TOPBAR §IV: bỏ bảng `F3/Ctrl+…` trùng, chỉ tham chiếu sang 01b) + P-06 (01b thêm F8 mở dropdown Bảng giá K03-A, liên kết `../K03/01-K03A-DOI-TAC.md`) — Xong 9/15 patch |
| 2026-06-27 | **Đợt 3 HOÀN TẤT**: P-07 (POS-ORDER-CALC: 3 BR sang `BR-CALC-01/02/03`, nâng BR-02/03 từ bold thành `###` heading để anchor ổn định) + P-08 (POS-CHECKOUT: 7 BR sang `BR-CHK-01..07` + 4 tham chiếu `(BR-04..07)` trong flow §5) + P-09 (01-K02-GIO-HANG: link `BR-02/BR-03` → `BR-CALC-02/03` với anchor `#br-calc-02-…` / `#br-calc-03-…`) — Xong 12/15 patch |
| 2026-06-27 | **Đợt 5 HOÀN TẤT** (lần 2 — thêm 2 fix wording nội bộ): P-11 (`02b-K02A-BOM-NESTED.md` dòng 39: đổi `Logic Trừ Kho` → `Diện tích tiêu hao` chỉ mô tả UI realtime + defer Backend; dòng 80: tách "Hành vi khi thanh toán" — phần user-facing vs phần defer Backend) + P-12 (`02-K02A-DONG-SP.md` rule #4/#7/#8/#9: thêm tag `*(Backend xử lý)*` ở cuối mỗi rule; giữ #10 Khui động tự do vì là UI; dòng 15 bảng con: đổi "Deep-Scan ngầm" → "Deep-Scan khi thanh toán" để đồng bộ với rule #7 đã sửa). Không tạo file Inventory mới trong đợt này. Pattern tương tự ở `01d-K01-KHUI.md` (§VI) + `02c-K02A-M2-KHUI.md` (§3, §4) ghi nhận backlog/future audit. Owner sẽ cần quyết định mở đợt mới nếu sau này tạo domain Inventory. |
