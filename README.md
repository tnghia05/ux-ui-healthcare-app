# UX_UI — ứng dụng sức khỏe

Source: E:\Code\UX_UI. React Native + Expo SDK 58, NestJS 12, MongoDB replica set.

## Trạng thái
G0.1 đang triển khai. API health/OpenAPI và database đã chạy kiểm chứng; mobile hiện là màn kiểm tra kết nối phát triển. 100 màn Figma vẫn chưa nghiệm thu. Theo dõi .planning/2026-10-29-ux-ui-healthcare-app/task_plan.md và progress.md.

## Chạy trên Windows PowerShell
Luôn chạy từ ổ E:

```powershell
cd E:/Code/UX_UI
. ./scripts/dev-env.ps1
pnpm install --frozen-lockfile
pnpm db:up
Copy-Item apps/api/.env.example apps/api/.env
pnpm --filter @uxui/api build
pnpm dev:api
```

Terminal thứ hai:

```powershell
cd E:/Code/UX_UI
. ./scripts/dev-env.ps1
Copy-Item apps/mobile/.env.example apps/mobile/.env
pnpm dev:mobile
```

API: http://localhost:3000/api/docs. MongoDB: 127.0.0.1:27018, replica set rs0.
Android emulator: API URL mặc định 10.0.2.2:3000/api/v1. Điện thoại thật cần đổi EXPO_PUBLIC_API_URL thành IP LAN máy tính; web dùng http://localhost:3000/api/v1.

## Kiểm tra
pnpm typecheck; pnpm lint; pnpm test; pnpm build.
Mobile build hiện là bundle Android, chưa phải APK đã ký hoặc kiểm thử thiết bị.

## Quản lý
- PLAN.md: phạm vi và kiến trúc đầy đủ.
- docs/SCREEN_MAP.csv: 100 màn, chủ sở hữu, Figma ID và trạng thái.
- docs/ACCEPTANCE.md: tiêu chí nghiệm thu.
- .planning/2026-10-29-ux-ui-healthcare-app/: kế hoạch, phát hiện, bằng chứng kiểm thử.

Cache/file tạm dự án: .local/ trên E (không commit). Không ghi/sửa ổ C theo yêu cầu người dùng. Kho dữ liệu hệ thống Docker Desktop chưa được di chuyển; cấu hình engine/storage thuộc cài đặt có sẵn của máy.

## Email xác thực local
Mailpit: http://127.0.0.1:8025 (hộp thư phát triển, không gửi ra Internet). API dùng SMTP_HOST=127.0.0.1, SMTP_PORT=1025, MAIL_FROM=noreply@uxui.local; đặt OTP_SECRET riêng ngẫu nhiên ít nhất 32 ký tự trong apps/api/.env. Không dùng secret kiểm thử khi triển khai. Đăng ký/OTP backend đã kiểm thử, UI chưa hoàn thành.

Auth hiện tại: API mới port 3001, web Expo 8081. Native Android emulator dùng EXPO_PUBLIC_API_URL=http://10.0.2.2:3001/api/v1; web dùng EXPO_PUBLIC_WEB_API_URL=http://127.0.0.1:3001/api/v1. Điện thoại thật cần IP LAN. OAuth chưa hoàn thành; quên mật khẩu qua SMTP local đã có. Trang account hiện chỉ kiểm tra phiên, chưa phải Profile hoàn chỉnh. E2E: đặt PLAYWRIGHT_BROWSERS_PATH=E:/Code/UX_UI/.local/playwright rồi pnpm exec playwright test khi API/Expo/Mailpit đang chạy.


Luồng Quên mật khẩu đã hoạt động qua SMTP local. OTP khôi phục chỉ đến hộp thư Mailpit khi địa chỉ đã đăng ký. Sau đổi mật khẩu, đăng nhập lại vì mọi phiên cũ bị thu hồi. Các dữ liệu test tài khoản/OTP không phải email gửi ra Internet.

