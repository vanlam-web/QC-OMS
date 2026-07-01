# QC-OMS Spec Gap Backlog — Draft

> Ngày lập: 2026-06-30  
> Trạng thái: Draft điều phối, không phải Source of Truth nghiệp vụ  
> Mục tiêu: Ghi lại các phần đặc tả còn thiếu sau khi rà `docs/`, để ưu tiên viết tiếp mà không sửa chồng lên luồng implementation hiện tại.

---

## 1. Phạm vi rà soát

Đã rà cấu trúc và quy tắc tài liệu:

- `AI_TEAM_RULES.md`
- `docs/DOCUMENT_RULES.md`
- `_RULES.md` của các tầng 00-07
- `docs/README.md`
- `docs/DEVELOPMENT-PLAN.md`
- `docs/PHASE-CHECKLIST.md`
- `docs/AUDIT-V2.md`
- nhóm PRD-UX POS, Business Sales, Database, Backend, Integration và Deployment hiện có

Nguyên tắc áp dụng:

- File này chỉ là backlog/draft điều phối, không chốt business rule mới.
- Khi một mục được làm thật, phải viết vào Source of Truth đúng tầng.
- Nếu chưa chắc business rule, ưu tiên tạo draft riêng trước, rồi Owner chốt trước khi cập nhật SoT.
- Tránh sửa trực tiếp các file đang có khả năng được luồng implementation sử dụng cho Phase 1A.
- Quy trình lưu draft, commit nhỏ và handoff cho implementation được ghi tại `docs/superpowers/specs/2026-06-30-spec-implementation-handoff-workflow.md`.
- Khi tham khảo KiotViet, không kết luận từ bộ lọc mặc định `Tháng này`; cần kiểm tra khoảng thời gian dài hơn nếu màn có vẻ trống.
- Màn nào vẫn không có dữ liệu thực tế sau kiểm tra dài hạn, rất ít dùng, hoặc chỉ là nghiệp vụ retail chung thì mặc định đề xuất bỏ khỏi MVP/để sau, trừ khi Owner chốt giữ.

---

## 2. Trạng thái hiện tại

### Đã tương đối ổn

- Vision và target state đã có.
- Phase 0 Foundation đã có spec, plan, checklist và tài liệu API/DB/Deployment tương ứng.
- PRD-UX POS đã phủ khung chính K01/K02/K03 và nhiều tương tác người dùng.
- Business Sales đã có các mảng nền:
  - tính giỏ hàng
  - vòng đời đơn POS/báo giá/hóa đơn
  - checkout/thanh toán
  - công nợ khách hàng
- Database/System và Backend/Foundation đã chốt cho Giai đoạn 0.
- Audit consistency cũ trong `AUDIT-V2.md` đã đánh dấu hoàn tất các patch lớn.

### Còn lệch giữa roadmap và spec chi tiết

Roadmap đã đi đến Giai đoạn 8, nhưng Source of Truth chi tiết mới chắc nhất ở Foundation và một phần POS/Sales. Các giai đoạn 1-7 vẫn cần viết dần theo tầng 02 -> 03 -> 04 -> 05 -> 06/07.

---

## 3. Khoảng trống đặc tả theo mức ưu tiên

### P0 — Cần trước khi làm Phase 1B/Phase 1 ổn định

#### 3.1. Product, Customer, Price List — Business

Source of Truth đã tạo/cập nhật:

- `docs/03-BUSINESS-NghiepVu/Sales/POS-CUSTOMER.md`
- `docs/03-BUSINESS-NghiepVu/Sales/POS-PRICING.md`

Ghi chú còn lại:

- Chưa cần tách `POS-PRODUCT-CATALOG.md` trong Phase 1; quy tắc sản phẩm liên quan tới bán hàng đang nằm trong `POS-PRICING.md`.
- Database/API cho Customer, Product và Pricing vẫn cần đặc tả ở tầng 04/05 sau Business.

Đã có trong PRD hiện tại:

