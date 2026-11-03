# Progress Log

## Session: 2026-10-29

### Current Status
- **Phase:** 2 - Planning & Structure
- **Started:** 2026-10-29
- Plan ID: 2026-10-29-ux-ui-healthcare-app
- App chưa hoàn thành; việc cài và thiết lập skill quản lý đã hoàn thành.
- Chưa khởi tạo source frontend/backend; chưa có kết quả test/build app.

### Actions Taken
- Trước phiên này: đã tạo PLAN.md, README.md, docs/SCREEN_MAP.csv và docs/ACCEPTANCE.md.
- Trước phiên này: kiểm tra mapping có đủ 100 màn, 5 thành viên x 20 màn; cài UI UX Pro Max.
- Lần bắt đầu workflow Codex with ChatGPT bị người dùng ngắt; chưa xác minh kết quả, chưa ghi nhận review nào.
- Cài Planning with Files từ OthmanAdi/planning-with-files, nhánh master, đường dẫn .codex/skills/planning-with-files bằng skill-installer.
- Đọc skill và các helper PowerShell, chạy resolver trước khi tạo plan để tránh ghi đè.
- Chạy initializer gốc tại E:\Code\UX_UI, tạo named plan cùng task_plan.md/findings.md/progress.md.
- Điền trạng thái dự án theo bằng chứng đang có; không đánh dấu phần code hoặc test chưa làm.

### Test Results
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Installer | Cài skill không ghi đè thư mục có sẵn | Installed planning-with-files vào thư mục skills của Codex | passed |
| Skill structure | Có SKILL.md và helper Windows | Có initializer/resolver/check-complete PowerShell | passed |
| Resolver trước khởi tạo | Không chọn nhầm plan khác | Không có plan được chọn trước initializer | passed |
| Initializer | Tạo ba file và pointer | Tạo .planning/2026-10-29-ux-ui-healthcare-app và .active_plan | passed |
| Plan format | Phase/status đúng định dạng | Validator gốc xác nhận hợp lệ, 5 phases | passed |
| App unit/API/E2E/build | Chạy sau khi có mã nguồn | Chưa có source, chưa chạy | not_run |

### Errors
| Error | Resolution |
|-------|------------|
| Git báo Permission denied khi kiểm tra từ sandbox | Không suy diễn trạng thái Git; initializer dùng quyền bổ sung đúng thư mục |

### Next Session
1. Resolve active plan và đọc ba file quản lý này.
2. Xác minh C2C/checkpoint của lần bị ngắt, không chạy kết nối trùng.
3. Thực hiện công việc G0 đầu tiên; ghi lại lệnh chạy, thay đổi, lỗi và kiểm thử thực tế.

## Session update: 2026-10-29 / Bắt đầu triển khai
- Đã đọc lại skill C2C và sổ tiến độ.
- Kiểm tra C2C: UX_UI chưa có session/checkpoint; cần lựa chọn thiết lập lần đầu và kiểu kết nối trước khi tạo kết nối.
- prefs: setupMode chưa được chọn; chưa mở trang cấu hình ChatGPT và chưa gửi yêu cầu lập kế hoạch.
- Công cụ đã kiểm tra: Node v24.14.0, pnpm 12.4.0; UX_UI chưa là Git repository và chưa có source.
- sandbox-allow chạy thường bị EPERM; chạy lại với quyền bổ sung thành công, cấu hình đã cho phép thư mục trạng thái C2C.
- tunnel status chạy trong sandbox báo workspace không tồn tại; chạy lại với quyền bổ sung xác nhận đúng workspace tồn tại và needsChoice=true.
- Đã hỏi người dùng hai lựa chọn bắt buộc qua request_user_input_async. Chờ câu trả lời, không tự chọn.
- Next: nhận lựa chọn, thiết lập C2C, xác minh workspace, lấy PLAN rồi bắt đầu triển khai. Chưa có test/build app.

## 2026-10-29 — Thiết lập ChatGPT
- Người dùng đã chọn thiết lập tự động và địa chỉ tạm; đã lưu lựa chọn.
- Setup và doctor thành công cho workspace UX_UI; chưa ghép plugin và chưa xác minh workspace_info qua ChatGPT.
- Giao diện ChatGPT mới chuyển URL tạo connector cũ sang quản lý plugin; đang kiểm tra UI hiện tại, chưa triển khai source app.


- Đã tìm thấy form mới tại Plugin > Thêm > Thêm server MCP tùy chỉnh; đã điền tên UX_UI, mô tả và địa chỉ đúng workspace. Dừng trước checkbox xác nhận quyền; chờ người dùng tích xác nhận và bấm Tạo dưới dạng plugin. Chưa ghép, chưa có workspace_info, chưa viết source app.


- Đã tạo mã mới tại form ghép nối và kết nối thành công; ChatGPT hiển thị plugin Codex with ChatGPT · UX_UI trong Đã cài đặt. Không lưu mã ghép nối vào repo.
- Session vẫn null, chế độ project, projectReady=false. Bước tiếp theo: người dùng tạo Project UX_UI với project-only memory theo skill, sau đó lưu project URL, cấu hình instruction và xác minh workspace_info trước INIT. Chưa viết source app.


- Project UX_UI đã được gắn; xác minh qua workspace_info: workspace UX_UI, id 3d4f17c5821c, Git chưa khởi tạo. Project-only memory, library disabled; đã lưu hướng dẫn riêng cho đúng connector.
- Đã gửi INIT task c2c_8a31, chờ PLAN nền tảng đầu tiên. Chat: https://chatgpt.com/g/g-p-6ae318eccf6081918444f626ed1359f7-ux-ui/c/6ae31966-ee9c-83ec-95de-a7f815fe924e .


## Triển khai G0.1 tiếp tục
- Đã nhận và thực thi PLAN c2c_8a31; đã tạo root monorepo, API NestJS, exception filter, validation, health/live và health/ready, OpenAPI và test HTTP nền tảng.
- Docker compose config hợp lệ; Linux engine Docker chưa chạy, chưa kiểm chứng database persistence. Đang cài dependencies, chưa có kết quả build/test.
- Công cụ điều khiển trình duyệt hiện không khả dụng; chưa thể gửi EXECUTED/review, giữ nguyên chat và checkpoint đang thực thi.


## Kiểm chứng Docker và MongoDB
- Docker Engine 28.0.4 đang chạy; sandbox báo Access denied, truy cập với quyền bổ sung thành công.
- Đã chạy uxui-healthcare-mongo-1, cổng loopback 27018, volume uxui-healthcare_mongo-data; container Healthy, replica set rs0 primary=true.
- Đã ghi foundation_checks/persistence, restart riêng container UX_UI, xác nhận persisted=true và primary=true.
- pnpm install/test dừng bởi ERR_PNPM_IGNORED_BUILDS @scarf/scarf. Lệnh thêm ignoredBuiltDependencies chưa thực hiện do người dùng từ chối. Chưa coi test API đạt; compiler trực tiếp đang chạy.


- Compiler TypeScript API thành công; 2 test nền tảng pass, 0 fail. Đã khởi động NestJS với MongoDB thật tại cổng 3000. Đã xác minh HTTP readiness và tài liệu OpenAPI (xem output phiên thực thi); chưa hoàn thành G0.1/mobile hoặc review C2C.


## Nền tảng mobile và ràng buộc ổ E
- Đã sửa policy pnpm 12 bằng allowBuilds=false cho @scarf/scarf; frozen install đã thành công.
- Expo Router và các dependency được expo install theo SDK 58. Đã tạo src/app, API client, palette tham chiếu và màn kiểm tra kết nối phát triển (không tính là màn Figma hoàn thành).
- Đã cấu hình cache/file tạm dự án trên E và scripts/dev-env.ps1. Người dùng yêu cầu không ghi/sửa ổ C; không thực hiện thêm thay đổi tại đó.
- Đang chạy typecheck/lint; chưa có kết quả, chưa hoàn tất G0.1, chưa có review ChatGPT.


## Kết quả G0.1 hiện tại
- Frozen install đã đạt sau khi dùng allowBuilds đúng pnpm 12.
- pnpm typecheck: mobile + API đạt. pnpm lint: đạt, 0 warnings. pnpm test: 2 passed, 0 failed.
- pnpm --filter @uxui/mobile build: Android export đạt, 1145 modules, bundle Hermes 2.5MB. Đây không phải APK; chưa chạy emulator/thiết bị.
- SCREEN_MAP: vẫn đủ 100 màn, chưa đánh dấu hoàn thành màn nào.
- README và PLAN đã cập nhật frontend đang triển khai, lệnh chạy và yêu cầu chỉ ghi E.
- Chưa có review ChatGPT: công cụ IAB không còn được cung cấp; không tự chuyển sang quy trình khác. C2C state-dir nằm trên C nên không cập nhật bằng CLI theo ràng buộc mới, lưu checkpoint cục bộ trong docs/G0_CHECKPOINT.json trên E.
- Lần tsc trực tiếp trong lúc pnpm đang thay node_modules báo missing react-native; kiểm tra lại sau install bằng pnpm typecheck đã đạt.

- Người dùng bỏ workflow Codex with ChatGPT. Điểm chờ review ChatGPT được gỡ; tiếp tục trực tiếp với Codex, không yêu cầu thiết lập thêm. Mọi thay đổi dự án tiếp tục chỉ trên E.


