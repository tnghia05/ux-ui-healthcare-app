# Findings & Decisions

## Requirements
- Dự án ở E:\Code\UX_UI; không nhầm với thư mục E:\Code\uxui.
- App hoàn chỉnh, dữ liệu lưu thật; môn UX/UI nên ưu tiên trải nghiệm và độ sát Figma.
- Backend NestJS + MongoDB đã được người dùng chọn.
- React Native + Expo là phương án frontend đang đề xuất; người dùng đã yêu cầu bắt đầu làm theo kế hoạch, nhưng chưa trả lời riêng lựa chọn Flutter/React Native. Ghi rõ quyết định khi khởi tạo.
- Người dùng yêu cầu dùng Codex with ChatGPT và UI UX Pro Max; đã đồng ý cài Planning with Files để quản lý dự án lớn.

## Research Findings
- Figma file: uZZH82U4pItqxxYRubWlvO, page High-Fidelity 181:1767.
- Inventory đã kiểm tra đủ 100 màn: 20 màn/người (wuchuy, Tâm, Nguyên, Hoàng, Nghĩa).
- Có 21 màn/nhánh trạng thái bổ sung trong lần sửa Figma trước; cần lấy lại inventory khi triển khai vì thiết kế có thể tiếp tục thay đổi.
- 44 avatar nhỏ đã được sửa crop và ghép đúng tên bác sĩ; giữ cách hiển thị đó trong app.
- Đã có PLAN.md, docs/SCREEN_MAP.csv, docs/ACCEPTANCE.md và README.md. Chưa có source app/API, database chạy hay build app để nghiệm thu.
- Máy có lệnh Node/npm/pnpm/Git/Docker; chưa kiểm tra xong phiên bản, daemon, Android SDK và thiết bị.
- Planning with Files đã cài ở C:\Users\adm\.codex\skills\planning-with-files, metadata version 3.26.0; có script PowerShell cho Windows.
- Initializer tạo named plan 2026-10-29-ux-ui-healthcare-app và ghi .planning/.active_plan. Không tạo thêm bộ file gốc trùng nội dung.
- Chưa kiểm chứng cơ chế hooks tự động trong host; có thể quản lý bằng đọc/cập nhật các file này trực tiếp. Không coi cài skill là đã kiểm chứng hooks.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Modular monolith NestJS | Phù hợp quy mô nhóm, tránh microservices không cần thiết |
| MongoDB + schema/index/transaction khi cần | Đảm bảo dữ liệu và xử lý đồng thời, không chỉ lưu JSON tự do |
| Frontend đọc API; provider/worker xác nhận giao dịch và nghiệp vụ | Không tự chuyển thanh toán/kết quả thành công bằng timer |
| UI UX Pro Max cho UX/accessibility và stack guidance | Figma vẫn quyết định ảnh, font, màu và bố cục gốc |
| planning-with-files cho trí nhớ dự án; Codex with ChatGPT cho lập kế hoạch/review | Hai vai trò bổ sung nhau, không có hai nguồn tiến độ độc lập |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| Kết nối Codex with ChatGPT chưa được xác minh sau lần ngắt | Kiểm tra lại trạng thái trước khi tiếp tục; không khẳng định plugin đã review code |
| Quyền sandbox với đường dẫn đích | Dùng quyền bổ sung đúng phạm vi khi cần; không ghi sang dự án khác |

## Resources
- ../../PLAN.md
- ../../docs/SCREEN_MAP.csv
- ../../docs/ACCEPTANCE.md
- https://www.figma.com/design/uZZH82U4pItqxxYRubWlvO
- https://github.com/OthmanAdi/planning-with-files
- https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

## Connection/toolchain verification: 2026-10-29
- UX_UI là workspace mới đối với C2C: session=null, projectReady=false, connectorName=null; không được dùng kết nối của workspace khác.
- Thiết lập máy: setupMode=null. Cần câu trả lời cho setupChoicePrompt.
- Kết nối workspace: needsChoice=true. Cần người dùng chọn địa chỉ tạm hoặc tên miền Cloudflare trước setup.
- Node v24.14.0, pnpm 12.4.0 hiện có. E:\Code\UX_UI chưa là Git repository.
- Lỗi truy cập workspace trong sandbox được giải quyết bằng quyền bổ sung, không phải workspace bị xóa.