- F3 tìm theo mã hàng hoặc tên hàng hóa/dịch vụ; không tìm theo viết tắt tự chế.
- F3 hỗ trợ tìm không dấu và không phân biệt cách nhập dấu tiếng Việt.
- F3 không hỗ trợ QR/barcode scan, không có nút quét mã cạnh ô tìm kiếm.
- POS không cho tạo nhanh hàng hóa từ dropdown tìm kiếm; tạo mới hàng hóa thuộc module Danh mục hàng hóa.
- K03-C chỉ hiển thị sản phẩm/dịch vụ đang bật bán trên POS.

Đã chốt bởi Owner:

- SĐT khách hàng không được trùng trong phạm vi dữ liệu của xưởng/organization.
- Cho phép tạo khách hàng không có SĐT.
- Mỗi khách hàng bắt buộc có mã khách và tên khách.
- Nếu khi tạo khách không nhập mã khách, hệ thống tự sinh mã khách dạng `KH000001`, `KH000002`, tăng dần trong phạm vi xưởng/organization.
- Mã khách không được trùng trong phạm vi xưởng/organization, dù là nhập tay hay tự sinh.
- Khách hàng có thể thuộc một nhóm khách; nhóm khách quyết định bảng giá áp dụng.
- Khách hàng không gán nhóm vẫn hợp lệ; khi đó POS áp dụng bảng giá chung.
- Khi đổi khách trên đơn, giá các dòng hàng được cập nhật theo bảng giá của nhóm khách mới.
- Giá mặc định khi bán hàng luôn lấy theo bảng giá của nhóm khách.
- Nếu nhân viên sửa giá khác bảng giá, đó là giá sửa tay cho lần bán đó; không tự cập nhật ngược vào bảng giá.
- Giá sửa tay được lưu vào lịch sử giá theo cặp khách hàng + sản phẩm.
- Lần sau bán cùng khách hàng + sản phẩm, POS vẫn hiện giá mặc định theo bảng giá nhóm khách trước.
- POS có một nút nhỏ để xem giá gần đây; khi bấm nút, hiển thị 5 giá gần nhất để nhân viên chọn lại.
- Nút xem giá gần đây chỉ hiện khi khách hàng đó đã có lịch sử giá riêng với sản phẩm đó.
- Phase 1 không có chiết khấu riêng theo khách/nhóm khách. Mức ưu đãi được thể hiện bằng bảng giá của nhóm khách.
- Sản phẩm ngưng bán không xuất hiện trong tìm kiếm POS bán hàng.
- Sản phẩm ngưng bán chỉ được tìm thấy trong danh sách sản phẩm ở trang Hàng hóa, thông qua bộ lọc trạng thái.
- Không bán trực tiếp theo đơn vị `Cuộn`; vật tư dạng cuộn được quy đổi ra `m²` khi bán.
- `Tấm` chủ yếu bán theo đơn vị `m` ghi là mét tới: ví dụ tấm khổ `2.44 x 1.22`, bán `1 m tới` nghĩa là bán phần `1 m x 1.22 m`.
- Với sản phẩm bán theo `m tới`, bảng giá lưu giá theo `1 m tới`, không phải giá theo `m²`.
- `Tấm` vẫn có thể bán nguyên tấm hoặc quy đổi/bán theo `m²` khi nghiệp vụ cần.
- `Cái` trong tài liệu hiện tại là cách nói chung cho nhóm hàng bán theo số lượng; về sau có thể có nhiều tên đơn vị cụ thể khác.

Lý do ưu tiên:

- Giai đoạn 1 cần sản phẩm, khách hàng và bảng giá.
- Database hiện có `customers`, `price_lists`, `products` nhưng schema còn một phần và chưa đủ quyết định chuẩn hóa.
- Backend README đang ghi Customers/Order/Checkout chưa có API riêng.

#### 3.2. Price List — Database decision

Source of Truth đã cập nhật:

- `docs/04-DATABASE/Sales/POS-TABLES.md`
- `docs/04-DATABASE/01-ERD.md`