## G1 — Auth session backend
- Đã lấy design context và screenshot màn đăng nhập 181:4043; chưa tạo UI đăng nhập hoặc tải asset.
- Đã triển khai login/me/logout, scrypt salted hash, session token ngẫu nhiên chỉ lưu SHA256, TTL và kiểm tra hạn/revocation, giới hạn thử đăng nhập lưu MongoDB. Chưa triển khai đăng ký/OTP/email provider/mobile token storage.
- Đã chuyển data directory MongoDB mới sang .local/mongo-data trên E; volume cũ không bị xóa. Dữ liệu trước chỉ gồm foundation check, không có tài khoản app.
- Test đầu tiên thất bại NotWritablePrimary: sửa compose healthcheck và readiness API để chờ primary, đang chạy lại.
- Script Python trước gặp cp1252: đã dùng PYTHONUTF8=1 và đọc UTF-8 rõ ràng.

- Sau sửa readiness: 4/4 test đạt với MongoDB thật, 0 skip; mobile/API typecheck và lint đạt. Test auth xác minh token chỉ lưu hash, phiên tồn tại giữa các service instances, hết hạn/đăng xuất vô hiệu token và throttle hoạt động. Chưa phải test restart process hoặc UI E2E.
- Đã thêm hợp đồng điều hướng 5 tab tại apps/mobile/src/navigation/routes.ts; chưa dựng 5 màn sản phẩm.
- Mốc tiếp theo: registration/OTP qua email adapter, secure token storage và UI đăng nhập bám Figma. Không có tài khoản hoặc mật khẩu hardcode cho người dùng.


## G1 — Đăng ký và OTP SMTP
- Đã thêm POST /auth/register (202) và POST /auth/verify; DTO validation, mật khẩu tối thiểu 12 ký tự, OTP ngẫu nhiên 6 chữ số, HMAC với OTP_SECRET riêng, hết hạn 10 phút, tối đa 5 lần thử, dùng một lần. Chặn gửi quá mức theo email/IP trên MongoDB.
- SMTP adapter không trả mã OTP, không ghi mã vào log; gửi lỗi trả 503 và xóa challenge lỗi. Mailpit local tại 127.0.0.1:8025 nhận email kiểm thử; production cần SMTP provider/TLS và OTP_SECRET riêng.
- pnpm test với TEST_MONGODB_URI và TEST_MAILPIT_URL: 5 passed, 0 failed, 0 skipped, gồm gửi email thật qua SMTP và đọc mã từ hộp thư kiểm thử; sai mã, dùng lại, trùng email, hết hạn và đăng nhập sau xác thực.
- Đã sửa 2 thông báo tiếng Việt bị sai encoding trong auth module.
- UI auth và secure token storage còn chưa triển khai. Không đánh dấu màn hoàn thành.

## UI Auth đang triển khai
- Đã lấy context/screenshot register 181:4065 và verify 181:4084, tải SVG Figma về E. Đang dựng login/register/verify, session provider SecureStore và API client có timeout. Chưa kiểm thử render/thiết bị.
- Lệnh cài dependency đầu tiên gọi sai đường dẫn script môi trường từ apps/mobile; đã dừng và chuyển sang đường dẫn script tuyệt đối trên E. Install bị ngắt gây thiếu module Expo; đang khôi phục bằng frozen install.

- Web auth E2E đã đạt 2/2: đăng ký -> OTP qua SMTP -> xác thực -> đăng nhập -> tài khoản -> đăng xuất; kiểm tra 320px không tràn ngang và giữ email khi validation lỗi. Đã xem screenshot login/register/verify 390px.
- Sửa checkbox aria-checked cho web; thay push verify bằng replace, xóa mật khẩu khỏi form cũ để tránh màn auth còn dưới stack.
- Mobile dùng SecureStore, web chỉ lưu token trong bộ nhớ; chưa kiểm thử SecureStore trên Android thực. OAuth và quên mật khẩu được đánh dấu chưa khả dụng, không báo thành công giả. Privacy là nội dung bản phát triển, chưa phải chính sách vận hành chính thức.
- Typecheck/lint đạt sau thêm UI. Android export đang kiểm tra.

- Sau sửa UI cuối: E2E web 2/2 pass, typecheck và lint đạt. Android export lần trước đạt; đang đóng gói lại sau tối ưu import 3 font Inter thay vì toàn bộ font family.
- API auth hiện chạy port 3001, web Expo 8081; email kiểm thử Mailpit 8025. Session web memory-only; native SecureStore chờ kiểm thử thiết bị. Màn 04/05/06 ghi trạng thái đã E2E web, chưa nghiệm thu Android/UX.
- Lệnh ghi tài liệu dài bị policy chặn; đã tách thành patch và lệnh ngắn, tiếp tục được, không yêu cầu quyền bổ sung.


- Android export cuối đã đạt: 1289 modules, bundle Hermes 2.7MB; chỉ đóng gói 3 font Inter cần dùng và 3 SVG auth local. Chưa phải APK đã ký/chạy thiết bị. Đã mở bản web qua panel Codex (queued).


## Expo Go trên điện thoại
- Đã đổi native API URL sang LAN 192.168.1.13:3001 và bật Expo Go LAN exp://192.168.1.13:8081. Backend readiness qua LAN trả database connected.
- QR local: .local/expo-phone-qr.png. Điện thoại cần cùng mạng LAN và Expo Go SDK 58.
- Thêm firewall rule giới hạn LocalSubnet không thành công do thiếu quyền admin; không sửa profile hệ thống. Nếu điện thoại bị chặn, người dùng cần Allow access cho Node.js hoặc cho phép cổng 8081/3001 trên mạng LAN.
- Chưa nhận xác nhận mở app trên thiết bị thật.

- Theo yêu cầu người dùng đã tạo tài khoản local admin@uxui.local, role admin, mật khẩu do người dùng chọn được lưu dạng scrypt hash. Đã kiểm chứng login/me/logout qua HTTP. UI chấp nhận tên admin và ánh xạ email này; không đặt mật khẩu trong frontend. Chưa có màn quản trị riêng.


- Theo yêu cầu đã đổi email admin local sang admin@gmail.com, giữ mật khẩu người dùng đã chọn, thu hồi các phiên cũ. Đã kiểm chứng HTTP login/logout với email mới; alias admin trong UI trỏ email mới. Không gửi thư tới địa chỉ Gmail.


## G1 — Hồ sơ cá nhân đang triển khai
- Đã lấy Figma context 181:4122. Thêm PATCH auth/me chỉ sửa hồ sơ của chính actor, DTO cấm các trường ngoài hợp đồng; ngày sinh lưu date-only, kiểm tra tương lai và mốc 1900.
- UI complete-profile dùng trường có nhãn, radio giới tính, giữ form khi lỗi, cập nhật context sau lưu. Upload avatar còn chưa triển khai, nút thể hiện chưa khả dụng. Chưa nghiệm thu UX/màn 08.

- Profile HTTP integration đạt: 401 khi thiếu phiên; 400 khi gửi role/userId/ngày sai/tương lai/số điện thoại sai; lưu profile đúng actor, không trả hash. Tổng 6/6 API test đạt với MongoDB/SMTP thật, 0 skip.
- E2E web auth đã thêm nhập/lưu/mở lại hồ sơ; 2/2 đạt sau sửa điều hướng tránh nhân đôi Account. Đã xem screenshot 390px; đổi giới tính sang danh sách thu gọn sát Figma hơn, đang kiểm tra lại.
- Quản lý dự án: Phase 2 complete (cấu trúc/công cụ), Phase 3 in_progress. Toàn bộ app chưa hoàn thành. Avatar/upload, quên mật khẩu, người thân và các nhóm màn còn lại vẫn mở.

- UI giới tính đã thu gọn; E2E web 2/2 đạt sau điều chỉnh test chọn mục (danh sách đóng ngay khi chọn). Android bundle hồ sơ trước chỉnh thu gọn đã đạt. Chưa kiểm thử Android thực.
- Đã restart API local port 3001 để cung cấp PATCH auth/me; Expo LAN vẫn dùng 8081. Người dùng đăng nhập rồi vào Thông tin cá nhân để thử.

- UI giới tính đã thu gọn; E2E web 2/2 đạt sau điều chỉnh test chọn mục (danh sách đóng ngay khi chọn). Android bundle hồ sơ trước chỉnh thu gọn đã đạt. Chưa kiểm thử Android thực.
- Đã restart API local port 3001 để cung cấp PATCH auth/me; Expo LAN vẫn dùng 8081. Người dùng đăng nhập rồi vào Thông tin cá nhân để thử.

## Tổ chức lại 100 màn theo luồng chức năng
- Đã chia A–J, giữ nguyên owner/Figma ID/status. SCREEN_MAP thêm functional_group/implementation_order, có tài liệu luồng và điều kiện nghiệm thu.
- Kiểm kê: đúng 100 mã duy nhất 01–100, không thiếu/không trùng; số màn A–J: 16,8,15,7,8,13,8,13,9,3.
- Quyết định nối luồng: đăng nhập → Home 13; appointment lists 42–44; health overview 91; lab tracking 76 → results 94–95. Nhóm thông báo là hạ tầng tích hợp sớm.

