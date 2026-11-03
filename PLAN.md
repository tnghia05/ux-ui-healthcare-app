# Kế hoạch triển khai ứng dụng đặt lịch và quản lý sức khỏe

Ngày lập: 29/10/2026 · Thư mục dự án: `E:\Code\UX_UI`

## 1. Mục tiêu đã thống nhất

- Xây dựng **app hoàn chỉnh**, có frontend, backend, cơ sở dữ liệu và các luồng nghiệp vụ hoạt động; không chỉ là giao diện bấm chuyển màn.
- Đây là dự án môn UX/UI: ưu tiên độ sát thiết kế, tính nhất quán, khả năng sử dụng và trải nghiệm trên điện thoại; code tổ chức rõ ràng, vừa đủ cho quy mô nhóm.
- Backend **NestJS + MongoDB** theo yêu cầu của người dùng.
- Frontend **React Native + Expo + TypeScript**; đã bắt đầu triển khai theo phương án này và yêu cầu tiếp tục của người dùng.
- Bao phủ 100 màn của 5 thành viên, cùng các trạng thái lỗi, đang tải, trống và thử lại. Một màn Figma có thể tương ứng với một route, tab hoặc trạng thái của cùng một màn app.
- Dữ liệu ghi phải còn sau khi đóng/mở app và khởi động lại backend. Không coi local state hoặc fixtures ở frontend là chức năng backend hoàn thành.
- Không tự chuyển yêu cầu thành app demo vì đây là môn UX/UI. Dữ liệu mẫu chỉ dùng để khởi tạo môi trường kiểm thử.

## 2. Nguồn thiết kế và hiện trạng

