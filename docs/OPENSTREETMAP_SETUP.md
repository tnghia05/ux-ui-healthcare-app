# Bản đồ thật — Explore (màn 14)

Đã dùng Leaflet 1.9.4 trên web và cùng bộ render trong react-native-webview 14.0.1 trên Expo Go. Không cần Google Maps API key. Đã mở rộng sang Chỉ đường (màn33); bản đồ lấy mẫu chưa thuộc đợt này.

## Nguồn nền bản đồ

Mặc định https://tile.openstreetmap.de/{z}/{x}/{y}.png — OSM Carto German, phục vụ đồ án phi thương mại. Máy phát triển không phân giải được tile.openstreetmap.org; máy chủ DE đã trả PNG và hiển thị trực tiếp trong app. Địa danh có thể theo quy tắc bản địa hóa của kiểu bản đồ DE.

Nguồn dữ liệu © OpenStreetMap contributors (ODbL), ảnh bản đồ CC BY-SA 2.0. Ghi công và liên kết luôn hiện ở góc bản đồ, không bị thẻ bệnh viện che.

- Điều kiện máy chủ: https://openstreetmap.de/germanstyle/
- Quy tắc tải tuiles: https://operations.osmfoundation.org/policies/tiles/
- Copyright: https://www.openstreetmap.org/copyright

Chỉ tải vùng đang xem; không có offline/prefetch/bulk download. Cache dùng cơ chế trình duyệt/WebView và header máy chủ. Native nhận diện ứng dụng UXUIHealthcare/1.0. Các bài kiểm thử tự động giả lập tile, không quét dịch vụ cộng đồng. Máy chủ cộng đồng không có SLA; khi triển khai thương mại phải chọn dịch vụ cho phép mục đích và lưu lượng tương ứng hoặc tự host, cập nhật URL và ghi công theo nhà cung cấp.

Có thể đặt EXPO_PUBLIC_MAP_TILE_URL trong apps/mobile/.env rồi khởi động lại Metro. Khi đổi sang nhà cung cấp khác phải sửa attribution trong map-html.ts, allowlist liên kết trong RealMap.tsx và route mock trong tests/e2e/fixtures.mjs. Không chèn khóa bí mật backend vào biến EXPO_PUBLIC.

## Tọa độ và tương tác

Tám bệnh viện có tọa độ trong apps/api/src/discovery/hospital-coordinates.ts; mỗi mục giữ nguồn và ngày kiểm tra. Bảy điểm lấy từ đối tượng OSM, BV Gia Đình dùng tọa độ bản đồ do bệnh viện công bố tại https://familyhospital.vn/en/home/. Các điểm biểu diễn cơ sở/campus, chưa xác minh lối vào hoặc điều hướng từng chặng. Khởi động API cập nhật riêng trường coordinates cho danh mục có sẵn, không ghi đè dữ liệu khác.

Kéo/zoom bản đồ; chạm ghim chọn thẻ bệnh viện; vuốt thẻ đưa bản đồ về bệnh viện; nút xem tất cả đưa về tám điểm. Không có chấm GPS giả. Chỉ xin vị trí khi người dùng bấm nút vị trí, từ chối/lỗi sẽ xóa chấm cũ và thông báo. Không lưu vị trí người dùng vào API; việc lấy tile ở khu vực được xem có thể cho nhà cung cấp biết vùng bản đồ đang truy cập.

## Xác minh

Typecheck, lint và kiểm thử API khám phá đã đạt. Kiểm thử Explore dùng tile fixture để kiểm tra tám ghim/tọa độ, kéo, zoom, đồng bộ thẻ, 320/390px và cấp/từ chối quyền vị trí. Đã thấy nền bản đồ thật ở phiên trình duyệt phát triển. Xuất Android chỉ xác minh bundle, không thay thế nghiệm thu WebView trên điện thoại.


## Màn33 — Chỉ đường từ vị trí hiện tại

GET navigation/:bookingId xác thực quyền sở hữu lịch khám và đọc tọa độ bệnh viện từMongoDB. POST navigation/:bookingId/route nhận GPS cùng consent=true, không chấp nhận điểm đến do client tự chọn. Backend gọi OSRM/FOSSGIS để lấy geometry đường phố, distance/duration và steps; không vẽ tuyến thẳng hoặc tự tạo thời gian.

Nguồn: https://routing.openstreetmap.de/about.html và https://project-osrm.org/docs/v5.24.0/api/ . Mặc định https://routing.openstreetmap.de/routed-car; có thể cấu hình OSRM_BASE_URL cho máy chủ OSRM tương thích. Giới hạn toàn tiến trình tối đa1request/1.1giây, không scraping/prefetch. Dịch vụ cộng đồng best-effort, không cóSLA; khi nhiều instance/triển khai thương mại cần rate limiter dùng chung và nhà cung cấp phù hợp. Ghi công OSRM/FOSSGIS và liên kết Sửa bản đồ hiện trong bản đồ khi có tuyến.

GPS chỉ lấy khi bấm “Lấy vị trí và tìm đường”; timeout15giây, dịch vụ route timeout10giây. Vị trí không lưu trong hồ sơ/collection nghiệp vụ của app; điểm xuất phát/đích gửi đếnFOSSGIS và có thể xuất hiện trong log phía họ theo chính sách. Không đưa tọa độ vàoGemini. Không xin quyền nền hay theo dõi liên tục. Từ chốiGPS sẽ không gọi routing, xóa tuyến/chấmGPS cũ. Không có tọa độ thì chuyểnGoogleMaps tìm theo địa chỉ, không đặt ghim giả.

Đây là tuyến ôtô, ETA chưa tính giao thông trực tiếp. Điểm bệnh viện lấy từcampusOSM/nguồn bệnh viện, chưa xác minh cổng vào. Nút mở bản đồ dùng GoogleMaps URLs (khôngAPIkey), có origin/destination và dir_action=navigate; GoogleMaps xử lý điều hướng từng chặng/giọng nói nếu thiết bị hỗ trợ. App không tựcheck-in, không phát âm/định vị nền hoặc tựreroute khi đang di chuyển. Bấm cập nhật để lấy vị trí/tuyến mới.

Kiểm thử:2APItest đạt (ownership/consent/validation/destinationDB/khônglưuGPS, thứtựlnglat/rate limit);4E2Eliênquan đạt (Directions/Explore/finance/calls). Typecheck/lintđạt. LiveAPI trả3007.1m,251s,124điểm/9bước tớiVinmec từđiểm xuấtphát QA16.06,108.219. Screenshot .local/screenshots/directions-live-road-390.png dùng điểm QAgiảlập, nềnOSM vàrouteOSRMthật; chưađọcGPSthật của người dùng/chưa nghiệmthu thiếtbị.