## Nhóm A — Khôi phục mật khẩu đang triển khai
- Đã lấy Figma context/screenshot màn 07. Thêm request/verify/complete reset qua SMTP, OTP HMAC, TTL, rate limit, reset grant ngắn hạn trong memory. Không đưa token vào URL.
- Complete dùng transaction MongoDB để đổi hash và thu hồi toàn bộ session; credentialVersion chặn session phát sinh muộn từ mật khẩu cũ.
- UI forgot-password/OTP/new-password đang nối API. Typecheck đầu phát hiện thay chuỗi tokenHash nhầm query authenticate; đã sửa phạm vi, đang chạy lại test.

- Reset integration với MongoDB replica set/SMTP: 7/7 API test đạt, 0 skip. Xác minh OTP sai/hết hạn/dùng lại/khóa thử; mật khẩu mới khác mật khẩu cũ; transaction thu hồi phiên; credentialVersion chặn token stale được insert sau reset.
- Web E2E: 3/3 đạt, bao gồm request email -> OTP -> màn 07 -> kiểm tra mật khẩu xác nhận -> lưu -> mật khẩu cũ bị từ chối -> mật khẩu mới đăng nhập -> đăng xuất.
- Typecheck/lint đạt; đã xem screenshot 390px. Màn 07 dùng yêu cầu 12 ký tự thống nhất với backend (Figma đang ghi 8), chưa chỉnh file Figma. Back icon tái sử dụng cùng component 35:1661 đã tải local.
- Tài khoản admin hiện có không bị thay mật khẩu trong kiểm thử; test dùng tài khoản riêng.

## Nhóm A — Intro và permissions đang triển khai
- Đã lấy context/screenshot 01–03, 09–11; tải 26 asset về E, giữ SVG gốc và ảnh Việt Nam.
- Đã dựng Splash loading, Welcome, Onboarding preview bằng layer native, không dùng screenshot làm asset. Lưu cờ đã giới thiệu trên thiết bị; trực tiếp mở sign-in vẫn được. Không thêm home indicator giả ngoài minh họa phone.
- Đang nối preferences và cấp quyền native; push delivery vẫn chưa triển khai.

## Nhóm A — Intro và lựa chọn quyền đã kiểm tra web
- 01–03: Splash thực khi tải, Welcome, Onboarding theo Figma; cờ giới thiệu lưu local, không lưu token web vào localStorage.
- 09–11: xin GPS khi bấm cho phép, nhập địa chỉ thủ công, bỏ qua và lựa chọn thông báo nối PATCH auth/preferences theo actor. Chuyển GPS sang manual/none xóa tọa độ cũ.
- API: 7/7 test đạt với MongoDB replica set + Mailpit, 0 skip; thêm kiểm tra preferences/ownership/validation/xóa dữ liệu vị trí cũ.
- Playwright: 5/5 đạt, gồm intro lần đầu/nhớ lựa chọn/320px và auth/profile/reset có bước permissions. Đã xem ảnh Welcome, Onboarding và nhập vị trí 390px.
- Typecheck và lint đạt. Quyền Android/iOS chưa kiểm thử trên điện thoại; thông báo đẩy, geocoding địa chỉ, avatar upload và màn 12/51/52/57/58 chưa hoàn tất. Phase 3 tiếp tục in_progress.
- Cài expo-location/expo-notifications: dừng đúng tiến trình Expo dự án để gỡ khóa thư viện Windows; cài thành công và bật lại API 3001, Expo LAN 8081. Không ghi dữ liệu dự án sang C.
- Build cuối lượt: NestJS compile và Expo export Android đạt (1401 modules, 57 assets). Đây là bundle Android, chưa phải APK hoặc kết quả QA thiết bị.

## Ưu tiên mới — luồng trang chủ (nhóm C)
- Theo yêu cầu người dùng chuyển ưu tiên sang Home trước khi hoàn thiện A/B. Đã dựng 13 → 21/24 → 15/16 từ context/screenshot Figma, dùng asset gốc local trên E.
- Sau login/hoàn tất thiết lập về /home. Tài khoản mới có trạng thái chưa có lịch; không chèn lịch mẫu/ngày đã qua. Tài khoản có thể trở lại từ bottom bar, quay Home dùng navigate để tránh tạo trùng route.
- NestJS DiscoveryModule seed-on-insert danh mục Figma vào MongoDB: 8 bệnh viện Đà Nẵng, 3 bác sĩ. API search có dấu/không dấu, type filter, detail404, yêu thích PUT/DELETE idempotent theo actor. Endpoint home lấy lịch confirmed/paid trong tương lai của chính user.
- API 8/8 test đạt, 0 skip, có kiểm tra 401/query400/404/tìm kiếm/không trùng yêu thích/cách ly người dùng/lọc lịch quá hạn-hủy-người khác. E2E web 6/6 đạt: auth/reset/intro hồi quy + Home/search/doctor/hospital/nearby8/favorite persistence/network retry/320px.
- Đã xem screenshot home390/320, search390, doctor390, hospital390, hospitals390. Ảnh avatar contain giữ đầu; ảnh bệnh viện đúng cơ sở. Typecheck/lint đạt. Test dùng tài khoản riêng, không đổi admin.
- Lỗi kiểm thử đã xử lý: selector văn bản bắt cả screen ẩn trong stack; dùng role và phạm vi visible, chờ tài khoản đích trước thao tác. Không tăng timeout để bỏ qua lỗi.
- Chưa hoàn tất: đặt lịch, chat, các tab bệnh viện17–20, bản đồ14, filter22, chuyên gia23, danh sách yêu thích49–50; không đánh dấu nhóm C hoàn thành. Nút chưa triển khai có trạng thái rõ ràng.
- Build cuối lượt đạt: API compile; Android export 1478 modules/106 assets. Chưa tạo APK và chưa QA trên thiết bị. API 3001 ready, Expo 8081 đang chạy.

## Nhóm C — mở rộng khám phá, đang triển khai
- Đã đọc context/screenshot 22/23/49/50. Filter mẫu có consultation/khoảng cách/phí nhưng catalog chưa có dữ liệu; chỉ áp dụng các tiêu chí có thật (chuyên khoa/rating), mục còn lại hiển thị chưa khả dụng.
- Không nhân đôi 4 bác sĩ thành8 như lưới mẫu. Danh sách yêu thích chỉ gồm bản ghi người dùng đã lưu; số lượng thực và trạng thái trống.
- API mở rộng đạt 8/8, 0 skip: specialty khớp chính xác, ratingBand (4.0 ≤ x < 4.5 và x ≥ 4.5) có test biên; favoritesOnly xác minh actor. Thêm bác sĩ Nguyễn Công Cảnh từ Figma, không gán cơ sở hành nghề khi mẫu chưa có.
- Typecheck đầu phát hiện kiểu Mongo projection mất index signature sau map khi sort rating; đã chuyển sort trước map và typecheck/lint đạt.
- Môi trường đầu lượt Docker/Expo/API tắt; khởi động lại. E2E lần đầu connection refused do Expo chưa listen, chưa phải lỗi luồng UI. Đã thêm globalSetup readiness để chặn chạy khi dịch vụ chưa sẵn sàng; đang chạy lại sau Metro ready.
- E2E mới lần đầu phát hiện radio không có aria-checked trên web dù màu chọn đúng; đã bổ sung như component giới tính hiện có. Test mới chạy lại đạt. Đã xem và sửa badge ✓, giữ avatar nguyên đầu, favorite backdrop đúng variant.
- Kết quả cuối luồng web: 7/7 đạt; gồm tạo tài khoản riêng, danh sách yêu thích trống, thêm/bỏ lưu bác sĩ và bệnh viện, refresh khi quay lại, chuyên gia4 avatar, lọc giữ tiêu chí khi mở lại, áp dụng rating ra trạng thái không kết quả, đặt lại và màn320px không tràn ngang. Typecheck/lint đạt.
- Nhóm C chưa hoàn tất: bản đồ14, tab bệnh viện17–20, đánh giá46, booking/chat. Filter22 có specialty/rating hoạt động; dữ liệu consultation/khoảng cách/phí còn thiếu được hiển thị rõ. Phase3 vẫn in_progress.
- Bundle Android cuối lượt đạt: 1524 modules/122 assets, chưa phải APK hoặc QA thiết bị. Bảng đủ100 màn, 5 phase markers hợp lệ. API3001 và Expo8081 đang chạy; dữ liệu và tiến độ lưu tại E:/Code/UX_UI.

