# Nguồn giao diện và tài sản
Figma file uZZH82U4pItqxxYRubWlvO, High-Fidelity 181:1767.
Component: 253:2422; states: 248:3880; Trang chủ: 181:2420.
Chưa nhập asset giao diện vào source. Ảnh/icon mặc định template Expo không phải asset thiết kế đã duyệt.
Khi triển khai từng màn: lấy design context + screenshot, tải asset gốc về local, ghi node/source/crop/callsite; kiểm ảnh bác sĩ không cắt đầu.
Chỉ dùng ảnh bác sĩ Việt Nam và bệnh viện Đà Nẵng đúng nguồn thiết kế. Không dùng URL asset Figma tạm ở runtime.

## Auth UI
- logo-light.svg: Figma Brand/Logo light (70:1709), slot medical graphic 261.9 x 62.08 tại Brand, local apps/mobile/src/assets/auth/logo-light.svg. Wordmark và subtitle là Text Inter theo context.
- checkbox.svg: Indicator I181:4079;35:1726, slot 20 x 20 khi checked.
- back.svg: I181:4086;35:1661, slot 22 x 22 trong header OTP.
- Inter Regular/SemiBold/Bold từ package @expo-google-fonts/inter local. Các SVG được render qua SvgUri + Asset local, không tham chiếu URL Figma runtime.
- google.svg tải từ context login; node phụ không hiển thị trong ảnh tham chiếu, chưa dùng trong UI OAuth chưa cấu hình.

## Intro/location/notifications
- 26 asset gốc Figma cho 181:3970/3986/4018/4137/4149/4161 được lưu apps/mobile/src/assets/intro, ánh xạ trong features/intro/assets.ts và dùng tại IntroScreens.tsx/PermissionScreens.tsx.
- Splash: wave-top 255×255, wave-bottom 170×170; logo-tube/cross/ring/camera giữ SVG gốc.
- Welcome: welcome-doctor.png slot 120×211; doctor-icon và welcome-arrow SVG. Preview onboarding: doctor1..4 PNG slot 42.692×42.692; verified/heart/search/back/curve/pagination SVG theo context, không dùng screenshot làm UI.
- Location/notification SVG 60×60; toàn bộ render local qua Asset/SvgUri. Không dùng URL asset tạm tại runtime. Các bác sĩ trong preview giữ khuôn mặt nhìn thấy.

## Discovery assets — màn 13/15/16/21/24
- 70 file tải gốc từ context Figma, không dùng ảnh chụp làm UI. Các key ánh xạ tại features/discovery/assets.ts; ảnh danh mục do API trả imageKey, frontend chỉ giải quyết key local.
- Home: hospital-home.png slot 290×114 trong card 300px; doctor-home/dot-active/dot chỉ dành trạng thái có lịch hẹn và chưa dùng khi tài khoản trống. Search/settings SVG 20px; nav SVG 24px; location 15px, heart 16px trên favorite-bg 28px.
- Danh sách 24: f1_imgNhBnhVin[1..7].png đúng từng bệnh viện, cover 340×132 ở viewport390; Bệnh viện Đà Nẵng và 199 giữ contain theo nguồn. Compact search slot72×71; ba bác sĩ f0_imgNhBacSi[1..2].png contain58×58, giữ đầu trong ảnh.
- Doctor15: portrait f2_imgPortraitBsNguynQucVit.png contain190×257; avatar48×48; stats SVG44/22px; verified17px; header heart36/20px. Số bệnh nhân/nhận xét chưa có dữ liệu hiển thị —.
- Hospital16: f3_imgNhBiaBnhVin.png cover fullwidth×222, thumbnail75×59; ba ảnh nội thất/khám dùng đúng context Vinmec. Bệnh viện khác chỉ dùng ảnh chính của chính bệnh viện, không gán ảnh Vinmec.
- Các asset dự phòng/tab/liên hệ chưa dùng vẫn lưu local, không tính là chức năng đã triển khai. Không có URL Figma tạm trong runtime.

