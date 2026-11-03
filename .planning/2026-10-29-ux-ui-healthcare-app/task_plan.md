# Task Plan: Ứng dụng sức khỏe từ Figma — frontend và backend

## Goal
Hoàn thành ứng dụng theo 100 màn High-Fidelity của 5 thành viên, có frontend, NestJS + MongoDB, dữ liệu lưu thật và các luồng nghiệp vụ được kiểm thử; ưu tiên chất lượng UX/UI.

## Next Step
Theo yêu cầu mới, ưu tiên nhóm C: trang chủ 13 → tìm kiếm 21/danh sách bệnh viện 24 → chi tiết bác sĩ 15/bệnh viện 16. Nhóm A còn thiếu giữ mở, không đổi owner/Figma ID. 13/15/16/21/24 và danh sách23/49/50 đã qua kiểm thử web; filter22 hoạt động chuyên khoa/rating, còn thiếu consultation/khoảng cách/phí. Đã nối đặt lịch25/26/27/28/30/31/32/35/42 với cash/wallet nội bộ và Home; đã nối thêm36/53/77/78/81/82: đổi/hủy, refund request/tracking và ví đọc; đã có UI admin duyệt refund và QR/check-in/hàng đợi34/79/80, qua API và E2E web; đã nối xét nghiệm69–76 tại cơ sở và admin tiếp nhận/phân tích, còn thiếu kết quả thật/lấy mẫu tại nhà; đã nối93/94/95/98/99 với tài liệu thật, chưa dữ liệu lâm sàng/bảng chỉ số; đã nối96/97 CRUD tự khai qua API/web, chưa native QA/xác minh; đã nối61–68 với quyền có thời hạn/consent và audit family, còn thiếu push/all-app audit/QA native; đã nối43–48/91–92 và chỉnh42, còn thiếu push/tư vấn online/dữ liệu điều trị; đã nối37–38 chat có phân công tài khoản, file và read cursor, chưa push/call/QA native; đã nối85–90 dạng ghi chép/bản chép đơn tự nhập và nhắc trong app, chưa bác sĩ xác thực/phát hành đơn hoặc OS notification; đã nối14 dạng sơ đồ minh họa và17–20 tab dữ liệu ứng dụng/review riêng; chưa bản đồ GPS hoặc nội dung bệnh viện trực tiếp. Đã nối51/52/57–60 profile/avatar/settings/password/FAQ/support nội bộ; chưa xóa account/emailchange/externalcontact. Đã nối83/84/100 thẻ riêng tư tự nhập và calculator theo giả định, chưa tích hợp BHXH/insurer. Tiếp theo chỉ đường33,12/29/54–56 và39–41; gọi thoại/video39–41 cần transport riêng. Không dùng Codex with ChatGPT.

## Current Phase
Phase 3

## Phases

### Phase 1: Requirements & Discovery
- [x] Xác định app hoàn chỉnh, không chỉ là bản giao diện demo.
- [x] Xác định backend NestJS + MongoDB; frontend đang theo phương án đề xuất React Native + Expo, cần ghi nhận rõ khi quyết định triển khai.
- [x] Lưu PLAN.md, tiêu chí nghiệm thu và mapping đủ 100 màn.
- [x] Ghi nguồn thiết kế và các quyết định trong findings.md.
- **Status:** complete

### Phase 2: Planning & Structure
- [x] Có roadmap G0–G6 và danh sách đủ 100 màn, mỗi thành viên 20 màn.
- [x] Cài UI UX Pro Max và Planning with Files.
- [x] Tạo ba file quản lý bằng initializer gốc, giữ marker phase/status.
- [x] Xác minh kết nối Codex with ChatGPT đúng workspace UX_UI, nhận PLAN G0.1.
- [x] Triển khai React Native + Expo SDK 58, TypeScript 6, NestJS 12, pnpm 12; đã cập nhật PLAN.md.
- [x] Khởi tạo cấu trúc repo, workspace và các lệnh kiểm tra.
- **Status:** complete

### Phase 3: Implementation
- [ ] G1: component UI, auth, hồ sơ và người thân.
- [ ] G2: khám phá, đặt khám và thanh toán đầu-cuối.
- [ ] G3: xét nghiệm, check-in, đổi/hủy/hoàn.
- [ ] G4: hồ sơ y tế, tài liệu, ví, chia sẻ/quyền riêng tư.
- [ ] G5: chat/call, thông báo và chăm sóc sau khám.
- [ ] Cập nhật SCREEN_MAP.csv theo bằng chứng triển khai, không tự đánh dấu xong chỉ vì có giao diện.
- **Status:** in_progress

### Phase 4: Testing & Verification
- [ ] Theo docs/ACCEPTANCE.md: nghiệp vụ, API/database, quyền, trạng thái và chống gửi lặp.
- [ ] E2E các luồng chính trên thiết bị/emulator.
- [ ] Đối chiếu Figma, ảnh/crop, font, layout, safe area, bàn phím và màn hẹp.
- [ ] Codex tự review từng mốc bằng code, test và đối chiếu Figma; người dùng đã bỏ workflow Codex with ChatGPT.
- [ ] Ghi kết quả thật, lỗi và giới hạn tích hợp trong progress.md.
- **Status:** pending