## Đợt lớn — booking/payment/appointments đang triển khai
- Lấy context/screenshot 25/26/27/28/30/31/32/35/42, lưu E. Không dùng QR placeholder thành QR thật.
- Giữ giá/gói từ thiết kế làm catalog local; thoại/video chưa triển khai bị vô hiệu hóa. Thêm cash tại cơ sở để xác nhận lịch mà không báo đã trả tiền. Ví mặc định0, chỉ ghi paid sau transaction trừ số dư và ledger; không tự nạp tiền cho người dùng.
- Backend dự kiến transaction, unique slot, idempotency theo actor, bảo vệ PII, lịch theo múi giờ Việt Nam và giới hạn ngày đặt.
- Backend mới đạt9/9: giá lấy server, từ chối chèn amount/userId, patient/date bắt buộc, actor receipt404, slot race201/409, wallet thiếu rollback, hai request cùng idempotency chỉ có1ledger, lịch mới về Home. Tách database test booking để tránh fixture bác sĩ gây nhiễu test discovery chạy song song.
- E2E booking đã đạt: chọn ngày tương lai/slot trống thực, package350k, validate patient, cash chưa paid, phiếu có mã thật không QR giả, list/detail/Home và320px. Đang đối chiếu ảnh và chạy hồi quy cuối lượt.
- Kiểm thử toàn bộ ban đầu bị fixture booking ảnh hưởng số lượng bác sĩ discovery; đã tách DB suite booking. Lint phát hiện import Draft không dùng, đã bỏ.
- E2E phát hiện bấm trúng screen ẩn trong stack; thêm chờ màn đích và phạm vi visible. Kiểm tra bounding box footer nằm trong viewport đã đạt ở lần chạy booking riêng.
- Sau nhiều lượt E2E, API dev chạm giới hạn đăng ký20/IP/giờ. Không nới rate limit: chuyển browser/API fixtures sang backend3002 + database tạm riêng và cleanup có kiểm tra prefix. Lượt isolated đạt8 test nhưng teardown route logout còn chạy; đã thêm chờ unroute và chờ UI đăng xuất xong, đang kiểm tra cuối.
- Kết quả hồi quy isolated cuối: 8/8 E2E web đạt, exit0, teardown sạch. Backend9/9 đạt,0skip; typecheck/lint đạt. Đã thêm expectedAmountVnd để từ chối giá đã đổi trước debit; cash không báo paid.
- Đợt này nối9 màn:25/26/27/28/30/31/32/35/42 và cập nhật Home/CTA bác sĩ/bottom bar. Các phần partial được ghi riêng trong SCREEN_MAP; không đánh dấu toàn bộ nhómE/F hoàn thành.
- Bundle Android cuối lượt đạt (3.1MB), chưa APK/QA thiết bị. Draft chứa thông tin người khám được xóa khi logout/đổi actor. API3001 và Expo8081 đang chạy; tiến độ và tài sản nằm trên E. E2E DB tạm đã được dọn sau exit0.
- Đã dọn đúng5 tài khoản fixture booking-ui và2 lịch do E2E cũ tạo ở DB dev, xác minh tên/email/password fixture trước khi xóa; giải phóng slot test, không thay admin hoặc dữ liệu người dùng khác. Các lượt E2E sau dùng DB tạm riêng.

## Lifecycle 36/77/78/81/82 + wallet53 đang triển khai
- Docker đã phục hồi sau khi dừng tiến trình build còn giữ named pipe; compose mongo/mailpit healthy, khởi động lại API. Không reset database.
- Đã lấy6 context/screenshot và12 asset local. Nối đổi lịch/hủy/refund request/status/wallet; tiền hoàn chỉ về ví sau role admin duyệt qua API, không có admin UI mới trong100 màn.
- Backend10/10 đạt: optimistic startsAt, race reschedule/cancel, bảo toàn slot cũ khi target bận, cancel giải phóngslot, duplicate actions idempotent, ví không tự hoàn khi request, approval twice chỉ1credit; user khác404, nonadmin403, cash không đủđiều kiện refund, cutoff1h.
- Hồi quy cuối:9/9 E2E web đạt exit0;10/10 API đạt,0skip. Sau chỉnh ngày trước: thêm test tuần trước không bỏ sót các ngày còn hợp lệ, lifecycle E2E riêng đạt lại. Typecheck/lint đạt.
- QA6 màn: xem ảnh reschedule/success/cancel/refund-request/pending/completed/wallet390/320. Sửa lưới ngày không giãn cao, bỏ icon chồng trên huy hiệu thành công, xóa thông báo lỗi lý do khi sửa nhập. Không nhân bản dữ liệu hoặc tạo giao dịch ví mẫu cho user.
- API dev đã restart có lifecycle routes; Docker mongo/mailpit healthy, Expo8081 đang chạy. Bảng100 màn cập nhật đúng6 màn36/53/77/78/81/82. Không đánh dấu toàn bộ nhómF/D xong.
- Bundle Android cuối lượt đạt (3.1MB), chưa APK/QA thiết bị. Các bước admin approval đã kiểm thử với role riêng trongDB E2E; không đổi vai trò/mật khẩu/số dư admin thật.

## QR/checkin/queue và admin UI đang triển khai
- Lấy34/79/80 context/screenshot. QR thật được tạo bằng qrcode1.5.4 server SVG local, token ký HMAC domain riêng, không chứa tên/điện thoại, có hạn và checkinVersion. Đổi lịch tăng version.
- Self check-in chỉ của actor trong cửa sổ[-30,+60]phút; thể hiện đây là check-in của app chưa tích hợp quầy. Queue số cấp bằng transaction/counter unique, không tạo số mẫu/thời gian chờ giả.
- Role admin từ profile server, quản trị hoàn tiền/điều hành queue kiểm quyền lại ởDB. Không mở cấp role qua profile/register API.
- Backend11/11 đạt,0skip: QR ký/thời hạn/mã cũ sau đổi-hủy bị chặn; actor khác404 vànonadmin403; 3 checkin đồng thời chỉ1ticket; call-next đồng thời chỉ1lượt; chặn hoàn thành khi chưa bắt đầu; lịch active vẫn hiển thị và completed vào lịch đã qua.
- Đã thêm3 màn admin ngoài bộ100: dashboard/refunds/queue, dùng component/token hiện có; không tự sửa Figma. Menu admin dựa role profile từ server, API vẫn xác thực quyềnDB.
- Đã tạm dừng đúng API/Metro khi cài qrcode1.5.4/@types1.5.6 để tránh khóa thư viện Windows; cài thành công, bật lại API3001/Expo8081. Không thêm native module/camera.
- Chốt đợt QR/admin: toàn bộ10 E2E web đạt (last-run passed, không test lỗi);11/11 API đạt. Typecheck/lint đạt. Android export đạt1635 modules/3.1MB, chưa APK hoặc thử thiết bị.
- QA ảnh QR390, queue completed320 và admin refund390: nội dung/QR/nút không bị cắt, xác nhận số tiền rõ; webtest kiểm tra màn hẹp. Admin duyệt qua giao diện trong E2E, patient theo dõi called → in_consultation → completed.
- SCREEN_MAP cập nhật32/34/35/79/80/81/82;3 màn admin không tính thêm vào bộ100. Tiếp theo ưu tiên xét nghiệm69–76; giữ mở bản đồ/tab bệnh viện, native QA và tích hợp ngoài.

## 2026-10-30 — xét nghiệm69–76 và Docker tái lỗi
- Đã lấy đủ8 context Figma; thêm LabModule: catalog/options/booking/list/detail, idempotency, unique cơ sở+giờ, kiểm giá, actor isolation và staff ordered progress. Cash unpaid; home sampling disabled; chưa kết quả thật.
- UI8 màn, list lịch và admin xét nghiệm đã nối; map minh họa ghép nguyên asset vector Figma, không GPS. Typecheck/lint đạt. Chưa QA render/E2E/Android export đợt này.
- API test mới lab.integration.test.ts chưa có kết quả: Docker tắt, Mongo27018 ECONNREFUSED; không tính lượt này là nghiệp vụ đạt. Không chạy thêm DB test đến khi Docker ready.
- Docker khởi động lại lỗi OTel userAnalyticsOtlpHttp.sock. Read-only log xác nhận Desktop4.40.0; fsutil query lỗi1920. Chưa xóa/reset/cập nhật. Người dùng đã cho quyền file socket tạm trước đó, chưa cho thay đổi cài đặt Docker trên C; đã hỏi phạm vi cập nhật riêng.
- Sau ảnh người dùng: xác minh Docker Engine28.0.4 phản hồi, compose tạo lại container/mạng và tải image; mongo/mailpit healthy. Không cập nhật Docker/reset dữ liệu. Kiểm tra database dev còn tài khoản admin và lịch cũ, health/ready đạt. Chưa kết luận lỗi Docker tái diễn đã được sửa tận gốc.
- API12/12 đạt,0skip sau sửa race retry idempotency khi options vừa bị chiếm bởi request giống hệt. E2E xét nghiệm riêng đạt, gồm admin cập nhật thật và actor xem history. QA ảnh detail/method/location/schedule/review/success/tracking390 và320; sửa ô khu vực giãn quá cao và cố định thứ tự cơ sở theo catalog Figma. Không có asset rỗng.
- Hồi quy toàn bộ:10/11 web đạt, test reset lỗi chọn input màn ẩn. Sửa test chờ màn khôi phục rồi chọn visible input (không đổi auth product); chạy lại reset + labs:2/2 đạt. Typecheck/lint cuối đạt. Không ghi toàn bộ11 cùng lượt đạt.
- QA sửa thanh ngày ScrollView co về44px, ô khu vực về36px; ảnh sau sửa không giãn; map giữ đủ SVG và nhãn. Luồng nhận mẫu/đang phân tích hiển thị timestamp thật, không tự sinh kết quả. Bộ100 còn phần chưa hoàn thiện, chưa QA thiết bị.
- Android export cuối đạt1680 modules/3.2MB. Chưa APK/thiết bị thật. API dev restart để tải bản lab options mới; Expo8081 đang chạy.