Đã chốt:

- Bảng giá dùng mô hình chuẩn hóa `price_lists` + `price_list_items`, không dùng `discount_items jsonb`.
- Sales Phase 1 có `organization_id` để scope dữ liệu theo xưởng/organization.
- `customers`, `customer_groups`, `price_lists`, `price_list_items`, `products` và `customer_product_price_history` đã được đặc tả.
- Constraint chính cho mã khách, SĐT chuẩn hóa, mã bảng giá, mã sản phẩm, trạng thái sản phẩm và đơn giá đã được ghi trong `POS-TABLES.md`.

Ghi chú còn lại:

- Cần chốt kỹ thuật cụ thể cho index/cột phụ phục vụ tìm kiếm không dấu khi viết migration hoặc Backend search API.

#### 3.2B. Customer/Product/Pricing — Backend API

Source of Truth đã tạo:

- `docs/05-BACKEND-MayChu/POS/CUSTOMER-PRODUCT-PRICING-API.md`

Đã chốt:

- POS lookup/create customer và đọc giá dùng `perm.create_order`.
- Quản lý sản phẩm, nhóm khách, bảng giá và chi tiết bảng giá dùng `perm.edit_price_book`.
- Product search trên POS luôn ép `status = active`.
- `/pricing/resolve` trả giá theo nhóm khách, bảng giá chung hoặc fallback bảng giá chung.
- Lịch sử giá gần đây chỉ đọc tối đa 5 giá; việc ghi lịch sử thuộc order/checkout khi chứng từ bán được lưu.

---

### P1 — Cần trước Phase 2-4

#### 3.2C. Sales Documents — PRD-UX

Source of Truth đã tạo:

- `docs/02-PRD-UX-PhongCanh/SalesDocuments/README.md`
- `docs/02-PRD-UX-PhongCanh/SalesDocuments/01-SALES-DOCUMENT-LIST.md`
- `docs/02-PRD-UX-PhongCanh/SalesDocuments/02-SALES-DOCUMENT-DETAIL.md`

Nguồn tham khảo:

- `docs/superpowers/specs/2026-07-01-kv-web-qc-oms-audit.md`

Đã định hướng:

- Trang chứng từ bán hàng quản lý báo giá `BG...`, hóa đơn `HD...`, hóa đơn sửa dạng `MaCu.01` và chứng từ đã hủy.
- Không đưa trả hàng, giao hàng, vận đơn, COD hoặc hóa đơn điện tử vào MVP.
- Báo giá mở lại tại POS; hóa đơn hoàn thành sửa bằng cách tạo chứng từ mới và hủy chứng từ cũ để truy vết.

#### 3.2D. Customers — PRD-UX

Source of Truth đã tạo:

- `docs/02-PRD-UX-PhongCanh/Customers/README.md`
- `docs/02-PRD-UX-PhongCanh/Customers/01-CUSTOMER-LIST.md`
- `docs/02-PRD-UX-PhongCanh/Customers/02-CUSTOMER-DETAIL.md`

Đã định hướng:

- Trang Customers giữ các thông tin phục vụ bán hàng, bảng giá, gửi bill và công nợ.
- Mã khách và tên khách là trọng tâm; SĐT không bắt buộc nhưng nếu có thì unique.
- Không đưa giới tính, sinh nhật, tích điểm, khuyến mại tự động hoặc người phụ trách khách hàng vào MVP.

#### 3.2E. PriceBook — PRD-UX

Source of Truth đã tạo:

- `docs/02-PRD-UX-PhongCanh/PriceBook/README.md`
- `docs/02-PRD-UX-PhongCanh/PriceBook/01-PRICE-LIST.md`
- `docs/02-PRD-UX-PhongCanh/PriceBook/02-PRICE-LIST-DETAIL.md`

Đã định hướng:

- QC-OMS quản lý bảng giá theo từng bảng riêng, không trải nhiều bảng giá ngang như KiotViet trong MVP.
- Bảng giá chung là fallback mặc định.
- Bảng giá nhóm áp dụng qua nhóm khách; khách không gán nhóm dùng bảng giá chung.
- Không đưa khuyến mại, công thức cập nhật giá hàng loạt hoặc chiết khấu riêng vào MVP.

#### 3.3. Order draft và Order persistence

Source of Truth đã tạo/cập nhật:

- Business: `docs/03-BUSINESS-NghiepVu/Sales/POS-ORDER-LIFECYCLE.md`
- Database: `docs/04-DATABASE/Sales/POS-TABLES.md`
- Backend: `docs/05-BACKEND-MayChu/POS/ORDER-API.md`

Đã định hướng:

- Nháp POS Phase 2 vẫn lưu local theo máy; backend chưa tạo `orders` cho nháp.
- Báo giá `BG...` và hóa đơn `HD...` mới là chứng từ lưu server.
- Báo giá không giữ hàng, không trừ kho, không tạo tiền/công nợ/doanh thu.
- Snapshot giá, tên sản phẩm, khách hàng và dòng kích thước phải lưu theo chứng từ.
- Sửa hóa đơn đã chốt dùng bản mới `MaCu.01`, chứng từ cũ chuyển đã hủy để truy vết.

Còn cần chi tiết khi làm phase sửa/chứng từ nâng cao:

- Quy tắc khóa hóa đơn cũ khi đang mở để sửa bởi nhiều máy POS.
- UX xử lý xung đột nếu hai người cùng mở/sửa một chứng từ.
- Chính sách đảo kho/đảo tiền/công nợ khi hủy hoặc sửa hóa đơn đã có phát sinh.

#### 3.4. Checkout API, payment, cashbook và debt allocation

Source of Truth đã tạo/cập nhật:

- Business: `docs/03-BUSINESS-NghiepVu/Sales/POS-CHECKOUT.md`
- Business: `docs/03-BUSINESS-NghiepVu/Sales/POS-CUSTOMER-DEBT.md`
- Business: `docs/03-BUSINESS-NghiepVu/Finance/CASHBOOK.md`
- Database: `docs/04-DATABASE/Finance/PAYMENT-DEBT-TABLES.md`
- Database: `docs/04-DATABASE/Finance/CASHBOOK-TABLES.md`
- Backend checkout: `docs/05-BACKEND-MayChu/POS/ORDER-API.md`
- Backend Finance: `docs/05-BACKEND-MayChu/Finance/FINANCE-API.md`

Đã định hướng:

- Checkout tạo hóa đơn, trừ kho, ghi phiếu thu, dòng sổ quỹ và công nợ trong cùng transaction nghiệp vụ.
- Thu nợ cũ phân bổ vào hóa đơn còn nợ cũ nhất trước.
- Một lần thanh toán MVP dùng tối đa một tài khoản ngân hàng cho phần chuyển khoản, có thể kết hợp tiền mặt + chuyển khoản.
- Sổ quỹ quản lý tiền mặt và từng tài khoản ngân hàng riêng.
- Mã phiếu/entry exact lookup phải bỏ qua/mở rộng filter thời gian mặc định khi cần.
- MVP không tạo khách trả trước/công nợ âm. Nếu khách trả dư khi còn nợ, nhân viên chọn trả lại khách hoặc cấn vào nợ cũ.

Còn cần chi tiết khi làm phase sửa/hủy nâng cao:

- Chính sách đảo hoặc tạo bút toán bù khi hủy hóa đơn đã phát sinh công nợ/phiếu thu.
- UX cho sửa phiếu thu thủ công đã đối soát.
- Error code chi tiết cho các tình huống checkout fail một phần nếu transaction backend không hoàn tất.

---

### P2 — Cần trước Phase 4-5

#### 3.5. Inventory domain

Draft tham khảo từ export KiotViet:

- `docs/superpowers/specs/2026-06-30-kv-product-export-inventory-draft.md`

Source of Truth Business đã tạo:

- `docs/03-BUSINESS-NghiepVu/Inventory/README.md`
- `docs/03-BUSINESS-NghiepVu/Inventory/STOCK-RULES.md`
- `docs/03-BUSINESS-NghiepVu/Inventory/UNIT-CONVERSION.md`
- `docs/03-BUSINESS-NghiepVu/Inventory/STOCKTAKE.md`
- `docs/03-BUSINESS-NghiepVu/Inventory/PRODUCTION-RECONCILIATION.md`

Source of Truth kỹ thuật đã tạo:

- `docs/04-DATABASE/Inventory/INVENTORY-TABLES.md`
- `docs/05-BACKEND-MayChu/Inventory/INVENTORY-API.md`

Đã chốt trong Business:

- Bán thiếu tồn: cảnh báo nhưng vẫn cho bán tiếp, tồn có thể âm.
- MVP tạo/lưu đơn bán chính thức là mốc trừ kho.
- Hàng đợi máy sản xuất vẫn được gửi thông báo vào POS để tạo hóa đơn nháp; nháp này chưa trừ kho cho tới khi chốt/lưu hóa đơn.
- Dữ liệu máy sản xuất dùng để đối soát, không tự trừ kho trong MVP.
- Mỗi sản phẩm có một đơn vị tồn chính; đơn vị bán phụ phải quy đổi.
- Hàng cuộn quản lý theo từng cuộn vật lý, không sửa tổng tồn trực tiếp.
- Hàng tấm quản lý theo tấm nguyên/tấm dở/tấm lỡ, không sửa tổng tồn trực tiếp.
- Tấm lỡ dưới `0.3m2` mặc định bỏ; nhân viên có thể tạo/sửa thủ công nếu muốn giữ.
- Kiểm kho có phiếu tạm/cân bằng/hủy; sửa tồn hàng thường ở Hàng hóa tự sinh phiếu kiểm kho đã cân bằng.

Rủi ro:

- PRD có luồng khui vật tư và BOM khá giàu, Business Inventory mới chốt mức MVP. Không nên chốt schema hoặc backend sâu cho BOM/máy sản xuất trước khi Owner chốt chính sách sản xuất chi tiết.

Còn cần chốt/chi tiết sau MVP:

- BOM/Combo MVP trừ vật tư con tới mức nào khi định mức chưa rõ.
- Production queue và dữ liệu máy sản xuất được lưu/claim qua API nào.
- Khi nào chuyển từ đối soát máy sản xuất sang cơ chế tự đề xuất/trừ kho nâng cao.

#### 3.6. BOM/Combo business

Draft tham khảo đã tạo:

- `docs/superpowers/specs/2026-07-01-bom-combo-mvp-boundary-draft.md`

Source of Truth cần bổ sung khi phase này bắt đầu:

- Business Sales hoặc Inventory tùy ranh giới cuối cùng.
- Database BOM tables.
- Backend validation chống vòng lặp BOM.

Đã định hướng tạm thời:

- Combo trong POS trước hết là dòng bán hàng có snapshot.
- Giá bán combo độc lập với tổng giá vật tư thành phần.
- Nếu BOM rõ và đủ cấu hình, có thể trừ kho theo thành phần khi chốt hóa đơn.
- Nếu BOM chưa rõ hoặc thiếu cấu hình, MVP không tự deep-scan/trừ vật tư con; chỉ lưu snapshot và cảnh báo nếu cần.
- Sửa BOM trong đơn mặc định chỉ lưu snapshot chứng từ, không tự tạo SKU/combo mới.

Còn thiếu/chưa chốt:

- BOM cấp 1/cấp 2 là cấu trúc bán hàng hay cấu trúc vật tư sản xuất.
- Quy tắc chỉnh BOM trong đơn có lưu thành combo mới hay chỉ snapshot trong đơn.
- Cách tính giá bán combo so với tổng chi phí vật tư.
- Cách deep-scan khi checkout và khi preview.

---

### P3 — Cần trước Phase 6-7

#### 3.7. Purchase/Supplier draft