### Phase 5: Delivery
- [ ] Hoàn thiện README chạy app/API, env mẫu, database/storage và tích hợp ngoài.
- [ ] Bàn giao build đã chạy thử, source, OpenAPI và dữ liệu kiểm thử.
- [ ] Nêu rõ môi trường live/sandbox/chưa cấu hình, không báo thành công giả.
- [ ] Chỉ đánh dấu complete sau khi đạt tiêu chí nghiệm thu đã thống nhất.
- **Status:** pending

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| PLAN.md giữ vai trò đặc tả tổng thể; file này theo dõi tiến độ thực thi | Không trộn ý định với bằng chứng đã hoàn thành |
| Figma là nguồn giao diện gốc | UI UX Pro Max hỗ trợ kiểm tra, không thay phong cách thiết kế |
| NestJS + MongoDB | Người dùng yêu cầu |
| Chia theo luồng frontend/API/database hoàn chỉnh | Giảm tích hợp muộn giữa 5 nhóm màn |
| Một sổ tiến độ chính cho dự án | Tránh cập nhật trạng thái mâu thuẫn giữa các phiên |

## Errors Encountered
| Error | Resolution |
|-------|------------|
| Kiểm tra Git từ sandbox nhận Permission denied với E:\Code\UX_UI | Đã dùng quyền bổ sung cho initializer trong đúng thư mục; chưa kết luận dự án đã là Git repo |
| Lần bắt đầu Codex with ChatGPT bị người dùng ngắt | Phải xác minh tiến trình/checkpoint trước khi tiếp tục, không tự khởi chạy kết nối thứ hai |












## Mốc 2026-10-31 — phủ hết danh mục100màn
- Đã triển khai9màn cuối trong một lượt;0mục chưa bắt đầu. Scope và giới hạn ởdocs/FINAL_NINE_SCREENS.md vàSCREEN_MAP.csv.
- Đã đạt fullAPI22 vàweb22, Androidexport; tiếp tục giữPhase3in_progress/Phase4pending do chưa nghiệmthu native/UX, gateway, TURN/nativecalls và các tíchhợp bệnh viện.


## 2026-11-02 — Morphicons (đã tích hợp và kiểm chứng web/export)
- Người dùng yêu cầu dùng https://www.morphicons.com/ cho app. Chọn dữ liệu Lucide outline mặc định từ trang, adapter React Native/web.
- Dùng AppIcon dùng chung, adapter asset cũ giữ layout; hỗ trợ reduced motion, trạng thái yêu thích/mật khẩu và màu active nav.
- Theo dõi kiểm thử và export trong progress.md; không coi đây là nghiệm thu100màn.

## 2026-11-02 — Explore bản đồ thật
- Thay sơ đồ Explore bằng Leaflet/web và WebView/native; tám tọa độ có nguồn, đồng bộ pin/card, kéo/zoom, quyền vị trí theo thao tác.
- OSM mặc định lỗi DNS trên máy; OSM DE trả200 và trực tiếp hiển thị, chỉ dùng cho đồ án phi thương mại; ghi công luôn hiện. Không dùng CARTO keyless vì điều khoản yêu cầu key.
- Chi tiết, nguồn và phạm vi: docs/OPENSTREETMAP_SETUP.md. Typecheck/lint/API discovery đạt; web/export theo kết quả nghiệm thu cuối lượt. Chưa nghiệm thu trên điện thoại.
- Nghiệm thu cuối lượt: full web22/22 (1.9phút); Androidexport1920modules,4.5MB; typecheck/lint/APIbuild đạt. Lần chạy web đầu thiếu PLAYWRIGHT_BROWSERS_PATH đã sửa sang cacheE rồi chạy đầy đủ thành công. Live API PID23212, ExpoPID1520.

## 2026-11-02 — Chat AI Gemini
- Người dùng muốn thay phần trao đổi bác sĩ bằng AI vì chưa có bác sĩ tham gia. Đã chọn Google Gemini, dùng key riêng ở backend; không có key của trợ lý.
- [x] Backend hội thoại AI riêng tư, idempotency, giới hạn tốc độ, retry và trạng thái lỗi; không tự đọc hồ sơ y tế.
- [x] UI chat AI và các điểm vào, nhãn AI rõ, giữ dữ liệu hội thoại người thật cũ tách biệt.
- [x] Kiểm thử API/web, cấu hình và tài liệu; người dùng đã thêm key, Gemini thật đã trả lời với nguồn MongoDB. Chưa QA thiết bị thật.

- Nghiệm thu AI cuối lượt: web23/23, APIAI+adapter2/2 vàchatlegacy1/1, Androidexport4.6MB; model thực tếgemini-3.5-flash-lite; APIlivePID31776. Bằng chứng vàgiới hạn ởdocs/AI_CHAT.md.

## 2026-11-02 — Chỉ đường thật
- Thay Directions33 bằng Leaflet dùng chung; vị trí qua hành động người dùng, endpoint auth booking lấy đích MongoDB, tuyến ôtôOSRM/FOSSGIS; khoảng cách/thời gian và bước rẽ thật, GoogleMaps đểdẫnđường từngchặng. Theo dõi kiểmthử vàgiới hạn trong progress.

## Nối Hoàng39–41 vào AIchat — 2026-11-02
- User chấp thuận chưađiệnđược; giữ UI Figma voice/video/end, AI môphỏng/chưakếtnối, timerxemUI; không camera/micro/medicalrecordwrites. Chat header vàDịchvụ46đãnối; end vềchat/đơnthuốchiệncó/lịchđãkhámđểđánhgiá/lịchhẹn.
- Typecheck/lintđạt;E2EAI/care2/2 vàfinance/WebRTC3/3đạt, assertiongetUserMedia=0. Docs AI_CHAT.md vàSCREEN_MAP cậpnhật. Androidexportđangxácnhận.

## Khớp Figma35 — 2026-11-02
- Thay chi tiếtlịch khám bằngcard303px,QR48px,4actionrows56px,bottomnav; dữ liệu ngày/giá/trạngthái thật; nhắc lịch khôngbậtgiả. Kiểmtra ảnh390/320 vàcác luồngđổi/hủy/QR/chỉđường.