## Hồ sơ và tài liệu93/94/95/98/99
- Đối chiếu5 context/screenshot Figma; thêm RecordsModule và6 route mobile gồm hub ngoài bộ100. Không sửa Figma. Tái sử dụng Frame/Field/Action/tokens và asset SVG nguyên bản (lab/file/chevron/shield/upload).
- Upload multipart10MB max, xác minh magic PDF/PNG/JPEG khớp MIME, ngày hợp lệ không tương lai; GridFS trong Mongo binddata trên E. Metadata và nội dung yêu cầu actor; không public file URL. Tên tải xuống dùng ID an toàn; UI dùng tên tài liệu.
- Lần khám chỉ lấy status completed. Vitals/clinicalNotes chưa nhận hiển thị thiếu dữ liệu, không chép chỉ số Figma thành dữ liệu thật. Results hiện là tài liệu category lab tự tải, chưa kết quả xác minh/bảng chỉ số.96/97/100 giữ mở.
- Expo DocumentPicker58.0.4, FileSystem58.0.13, Sharing58.0.21 cài bằng expo install; dừng API/Metro trước khi cài, bật lại sau. Web download dùng Blob; native tạo cacheFile rồi mở share sheet và xóa cache sau khi đóng, chưa QA thiết bị.
- Docker đầu lượt tắt; mở lại bình thường đã có engine28.0.4, compose mongo/mailpit healthy. Không reset/cập nhật/xóa socket. API13/13 đạt0skip. E2E records riêng đạt: completed visit→upload→search/filter→download→delete; kiểm màn320. Sửa locator cuối chỉ chọn màn visible do stack giữ màn cũ.
- Đã xem ảnh7 trạng thái390/320: visit, results empty/list, upload, documents, document, result. Tài liệu chưa xác minh thể hiện rõ. Không có asset rỗng; thời gian/size/tên lấy từ dữ liệu thật.
- Hồi quy cuối13/13 API,12/12 E2E web đạt exit0; sau sửa chụp screenshot chờ hết loading, records E2E riêng đạt lại. Typecheck/lint đạt. Chưa kết luận native/file share chạy trên thiết bị chỉ từ web test.
- Export Android cuối sau await File.write đạt1717 modules/3.3MB exit0; chưa APK/thử thiết bị. API3001 health ready và Expo8081 đang lắng nghe. Project/caches/artifacts trên E.

## Dị ứng/bệnh nền96 và tiêm chủng97
- Đọc2 context/screenshot Figma; dùng Frame/Field/Action và SVG shield/chevron đã có, calendar mới nguyên bản22px. Thêm2 màn danh sách và1 editor dùng chung ngoài bộ100; nối từ hub và chi tiết lần khám.
- HealthInfoModule lưu Mongo health_info theo actor, source=self_reported/verified=false. Thêm có UUID+payload hash unique; sửa/xóa kiểm expectedVersion để chặn ghi đè stale. Không cấp quyền sửa của người khác; source/version không thể tự cấp từ client.
- Kiểm ngày thật không tương lai, vaccine bắt buộc ngày/mũi/cơ sở. Không có bản ghi không đồng nghĩa không dị ứng. Không tự tư vấn lịch tiêm hoặc xác nhận miễn dịch. Dị ứng được xếp trước bệnh nền.
- API14/14 đạt0skip: double POST chỉ1record, sai payload cùngkey409, actor404, race PATCH chỉ1thành công, stale DELETE409, vaccine thiếu trường400, ngày sai400. E2E riêng đạt thêm/sửa dị ứng, thêm bệnh nền, vaccine+search+delete, màn320 không tràn.
- QA ảnh allergy/conditions390, vaccine editor390 và list320; không seed nội dung y tế mẫu vào dev.
- Hồi quy cuối13/13 E2E web đạt exit0,14/14 API đạt. Typecheck/lint đạt. Restart đúng API dev13360 vì còn dùng AppModule cũ, lần start trước bị EADDRINUSE không ảnh hưởng server cũ/dữ liệu.
- Android export cuối đạt3.3MB exit0; chưa APK/QA thiết bị. API dev health ready đạt và health-info trả401 khi chưa đăng nhập (route đã tải). Tiến độ/file trên E.

## Người thân và quyền riêng tư61–68
- Lấy đủ8 context/screenshot Figma; triển khai10 route gồm shared/incoming ngoài bộ100, không sửa Figma. Hồ sơ người thân owner-controlled, không liên kết danh tính tài khoản người thân; sức khỏe tự khai chưa xác minh. Đã nối từ Tài khoản.
- FamilyModule: CRUD owner, idempotency tạo và version khi sửa/xóa, tự thu hồi grant khi xóa. Cấp quyền cho email đã xác thực, có hạn tối đa366 ngày, basic bắt buộc, edit_health yêu cầu health và chỉ family. Người nhận phải chấp nhận; mỗi lần đổi scope/thời hạn đều reset consent. Thu hồi/hết hạn/từ chối chặn request tiếp theo.
- Self sharing hỗ trợ health info và danh mục lab/prescription; documents mới cho tải mọi tài liệu. Không cấp family lab/prescription/documents vì chưa có nguồn dữ liệu family riêng. Shared file luôn kiểm grant rồi kiểm file thuộc owner; endpoint private ban đầu vẫn404 cho người nhận.
- Audit thật owner/actor/subject/action/outcome/time, không ghi clinical text.68 giới hạn100 thao tác family/sharing, chưa log mọi API khác/chưa lọc tháng/phân trang.66 thông báo truy cập disabled, chưa fake push hoặc chính sách vận hành đầy đủ.
- API15/15 đạt0skip:3actors, pending403, chỉ basic không lộ health, chỉ xem không sửa, đổi quyền phải accept lại, revoke/expiry/decline chặn, không cho tải khi chỉ lab, byte tải đúng khi có documents, nhật ký có denied/allowed và không chứa ghi chú.
- E2E family2contexts đạt; toàn bộ14/14 web đạt exit0. QA chỉnh footer tài khoản dùng5SVG nguyên bản Figma61, bỏ padding/border thừa và màu switch theo token. Shield66 sửa đúng imgVector1(48px), không dùng back22px. Route center là /privacy/center để không trùng privacy.tsx bản trước.
- Typecheck/lint cuối đạt; family/booking sau sửa footer2/2 đạt; Android export cuối1739 modules/3.3MB exit0. Chưa APK/QA thiết bị. Restart đúng API dev cũ để nạp FamilyModule, API3001 ready và family401 chưa đăng nhập; Expo8081 đang chạy.61 màn đã có triển khai ở các mức khác nhau,39 chưa triển khai; không có nghĩa61 màn đã nghiệm thu đầy đủ.

## Hoàng43/44/45/46/47/48/91/92
- Đọc8 context/screenshot Figma. Thêm CareModule và UI services/notifications/reviews/overview/timeline; nâng42 thành tabs upcoming/completed/cancelled/expired. Giữ API past tương thích nhưng UI Đã khám chỉ status completed, không biến confirmed quá giờ thành đã khám.
-45 feed tổng hợp mốc hiện còn lưu trong appointments/labs/documents/grants, read flags Mongo per actor. Không phải push, nhắc giờ hoặc outbox lưu mọi lần thay đổi.100 thông báo gần nhất; xóa tài liệu có thể mất mốc từ feed.92 thêm mốc health tự khai, ngày-only không hiển thị giờ giả,100 mốc gần nhất.91 counts dùng countDocuments thật, clinicalVitals/treatmentPlans null.
-47/48 chỉ owner completed booking;4 tiêu chí1–5 và nhận xét5–2000 ký tự. Unique user/booking/target và payload hash; gửi giống hệt trả bản cũ, khác nội dung409. Lưu nội bộ gắn account, chưa ẩn danh gửi bệnh viện/chưa công khai và không đổi rating catalog. Không dựng data chẩn đoán/thuốc minh họa.
-46 nối khám trực tiếp/tái khám/chăm sóc/xét nghiệm; tư vấn online disabled vì chưa transport/nhân sự. Assets tĩnh dùng SVG gốc care; ảnh doctor/hospital động theo dữ liệu Figma catalog, giữ đầu avatar.
- API16/16 đạt0skip: actor isolation/read flags, idempotent review races, reject chưa completed, private review data, completed/expired phân biệt, summary không bịa vitals. Care E2E riêng đạt và hồi quy15/15web đạt. Typecheck/lint đạt. QA thu gọn card43/44 thành nút2cột, chọn sao có nềnselected, ảnh BV tròn.
- Chốt:16/16 API0skip và15/15 E2E web toàn bộ đạt; sau chỉnh card/dateOnly, booking+care2/2 đạt và care riêng sau chờ SVG render đạt lại. Typecheck/lint đạt. Android export cuối3.4MB exit0; chưa APK/QA thiết bị.69/100 màn có triển khai ở các mức,31 chưa bắt đầu. Không đánh dấu các nhóm complete.
- API dev restart35488, health ready đạt/care401 chưa login, Expo8081 chạy. Các screenshot mới chờ SVG nên services/nav/icon đầy đủ; tài sản không rỗng. Toàn bộ code/caches/tiến độ trên E.