## Discovery bổ sung — màn 22/23/49/50
- Context nguồn: 181:2885/2941/1769/1824. 41 asset gốc lưu dưới src/assets/discovery/m0..m3, map trong more-assets.ts, gộp vào registry local dùng chung.
- Filter22: Lựa chọn18×18, chấm chọn10×10, tay nắm20×20; nút chạm44px giữ hình SVG đúng kích thước. Các thanh khoảng cách/phí ở trạng thái không tương tác, có lý do dữ liệu thiếu. Chuyên khoa/đánh giá dùng radio có aria-checked và accessibilityState.
- Specialist23: bốn ảnh m1_imgNhBacSi[1..3] contain44×44; vòng mở hồ sơ30×30 và chevron16×16. Không nhân đôi dữ liệu để lấp lưới 8 mẫu, không thêm 53 đánh giá giả.
- Favorites49: ảnh m2_imgNhBacSi[1..3] contain74×74, verified circle19×19 + Text ✓ đúng layer Figma; backdrop yêu thích28×28 và tim16×16; card thực hiện mở hồ sơ khi booking chưa có.
- Favorites50 tái dùng HospitalCard ảnh đúng API imageKey từng bệnh viện, slot card350px với ảnh340×132; tim selected m3_imgVector2. Tab số lượng lấy từ kết quả thật; trạng thái trống có đường tìm kiếm.
- Ảnh kiểm chứng: .local/screenshots/specialists-390.png, favorites-doctors-390.png, favorites-hospitals-390.png, favorites-empty-390.png, filter-390.png, filter-320.png. Đã xem ảnh; bổ sung chờ đủ4 avatar trước chụp lưới.

## Booking assets và màn nối luồng
- Nguồn Figma:25=181:3188,26=181:3309,27=181:3347,28=181:3386,30=181:3452,31=181:3492,32=181:3507,35=181:3603,42=181:4480. 64 file gốc lưu src/assets/booking; map b0..b8 trong features/booking/assets.ts và registry chung.
- 25/30: avatar BS. Quốc Việt b0_imgNhBacSi contain74×74, circle xác minh +Text✓; bác sĩ khác dùng ảnh theo API imageKey. Calendar là control native động theo ngày hiện tại, không ảnh chụp và không hardcode tháng/ngày đã qua.
- 26: các icon b1_imgVector1..4 trong nền48px; radio vòng/chấm đúng SVG gốc. Gói thoại/video disabled thực tế.
- 27: hình người khám b2_imgNhNgiKham giữ SVG gốc. TextInput có nhãn/giới hạn, form giữ dữ liệu trong memory theo actor. Không đưa ghi chú sức khỏe vào URL/localStorage.
- 28: icon ví/thẻ từ b3; các cổng chưa kết nối không có nút nhập PAN/CVV. Không hiển thị số dư500k mẫu; cash là nhánh bổ sung có trạng thái unpaid.
- 30: b4 calendar/heart/user/wallet đúng từng khối, giữ màu/token. 31: huy hiệu b5_imgNpTinThanhCongHuyHiu SVG gốc; tiêu đề/tiền theo response paid hay unpaid, không ghi thành công thanh toán cho cash.
- 32: không render b6_imgAssetsQrPlaceholder như mã thật. Chỉ mã lịch + dữ liệu server, phiếu/biên nhận nội bộ, chưa phải hóa đơn thuế.
- 35/42: ảnh theo doctor imageKey, nav active dùng các SVG b8_imgVector1..5 đúng variant lịch hẹn. Không tạo lịch/video/chat giả hoặc trạng thái đã khám chỉ vì đã qua ngày.
- Ảnh QA local: booking-date/package/patient/payment/review/success/receipt-390, appointments-390/320, appointment-detail-390 và home-with-appointment-390. Đã xem toàn bộ nhóm; kiểm tra footer nằm trong viewport trước chụp.