Draft tham khảo KiotViet đã tạo:

- `docs/superpowers/specs/2026-07-01-kv-purchase-supplier-draft.md`

Định hướng:

- Chưa đưa Purchase vào MVP nếu chưa chốt nhập kho vật lý theo cuộn/tấm.
- Khi làm sau này nên tách nhà cung cấp, phiếu nhập hàng và công nợ nhà cung cấp.
- Mua dịch vụ có thể đi qua phiếu chi Sổ quỹ trước, chưa cần module riêng.

Owner cần chốt:

- Có cần quản lý nhà cung cấp ngay phase đầu không.
- Nhập cuộn/tấm có tạo object tồn vật lý ngay lúc nhập hàng không.
- Có cần công nợ nhà cung cấp trong MVP không.
- Giá vốn dùng phương pháp nào.

#### 3.7B. MVP Scope lock

Source of Truth đã tạo:

- `docs/01-VISION-TamNhin/03-MVP-SCOPE.md`

Đã chốt:

- QC-OMS MVP là bán đứt tại xưởng, không copy các module KiotViet không dùng.
- Không làm Đặt hàng KiotViet, vận đơn, COD, bán online, HĐĐT/VAT, thương hiệu retail, điểm thưởng, chấm công/lương/hoa hồng.
- Báo giá chỉ là bản giá, không giữ hàng, không trừ kho, không tạo tiền/công nợ/doanh thu.
- Purchase/Supplier, giá vốn/lợi nhuận đầy đủ, máy sản xuất tự trừ kho và gửi tin tự động để sau MVP.

Ý nghĩa với implement:

- Khi làm UI/API/DB mới, phải kiểm tra scope lock này trước khi thêm trường/chức năng từ KiotViet.

#### 3.8. Reporting draft

Draft tham khảo KiotViet đã tạo:

- `docs/superpowers/specs/2026-07-01-kv-reporting-draft.md`

Định hướng:

- Báo cáo cuối ngày là báo cáo nên ưu tiên đầu tiên sau Finance/đối soát.
- Báo cáo/phân tích vẫn cần đầy đủ cho quản trị xưởng: bán hàng, khách hàng, công nợ, hàng hóa/tồn kho và tài chính.
- Báo cáo hàng hóa của QC-OMS phải nhìn được tồn vật lý cuộn/tấm.
- Bỏ kênh bán, VAT/HĐĐT và thương hiệu/thuộc tính retail khỏi báo cáo QC-OMS.
- Thương hiệu nếu cần thì ghi trong tên hàng/mã hàng/nhóm hàng, không tạo field báo cáo riêng.
- Chưa gọi là lợi nhuận chuẩn nếu chưa chốt giá vốn, nhập hàng và chi phí sản xuất.

#### 3.9. Inventory adjustments & returns draft

Draft tham khảo KiotViet đã tạo:

- `docs/superpowers/specs/2026-07-01-kv-inventory-adjustments-returns-draft.md`

Định hướng:

- Xuất hủy chỉ giữ nếu Owner cần kiểm soát vật tư bỏ/hỏng; nếu giữ thì làm tối giản như điều chỉnh giảm tồn/hủy vật tư.
- Xuất dùng nội bộ chưa cần module riêng; có thể là một lý do của điều chỉnh giảm tồn.
- Trả hàng nhập để sau Purchase/Supplier.
- Trả hàng bán tiếp tục không thuộc MVP; hóa đơn sai xử lý bằng sửa chứng từ `MaCu.01`.
- Các màn Xuất dùng nội bộ, Xuất hủy, Trả hàng nhập và Trả hàng bán đã được kiểm tra dài hạn `01/07/2016 - 01/07/2026` và vẫn không có giao dịch phù hợp; vì vậy càng nên xếp vào bỏ/để sau.

Owner cần chốt:

- Có cần phiếu hủy vật tư riêng trong MVP không.
- Tấm lỡ dưới `0.3m2` mặc định bỏ có cần sinh lịch sử hủy không.
- Dùng nội bộ có cần theo dõi ngay không.