## Tin nhắn37–38 và phân công bác sĩ
- Đối chiếu2 context Figma181:4312/181:4363, bổ sung ChatModule,4route mobile, footer messages và menu admin. Không sửa Figma, không tự gán admin thành bác sĩ.
- Tài khoản verified được admin gán với expectedVersion; room unique booking+assignmentVersion, participant-only. Đổi người không chuyển transcript cũ; old clinician mất quyền, patient giữ lịch sử readonly.
- Gửi text/file trong transaction, seq tăng và UUID+hash chống trùng;30tin/phút/người/room. Read cursor monotonic. File chỉ attach của sender, tải qua kiểm quyền room rồi kiểm owner file. Không fake trạng thái online/typing, tư vấn hoặc chỉ số y tế.
- Frontend polling3s chỉ focus/foreground, abort khi rời màn; draft giữ khi lỗi, cursor đọc khi gần đáy.50tin/lần,500tin/phiên. Chưa WebSocket/push/call/E2EE/QA máy thật. Native export không phải APK.
- API17/17 đạt0skip; typecheck/lint đạt sau sửa no-extra-boolean-cast. Chat E2E3tài khoản đạt: admin gán→patient gửi→staff đọc/reply→readreceipt→admin gỡ→staff mất dữ liệu/patient readonly. Tệp và actor isolation kiểm API, chưa E2E chọn/tải tệp trên native.
- QA ảnh390/320: ảnh bác sĩ đủ đầu, tin nhắn và composer không tràn, icon SVG đầy đủ. Android1773modules/3.4MB export exit0. Dev API34760 ready, Expo8081 chạy. Tăng startup timeout E2E30→90s vì cold startup vượt30s.
- SCREEN_MAP giữ đủ100số,71màn có triển khai các mức,29chưa triển khai. Các phase chưa đủ nghiệm thu vẫn mở. Tiếp theo85–90 và các mục chưa xong.
- Hồi quy lần đầu15/16 web đạt, chat timeout120s dù chạy riêng đã đạt. Thêm điều kiện chờ màn Tài khoản sau đăng nhập và ảnh phụ khi lỗi; chạy lại5bài auth/booking/care/chat cùng thứ tự đạt5/5. Chưa quy kết chắc nguyên nhân timeout; đang chạy lại toàn bộ.
- Chốt hồi quy lần cuối16/16 E2E web đạt exit0 (1.1m),17/17 API0skip, typecheck/lint đạt. API3001 /health/ready ok và /chat401 chưa login xác nhận route đã nạp; Expo8081 lắng nghe. Không kết luận native đã QA chỉ từ Android export.

## Đang triển khai85–90
- Thêm AftercareModule,9route và AftercareScreens. Notes/Px self_reported verified=false; không dùng data chẩn đoán/thuốc Figma. Chỉ owner completed visit. Kê đơn chuyên môn/chữ ký số chưa triển khai.
- Rx12thuốc max6giờ/ngày, date hợp lệ tối đa366ngày/thuốc, UUID+hash create unique, thuốc bất biến sau lưu; archive bản chép tắt nhắc không xóa lịch sử. Notes/version; intake version theoRx/med/date/time. Transaction serialize với archive. Chặn mốc chưa tới giờ/tương lai, ngàyVN. Hoãn15phút trongngày, không tự ghi nhận uống.
-18/18 API0skip đạt. Typecheck/lint phát hiện token muted chưa có và explicit any; đã sửa kiểuMedication/màu hiện có. E2E đầu phát hiện RNweb switch thiếu aria-checked dù dữ liệu đã đổi: đã bổ sung aria-checked cho switch/checkbox/radio. E2E lần2 sai locator exact status có prefixdate; đổi locator đúng nhãn. Screenshot summary bắt trúng loading do stacktransition; thêm điều kiện nút sau load trước chụp.
- Aftercare E2E sau sửa đạt1/1; kiểm ảnh summary/plan/prescription/schedule390, reminder390 và schedule320 đủ icon/không tràn. Thêm auto refresh30s focus/foreground và aria-checked rõ. Export Android1788modules/3.4MB đạt; chưa APK/QA máy thật. API dev đã restart9356, readyok/aftercare401 chưa login.
- Hồi quy rộng aftercare đạt nhưng chat cũ tái diễn timeout120s. Đang giới hạn actiontimeout15s và đóng context trước khi đợi route polling để không che lỗi teardown; chưa quy kết nguyên nhân. SCREEN_MAP77màn có triển khai ở các mức,23chưa triển khai; không đánh dấu nhóm complete.
- QA bổ sung87 danh sách bản chép (file24/circle40 đúng slot). Aftercare+auth+booking+care+chat chạy cùng thứ tự đạt6/6 sau giới hạn actiontimeout và đóng riêng context có polling; đang chốt cả17 bài web. Assets5file gốc đủ, typecheck/lint đã đạt. Chưa coi timeout trước đã có nguyên nhân xác định.
- Chốt cuối:17/17 E2E web exit0(1.2m),18/18 API0skip, typecheck/lint đạt; Android1788modules/3.4MB export đạt. Chưa QA thiết bị thật/OS notification. API9356 ready và aftercare401 khi chưa login, Expo8236 cổng8081. Tất cả code/caches/tài sản/tiến độ trên E.

## Đang triển khai Tâm14/17–20
- Đọc5context/screenshot Figma. Map14 ghép99slot SVG gốc từ node225:3586, giữ bố cục390×844 và scale nguyên composition, không inline/redraw vector. Ảnh marker/card động từ hospitalcatalog, bỏ khoảng cách/phút mẫu. Rõ nhãn minh họa/khôngGPS, reset chỉ đưa thẻ về Vinmec.31SVG asset tải đúng curl; chevron root18 đã sửa wrapper18.
- Tab bệnh viện nay Pressable role tab/aria-selected. ContentAPI lấyactive doctor theo hospitalId, packages enabled chỉ khi códoctor; ảnh4Vinmec/1cơsởkhác từcatalog hiệncó, không bịa sốảnh8/specialist16/review53. Reviews chỉactor+completedhospitalbooking, privatecomment khôngpublic. Dịch vụ dẫn chọn bác sĩ; chọn gói ở flowbooking. Không trộn avatar/khoảnh cách minh họa thành dữ liệu thực.
- API19/19 đạt0skip; E2E explore/tabs riêng đạt: marker/card→GiaĐình khôngdoctor disabled→Vinmec services→doctors→gallerymodal→ownreviews/search→320→search. QAảnh map390/320 đúng đường/ôphố/sông/4marker/halo, sourceGPS rõ, portrait đầyđầu. Đưa favorite lênhero để bỏ hàngtrống. Modal fade screenshotchụp quá sớm, thêm chờ nútđóng biếnmất.
- Typecheck đầu gặp inferred Document trong detail thiếu imageKey/specialties; đã khai báo return Record<string,unknown>&favorite, runtimepayload giữ nguyên. Lưu context14 qua shell quá commandline Windows206; dùng apply_patch lưu E. rg globPowerShell123 đã chuyển -g.
- Hồi quy18/18 E2E web đạt exit0(1.3m), API19/19 đạt. Hash QA nav14 so với careNav phát hiện4/5 khác; thêm props map cho BottomBar/Favorite để dùng chính source14 nav19–23/bg/heart17, không đổi services nav. Typecheck/lint sau sửa đạt; đang chạy explore+home và export lại. API dev14128 ready/content401 chưalogin, Expo8236:8081. SCREEN_MAP82màn có triển khai các mức,18chưa triển khai, nhóm chưa đủ nghiệm thu vẫn mở.
- Chốt cuối:19/19 API0skip,18/18 E2E web đạt; sau sửa đúngsource mapnav/favorite, explore+home2/2 đạt lại. Typecheck/lint đạt. QAảnh reviews đã hếtoverlayfade, mapnav/heart/rootgeometry đúngsource. Android1823modules/3.5MB export exit0, chưa APK/QA thiết bị thật. Toàn bộ project/caches/tài sản/tiến độ trên E.