- [Figma của nhóm](https://www.figma.com/design/uZZH82U4pItqxxYRubWlvO).
- Page triển khai: **High-Fidelity**, ID `181:1767`.
- 100 màn gốc: wuchuy 20; Tâm 20; Nguyên 20; Hoàng 20; Nghĩa 20.
- Có thêm 21 màn/nhánh trạng thái sau đợt chuẩn hóa trước. Phải lấy lại inventory hiện tại trước khi code từng nhóm màn vì nhóm có thể tiếp tục sửa Figma.
- [Component HighFi dùng chung](https://www.figma.com/design/uZZH82U4pItqxxYRubWlvO?node-id=253-2422).
- [Các trạng thái cần kiểm tra](https://www.figma.com/design/uZZH82U4pItqxxYRubWlvO?node-id=248-3880).
- Đã lấy design context và ảnh tham chiếu Trang chủ `181:2420` để xác định hướng chuyển thiết kế sang app; **chưa tạo mã nguồn ứng dụng**.
- Thư mục đích trống khi kiểm tra. Máy có lệnh Node, npm, pnpm, Git, Docker; chưa xác nhận phiên bản tương thích, Docker daemon, Android SDK hoặc thiết bị chạy app.

## 3. Chọn công nghệ

| Phần | Phương án kế hoạch | Mục đích |
|---|---|---|
| Mobile | React Native + Expo, TypeScript | Android trước; kiến trúc hỗ trợ iOS |
| Điều hướng | Expo Router | Auth stack, 5 tab chính, màn chi tiết và modal |
| UI | Component riêng + StyleSheet + tokens từ Figma | Giữ phong cách của nhóm; không áp một UI kit khác lên thiết kế |
| Dữ liệu phía app | TanStack Query | Cache dữ liệu server, tải lại, loading/error và cập nhật sau mutation |
| State giao diện | React state; store nhỏ cho session và bản nháp nhiều bước nếu cần | Không dùng store làm cơ sở dữ liệu |
| Form | React Hook Form + schema validation | Lỗi từng trường, giữ nội dung nhập, không mất form khi quay lại |
| Backend | NestJS, REST `/api/v1`, OpenAPI | Backend dạng modular monolith; không cần microservices |
| Database | MongoDB + Mongoose | Schema, indexes, truy vấn, validation và migrations có phiên bản |
| File | Storage adapter: local private khi phát triển, S3-compatible khi triển khai | MongoDB lưu metadata; không nhúng ảnh/PDF base64 vào hồ sơ |
| Chat | WebSocket gateway + lưu messages ở MongoDB | Đồng bộ thời gian thực, lịch sử, phân trang và trạng thái gửi |
| Tác vụ nền | Worker trong cùng codebase + jobs lưu bền | OTP, thông báo, hết hạn giữ chỗ, nhắc lịch; chỉ thêm Redis/queue khi có nhu cầu thực tế |
| Kiểm thử | Unit nghiệp vụ, API integration, mobile component và E2E luồng chính | Kiểm tra hành vi, không chỉ kiểm tra màn render được |

Lý do đề xuất React Native: frontend và NestJS cùng TypeScript, giúp thống nhất hợp đồng API và giảm phần công nghệ nhóm phải học. DTO chia sẻ qua OpenAPI/client types; không import Mongoose model hoặc Nest decorators vào app. Flutter vẫn triển khai được cùng API và có thể phù hợp hơn nếu nhóm đã quen Dart. Cả hai đều có thể dựng sát Figma; độ sát phụ thuộc cách làm layout và assets.

Chọn phiên bản ổn định, tương thích tại thời điểm khởi tạo và khóa trong lockfile. Không ghi tùy tiện số phiên bản hoặc trộn nhiều package manager. Dùng development build cho tính năng native; Expo Go chỉ dùng khi kiểm tra ban đầu với thư viện tương thích.

## 4. Cấu trúc dự án dự kiến

```text
UX_UI/
  PLAN.md
  docs/
    SCREEN_MAP.csv
    ACCEPTANCE.md
  apps/
    mobile/
      app/                 # routes; không chứa toàn bộ logic màn
      src/components/      # Button, Field, Avatar, cards, feedback
      src/features/        # auth, discovery, booking, health...
      src/api/             # client, errors, query keys, generated types
      src/theme/           # màu, kiểu chữ, khoảng cách, kích thước
      src/assets/          # assets có nguồn và ánh xạ về Figma
    api/
      src/modules/         # từng domain nghiệp vụ
      src/common/          # guards, validation, exception mapping
      src/integrations/    # email, payment, video, maps, storage
      scripts/             # seed, migrations, dữ liệu phát triển
  packages/
    api-client/            # types/client sinh từ OpenAPI nếu cần
    config/                # cấu hình TS/lint dùng chung
  infra/
    compose.yaml
  tests/
    e2e/
```

Đây là cấu trúc dự kiến, chưa phải các thư mục mã nguồn đã được tạo. Không thêm web quản trị lớn ngoài 100 màn nếu chưa có nhu cầu; vẫn phải có API và tài khoản nghiệp vụ để cơ sở/bác sĩ thực hiện các thao tác cần thiết.

## 5. Điều hướng và quy tắc giao diện

5 tab thống nhất: **Trang chủ → Khám phá → Lịch hẹn → Tin nhắn → Tài khoản**.

- Tab Lịch hẹn mở danh sách 42–44; từ danh sách mới mở chi tiết 35.
- Tài khoản → Hồ sơ sức khỏe mở tổng quan 91; từ đó vào lịch sử, lần khám, kết quả và tài liệu.
- Flow đặt lịch giữ `doctorId`, `hospitalId`, `patientId`, slot, package và payment method xuyên các bước. Backend kiểm tra lại toàn bộ khi xác nhận.
- Flow xét nghiệm giữ package, phương thức lấy mẫu, địa chỉ nếu tại nhà, cơ sở và slot; tính phí trên backend.
- Mỗi route dùng ID dữ liệu thật; không trỏ mọi bác sĩ hoặc bệnh viện vào cùng một chi tiết cố định.
- Không copy tọa độ tuyệt đối của toàn bộ Figma sang app. Dùng layout co giãn, vùng cuộn, safe area và xử lý bàn phím.
- Không vẽ status bar hay home indicator giả trong nội dung app. Tôn trọng vùng hệ thống của thiết bị.
- Dùng đúng ảnh bác sĩ Việt Nam, bệnh viện Đà Nẵng và khung crop đã sửa. Asset tĩnh tải về dự án; ảnh theo dữ liệu tải từ storage. Không dùng URL Figma tạm thời ở runtime.
- Kiểm tra cỡ màn 320, 390 và 412 logical px; tên dài, font hệ thống lớn hơn, bàn phím, nội dung trống và danh sách dài.
- Nút quan trọng có vùng chạm đủ lớn; thao tác gửi có loading và chống nhấn lặp; màu không phải dấu hiệu trạng thái duy nhất.
- Các màn 12–60 tham khảo UI kit và 61–100 bổ sung phải dùng cùng bộ component, không tách thành hai phong cách.

## 6. Phạm vi chức năng và nguồn dữ liệu

| Nhóm | Frontend | Backend phải làm thật |
|---|---|---|
| Tài khoản và người thân | Đăng ký, OTP, đăng nhập, quên mật khẩu, hồ sơ và quyền chăm sóc | Hash password, session, OTP hết hạn/giới hạn thử, phân quyền từng patient |
| Khám phá | Tìm kiếm, lọc, yêu thích, chi tiết bác sĩ/bệnh viện, bản đồ | Truy vấn theo dữ liệu và tọa độ, phân trang, favorite gắn user |
| Đặt khám | Slot, gói, người khám, thanh toán, hóa đơn | Giữ/đặt chỗ, kiểm giá, chống trùng, trạng thái và lịch sử |
| Xét nghiệm | Gói, lấy mẫu tại nhà/cơ sở, đặt lịch, theo dõi | Kiểm phạm vi phục vụ, phí, slot, mẫu và kết quả |
| Check-in | QR, đến cơ sở, theo dõi số thứ tự | QR có kiểm chứng, check-in một lần, phòng khám và queue ticket |
| Ví/đổi/hủy/hoàn | Số dư, nạp tiền, đổi lịch, hủy và hoàn | Ledger, idempotency, điều kiện hủy, hoàn và đối soát |
| Tư vấn | Hội thoại, gọi thoại/video, tóm tắt | Message history, quyền phòng chat/call, signaling hoặc dịch vụ video, dữ liệu bác sĩ nhập |
| Sau khám | Điều trị, đơn thuốc, lịch thuốc, đánh giá | Dữ liệu nguồn hợp lệ, nhắc thuốc, quyền tạo/sửa của bác sĩ |
| Hồ sơ sức khỏe | Lần khám, kết quả, dị ứng, tiêm, tài liệu, chia sẻ | CRUD có quyền, file private, access log và thu hồi chia sẻ |
| Hỗ trợ | FAQ, liên hệ, cài đặt | FAQ dữ liệu, tạo ticket hỗ trợ và lưu preferences |

Không sinh chẩn đoán hoặc đơn thuốc tự động. Bác sĩ/cơ sở là nguồn nhập dữ liệu nghiệp vụ. Phải có công cụ/API được phân quyền cho các thao tác như xác nhận lấy mẫu, nhập kết quả, tiến độ hàng đợi và kết thúc tư vấn; app bệnh nhân không tự cập nhật các trạng thái đó.

## 7. Mô hình MongoDB

Các collection dự kiến, điều chỉnh tên sau khi chốt API chi tiết:

| Domain | Collections và trách nhiệm |
|---|---|
| Identity | `users`, `sessions`, `otpChallenges`, `patientProfiles`, `careGrants` |
| Directory | `hospitals`, `doctors`, `specialties`, `servicePackages`, `availabilitySlots`, `favorites` |
| Booking | `appointments`, `slotReservations`, `appointmentEvents` |
| Laboratory | `labPackages`, `labBookings`, `labSamples`, `labResults` |
| Finance | `paymentIntents`, `payments`, `wallets`, `walletEntries`, `refunds`, `coupons`, `couponRedemptions` |
| Care | `visits`, `carePlans`, `prescriptions`, `medicationSchedules`, `medicationIntakes`, `allergies`, `vaccinations` |
| Documents/privacy | `medicalDocuments`, `sharingGrants`, `accessLogs`, `insuranceCards`, `insuranceEstimates` |
| Communication | `conversations`, `messages`, `callSessions`, `notifications`, `deviceTokens`, `reviews`, `supportTickets` |
| Operations | `queueTickets`, `idempotencyRecords`, `outboxEvents`, `scheduledJobs` |

Nguyên tắc:

- `patientProfiles` độc lập với tài khoản đăng nhập: một user có thể quản lý hồ sơ bản thân/người thân qua quyền cụ thể; không mặc định biết ID là được đọc hồ sơ.
- Document liên kết bằng ObjectId; API trả ID dạng string. Đặt các chỉ số xét nghiệm và các dòng đơn thuốc có số lượng hữu hạn thành subdocuments; messages, events, logs lưu collection riêng, không dùng mảng tăng vô hạn.
- Appointment lưu snapshot tên dịch vụ, giá và đơn vị tiền tại thời điểm giao dịch; sửa bảng giá sau này không sửa hóa đơn cũ.
- Tiền VND lưu số nguyên, backend tính tổng/giảm/phụ phí; không tin số tiền frontend gửi.
- Thời điểm lưu UTC; hiển thị theo `Asia/Ho_Chi_Minh`. Giờ làm việc của cơ sở có timezone riêng. Không ghi cứng lịch tháng 10/2026 trong app.
- Index: email normalized unique; favorite `(userId,targetType,targetId)` unique; booking code unique; provider event ID/idempotency key unique theo scope; messages `(conversationId,createdAt,_id)`; quyền theo `(patientId,granteeId)`; vị trí dùng GeoJSON/2dsphere nếu truy vấn khoảng cách.
- MongoDB không thay validation và quan hệ nghiệp vụ: dùng Mongoose schema + DTO + kiểm tra ở service.
- Khi cần cập nhật nguyên tử nhiều collection, dùng transaction trên replica set. Môi trường local phải có replica set nếu kiểm thử booking/ledger kiểu này; không dùng standalone rồi bỏ transaction để test pass.

### Chống đặt trùng và sai số dư

1. Slot có capacity; giữ chỗ qua cập nhật có điều kiện, trong transaction với reservation và appointment. Một slot cá nhân capacity=1 chỉ có một reservation còn hiệu lực.
2. Reservation có hạn. Worker giải phóng giữ chỗ theo chuyển trạng thái nguyên tử; TTL chỉ dọn dữ liệu, không được dùng như bộ đếm thời gian chính xác hoặc tự giải phóng capacity.
3. Xác nhận, đổi lịch và hủy phải kiểm tra trạng thái hiện tại và version; đổi lịch giữ slot mới rồi giải phóng slot cũ trong cùng transaction.
4. Wallet debit và wallet entry phải nhất quán, không âm số dư. Payment/webhook lặp không tạo thêm lần thu hoặc nạp.
5. Side effect ra nhà cung cấp ở ngoài transaction DB. Dùng intent + outbox + idempotency để phục hồi khi timeout; không giữ transaction mở trong lúc gọi mạng.
6. Hoàn tiền theo chính sách và số đã thực thu; một khoản thu không được hoàn quá số tiền còn lại.

## 8. Trạng thái nghiệp vụ

- Appointment: `DRAFT → HELD → PENDING_PAYMENT → CONFIRMED → CHECKED_IN → IN_PROGRESS → COMPLETED`; các nhánh `EXPIRED`, `CANCELLED`, `NO_SHOW` theo điều kiện.
- Payment: `CREATED → PROCESSING → SUCCEEDED | FAILED | CANCELLED`; giao dịch chưa xác định khi timeout phải đối soát, không tự coi là thất bại hoặc thu lại.
- Refund: `REQUESTED → REVIEWING → APPROVED → PROCESSING → COMPLETED | FAILED`; có `REJECTED` và lý do.
- Lab booking: `CONFIRMED → AWAITING_COLLECTION → COLLECTED → RECEIVED → ANALYZING → RESULT_READY`; hủy theo chính sách.
- Upload: `SELECTED → VALIDATING → UPLOADING → PROCESSING → READY | FAILED`; retry không tạo bản ghi/tệp trùng.
- Message: `SENDING → SENT → DELIVERED → READ`, nhánh `FAILED` có retry và `clientMessageId` chống trùng.
- Sharing: `ACTIVE → EXPIRED | REVOKED`; kiểm tra quyền tại mỗi request, bao gồm tải file.

Frontend hiển thị trạng thái từ API; không dùng timer để tự chuyển thanh toán thành công, tự sinh kết quả hoặc tự làm giảm số thứ tự.

## 9. Hợp đồng API ban đầu

REST prefix `/api/v1`; OpenAPI là nguồn sinh types/client. Controller không trả Mongoose document thô.

| Nhóm | API dự kiến |
|---|---|
| Auth | `POST /auth/register`, `/auth/verify-otp`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password` |
| Người dùng | `GET/PATCH /me`, `GET/POST /patients`, `GET/PATCH /patients/:id`, các care grants |
| Khám phá | `GET /doctors`, `/doctors/:id`, `/hospitals`, `/hospitals/:id`, `/specialties`, `/availability`; filters/pagination trong query |
| Favorite | `GET/POST/DELETE /favorites` theo đối tượng cụ thể |
| Đặt khám | `POST /appointments`, `GET /appointments`, `GET /appointments/:id`, các action `hold`, `confirm`, `reschedule`, `cancel` |
| Tài chính | `POST /payment-intents`, `GET /payments/:id`, webhook provider; `GET /wallet`, `/wallet/entries`, `POST /wallet/topups`, `/refunds` |
| Check-in | Lấy QR có hạn, `POST /check-ins/verify`, `GET /appointments/:id/queue`; verify thuộc actor cơ sở |
| Lab | `GET /lab-packages`, `POST /lab-bookings`, `GET /lab-bookings/:id`, `/tracking`; cập nhật mẫu/kết quả bằng quyền cơ sở |
| Hồ sơ | Visits/results/prescriptions/care-plans/allergies/vaccinations dưới patient scope |
| Tài liệu | Create upload, complete upload, list metadata, authorized download, delete; kiểm MIME/signature và giới hạn 10 MB |
| Chia sẻ | Create/list/revoke sharing grants; `GET /patients/:id/access-history` |
| Chat/call | Conversations, message history; WebSocket authenticated; server cấp room/call token có quyền |
| Thông báo/hỗ trợ | Device registration, list/read notifications, medication schedules, reviews, FAQ, support tickets |

Lỗi có cấu trúc `{ code, message, fieldErrors?, requestId }`. Quy ước 401 hết session, 403 thiếu quyền, 404 không tìm thấy, 409 slot/trạng thái xung đột, 422 validation, 429 giới hạn yêu cầu. Request có thể tạo thu/đặt lịch cần idempotency key. Dùng cursor cho message/log; phân trang giới hạn cho catalog.

## 10. Dịch vụ ngoài và cấu hình

| Chức năng | Cách tích hợp và giới hạn rõ ràng |
|---|---|
| Email OTP | Email provider qua adapter; dev dùng mail inbox local. Production gửi thật, OTP hash/expire/attempt limit; không log mã hoặc dùng OTP cố định |
| SMS OTP | Chỉ bật nếu chọn xác thực bằng điện thoại; cần provider/tài khoản riêng |
| Thanh toán/nạp ví | Chọn provider hỗ trợ Việt Nam và các phương thức thực sự triển khai; tích hợp sandbox trước, xác minh webhook, đối soát; live credentials trước khi thu tiền thật |
| Apple/Google login | Provider OAuth/OIDC với kiểm chứng token ở backend; nếu chưa cấu hình thì thể hiện chưa khả dụng, không giả vờ đăng nhập thành công |
| Bản đồ/chỉ đường | Dữ liệu tọa độ thật, chọn map provider trước khi build; lấy mẫu tại nhà kiểm vùng phục vụ. API keys cấu hình theo môi trường |
| Video/voice | Chọn managed WebRTC provider hoặc signaling/STUN/TURN tự vận hành sau một thử nghiệm kỹ thuật nhỏ; kiểm quyền room, microphone/camera, mất kết nối và chi phí |
| Thông báo | Local reminder cho lịch thuốc kết hợp push cho sự kiện server. Thử trên thiết bị thật và xử lý từ chối quyền |
| Bảo hiểm | Lưu thẻ/quyền lợi có kiểm tra; ước tính tách khỏi phê duyệt chi trả. Không gọi số dự tính là quyền lợi đã được bảo hiểm xác nhận |
| Lưu file | Private storage; URL tải có hạn/quyền. Cấu hình backup và vòng đời file khi triển khai |

Sandbox và mail inbox local là môi trường phát triển/kiểm thử, không phải chức năng được trình bày là đã vận hành live. Khóa tài khoản nhà cung cấp, thiết bị và hostname là các đầu vào cần cấu hình trong giai đoạn tích hợp; không bỏ chức năng hoặc thay bằng thông báo “thành công” giả.

## 11. Thứ tự triển khai và điều kiện hoàn thành

### G0 — Chốt frontend và hợp đồng chung

- Chốt React Native hoặc Flutter; xác định Android là thiết bị nghiệm thu đầu tiên, nhu cầu iOS, thời hạn môn học và nhà cung cấp ngoài.
- Kiểm tra toolchain, khởi tạo workspace, README chạy local, env mẫu không có secrets, lint/typecheck và pipeline kiểm tra cơ bản.
- Lấy design context theo từng màn cần code; lập manifest ảnh/font/icon với node Figma và đường dẫn local.
- Chốt database model, OpenAPI khung, trạng thái nghiệp vụ và bộ token UI.
- Xong khi cả app và API khởi động được, database kết nối được; chưa tính scaffold là chức năng hoàn thành.

### G1 — Nền tảng UI + auth + hồ sơ

- Button/Field/Avatar/Header/Card/BottomTabs/Notice/Skeleton; trạng thái lỗi/disabled/loading; xử lý safe area và keyboard.
- Đăng ký → email OTP → hoàn thiện hồ sơ → cấp quyền; đăng nhập/refresh/logout/reset; lưu người thân và phân quyền cơ bản.
- Xong khi tài khoản mới dùng được qua API, mở lại app giữ đúng session, logout/revoke session đúng; chặn đọc hồ sơ của user khác.

### G2 — Khám phá + đặt khám + thanh toán đầu-cuối

- Catalog thật từ MongoDB, tìm/lọc, favorite, chi tiết từng bác sĩ/cơ sở.
- Chọn slot/gói/patient → tính giá → giữ chỗ → thanh toán → hóa đơn → danh sách/chi tiết lịch hẹn.
- Hoàn thiện payment adapter, callback/webhook và trạng thái pending/failed; không giao trạng thái thành công cho frontend tự quyết.
- Xong khi hai thiết bị tranh một slot không cùng đặt thành công; dữ liệu xuyên các bước đúng bác sĩ/patient/giá và tồn tại sau reload.

### G3 — Xét nghiệm + check-in + đổi/hủy/hoàn

- 69–76, 33–36 và 77–84: tại nhà/cơ sở, phí, địa chỉ, tracking; QR có hạn, queue từ server, đổi/hủy/hoàn.
- Bổ sung actor/API cơ sở để cập nhật tiến độ và kết quả.
- Xong khi kết quả lab đi vào đúng hồ sơ, đổi lịch không mất lịch cũ khi slot mới lỗi, check-in/hoàn tiền có chống lặp.

### G4 — Hồ sơ sức khỏe, ví và quyền riêng tư

- Đầy đủ 49–60, 61–68, 91–100: tài liệu private, metadata, download, dị ứng, tiêm, bảo hiểm, ví, coupon, support.
- Xong khi file lưu/tải được, file sai bị từ chối, chia sẻ có phạm vi/hạn/thu hồi và access history; số dư/ledger khớp.

### G5 — Tư vấn và chăm sóc sau khám

- 37–48, 85–90: chat realtime, voice/video, thông báo, review, care plan, đơn và nhắc thuốc.
- Xong khi hai tài khoản trao đổi được, reconnect không nhân đôi tin nhắn, cuộc gọi có xử lý quyền/mất mạng, dữ liệu sau khám do actor đúng tạo.

### G6 — Nghiệm thu UX và bản cài đặt

- Kiểm tra đủ 100 màn và các trạng thái bổ sung theo `docs/SCREEN_MAP.csv`.
- Đối chiếu ảnh app với Figma theo cùng kích thước; sửa crop avatar, font, khoảng cách, truncation, scroll, modal và bàn phím.
- Kiểm thử task với người dùng: tìm bác sĩ, đặt cho người thân, đổi lịch, xem kết quả, chia sẻ/thu hồi hồ sơ; ghi thời gian, lỗi và chỗ ngập ngừng để sửa.
- E2E trên Android thật; iOS nếu đã nằm trong mục tiêu và có thiết bị/cấu hình build.
- Bàn giao mã nguồn, OpenAPI, seed kiểm thử, hướng dẫn chạy/backup, tài khoản nghiệm thu và APK/build thử nghiệm.
- Không tự coi “đủ số màn” là hoàn thành nếu thao tác, dữ liệu hoặc quyền còn sai.

Không ấn định ngày hoàn thành khi chưa biết hạn nộp và khả năng làm việc của nhóm. Ước lượng sau G0, dựa trên phần chức năng đã kiểm chứng, không dựa vào số frame đơn thuần.

## 12. Chia việc cho 5 thành viên

| Người | Nhóm màn | Frontend + backend phụ trách |
|---|---|---|
| wuchuy / TV1 | 01–12, 61–68 | Auth, hồ sơ cá nhân/người thân, care grants/privacy UI; phối hợp Nghĩa về quyền hồ sơ |
| Tâm / TV2 | 13–24, 69–76 | Catalog, search/filter/maps/favorites API phối hợp Nghĩa, lab booking/tracking |
| Nguyên / TV3 | 25–36, 77–84 | Slot/appointment, payment, insurance, QR/queue, đổi/hủy/hoàn; thống nhất ledger với Nghĩa |
| Hoàng / TV4 | 37–48, 85–92 | Chat/call, notifications, appointments list, treatment/prescription/reminders, tổng quan/timeline |
| Nghĩa / TV5 | 49–60, 93–100 | Account/settings/wallet/coupon/support, clinical records/documents/estimates; quản lý asset/tokens chung nếu nhóm đồng ý |

Một người chịu trách nhiệm tích hợp navigation/tokens/API client; phân công cụ thể khi nhóm chốt. Dùng API contract và IDs chung, không tạo 5 database hoặc 5 loại Appointment khác nhau. Appointment list/chi tiết, ví/payment và patient/privacy là phần cần thống nhất trước khi chia module.

## 13. Tài liệu chính thức đã đối chiếu

- [React Native: TypeScript](https://reactnative.dev/docs/typescript): dự án mới hỗ trợ TypeScript mặc định.
- [Flutter learning pathway](https://docs.flutter.dev/learn/pathway): Flutter dùng Dart; lựa chọn frontend không ràng buộc backend NestJS.
- [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/): cơ sở lập kế hoạch tính năng native và build thiết bị.
- [NestJS MongoDB](https://docs.nestjs.com/techniques/mongodb): adapter Mongoose; kiểm tra lại tài liệu phiên bản tại lúc khởi tạo.
- [NestJS OpenAPI](https://docs.nestjs.com/openapi/introduction): sinh hợp đồng API.
- [MongoDB transactions](https://www.mongodb.com/docs/manual/core/transactions/): cập nhật nguyên tử nhiều document khi cần.
- [MongoDB unique indexes](https://www.mongodb.com/docs/manual/core/index-unique/): ràng buộc unique trên dữ liệu.

## 14. Bước kế tiếp

Chốt frontend, sau đó thực hiện G0 → G1. Bắt đầu bằng một luồng frontend/API/database hoàn chỉnh; mở rộng theo G2–G5 cho đủ phạm vi, rồi nghiệm thu G6. Kế hoạch này chưa cài dependencies, chưa chạy dịch vụ, chưa tạo database và chưa sửa thêm Figma.

## 15. Skill hỗ trợ UI/UX đã bổ sung

- Theo yêu cầu người dùng, đã cài [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) vào `C:\Users\adm\.codex\skills\ui-ux-pro-max` ngày 29/10/2026, từ nhánh `main`.
- Đọc `SKILL.md` của skill khi triển khai/review UI; tra cứu UX hoặc stack tương ứng khi cần. Không áp dụng skill này cho phần backend thuần túy.
- **Figma High-Fidelity của nhóm vẫn là nguồn thiết kế gốc** cho bố cục, màu, font, ảnh, icon và luồng. Kết quả tìm kiếm của skill là hướng dẫn bổ sung, không tự thay palette, typography, ảnh hoặc thiết kế bằng một bộ mới.
- Dùng skill để kiểm tra vùng chạm, accessibility, phản hồi tương tác, validation, loading/error/empty, safe area, responsive layout và độ mượt của danh sách/chuyển màn.
- Hướng dẫn web như ARIA, hover, CSS breakpoints phải được chuyển sang cách làm phù hợp với nền tảng mobile đã chọn; không chép nguyên vào React Native/Flutter.
- Khi gặp xung đột giữa độ sát Figma và khả năng sử dụng, ghi rõ vấn đề và đề xuất thay đổi có chủ đích; không âm thầm đổi hướng thiết kế.


## 16. Quản lý thực thi bằng Planning with Files

- Đã cài skill Planning with Files ngày 29/10/2026 từ https://github.com/OthmanAdi/planning-with-files.
- Sổ thực thi nằm trong .planning/2026-10-29-ux-ui-healthcare-app/ với task_plan.md, progress.md và findings.md; .planning/.active_plan trỏ đến plan này.
- PLAN.md là kế hoạch tổng thể; task_plan.md theo dõi trạng thái từng phase; progress.md lưu bằng chứng thực thi/kiểm thử; findings.md lưu quyết định và phát hiện.
- Đọc plan trước khi tiếp tục và cập nhật sau từng mốc. Không đánh dấu hoàn thành chức năng nếu mới có giao diện hoặc chưa kiểm thử API/dữ liệu.
- Codex with ChatGPT phụ trách lập kế hoạch/review khi kết nối đúng workspace đã được xác minh; Figma và UI UX Pro Max hỗ trợ chất lượng UI/UX.

## Cập nhật tổ chức triển khai theo chức năng
Theo yêu cầu mới, dùng docs/FUNCTIONAL_GROUPS.md và hai cột functional_group/implementation_order trong SCREEN_MAP.csv để triển khai theo A–J. Giữ G0–G6 làm mốc tham chiếu kỹ thuật/nghiệm thu. Mỗi nhóm phải nối giao diện/API/database và đường vào/ra trước khi coi hoàn thành.