#### 3.10. Hàng đợi máy sản xuất và Integration máy sản xuất

Draft tham khảo đã tạo:

- `docs/superpowers/specs/2026-07-01-production-queue-contract-draft.md`

Source of Truth cần tạo/bổ sung khi phase này bắt đầu:

- Business Production Queue hoặc Sales queue rule
- Database queue/event/history tables
- Backend production queue API
- Integration contract cho máy in/CNC

Đã định hướng:

- Hàng đợi máy sản xuất tạo hoặc bổ sung hóa đơn nháp trong POS.
- Nháp từ queue chưa trừ kho/ghi tiền/doanh thu/công nợ.
- Queue phải có atomic claim để hai POS không xử lý trùng một thông báo.
- Channel realtime dự kiến là `production_queue`, không dùng thuật ngữ `workstation_queue`.
- Parser filename dự kiến theo PRD K02-D: `KH_[HH_]daixrong(_xSL)?(_ghichu)?`.

Owner/Technical cần chốt:

- Máy sản xuất gửi qua folder watcher, API, webhook, hay manual simulator trước.
- Dữ liệu khách/hàng/kích thước trong tên file có format bắt buộc nào.
- Queue item lỗi khách/hàng có hiện cho thu ngân hay chỉ hiện cho quản lý.
- Khi add-to-draft claim thành công nhưng frontend local draft fail, restore thủ công có đủ cho MVP không.

#### 3.11. Bill, Printer, Zalo/Facebook send support

Draft tham khảo đã tạo:

- `docs/superpowers/specs/2026-07-01-bill-printer-messaging-draft.md`

Source of Truth cần tạo sau khi phase này bắt đầu:

- PRD-UX quản lý mẫu bill nếu cần.
- Integration Printer.
- Integration Zalo/Facebook hoặc Messaging.
- Database bill templates/config nếu cần lưu cấu hình.
- Backend bill config/render API nếu cần.

Đã định hướng:

- Bill lấy dữ liệu từ snapshot chứng từ, không lấy lại bảng giá/tên hàng/khách hiện tại.
- MVP chỉ hỗ trợ in browser, sinh ảnh bill và mở đúng nơi gửi.
- Nhân viên tự kiểm tra, dán ảnh và bấm gửi.
- Không tự động gửi Zalo/Facebook, không lưu lịch sử gửi bill và không rollback chứng từ nếu gửi lỗi.
- Lỗi môi trường như chưa đăng nhập, link sai hoặc clipboard bị chặn phải có fallback thủ công.

---

### P4 — Cần trước Production

#### 3.12. Deployment production, backup, RPO/RTO

Source of Truth baseline đã tạo:

- `docs/07-DEPLOYMENT-TrienKhai/PRODUCTION.md`
- `docs/07-DEPLOYMENT-TrienKhai/BACKUP-RESTORE.md`

Đã định hướng:

- Production chỉ promote commit đã qua CI/staging/smoke test.
- Rollback app theo Git SHA ổn định; database dùng corrective migration hoặc restore theo runbook.
- RPO baseline 24 giờ, RTO baseline 4 giờ làm việc.
- Backup tự động hằng ngày, giữ tối thiểu 14 ngày.
- Restore drill phải chạy định kỳ vào môi trường riêng.
- Alert tối thiểu cho API/login/checkout/DB/backup/SSL/realtime hoặc queue khi có.

Còn cần bổ sung khi hạ tầng thật được chốt:

- Công cụ monitoring/alert cụ thể.
- Kênh cảnh báo chính thức.
- Checklist restore theo nhà cung cấp production thật.

---

## 4. Thứ tự làm tiếp đề xuất