## Đang triển khai Nghĩa51/52/57–60
- AccountModule/avatar GridFS riêng,2MB/magicPNG/JPEG và kích thước4096px/12MP, private no-store và version chống overwrite; sourceUserAPI không lấy ảnh người mẫu trong Figma. Upload/delete refresh profile không bật global loading để không mất draft form52. Avatar hiển thị chữ cái đầu nếu chưa cóảnh, emailchưađổi.
- Đổi mật khẩu kiểmcurrent/scrypt, min8/newconfirm, giới hạn5lần/15phút, conditionalhashupdate+inccredentialVersion và deleteall sessions; chưa đổi mật khẩu thật admin. Support uniqueUUID/hash,5request/ngày transaction, owner-only/100ticket, adminstatus received→reviewing→resolved+version, không gửi externalmail/mạngxãhội. FAQ nội dung theo thực tế app; channelschưa cấu hình.57 xóa accountdisabled.
-20/20 API0skip đạt. Typecheck/lint đạt. SourceQA sửa57userred sangvector2 (vector3 làchevron),60 WhatsApp/X messagevector2 vàWebsiteglobeFrame1; accountnav dùngđúng51a0_vector10–14. Contactbackground dùngSVG40 gốc, iconsrootđúng.
- E2Eavatar báomissingfile: browserfilechooserfilepath qua request-proxy chỉ293byte multipart, APIuploadtừFormData trực tiếp đãpass. Đổi testfixture sangmemoryfilepayload như RecordsE2E; thêmrole image và base64:false rõ. Đãsửa returncontact dùngdismissTo đểkhôngnhânroutehelp. Pythonstdoutcp1252 khônginđượclabelViệt; thêmPYTHONUTF8=1.
- Avatar E2E đổi memoryfilepayload đã tải được (proxy khônglấy bytes backingfilepath). Bỏ roleimage thừa vì RNweb tự tạo altimg vàexplicitrole gây2role. Account E2E riêng đạt7.2s: giữdraft khiảnhrefresh, profilepersists, FAQ, support2actorstatus, passwordrelogin. QA8ảnh390/320 đủảnh/icon/scroll; sửa gender320scrolltest và clearpassworderror onedit.
- Hồi quy đầu16/19: auth còn nhấn Lưu hồ sơ cũ (52nay Cập nhật), chat vàdiscovery-more gặpduplicateTin nhắn/Trang chủ vìbody+footer. Bỏ2bodyactionđãcófooter, cậpnhật authassert lưu tên/phone/datequaeditor. Tăng bảo vệpassword bằngtransaction cậpnhậthash+credentialVersion+deleteallsessions+deleteoldresetchallenges, APIaccount riêngđạt. Đang chốt20API/19web.
- Hồi quy lần2 API20/20 đạt,web17/19: profileSave replace account tạoAccounttrùng trongstack→đổi dismissTo, authlocatornamechỉvisible; chatnhiềupage footerđangtransition/background→login bringToFront, staffreplychờmessage2serverack rồiđưapatientforeground, revokeđưatừngactorforeground đểkiểm pollingđúngAppState. Không giảm assertquyền/biênnhận.
- Profile52 dismissToaccount + authvisiblelocator đãđạt2/2auth. ChatcònfootertrùngHome/Account trongnavigationtransition (ảnhlỗiAccountfooterhiệnđúng nhưnglocatorgiữHomefooter): đợiemailAccount và chọnbooking-footercủaAccount, bringactorforegroundtheoAppState vàchờserverack. Auth+chat3/3đạt. KhôngmởAPIprod bằngfixtures, khôngđổiadminpassword thật. SCREEN_MAP88cótriểnkhaicácmức/12chưabắtđầu; đangchốt19webcuối.
- Lần19web kếtiếp account/auth/chat và17bài khác đạt, familyfail do2successmessage trongkhoảngrefresh (HealthFormlocal+FamilyHealthScreenparent). Khôngsửalayoutfamilyngoàiphạmvi; testđợi hếtloading/vềmộtmessage rồi kiểmnotes từformremountserver. API20/20đạt0skip, sourceaccountkhôngđổi thêm.
- Hồi quy cuối19/19 E2E web exit0(1.5m),20/20 API0skip. Accountprofile/avatar/support/password và các luồng cũ đều đạt. APIdev35720healthready vàaccount/support401 chưalogin, Expo8236:8081. Source/UI cuối khôngđổi sauhồiphụcnav; đangexportAndroid. Chưa QAthiếtbịthật, xóaaccount/emailchange/externalcontact vẫnchưa hỗtrợ.
- Typecheck/lint cuối đạt; Androidexport3.5MB exit0, ảnh/cacheduserAPI không cần assetảnhFigma choaccount. Chưa APK/QA máy thật. Code/caches/ảnh/tiếnđộ đều trênE.

## Đang triển khai bảo hiểm83/84/100
- CRUD thẻ self_reported verified=false, listmasked/owner-only, idempotency+hash trùngthẻ, version khi sửa/xóa, transaction preferred/delete. Không gửi thông tin tớiBV hoặc tự giảm giá khám. Docsinsurancecategory phảiowner; dữliệuthuộcriêngcard khôngchia sẻquaexistingfamilygrant.
- Estimate chỉ user assumptions acknowledged, integerVND/basispoints floor đồng. Nếu booking nguồn thìserver đọcamountVnd/actor/status, chặn giáclientsupplied. Không có engine quyền lợi/BHXH/insurer. Bố cục theo3context Figma, shieldroot28 mới, Header/Field/Frame/Actionreused.
- Typecheck/lint đạt. Lần test đầu DB/Expo/API đều đangtắt, Dockerchưacópipe. Mở lạiDockerDesktop hidden bìnhthường đãengine28.0.4; khôngreset/install/sửaC. Dừng đúngnode testPID35184vàchildren đangretry doDBtắt, bậtcomposeMongo/mailpit dataE vàExpo8081. Chưa kết luận testnghiệpvụ từ lỗihạtầng.
- Sau composehealthy:21/21 API0skip và20/20 E2Eweb đạt exit0(1.5m). Insurance riêng đạt CRUD/preferred/estimatebooking-price/expired/delete; foreignactor/documentref/forgedprice/race/floor kiểmAPI. QA4ảnh390/320 phát hiện kếtquả nằm xa do listnguồnchi phí; gom selectornguồn và bỏ radiotrùngkhi1thẻ, đangtestlạiphầninsurance. Không đổiAPI sau21testpass. APIdev27832ready, Expo6664:8081, Ethernet192.168.1.13.91màncótriểnkhaicácmức/9chưabắtđầu.
- Sau thu gọn nguồnchi phí: insuranceE2Eriêng1/1đạt lại, typecheck/lint đạt. QAestimate390 thấy640000/360000từgiảđịnh800000×80%;320cho100000/100000từgiábooking200000×50%, giữđượcphép tính/quyềnkhôngđổigiálịch. Shield28rootkhôngđèW/H, khôngảnhplaceholder.21API/20webhồiquyđạt trướcUIthu gọn.
- Chốt: Android1879modules/3.6MB exportexit0, chưaAPK/QAthiếtbịthật. API27832/Expo6664vàMongo/mailpit đangchạy; healthreadyok, insurance/cards401khônglogin xácnhậnrouteđãnạp. Code/caches/tài sản/tiếnđộtrênE, dữliệuMongoE giữ nguyên.91màncótriểnkhai/9chưabắtđầu, khôngđánhdấugroupcomplete.


## 2026-10-31 — Chín màn cuối (đang thực hiện)
- Phạm vi: 12, 29, 33, 39–41, 54–56; đã đối chiếu context Figma.
- Người dùng chọn nạp ví chờ quản trị đối soát. Chỉ báo thành công sau khi cộng ví.
- Thẻ chỉ lưu nhãn/4 số cuối, không PAN/CVV và không coi là đã token hóa.


### Chín màn cuối — kết quả triển khai 2026-10-31
- Đã thêm12/29/33/39/40/41/54/55/56 và các menu/route nối từ tài khoản, cài đặt, ví, chi tiết lịch khám, chat và quản trị. SCREEN_MAP đủ100mục, 0mục trạng thái chính xác “Chưa triển khai”; từng mục vẫn ghi rõ giới hạn, không coi100màn là app production hoàn thành.
- Backend mới PaymentsModule/CallsModule; manual topup pending→admin approve/reject, reference duy nhất, transaction wallet+ledger+decision, chống retry cộng trùng. Admin thấy tên/email người yêu cầu. Nhãn thẻ riêng tư không chargeable, server chỉ chấp nhận4sốcuối, khôngPAN/CVV.
- Mã giảm giá do admin tạo/ngừng, quote và kiểm tra lại trong booking; lượt dùng+wallet+appointment cùng transaction. UI đã kiểm thử áp dụng giảm50.000đ vào gói200.000đ, trảví150.000đ và sốdưcòn50.000đ từ200.000đ.
- Cuộc gọi WebRTC web có signaling giới hạn, quyền theochatbinding, accept/decline/end, mic/camera, timeout, metadata kết thúc. Hai browsercontexts kết nối media thật từ thiết bị giả Chromium; không tạo thông tin lâm sàng hay tự complete appointment. Expo Go chưa gọi native, chưa TURN/STUN/QA khác mạng.
-33tái dùng SVGmapgốc làm sơđồminhhọa, mở GoogleMaps với ownedbookingdestination; không giảETA/distance.12thôngtinprivacy cập nhậtđúngcácdữliệuđanglưu, chưathẩmđịnhpháplý.
- Verification: typecheck/lint đạt; fullAPI22/22,0skip; fullPlaywright22/22. Sau cải thiện footercall/map/adminidentity, chạy lạiAPIpayments-calls đạt và2E2Emới đạt (gồm thêm coupon booking UI). Lỗi trong mở rộng E2E là selector Home cũ và mong đợi sai headline cash cho thanh toán ví, đã sửa theo snapshot thực tế, giữ assert giá/số dư DB.
- Android export đạt1897modules/3.6MB, output.local/export-android; chưa APK/deviceQA. Đã xem screenshot29/33/39/55/56, badge112SVGgốc vàphoto đủđầu, callcontrolsfooter cốđịnh.
- APIdev đã restart PID12676/session92082, port3001 ready200, routespayments/callsyêu cầuauth401. Expo8081 vẫn chạy PID6664. Không reset Docker hay thay database phát triển. Tất cả mã/docs/artifacts ghi trongE:/Code/UX_UI.
- Chi tiết phạm vi: docs/FINAL_NINE_SCREENS.md. Phase3vẫnactive và Phase4/5chưahoànthành vì cònnghiệmthuUX/thiếtbị/tíchhợpngoài.

- Kiểm tra cuối: typecheck/lint đạt; 2E2Emới mở rộng đạt6.4s/9.2s, gồm assert server đã chuyển connected sau khi2peer kết nối. Đã sửa selector search để đợi đúng màn/tìm theo tên thay vì bắt trúng doctorcard Home bị ẩn khi stack chuyển màn. Nativeexport1897modules đã hoàn tất. Không còn lỗi kiểm thử mới đang mở.