- ChatGPT hiện chuyển #settings/Security sang /settings/security; trang này không có Developer mode. URL tạo connector cũ chuyển về /settings/plugins-settings, hiện chỉ có plugin Codex_with_chatgpt, DACN2 và Figma; chưa có UX_UI.


- Ràng buộc mới của người dùng: mọi file dự án, cache và file tạm chỉ ghi trên ổ E. Không chỉnh/sửa/xóa file trên C. Thiết lập project-local .npmrc và .local trên E; lệnh Node/Expo tiếp theo phải đặt TEMP/TMP/EXPO_HOME về .local trên E. Docker Desktop dùng kho lưu trữ riêng; chưa di chuyển kho Docker.


- Quyết định mới của người dùng: không sử dụng Skill Codex with ChatGPT nữa. Codex tự thực hiện lập kế hoạch, triển khai, kiểm thử và review; không chờ IAB/ChatGPT và không cập nhật cấu hình C2C trên C. Không tự gỡ plugin hoặc ngắt kết nối đã có vì người dùng chỉ yêu cầu bỏ workflow skill.


- Người dùng yêu cầu chia 100 screen thành nhóm chức năng để triển khai liền mạch. Dùng nhóm A–J làm thứ tự ưu tiên, không chia implementation theo từng thành viên; giữ nguyên chủ sở hữu phục vụ bàn giao nhóm.

- Expo SDK 58: local notifications dùng được trong Expo Go; remote push trên Android cần development build và cấu hình provider. Chỉ triển khai màn xin quyền, không báo delivery/nhắc lịch đã hoàn thành.
- Cài dependency khi Metro đang chạy bị Windows khóa thư mục source-map-support/jest-util. Đã xác minh process Expo riêng của UX_UI, dừng server, phục hồi frozen install rồi cài lại đúng SDK.


## Permissions implementation constraints
- Manual location lưu chuỗi địa chỉ người dùng cung cấp, chưa có geocoder, không giả kết quả tìm kiếm.
- Xin quyền native không đồng nghĩa có push delivery. Web hiển thị chưa hỗ trợ và cho bỏ qua; device permission cần QA trên điện thoại.
- Intro web localStorage chỉ chứa cờ không nhạy cảm; token vẫn ở memory web/SecureStore native.

## Home/discovery data and acceptance limits
- Catalog initial lấy từ file Figma của nhóm, persisted MongoDB, không phải kết nối live hệ thống bệnh viện. Rating, bác sĩ/chuyên khoa/kinh nghiệm là dữ liệu nguồn thiết kế, chưa xác minh lịch hành nghề thực; không được dùng để tuyên bố sẵn sàng vận hành thực tế.
- 8 cơ sở đều tại Đà Nẵng. Chưa tính khoảng cách GPS hoặc thời gian di chuyển; không hiển thị 3,5km/15 phút mẫu như dữ liệu thật. Chưa có search history nên UI ghi gợi ý, không giả lịch sử tìm kiếm.
- Không lấy ảnh phòng khám Vinmec để minh họa cơ sở khác. Gallery Vinmec có 4 ảnh thật trong thiết kế; không hiển thị +10 nếu chưa có ảnh.
- Các website được cấu hình là website tổ chức, chỉ đường mở maps search theo địa chỉ, không tuyên bố đã tích hợp booking. Scope bệnh viện khác có ảnh chính và danh mục chuyên khoa, không tự thêm thông tin giờ mở cửa.
- Danh mục hiện tối đa100 mỗi loại; trước khi mở rộng dữ liệu phải thêm phân trang/index tìm kiếm. Mobile Android native QA còn mở.

## Discovery extension constraints
- ratingBand=all/high/4/3.5/3/2.5; các band hữu hạn là [lower,lower+0.5), high ≥4.5. Tất cả đánh giá là mặc định, không tự loại dữ liệu khi người dùng chưa chọn.
- favoritesOnly lọc từ userId của SessionGuard; client không gửi userId. Danh sách mặc định trống, bỏ lưu thì biến mất sau refresh.
- Các control distance/fee/consultation không có hợp đồng dữ liệu nên không thực thi/không hứa lọc được. Không tạo reviewCount=53 hoặc nhân đôi bác sĩ để lấp lưới Figma.