## Luồng trang chủ hiện tại
Đăng nhập/thiết lập lần đầu → /home → /search hoặc /hospitals → /doctor/[id] hoặc /hospital/[id]. API /api/v1/discovery/* dùng Bearer session. Danh mục 8 bệnh viện và 4 bác sĩ được khởi tạo từ Figma vào MongoDB bằng setOnInsert, không ghi đè bản ghi đã có. Đặt lịch/chat/các tab chi tiết khác đang phát triển; danh mục chưa phải tích hợp dữ liệu vận hành của bệnh viện.


## Đặt khám hiện tại
Luồng /book?doctorId=... → /booking/package → /booking/patient → /booking/payment → /booking/review → /booking/success → /booking/receipt → /appointments → /appointment/[id]. Lịch mới xuất hiện tại Home.

Thanh toán tại cơ sở ghi unpaid; ví nội bộ ghi paid chỉ sau transaction debit+ledger. Không có top-up thật/cổng thẻ/PayPal/Apple Pay/Google Pay. Lịch, giá và bác sĩ là catalog nội bộ từ Figma, chưa đồng bộ hệ thống bệnh viện. Phiếu đặt khám có liên kết QR check-in; chưa có hóa đơn thuế.

E2E: bật Docker, Expo8081 và build API trước khi chạy pnpm exec playwright test. Playwright tự chạy backend3002 với database tạm riêng, proxy request của browser test sang đó và xóa đúng database tạm sau chạy. API phát triển3001 và dữ liệu người dùng được giữ. Cache/temp vẫn dùng scripts/dev-env.ps1 trên E.

## Đổi/hủy và hoàn ví nội bộ
Chi tiết lịch → đổi lịch hoặc hủy. Đổi/hủy trong ứng dụng yêu cầu trước giờ khám ít nhất1h; đây là quy tắc nội bộ, chưa phải chính sách của bệnh viện. Đổi giữ giá/gói/người khám; hủy giải phóngslot. Đã thanh toán ví thì người dùng gửi refund request → requested, không tự cộng tiền. API POST /api/v1/appointment-actions/:id/refund/approve chỉ role admin được duyệt, transaction cộng ví+ledger đúng một lần. Đã có màn quản trị duyệt; chưa nối cổng hoàn tiền ngoài.

Ví /wallet đọc số dư và50 giao dịch gần nhất; chưa có nạp tiền thật, phân trang lịch sử dài hoặc rút tiền. Các test credit ví chỉ ở database test, không credit tài khoản admin hoặc user thật.


## QR, check-in và quản trị
Chi tiết lịch → Mở mã QR check-in → Tôi đã đến cơ sở → Check-in và lấy số. Cửa sổ check-in từ30 phút trước đến60 phút sau giờ khám; QR hết hiệu lực khi đổi/hủy lịch. Đây là hàng đợi nội bộ ứng dụng, chưa đồng bộ quầy bệnh viện hoặc xác minh GPS.

Tài khoản có role admin từ server → Tài khoản → Quản trị ứng dụng: duyệt hoàn tiền vào ví, gọi số, bắt đầu và kết thúc khám. Quyền được kiểm tra lại tại API; chưa có camera scanner trong UI. Các thao tác được kiểm thử trên web; Android mới export bundle, cần QA điện thoại.

## Xét nghiệm69–76
Home → Đặt xét nghiệm → chọn gói → Tại cơ sở → chọn cơ sở Đà Nẵng → chọn ngày/giờ → xem lại → xác nhận → theo dõi. Lịch lưu trong MongoDB; cùng mã xác nhận gửi lặp chỉ tạo một lịch. Danh mục/giá từ Figma và lịch nội bộ, chưa phải lịch do bệnh viện cung cấp. Hiện mỗi cơ sở nhận một lượt mỗi khung giờ trong lịch nội bộ.

Tài khoản admin → Quản trị ứng dụng → Quản lý xét nghiệm: xác nhận tiếp nhận mẫu → bắt đầu phân tích. Không tự tăng tiến độ theo thời gian; chưa có tải/hiển thị kết quả bệnh viện. Lấy mẫu tại nhà chưa hỗ trợ, thanh toán tại cơ sở ghi chưa thanh toán. Lịch của tôi truy cập trong mục xét nghiệm. Test dùng database tạm riêng.

## Hồ sơ và tài liệu y tế93/94/95/98/99
Tài khoản → Hồ sơ sức khỏe → lần khám đã hoàn thành → kết quả/tài liệu → tải lên. Chọn PDF/JPG/PNG tối đa10MB, tên/loại/ngày và có thể liên kết lần khám. Kho hỗ trợ tìm/lọc, tải bản gốc và xóa có xác nhận. Chỉ tài khoản sở hữu được đọc metadata/nội dung hoặc xóa; tệp không public. GridFS lưu cùng MongoDB với binddata trên E; phải sao lưu cả database, metadata và GridFS chunks/files cùng nhau.

Kết quả xét nghiệm hiện là tài liệu cá nhân category lab, chưa xác minh; ứng dụng chưa OCR, trích chỉ số, kết luận sức khỏe hoặc đồng bộ hồ sơ bệnh viện. Sinh hiệu và ghi nhận chưa có hiển thị thiếu dữ liệu.96/97/100 vẫn chưa triển khai. Web đã kiểm thử upload/download/delete; native dùng DocumentPicker/FileSystem/Sharing, cần thử thiết bị, chưa có chụp ảnh trực tiếp. Danh sách giới hạn100 bản gần nhất, chưa có phân trang/antivirus/tích hợp phân quyền người thân.

## Dị ứng, bệnh nền và tiêm chủng96–97
Tài khoản → Hồ sơ sức khỏe → Dị ứng và bệnh nền/Lịch sử tiêm chủng. Thêm, chỉnh sửa, xóa có xác nhận. Mũi tiêm nhập ngày đã tiêm, số mũi và cơ sở; có tìm theo tên vắc xin. API chặn sửa/xóa bản cũ khi dữ liệu đã thay đổi, có nút tải lại thông tin. Dữ liệu tự khai chưa xác minh, chưa tích hợp hồ sơ bệnh viện/sổ tiêm hoặc tư vấn mũi nhắc. Danh sách giới hạn200 bản, chưa phân trang.

## Người thân và quyền riêng tư61–68
Tài khoản → Người thân: tạo hồ sơ, cập nhật thông tin sức khỏe tự khai và cấp quyền chăm sóc. Hồ sơ này do người tạo quản lý, không liên kết với tài khoản cá nhân của người thân. Quyền nhận qua tài khoản đã xác thực; người nhận vào Tài khoản → Quyền riêng tư → Hồ sơ được chia sẻ với tôi để chấp nhận. Không gửi email tự động.

Quyền gồm thông tin cơ bản, xem sức khỏe và sửa sức khỏe người thân. Hồ sơ cá nhân chỉ chia sẻ quyền xem; có thể cấp xem danh mục xét nghiệm/đơn thuốc hoặc tải mọi tài liệu. Family chưa có tài liệu/xét nghiệm/đơn thuốc riêng nên các quyền đó disabled. Thời hạn đến hết ngày Việt Nam đã chọn, tối đa366 ngày. Đổi quyền phải chấp nhận lại; owner có thể thu hồi, recipient có thể ngừng nhận. API kiểm lại quyền trên mỗi request; thông tin đã từng xem/tải trước thu hồi không thể lấy lại từ người nhận.

Nhật ký /privacy/audit hiển thị100 thao tác family/sharing gần nhất, không chứa ghi chú sức khỏe. Chưa có lọc tháng, phân trang, thông báo push truy cập hay nhật ký toàn bộ hệ thống. Các màn đã kiểm thử web, chưa QA native. Trang trung tâm /privacy/center khác trang thông tin quyền riêng tư cũ /privacy.

## Lịch đã khám, thông báo và đánh giá43–48/91–92
Lịch hẹn có Sắp tới, Đã khám, Đã hủy và Quá giờ. Đã khám yêu cầu trạng thái completed do quản trị hoàn thành; lịch confirmed quá hạn thuộc Quá giờ. Lịch hủy hiển thị lý do và trạng thái thanh toán thật, có đặt lại lịch. Từ completed mở hồ sơ và đánh giá bác sĩ/bệnh viện.

Đánh giá4 tiêu chí và nhận xét, một bản cho mỗi lượt khám/đối tượng. Lưu nội bộ theo tài khoản, chưa công khai/gửi bệnh viện, chưa có sửa sau gửi và không cập nhật rating tham khảo từ Figma. Chỉ owner lượt completed được gửi.

Trang chủ/Tài khoản → Thông báo hoặc Dịch vụ. Thông báo tổng hợp các mốc hiện còn lưu và có trạng thái đã đọc theo tài khoản; chưa push, nhắc lịch theo giờ hay outbox đầy đủ. Feed100mốc gần nhất không bảo đảm giữ mốc khi tài liệu nguồn bị xóa. Tổng quan/dòng thời gian trong Hồ sơ sức khỏe dùng counts và dữ liệu thật; tài liệu/ngày tiêm tự khai được phân biệt, không tự sinh chỉ số, thuốc hoặc điều trị. Dịch vụ tư vấn trực tuyến vẫn chưa hỗ trợ.

## Tin nhắn37–38
Quản trị → Phân công tài khoản bác sĩ: gán email đã xác thực cho hồ sơ bác sĩ. Đây là phân công nội bộ, chưa xác minh danh tính hành nghề/kênh chính thức bệnh viện; không tự gán admin vào bác sĩ. Bệnh nhân có lịch hợp lệ vào Tin nhắn → Mở trò chuyện từ lịch khám. Người được phân công đăng nhập tài khoản của mình để trả lời trong Tin nhắn.

Có văn bản, chọn tài liệu từ kho riêng, tải tệp có kiểm quyền, trạng thái đã gửi/đã đọc và đọc tin cũ. Cập nhật bằng polling3 giây khi màn hình đang mở; chưa WebSocket, push, gọi thoại/video hay mã hóa đầu cuối. Giới hạn30tin/phút/người/hội thoại,50tin/lần tải,500tin hiển thị/phiên. Khi đổi phân công, bác sĩ cũ mất quyền lịch sử, bác sĩ mới không nhận transcript cũ; bệnh nhân giữ lịch sử chỉ đọc và có thể mở luồng mới. Tệp gốc bị xóa sẽ không tải được từ tin nhắn.

## Chăm sóc sau khám85–90
Hồ sơ sức khỏe → Chăm sóc sau khám → chọn lần đã hoàn thành. Có thể tự ghi lại tóm tắt/kết luận và các hạng mục kế hoạch, cập nhật tiến độ; dữ liệu luôn được ghi rõ tự nhập/chưa xác minh. Chưa có bác sĩ phát hành kế hoạch hoặc đơn thuốc được xác thực; ứng dụng không đưa thuốc/chẩn đoán minh họa Figma vào hồ sơ.

Đơn thuốc → Nhập từ đơn thuốc có sẵn: chọn lần khám, chép thông tin, có thể liên kết tài liệu gốc loại prescription của chính bạn. Bản chép giữ nguyên thuốc sau lưu; nếu chép sai, lưu trữ bản cũ và nhập bản mới. Lưu trữ chỉ tác động bản chép/lời nhắc trong app. Danh sách100bản gần nhất, tối đa12thuốc/bản,6giờ/ngày/thuốc,366ngày/thuốc. Chưa hỗ trợ lịch cách ngày/PRN, kiểm tra liều hoặc tương tác thuốc.

Lịch dùng múi giờ Việt Nam UTC+7. Chỉ ghi nhận sau giờ đã nhập, không cho ghi tương lai. Ghi nhận uống/bỏ qua/chưa ghi nhận được lưu theo từng thuốc/ngày/giờ với version chống ghi đè. Hoãn15phút chỉ khi nhắc bật, mốc chưa uống/bỏ qua, ngày hiện tại và không qua nửa đêm. Trạng thái chỉ phản ánh tự ghi nhận, không xác nhận thực tế đã dùng thuốc. Nhắc trong ứng dụng cập nhật30giây khi mở màn/focus/foreground; chưa thông báo OS/push khi khóa màn hoặc đóng app. Dữ liệu aftercare mới chưa nằm trong chia sẻ quyền prescription (quyền đó hiện chỉ chia sẻ danh mục tài liệu gốc), audit family hoặc dòng thời gian.

## Khám phá14 và bệnh viện17–20
Thanh dưới → Khám phá mở sơ đồ minh họa Đà Nẵng theo Figma, chọn marker để cuộn đến thẻ cơ sở; có đủ8cơsở trong carousel,4marker minh họa. Reset đưa thẻ về Vinmec. Đây không phải map tile/GPS/toạ độ chính xác, không hiển thị km/phút giả; Chỉ đường trong chi tiết mở tìm kiếm Google Maps theo tên/địa chỉ. Search và filter dẫn sang luồng tìm kiếm hiện có.

Chi tiết bệnh viện có5tab: giới thiệu, dịch vụ, bác sĩ/chuyên khoa, ảnh phóng to, đánh giá riêng. Bác sĩ phảiactive và gắn đúnghospitalId; chỉ khi có bác sĩ thì bật đặt lịch và hiện gói khám enabled. Giá là cấu hình app, chưa đồng bộ giá bệnh viện. Cơ sở chưa có bác sĩ trongcatalog hiển thị trạng thái chưa nhận lịch. GalleryVinmec4ảnh, cơsởkhác1ảnh/logo hiện có, không tự nhân sốảnh. Đánh giá chỉ của tài khoản đang đăng nhập từcompletedvisit; không công khai nội dung người khác, không sửa rating tham khảo. Giới hạn100review trong1000lầncompletedđược lấy,100bácsĩ/catalog mỗiAPI; chưa phân trang/CMS/moderation/liveintegration.

## Tài khoản51/52, cài đặt57/58 và trợ giúp59/60
Tài khoản nay có menu theo Figma và thanh điều hướng dùng chung. Thông tin cá nhân cho sửa họ tên/số điện thoại/ngày sinh/giới tính; email verified chưa đổi. Ảnh riêng PNG/JPG2MB, tối đa4096px và12MP, lưu GridFS profile_images tách tài liệu y tế, tải luôn kiểm tài khoản/no-store. Chưa crop/stripEXIF hoặc scan ảnh; nếu chưa có ảnh dùng chữ cái đầu. Không dùng ảnh người mẫu Figma cho user.

Cài đặt → Quản lý mật khẩu: xác minh mật khẩu hiện tại, mật khẩu mới8–128ký tự, tối đa5lần thử/15phút. Transaction đổi hash, tăng credentialVersion, thu hồi tất cả phiên và mã khôi phục đang tồn tại. Đăng nhập lại sau khi đổi. Không tự đổi mật khẩu devadmin. Xóa tài khoản hiệndisabled, chưa có luồng xóa vĩnh viễn hồ sơ/giao dịch/khôi phục.

Trợ giúp có FAQ/tìm kiếm/chủ đề và Liên hệ → yêu cầu hỗ trợ trong app. Yêu cầu UUID/hash chống trùng, tối đa5/ngày/account, danh sách100mới nhất. Quản trị → Yêu cầu hỗ trợ người dùng → tiếp nhận xử lý → đánh dấu giải quyết; bản ghi version chặn ghi đè. Chưa phản hồi hội thoại/email/push hoặc liên hệ WhatsApp/Facebook/Website; không dùng phone minh họa. Chủ tài khoản và admin hỗ trợ được đọc nội dung; không nhập mật khẩu/OTP trong yêu cầu.

## Bảo hiểm83/84/100
Tài khoản hoặc Hồ sơ sức khỏe → Bảo hiểm y tế. Lưu thẻ tự nhập, sửa/xóa với version và chọn thẻ ưu tiên trong app; list chỉ hiện4ký tự cuối. Mã chỉ kiểm ký tự/sốđộdài, không phải xác thực mã BHYT. Ngày hiệu lực là ngày tự nhập. Chưa mãhóa field ở DB, chưa BHXH/insurer integration/OCR/camera riêng. Tài liệu gốc (PDF/JPG/PNG) liên kết từ kho category insurance của chính bạn; xóa metadata thẻ không xóa tài liệu gốc. Các thẻ mới không tự chia sẻ trong family/privacy scopes hiện có.

Dự tính dùng tổng chi phí tự nhập hoặc giá của lịch khám do server kiểm ownership/status. Không cho client thay giá khi chọn booking, không sửa amountVnd/payments. Người dùng tự nhập phần chi phí giả định được tính và tỷ lệ0–100% (2số lẻ), bắt buộc xác nhận giả định; bảo hiểm=floor(eligibleCostVnd*rateBasisPoints/10000), người dùng=totalCostVnd-bảo hiểm. Không tự suy ra tuyến, đồng chi trả, khấu trừ, hạn mức hoặc quyền lợi; không gửi hồ sơ/giảm giá đặt khám. Thẻ có ngày tự nhập hết hạn không được ưu tiên/dự tính. Danh sách thẻ/lịch tối đa100mục, chưa phân trang hoặc lưu lịch sử dự tính.


## Chín màn cuối 12/29/33/39–41/54–56

Xem [phạm vi và giới hạn](docs/FINAL_NINE_SCREENS.md). Tài khoản → Thẻ đã lưu / Mã giảm giá / Ví của tôi; Cài đặt → Chính sách bảo mật. Chi tiết lịch khám → Chỉ đường. Hội thoại → Gọi thoại/video (web). Quản trị → Đối soát nạp ví / Quản lý mã giảm giá.

Nạp ví dùng yêu cầu chờ quản trị đối soát theo lựa chọn người dùng, không có cổng thanh toán hoặc tài khoản ngân hàng mặc định. Chỉ duyệt sau khi tiền đã thực nhận; mã đối soát duy nhất, transaction và ledger ngăn cộng trùng. Thẻ chỉ lưu nhãn 4 số cuối/loại/chủ/hạn, không PAN/CVV và không charge được. Mã giảm giá nội bộ được kiểm tra lại và ghi lượt dùng trong transaction booking.

Gọi WebRTC thật đã kiểm thử hai browser contexts bằng media giả Chromium cùng máy; hiện host ICE, không TURN/STUN, không native trong Expo Go. Bản web cần HTTPS hoặc localhost; không nhận định đã gọi ổn qua Internet/điện thoại thật. Không bán gói khám video/thoại, không ghi âm/ghi hình, không tự xác nhận khám hoàn thành. Bản đồ ngoài lấy đích từ lịch, sơ đồ trong app chỉ minh họa.

Kiểm thử bổ sung: `apps/api/test/payments-calls.integration.test.ts`, `tests/e2e/payments-calls.spec.mjs`; dùng Mongo test và Playwright DB tách biệt như hướng dẫn phía trên. SCREEN_MAP có 100 mục đã bắt đầu triển khai, vẫn giữ chi tiết giới hạn và bước nghiệm thu thiết bị/UX; chưa coi là app production hoàn chỉnh.

Bản đồ thật ở Khám phá: xem [cấu hình OpenStreetMap](docs/OPENSTREETMAP_SETUP.md).

Chat bác sĩ AI theo Figma và nguồn MongoDB: [cấu hình, luồng dữ liệu và kiểm thử](docs/AI_CHAT.md).