## 2026-11-02 — Trang chủ, bỏ lối tắt ngoài Figma
- Người dùng làm rõ chỉ ba nút Thông báo/Dịch vụ/Đặt xét nghiệm tự thêm giữa lịch hẹn và section Dịch vụ. Đã bỏ đúng ba Action ở HomeScreen, không sửa Figma hay mở rộng bố cục khác.
- Notifications vẫn trong Tài khoản; Dịch vụ mở từ Xem tất cả ở section; xét nghiệm mở qua Dịch vụ. Đã cập nhật E2E labs đi qua đường dẫn hiện có.
- Mobile typecheck và lint đạt.
- Kiểm chứng: E2E Home đạt và E2E labs đạt sau khi đổi đường vào xét nghiệm qua section Dịch vụ; không thêm lại nút ngoài mẫu.


## 2026-11-02 — Icon Morphicons
- Cài morphicons2.0.2 + dữ liệuLucide1.66.0; AppIcon native/web + LegacyIcon cho glyph cũ, giữ ảnh/logo/maps/badges/nềnSVG. License MIT/ISC kèm docs/licenses.
- Điều hướngactive, search/filter, favorite outline→fill, tài khoản, hồ sơ/tài liệu, chat/care, header/back dùng chung đã chuyển. reducedMotion=user. Không sửa Figma hay thêm nút lối tắt ngoài mẫu.
- Full22E2Eweb đạt, typecheck/lint đạt, Android export4.3MB đạt trước phần bổ sung dưới đây.
- Người dùng làm rõ muốn thấy chuyển động: thêm PasswordField với nút mắt ở login/register/reset và search→close ngay ô tìm kiếm; không tạo idleloop. Hai trạng thái điều khiển secureTextEntry/clear/focus thật. Đang kiểm tra lại các luồng này.
- Hoàn tất kiểm chứng phần động: typecheck/lint đạt;5E2E liên quan đạt; Android export4.3MB đạt sau PasswordField/search state morph. Runtime Expo PID12416 và APIdev được giữ mở; không kiểm thử trên điện thoại vật lý trong lượt này.


## 2026-11-02 — Bản đồ thật, chờ Google Demo Key
- Người dùng chọn Google Maps API thay OpenStreetMap, rồi chọn Demo Key trước khi chuyển key tiêu chuẩn khi triển khai thật.
- Chưa có key; đã chuẩn bị GOOGLE_MAPS_WEB_API_KEY và DEMO_MAP_ID trong env/template, hướng dẫn ở docs/GOOGLE_MAPS_SETUP.md. Không cài Leaflet/WebView hoặc thay bản đồ bằng provider khác sau khi người dùng chọn Google. Bản đồ Google thật chưa được bật/kiểm chứng.
- Bước cần người dùng: tạo Demo Key bằng tài khoản Google cá nhân, tự chấp nhận điều khoản Google và thêm key vào env trênE. Sau đó tiếp tục tích hợp/kiểm tra render, marker/card selection và vị trí được cấp quyền.

## 2026-11-02 — Explore bản đồ thật
- Thay sơ đồ Explore bằng Leaflet/web và WebView/native; tám tọa độ có nguồn, đồng bộ pin/card, kéo/zoom, quyền vị trí theo thao tác.
- OSM mặc định lỗi DNS trên máy; OSM DE trả200 và trực tiếp hiển thị, chỉ dùng cho đồ án phi thương mại; ghi công luôn hiện. Không dùng CARTO keyless vì điều khoản yêu cầu key.
- Chi tiết, nguồn và phạm vi: docs/OPENSTREETMAP_SETUP.md. Typecheck/lint/API discovery đạt; web/export theo kết quả nghiệm thu cuối lượt. Chưa nghiệm thu trên điện thoại.
- Nghiệm thu cuối lượt: full web22/22 (1.9phút); Androidexport1920modules,4.5MB; typecheck/lint/APIbuild đạt. Lần chạy web đầu thiếu PLAYWRIGHT_BROWSERS_PATH đã sửa sang cacheE rồi chạy đầy đủ thành công. Live API PID23212, ExpoPID1520.

- Theo yêu cầu đổi số thành avatar: ghim48px dùng ảnh bệnh viện từ asset hiện có, JPEG96px nhúng dataURI dùng được trong iframe/WebView; logo giữ toàn hình. Không gọi thêm mạng ảnh; fallback biểu tượng bệnh viện. Typecheck/lint và Explore E2E đạt (8ảnh tải đủ, kéo/zoom/chọn/permission). Đã thấy trực tiếp bản đồ thật với avatar; proof .local/screenshots/explore-hospital-avatars.png.

## Chat Gemini và nguồn MongoDB — 2026-11-02
- Theo yêu cầu, giữ tên/avatar bác sĩ theo Figma37/38 và ghi AI mô phỏng. Dùng FigmaDesignToCode đọc2node, không sửaFigma.
- Luồng mặc định Tin nhắn chuyển sang Gemini; chat người thật cũ giữ riêng. MongoDB lưu trước, lấy lịch sử đúng user/doctor và danh mục public mới mỗi lượt rồi gọi model, lưu phản hồi vàoMongoDB.
- User đã thêmkey backend; không đưa keyclient/log. Model3.8timeout,2.5FlashLite404 cho usermới; model3.5FlashLite theo phản hồiGoogle đã200 và thật sự trả lời đúng Vinmec/Đường30Tháng4 từDB.
- API mới/adaptor tests đạt; E2E AI đạt sau sửa bộchọn tránh hiddenstack củaExpoRouter; các luồngchat/call cũ vẫnđạt. Typecheck/lint vàAndroidexport đạt. Fullweb đangghi nhận cuối lượt.
- Scope/trạng thái/giới hạn vànguồn: docs/AI_CHAT.md. Không tự gửi hồ sơ/tài liệu; service_catalog chưa có dữ liệu giá.

- Kết quả cuối: toàn bộweb23/23 đạt(2.8phút), APIAI/adapter2/2vàchatlegacyđạt, typecheck/lintđạt, Androidexport4.6MB. Gemini live đã200 và lưu câu trả lời. Proof ảnh thật ai-chat-live-gemini-390.png. Nội dung đầu tiên kiểm thửmodel3.8 lỗi vẫn giữ đúngtrạng thái failed; không biến thành câu trả lời giả.

## Chỉ đường33 — 2026-11-02
- Thay schematic bằng RealMapchung, thêmroutepolyline, GPSuseraction/consent, backendauthbooking và điểmđếnMongoDB. OSRM/FOSSGIScar thật, steps/km/ETA; GoogleMaps đểnavigation từngchặng. KhônglưuGPS vàoDB, không tựcheckin.
- API2/2vàE2E4/4liênquan đạt; typecheck/lintđạt. Lượtlive vớiQAorigin16.06,108.219trả3007.1m/251s/124điểm/9bước. Ảnh directions-live-road-390.png làtile/route thật vớiorigin giảlập, không đọcGPSngười dùng. ChưaQAthiếtbị.
- Tài liệu/nguồn/rate/privacy: docs/OPENSTREETMAP_SETUP.md. APIlivePID11976. Androidexportđangxácnhậncuốilượt.
- Androidexportđãđạt1925modules/4.6MB. Đã chỉnhpaddingroute đểghimđích khôngbị attributionche và chờđủtiletảixong trước proofảnhthật.

## Nối Hoàng39–41 vào AIchat — 2026-11-02
- User chấp thuận chưađiệnđược; giữ UI Figma voice/video/end, AI môphỏng/chưakếtnối, timerxemUI; không camera/micro/medicalrecordwrites. Chat header vàDịchvụ46đãnối; end vềchat/đơnthuốchiệncó/lịchđãkhámđểđánhgiá/lịchhẹn.
- Typecheck/lintđạt;E2EAI/care2/2 vàfinance/WebRTC3/3đạt, assertiongetUserMedia=0. Docs AI_CHAT.md vàSCREEN_MAP cậpnhật. Androidexportđangxácnhận.
- Androidexportđãđạt1930modules/4.6MB; đối chiếuảnh39/41 vàbadge gốcFigma. Hoànthiệnnútsecondarymàutint trên41 theoFigma. Khôngthaybackend/lịchkhám.

## Màn35 khớpFigma — 2026-11-02
- Đọcdesigncontext+screenshot181:3603. Thaycomponentchi tiếtlịchcũ bằng AppointmentDetailsScreen: thẻ303,avatar106x117,metadata2cột,payment thật,QR48,4hàng56px,bottomnavactiveLịchhẹn. Desktopgiới hạn480px đểgiữtỷlệmobile.
- Khôngthêmnútthừa; giữđổi/hủy/hoàn/queue/checkin/receipt/chỉđường. Reminderchỉgiảithíchchưabật, khôngtạo trạngtháipushgiả. RatingAPIcatalog; ngàychuẩnAsia/Ho_Chi_Minh,giáthực tếtrừdiscount.
- Typecheck/lintđạt và6E2Ebooking/lifecycle/checkin/navigation/finance/WebRTCđạt. Screenshotdữliệuthật appointment-35-live-{390,320}.png, khôngoverflow320;namewrapđúng. Androidexportđangxácnhận.
- Android export completed (4.6MB); final layout/typecheck/lint and live screenshots verified.