## Booking invariants and limits
- Mọi số tiền là số nguyên VND lấy từ server. expectedAmountVnd chỉ kiểm tra người dùng đã thấy đúng giá; khác giá trả409, không dùng giá client để ghi nợ.
- Mongo transaction gộp debit ledger + appointment; unique partial index doctorId/startsAt/occupiesSlot và unique actor/idempotencyKey. Cùng key/payload trả lại lịch cũ; cùng key khác payload từ chối. Kiểm tra lại key trong transaction sau retry, kể cả ví chỉ đủ tiền một lần.
- Lịch template của app theo giờ Việt Nam, 08/09/10/11/13/14/15/16, trước giờ khám tối thiểu1h và trong30ngày. Chưa tích hợp hệ thống xác nhận/giá/lịch của bệnh viện. Gói30 hoặc60phút khớp các mốc cách nhau1h; chưa hỗ trợ tùy ý khoảng giờ ngoài template.
- Cash là confirmed/unpaid, wallet chỉ paid sau trừ tiền thật trong database. Không tự credit/tặng500k. Thẻ/PayPal/ApplePay/GooglePay, thoại/video, family/insurance, QR, nhắc lịch, đổi-hủy-hoàn chưa triển khai ở đợt này.
- Receipt nội bộ và phiếu đặt khám có mã booking thật, không phải hóa đơn thuế; không render QR mẫu thành QR check-in.
- E2E nay có backend3002 và DB tạm uxui_e2e_<timestamp>; chỉ browser test proxy API sang3002. Dev API3001 và dữ liệu user không bị reset. Cleanup kiểm hostname/port/prefix trước khi xóa database test riêng.

## Records implementation decisions
- Figma93–95 chứa chỉ số/nhận xét mẫu, không seed thành thông tin sức khỏe thật. Chỉ completed appointment xuất hiện là lần khám; chưa nhận clinical/vitals.
-94/95 hiện phục vụ tài liệu lab do patient upload, verified=false. Không giả vờ là kết quả do cơ sở trả hoặc tự kết luận bình thường.
- GridFS giữ10MB PDF/JPG/PNG; byte-signature matching chỉ kiểm loại tệp, chưa parser/antivirus. Auth actor trên tất cả endpoints, no-store trên nội dung; sharing người thân chưa có.
- Expo58 File.write trả Promise theo package types; phải await ghi xong trước shareAsync. Cache download được dọn sau khi đóng sheet; vẫn cần QA native.

## Care feed and feedback boundaries
- Notification feed is derived from persisted milestones, not a durable event outbox; reads are persistent actor-specific markers. No automatic push or reminder scheduler yet. Summary/timeline do not invent diagnoses, prescriptions or vitals from Figma placeholders.
- Completed state is distinct from elapsed appointment time. Public catalog ratings remain Figma reference data; feedback is internal, owner-bound and one submission per booking/target, not sent to providers or falsely labelled anonymous.
- Timeline date-only metadata retains dateOnly=true; midnight is only a sort key, never shown as an actual recorded clinical time. Dynamic photo keys reuse Vietnam catalog assets.