1. ~~Viết draft Business cho Customer/Product/Pricing.~~ Đã chuyển vào `03-BUSINESS-NghiepVu/Sales/POS-CUSTOMER.md` và `POS-PRICING.md`.
2. ~~Chốt schema bảng giá: JSONB hay `price_list_items`.~~ Đã chốt `price_list_items`.
3. ~~Viết Database Sales Phase 1: customers/products/price lists chuẩn hóa, index tìm kiếm.~~ Đã cập nhật `04-DATABASE/Sales/POS-TABLES.md`.
4. ~~Viết Backend APIs Phase 1: product search, customer CRUD/search, price resolution.~~ Đã tạo `05-BACKEND-MayChu/POS/CUSTOMER-PRODUCT-PRICING-API.md`.
5. ~~Viết draft Order persistence: nháp, báo giá, hóa đơn, snapshot dòng hàng.~~ Đã cập nhật `POS-ORDER-LIFECYCLE.md`, `POS-TABLES.md` và tạo `ORDER-API.md`.
6. Viết Finance/Checkout spec: payment, cashbook, debt allocation, idempotency. Đã tạo `03-BUSINESS-NghiepVu/Finance/CASHBOOK.md`; còn cần Database/API cho Finance và Checkout idempotency.
7. Viết Inventory policy draft trước khi động đến BOM/khui vật tư sâu.
8. Viết Production queue + Integration contract cho Phase 6.
9. Viết Bill/Printer/Messaging spec cho Phase 7.
10. Viết Production/Backup/Monitoring trước Phase 8.

Khuyến nghị cho luồng hiện tại:

- Nếu luồng implementation đang ở Phase 1A, không cần đụng các file SoT POS hiện tại.
- Luồng spec nên đi trước bằng draft ở `docs/superpowers/specs/` cho các quyết định còn thiếu, sau đó mới chuyển từng phần đã chốt vào đúng tầng.

---

## 5. Quyết định Owner còn mở

Đã chốt và gom vào draft `2026-06-30-customer-product-pricing-design.md`:

- SĐT khách hàng không được trùng trong cùng organization nếu có nhập.
- Khách được phép không có SĐT.
- Khách bắt buộc có mã khách và tên khách; mã khách có thể tự sinh dạng `KH000001`.
- Khách có nhóm dùng bảng giá nhóm; khách không nhóm dùng bảng giá chung.
- Phase 1 không có chiết khấu riêng ngoài bảng giá.
- Giá sửa tay không cập nhật ngược vào bảng giá; được lưu lịch sử theo khách hàng + sản phẩm.
- POS chỉ bán sản phẩm đang bán; sản phẩm ngưng bán chỉ xem ở trang Hàng hóa qua bộ lọc trạng thái.
- Không bán trực tiếp theo cuộn; tấm chủ yếu bán theo mét tới và giá theo `1 m tới`.

Còn cần Owner quyết định ở các phase sau:

- Nháp hóa đơn lưu server từ Phase 2 hay chỉ LocalStorage cho tới khi báo giá/thanh toán.
- Cơ chế máy sản xuất gửi event trong pilot: file watcher, API, webhook hoặc simulator.
- Nhập hàng/NCC có nằm trong MVP không, hay để sau khi Inventory vật lý ổn định.
- Báo cáo cuối ngày có cần chốt/khóa lịch sử hay chỉ là báo cáo động.

Đã chốt và cần giữ:

- Bán thiếu tồn: cảnh báo nhưng vẫn cho bán tiếp, tồn có thể âm.
- MVP không tạo khách trả trước/công nợ âm.
- Bill gửi khách trong MVP chỉ mở đúng nơi gửi và chuẩn bị ảnh/copy; nhân viên tự kiểm tra rồi bấm gửi.

---

## 6. Definition of Ready cho từng spec tiếp theo

Một spec được xem là sẵn sàng chuyển từ draft sang SoT khi:

- Đã xác định đúng tầng sở hữu.
- Không có business rule mơ hồ cần Owner chốt.
- Có danh sách file liên tầng cần cập nhật.
- Có acceptance criteria đủ để implementation/test dùng.
- Không sao chép lại nội dung đã thuộc tầng khác; chỉ tham chiếu bằng link tương đối.