## Lifecycle assets — 36/77/78/81/82/53
- 12 asset gốc từ context181:3663/3689/3710/3908/3922/1982, lưu src/assets/booking/l0..l5, map manage-assets.ts và registry dùng chung.
- Cancel36: radio l0_imgChnLyDo22px/chấm l0_imgDaChn theo intrinsic SVG, touch48px; TextInput lý do tùy chọn, chọn other mới bắt buộc.
- Reschedule77: các lựa chọn ngày100×44 và giờ44px là controls động, cuộn ngang7 ngày và đổi tuần, không dùng ảnh chụp lịch mẫu. Lịch cũ chỉ đổi khi API commit.
- Success78: dùng đúng l2_imgDiLchThanhCong48×48, không chồng thêm icon back. Refund81/82 dùng card/text/token có sẵn, trạng thái đọc từ API và refresh thủ công, không giả push notification.
- Wallet53: l5_imgVector1 ở slot biểu tượng số dư, các ledger thật từ API; UI regular không có500k mặc định. 500k trong ảnh QA là fixture ở database E2E riêng đã dọn.
- Screenshots QA .local/screenshots/reschedule-390.png, rescheduled-390.png, cancel-390.png, refund-request-390.png, refund-pending-390.png, refund-completed-390.png, wallet-390.png vàwallet-320.png.

QR/check-in34/79/80: thêm6 asset Figma q0–q2 trong assets/booking, dùng huy hiệu q0 cho xác nhận. QR hiển thị là SVG động từ booking đã ký HMAC; ảnh QR placeholder tải từ Figma không dùng để check-in. Admin tái sử dụng token/component hiện có.

Xét nghiệm69–76: map72 được ghép bằng các SVG nguyên bản imgVector–imgVector28/imgGroup–imgGroup2, giữ hình học350×140 và scale toàn bộ để vừa màn; nhãn đường/sông/cơ sở theo Figma. Không phải bản đồ GPS. success.svg dùng nguyên huy hiệu48×48 từ75. Header dùng component/asset đã có. Tài sản trong src/assets/lab; không URL Figma tạm ở runtime. Đã QA web390 và tracking320, cần QA native.

Records93/94/95/98/99: asset gốc trong src/assets/records; callsite RecordsScreens dùng r0_imgVector(lab22), r0_imgVector1(chevron16), r0_imgVector2(file22), r3_imgVector2(shield22), r4_imgVector(upload32). Root SVG không ghi đè kích thước. Header tái dùng asset cũ. Không dùng screenshot làm tài sản runtime; tài liệu người dùng lưu GridFS có auth.

96/97: HealthInfoScreens dùng lại r3_imgVector2(shield22), r0_imgVector1(chevron16); vaccination-calendar.svg mới từ Figma97(imgVector1,22×22). Không sửa root SVG hoặc dùng ảnh màn hình. Card danger #FFF0F2/#D93F56 theo Figma96, giữ nhãn tự khai.

61–68: src/assets/family/privacy-shield.svg từ66 imgVector1 root48×48; nav-imgVector1–5.svg từ61 tương ứng home/location/calendar/message/user root24×24. BottomBar active account dùng các SVG này, không đổi root geometry. Frame hỗ trợ plainFooter để dùng thanh điều hướng toàn chiều ngang. Avatar người thân là chữ cái đầu động trên circle, chưa có tải ảnh. Header/component dùng thư viện hiện có.

Hoàng43–48/91–92: assets/care h2(calendar/file/bell24), h3(video/hospital24 và5nav24), h4 star24, h6(doctor/lab24), h7 marker12×108. Header dùng thư viện cũ, ảnh doctor/hospital dùng catalog động, không screenshot runtime. Chọn sao tô nền control, giữ SVG outline gốc. Service nav active explore dùng5SVG h3. Photo BV48×48 clipcircle; doctor contain tránh mất đầu.