## Chat37–38
- Doctor catalog khác tài khoản xác thực. Admin phải gán email verified, unique active1account/doctor; assignment version tách lịch sử khi thay người, không tự cấp đặc quyền đọc chat cho admin.
- Room theo booking+assignmentVersion. Transaction đánh seq và idempotency; sender chỉ đính kèm tài liệu của mình. File tải kiểm người tham gia và phân công mỗi request. Không tuyên bố thu hồi được dữ liệu đã tải.
- Client polling3s chỉ khi focus/foreground; dừng/abort khi rời, 401/403/404 xóa nội dung trong view. Read cursor chỉ khi gần đáy. Không giữ trạng thái online hoặc tự tạo phản hồi bác sĩ.
## Bắt đầu85–90
Đã đọc6context/screenshot Figma. Mẫu có chẩn đoán/thuốc minh họa và ghi chú90 mô phỏng; app sẽ không seed các nội dung này. Triển khai ghi chép sau khám và phiên chép đơn tự nhập (source self_reported, verified false), liên kết lần completed; không mạo danh kê đơn của bác sĩ. Nhắc thuốc trong ứng dụng, chưa OS notification. Dữ liệu intake/version/idempotency cần kiểm race và actor. Dùng Frame/Field/Action/Photo/tokens đã có, tải SVG nguyên bản file/checkbox/bell/switch vào assets/aftercare.
## Bắt đầu14/17–20
Đọc5context/screenshot Figma.14 là map vector minh họa, cần giữ nhiều đường/ô phố/sông và thumbnail marker; không biến khoảng cách mẫu thành GPS thật.17–20 tab hiện làText. Triển khai tab tương tác, nội dung hospital->doctors thật từcatalog, packages cấu hìnhapp, galleryảnhnhómđãcó, reviews chỉ chủ tài khoản vìcare_reviews visibility internal chưaconsentpublic. Booking chỉbật khi códoctorkhảdụng. KhôngsửaFigma.

## Tài khoản51/52/57–60
Đọc6context/screenshot. Account hiện menuAction thô, profile08đã có dữ liệu thật nhưng52chưađúngbốcục. Thêm Avatar privateGridFS2MB PNG/JPG có bound4096px/12MP và version; không dùng ảnh người mẫu của Figma làm danh tính user. Password current→new8+chars→revokeallcredentialVersion. HelpFAQ nội dung đúng hành viapp, liên hệ nội bộ lưu ticket/owner/adminstate, không copyphone0901234567. Xóa tài khoản trong57 giữdisabled vì chưa có chính sách xóa/giữ hồ sơ và luồng xử lý lịch/ví. Không đụng dữ liệu thật của admin.
## Bắt đầu bảo hiểm83/84/100
Đọc3context/screenshot. Chỉ dữ liệu self_reported verified=false, không seed thẻ/minh họa80%/800000 từFigma. Danh sáchmasked, xem/sửaowner/version/idempotency/duplicatehash, preference thẻưu tiên không gửi BV. Cóliênkếttàiliệuinsurance củaownerquaRecords, khôngOCR/camera tựnhậnthẻ. Dựtính chỉphéptính giảđịnhuserack, sốVNDnguyên vàbasispoints; nếu chọnbooking thìgiáserver từbookingactor, không thayđổiamount/payments vàkhông xácnhậnBHYT. API không mãhóa fieldatrest; khôngtuyênbốkết nối BHXH/insurer.


## Chín màn cuối — 2026-10-31
- Người dùng chọn nạp ví chờ admin đối soát. Không cần cổng thanh toán để dùng luồng nội bộ này; không mô phỏng gateway thành công.
- 29 chỉ triển khai nhãn thẻ không chargeable do chưa có tokenization gateway; server whitelist từ chối PAN/CVV.
- WebRTC dùng signaling qua API xác thực và host ICE. MDN: signaling có thể qua fetch; getUserMedia yêu cầu HTTPS/localhost. Đã kiểm thử media thực chạy giữa hai browser contexts dùng thiết bị giả Chromium, không dùng ảnh doctor làm media. Chưa native Expo Go/TURN/thiết bị thật.
- 33 dùng địa chỉ owned booking mở Google Maps; sơ đồ SVG minh họa và không tạo ETA/khoảng cách giả. Không tự xác nhận đã đến.
- 12 cập nhật theo dữ liệu app hiện tại, không còn nói hồ sơ chưa mở; chưa là policy pháp lý chính thức.
- Source: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling ; https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia .


## Morphicons 2026-11-02
- Trang chủ là thư viện morph SVG nhận dữ liệu icon (Lucide mặc định), có adapter morphicons/react-native qua react-native-svg và adapter react cho web. Đã đọc tài liệu chính thức https://www.morphicons.com/docs và llms.txt.
- Đã cài morphicons2.0.2 + lucide1.66.0. Pnpm lần đầu bị filelock Metro; dừng đúng Expo process rồi chạy lại thành công, không xóa node_modules hay thay phiên bản Expo.
- Glyph mới dùng AppIcon, decorative SVG/ảnh/logos giữ source cũ. License notices lưu trênE trong docs/licenses.

## 2026-11-02 — Explore bản đồ thật
- Thay sơ đồ Explore bằng Leaflet/web và WebView/native; tám tọa độ có nguồn, đồng bộ pin/card, kéo/zoom, quyền vị trí theo thao tác.
- OSM mặc định lỗi DNS trên máy; OSM DE trả200 và trực tiếp hiển thị, chỉ dùng cho đồ án phi thương mại; ghi công luôn hiện. Không dùng CARTO keyless vì điều khoản yêu cầu key.
- Chi tiết, nguồn và phạm vi: docs/OPENSTREETMAP_SETUP.md. Typecheck/lint/API discovery đạt; web/export theo kết quả nghiệm thu cuối lượt. Chưa nghiệm thu trên điện thoại.

## Chat Gemini và nguồn MongoDB — 2026-11-02
- Theo yêu cầu, giữ tên/avatar bác sĩ theo Figma37/38 và ghi AI mô phỏng. Dùng FigmaDesignToCode đọc2node, không sửaFigma.
- Luồng mặc định Tin nhắn chuyển sang Gemini; chat người thật cũ giữ riêng. MongoDB lưu trước, lấy lịch sử đúng user/doctor và danh mục public mới mỗi lượt rồi gọi model, lưu phản hồi vàoMongoDB.
- User đã thêmkey backend; không đưa keyclient/log. Model3.8timeout,2.5FlashLite404 cho usermới; model3.5FlashLite theo phản hồiGoogle đã200 và thật sự trả lời đúng Vinmec/Đường30Tháng4 từDB.
- API mới/adaptor tests đạt; E2E AI đạt sau sửa bộchọn tránh hiddenstack củaExpoRouter; các luồngchat/call cũ vẫnđạt. Typecheck/lint vàAndroidexport đạt. Fullweb đangghi nhận cuối lượt.
- Scope/trạng thái/giới hạn vànguồn: docs/AI_CHAT.md. Không tự gửi hồ sơ/tài liệu; service_catalog chưa có dữ liệu giá.

## Chỉ đường33 — 2026-11-02
- Thay schematic bằng RealMapchung, thêmroutepolyline, GPSuseraction/consent, backendauthbooking và điểmđếnMongoDB. OSRM/FOSSGIScar thật, steps/km/ETA; GoogleMaps đểnavigation từngchặng. KhônglưuGPS vàoDB, không tựcheckin.
- API2/2vàE2E4/4liênquan đạt; typecheck/lintđạt. Lượtlive vớiQAorigin16.06,108.219trả3007.1m/251s/124điểm/9bước. Ảnh directions-live-road-390.png làtile/route thật vớiorigin giảlập, không đọcGPSngười dùng. ChưaQAthiếtbị.
- Tài liệu/nguồn/rate/privacy: docs/OPENSTREETMAP_SETUP.md. APIlivePID11976. Androidexportđangxácnhậncuốilượt.

## Màn35 khớpFigma — 2026-11-02
- Đọcdesigncontext+screenshot181:3603. Thaycomponentchi tiếtlịchcũ bằng AppointmentDetailsScreen: thẻ303,avatar106x117,metadata2cột,payment thật,QR48,4hàng56px,bottomnavactiveLịchhẹn. Desktopgiới hạn480px đểgiữtỷlệmobile.
- Khôngthêmnútthừa; giữđổi/hủy/hoàn/queue/checkin/receipt/chỉđường. Reminderchỉgiảithíchchưabật, khôngtạo trạngtháipushgiả. RatingAPIcatalog; ngàychuẩnAsia/Ho_Chi_Minh,giáthực tếtrừdiscount.
- Typecheck/lintđạt và6E2Ebooking/lifecycle/checkin/navigation/finance/WebRTCđạt. Screenshotdữliệuthật appointment-35-live-{390,320}.png, khôngoverflow320;namewrapđúng. Androidexportđangxácnhận.