Chat37–38: assets/chat c0_imgVector2–6 là footer5mục nguyên bản từ181:4312; c1_imgFrame/c1_imgFrame1 phone/video24, c1_imgVector1 file24, c1_imgVector2 upload24 từ181:4363. Dùng SVG gốc, không screenshot/URL tạm runtime; ảnh bác sĩ dùng catalog. ChatScreen biên nhận từ cursor server, không dùng online/typing/tin nhắn mẫu Figma làm dữ liệu thật. QA390/320 có ảnh bác sĩ đủ đầu và composer trong viewport.

Aftercare85–90: assets/aftercare/file.svg từ87(root24×24 trong circle40), checked/unchecked.svg từ89(root20×20), bell.svg từ90(root24×24 trong circle64), reminder-on.svg từ90(root36×20). Header dùng bản gốc dùng chung; Photo bác sĩ động từ booking, contain tránh mất đầu. Không sửa root geometry, không dùng screenshot/tin/chỉ định minh họa làm runtime data. Trạng thái off dựng bằng control hình học theo token; trạng thái on dùng nguyên SVG Figma và role switch/aria-checked.

Tâm14/17–20: assets/explore31SVG nguyên bản từ14 và chevron17(root18×18). explore-assets.ts có99mapSlots tính hình học từ nested inset trong context Figma14, canvas390×844; mỗiSvg giữ root W/H, transformwrapper theo rect nguồn, sau đó scale cả canvas theo viewport. Không rút path/redraw/screenshot map. Bố cục ô phố/đường/sông/công viên và labels theo Figma. Halo72/current45/arrow22/recenter22/search20/filter20/location15 đúng root; mapnav19–23 và favorite-bg/heart17 dùng đúngsource14 qua props map của BottomBar/Favorite; header/photo reuseasset đã có. Marker và ảnh bệnh viện động theocatalog; có logoBVĐàNẵng vìasset hiệncó làlogo, không thay bằng ảnh tòa nhà của bệnh viện khác. Hospitalgallery tái dùng4ảnhf3 gốc; doctorảnhcontain giữđầu.

Nghĩa51/52/57–60: assets/account41SVG gốc, account-assets.ts lưu intrinsicW/H. Rows51 dùnga0_vector1/3–9(root22),chevron2(root16), avatar editbadgea0_Sanh30/a1_Sanh32 và glyph✎theoFigma; ảnhuserAPI động, fallbackinitials. BottomBar prop profile dùngđúng51navvector10–14(root24), không đổi family nav.57 bellFrame/keyFrame1/userredvector2 đúngslot;58eye a3_vector1(root22);59searcha4_vector1(root20);60headphoneFrame/messagevector2/globeFrame1/uservector3(root22), backgroundNnBiuTng40. Header dùng bản gốc library, không screenshot/temporaryURL.

Insurance83/84/100: shield.svg root28×28 từ181:2402(imgVector), dùng trong thẻtint100. Header quaylại dùngcomponentgốc root22, Row/Field/Frame/Action dùngthưviệnhiệncó. Không cóảnhthẻminh họa runtime; tài liệu gốc làsourceuser/API.100khôngseed80%/800000; kếtquảtínhthật theoassumptions server. QA ảnh3màn390 vàestimate320; nguồnchi phí gom vào disclosureselector để không đẩy kếtquảquáxa.


9 màn cuối: assets/payments/success.svg root112×112 từ181:2050 (41b0445c-19fa-44df-815b-792fb560dfc3), wallet.svg root24×24 từ181:2021 (faf2c0c9-d354-47fe-b775-15f4218195cc), tải curl -L và dùng SvgUri local. 33 tái sử dụng MapArtwork SVG gốc14, ghi rõ sơ đồ minh họa; chỉ đường thật mở dịch vụ bản đồ ngoài theo địa chỉ lịch khám. 39/40 dùng stream WebRTC thật, không dùng ảnh/video mẫu Figma làm media từ người tham gia. 29 preview thẻ dựng View/Text và chỉ hiển thị4sốcuối, không thu PAN/CVV. Header/Field/Action/Photo dùng component hiện có.
