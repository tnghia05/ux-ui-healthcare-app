# 100 màn theo nhóm chức năng và luồng liền mạch

Nguồn kiểm kê: SCREEN_MAP.csv. Mỗi màn thuộc đúng một nhóm chức năng; nhóm liên kết bằng ID dữ liệu. Không đổi chủ sở hữu, Figma node hoặc trạng thái hoàn thành.

## Thứ tự triển khai

Ưu tiên cập nhật theo yêu cầu: nền tảng A → luồng trang chủ C → hoàn thiện A/B → D → E → F → G → H → I → J. Thiết kế hợp đồng thông báo, quyền hồ sơ, file và trạng thái nghiệp vụ từ đầu; tích hợp vào từng nhóm khi có sự kiện, không chờ nhóm cuối.

| Nhóm | Chức năng | Số màn | Mã màn |
|---|---|---:|---|
| A | Khởi động, tài khoản và cài đặt | 16 | 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 51, 52, 57, 58 |
| B | Người thân và quyền riêng tư | 8 | 61, 62, 63, 64, 65, 66, 67, 68 |
| C | Khám phá bác sĩ và bệnh viện | 15 | 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 46, 49, 50 |
| D | Ví, ưu đãi và bảo hiểm | 7 | 53, 54, 55, 56, 83, 84, 100 |
| E | Đặt khám và thanh toán | 8 | 25, 26, 27, 28, 29, 30, 31, 32 |
| F | Lịch hẹn, check-in, đổi/hủy/hoàn | 13 | 33, 34, 35, 36, 42, 43, 44, 77, 78, 79, 80, 81, 82 |
| G | Đặt lịch xét nghiệm | 8 | 69, 70, 71, 72, 73, 74, 75, 76 |
| H | Tư vấn và chăm sóc sau khám | 13 | 37, 38, 39, 40, 41, 47, 48, 85, 86, 87, 88, 89, 90 |
| I | Hồ sơ sức khỏe và tài liệu | 9 | 91, 92, 93, 94, 95, 96, 97, 98, 99 |
| J | Thông báo và hỗ trợ | 3 | 45, 59, 60 |

## Luồng xuyên nhóm

- Người dùng mới: A → Trang chủ 13 (C). Tài khoản 51 không phải điểm đến mặc định cuối cùng sau đăng nhập; trang account tạm hiện tại sẽ được thay.
- Đặt khám cho người thân: A → B → C → E (dùng D khi chọn ví/ưu đãi/bảo hiểm) → F → H → I.
- Xét nghiệm: A → chọn patient từ B → C → G → thanh toán dùng E nếu cần → theo dõi 76 → kết quả 94/95 thuộc I.
- Hồ sơ y tế: 51 → 91 → 92 → 93 → 94/95 hoặc 98/99; quyền chia sẻ 65–68 áp dụng xuyên suốt.
- Đánh giá: 43 → 47/48; hiển thị trong chi tiết bác sĩ/bệnh viện của C. Không cho đánh giá khi lịch chưa hoàn thành.
- Thông báo 45 mở đối tượng thật bằng appointmentId/labBookingId/conversationId/recordId, không mở một màn chi tiết cố định.

## Chi tiết từng nhóm

### A — Khởi động, tài khoản và cài đặt

Khởi động → chào mừng/giới thiệu → đăng ký hoặc đăng nhập → OTP → hoàn thiện hồ sơ → quyền vị trí/thông báo → Trang chủ. Từ Tài khoản quay lại sửa hồ sơ, cài đặt, mật khẩu.

Phần backend và điều kiện: Auth, session, password recovery, profile, preferences; quyền hệ thống bị từ chối vẫn tiếp tục được.

Màn trong nhóm:
- 01 — Màn hình khởi động (wuchuy).
- 02 — Màn hình chào mừng (wuchuy).
- 03 — Giới thiệu ứng dụng (wuchuy).
- 04 — Đăng nhập (wuchuy).
- 05 — Đăng ký tài khoản (wuchuy).
- 06 — Xác thực OTP (wuchuy).
- 07 — Tạo mật khẩu mới (wuchuy).
- 08 — Hoàn thiện hồ sơ (wuchuy).
- 09 — Cấp quyền vị trí (wuchuy).
- 10 — Nhập vị trí thủ công (wuchuy).
- 11 — Cấp quyền thông báo (wuchuy).
- 12 — Chính sách bảo mật (wuchuy).
- 51 — Tài khoản (Nghĩa).
- 52 — Thông tin cá nhân (Nghĩa).
- 57 — Cài đặt (Nghĩa).
- 58 — Quản lý mật khẩu (Nghĩa).

### B — Người thân và quyền riêng tư

Tài khoản → danh sách người thân → thêm → hồ sơ/sức khỏe → cấp quyền chăm sóc/chia sẻ → xem lịch sử → thu hồi quyền.

Phần backend và điều kiện: Patient ownership/caregiver grants, consent scopes, audit log; người thân xuất hiện trong bước chọn người khám.

Màn trong nhóm:
- 61 — Danh sách người thân (wuchuy).
- 62 — Thêm người thân (wuchuy).
- 63 — Hồ sơ người thân (wuchuy).
- 64 — Thông tin sức khỏe người thân (wuchuy).
- 65 — Quản lý quyền chăm sóc (wuchuy).
- 66 — Trung tâm quyền riêng tư (wuchuy).
- 67 — Quyền chia sẻ hồ sơ y tế (wuchuy).
- 68 — Lịch sử truy cập hồ sơ (wuchuy).

### C — Khám phá bác sĩ và bệnh viện

Trang chủ → dịch vụ/tìm kiếm → lọc → bác sĩ/bệnh viện → các tab thông tin → yêu thích → đặt khám.

Phần backend và điều kiện: Catalog, search, filters, favorites, tọa độ; đúng ảnh và dữ liệu bệnh viện Đà Nẵng, bác sĩ Việt Nam.

Màn trong nhóm:
- 13 — Trang chủ (Tâm).
- 14 — Khám phá dịch vụ (Tâm).
- 15 — Chi tiết bác sĩ (Tâm).
- 16 — Giới thiệu bệnh viện (Tâm).
- 17 — Dịch vụ điều trị (Tâm).
- 18 — Chuyên khoa bệnh viện (Tâm).
- 19 — Hình ảnh bệnh viện (Tâm).
- 20 — Đánh giá bệnh viện (Tâm).
- 21 — Tìm kiếm (Tâm).
- 22 — Bộ lọc (Tâm).
- 23 — Chuyên gia nổi bật (Tâm).
- 24 — Bệnh viện gần đây (Tâm).
- 46 — Dịch vụ (Hoàng).
- 49 — Bác sĩ yêu thích (Nghĩa).
- 50 — Bệnh viện yêu thích (Nghĩa).

### D — Ví, ưu đãi và bảo hiểm

Tài khoản → ví → nạp tiền; thêm bảo hiểm → xem dự tính; chọn ưu đãi/bảo hiểm trong luồng thanh toán.

Phần backend và điều kiện: Wallet ledger, coupon rules, insurance cards/estimates, payment adapter; dự tính không đồng nghĩa bảo hiểm đã duyệt.

Màn trong nhóm:
- 53 — Ví của tôi (Nghĩa).
- 54 — Nạp tiền (Nghĩa).
- 55 — Nạp tiền thành công (Nghĩa).
- 56 — Mã giảm giá (Nghĩa).
- 83 — Thông tin bảo hiểm y tế (Nguyên).
- 84 — Thêm thẻ bảo hiểm (Nguyên).
- 100 — Dự tính chi phí bảo hiểm (Nghĩa).

### E — Đặt khám và thanh toán

Chi tiết bác sĩ → ngày giờ → gói khám → người khám → phương thức thanh toán/thêm thẻ → xem lại → thanh toán → hóa đơn → lịch hẹn.

Phần backend và điều kiện: Slot holds, server-side price, patient permission, provider callback/idempotency, receipt. Không lưu số thẻ/CVV thô.

Màn trong nhóm:
- 25 — Đặt lịch khám (Nguyên).
- 26 — Chọn gói khám (Nguyên).
- 27 — Thông tin người khám (Nguyên).
- 28 — Phương thức thanh toán (Nguyên).
- 29 — Thêm thẻ thanh toán (Nguyên).
- 30 — Xem lại lịch khám (Nguyên).
- 31 — Thanh toán thành công (Nguyên).
- 32 — Hóa đơn điện tử (Nguyên).

### F — Lịch hẹn, check-in, đổi/hủy/hoàn

Danh sách sắp tới → chi tiết → chỉ đường → mã QR/đã đến → số thứ tự. Nhánh đổi lịch, hủy, hoàn tiền; kết quả phản ánh đúng danh sách tương ứng.

Phần backend và điều kiện: Appointment state machine, queue, signed check-in, reschedule, cancellation/refund rules; giữ chỗ mới an toàn khi đổi lịch.

Màn trong nhóm:
- 33 — Chỉ đường (Nguyên).
- 34 — Xác nhận đã đến (Nguyên).
- 35 — Lịch khám sắp tới (Nguyên).
- 36 — Hủy lịch khám (Nguyên).
- 42 — Lịch khám sắp tới (Hoàng).
- 43 — Lịch khám đã hoàn thành (Hoàng).
- 44 — Lịch khám đã hủy (Hoàng).
- 77 — Chọn lại lịch khám (Nguyên).
- 78 — Đổi lịch thành công (Nguyên).
- 79 — Mã QR check-in (Nguyên).
- 80 — Số thứ tự khám (Nguyên).
- 81 — Yêu cầu hoàn tiền (Nguyên).
- 82 — Theo dõi hoàn tiền (Nguyên).

### G — Đặt lịch xét nghiệm

Trang chủ/khám phá → danh sách xét nghiệm → chi tiết gói → phương thức lấy mẫu → cơ sở/địa chỉ → lịch → xác nhận → đặt thành công → theo dõi → kết quả 94–95.

Phần backend và điều kiện: Lab catalog, sampling method, home service area, lab booking and status; dùng lại patient/price/payment của nhóm E khi cần.

Màn trong nhóm:
- 69 — Danh sách xét nghiệm (Tâm).
- 70 — Chi tiết xét nghiệm (Tâm).
- 71 — Phương thức lấy mẫu (Tâm).
- 72 — Cơ sở xét nghiệm (Tâm).
- 73 — Ngày giờ xét nghiệm (Tâm).
- 74 — Xác nhận xét nghiệm (Tâm).
- 75 — Đặt xét nghiệm thành công (Tâm).
- 76 — Theo dõi xét nghiệm (Tâm).

### H — Tư vấn và chăm sóc sau khám

Lịch hẹn → trò chuyện → gọi thoại/video → kết thúc → tóm tắt → điều trị → đơn thuốc/chi tiết → lịch uống/nhắc → đánh giá bác sĩ hoặc bệnh viện.

Phần backend và điều kiện: Durable messages, authorized rooms/calls, clinician-authored records, medication reminders, review eligibility.

Màn trong nhóm:
- 37 — Tin nhắn (Hoàng).
- 38 — Chi tiết trò chuyện (Hoàng).
- 39 — Gọi video (Hoàng).
- 40 — Gọi thoại (Hoàng).
- 41 — Kết thúc tư vấn (Hoàng).
- 47 — Đánh giá bác sĩ (Hoàng).
- 48 — Đánh giá bệnh viện (Hoàng).
- 85 — Tóm tắt tư vấn (Hoàng).
- 86 — Kế hoạch điều trị (Hoàng).
- 87 — Đơn thuốc (Hoàng).
- 88 — Chi tiết đơn thuốc (Hoàng).
- 89 — Lịch uống thuốc (Hoàng).
- 90 — Nhắc uống thuốc (Hoàng).

### I — Hồ sơ sức khỏe và tài liệu

Tài khoản → tổng quan sức khỏe → dòng thời gian → lần khám → kết quả/chi tiết; xem dị ứng, tiêm chủng; kho tài liệu → tải lên → chia sẻ theo quyền nhóm B.

Phần backend và điều kiện: Patient-scoped clinical records, lab results, allergy/vaccine history, private file storage and validated upload.

Màn trong nhóm:
- 91 — Tổng quan hồ sơ sức khỏe (Hoàng).
- 92 — Dòng thời gian bệnh án (Hoàng).
- 93 — Chi tiết lần khám (Nghĩa).
- 94 — Kết quả xét nghiệm (Nghĩa).
- 95 — Chi tiết xét nghiệm (Nghĩa).
- 96 — Dị ứng và bệnh nền (Nghĩa).
- 97 — Lịch sử tiêm chủng (Nghĩa).
- 98 — Tài liệu y tế (Nghĩa).
- 99 — Tải lên tài liệu (Nghĩa).

### J — Thông báo và hỗ trợ

Thông báo → đúng lịch hẹn/kết quả/tin nhắn liên quan; Tài khoản → FAQ → liên hệ hỗ trợ → lưu yêu cầu.

Phần backend và điều kiện: Notification events/deep links, preferences, FAQ and persistent support tickets. Hạ tầng thông báo tích hợp sớm, không đợi làm màn 45.

Màn trong nhóm:
- 45 — Thông báo (Hoàng).
- 59 — Câu hỏi thường gặp (Nghĩa).
- 60 — Liên hệ hỗ trợ (Nghĩa).

## Điều kiện hoàn thành một nhóm

1. Giao diện theo Figma, trạng thái tải/lỗi/trống, retry và quay lại không mất lựa chọn.
2. API/database hoạt động thật; đóng/mở app hoặc tải lại không làm mất dữ liệu đã lưu.
3. Kiểm quyền theo actor và patient, không lấy role/giá/trạng thái thanh toán từ frontend.
4. Có đường vào/ra với nhóm trước/sau bằng dữ liệu thật; không có nút quan trọng im lặng hoặc thành công giả.
5. Kiểm thử luồng đầu-cuối và các lỗi nghiệp vụ chính; ghi bằng chứng vào progress.md.
6. Chỉ đánh dấu hoàn thành sau kiểm thử thiết bị và nghiệm thu UX. Đếm frame đã render không thay thế nghiệm thu.

## Quan hệ với roadmap cũ

Nhóm A–J là cách phân chia chức năng và thứ tự triển khai. G0–G6 trong PLAN.md là mốc kỹ thuật/nghiệm thu cũ, được giữ để tra cứu; không phải một danh sách screen thứ hai. SCREEN_MAP.csv bổ sung functional_group và implementation_order để ưu tiên công việc, các cột milestone cũ không bị đổi ngầm.

## Hiện trạng

04–06: UI/API auth đã E2E web, chờ thiết bị/UX và các nhánh chưa làm. 08: form dữ liệu đã E2E web, còn avatar và kiểm thử thiết bị. Các màn khác chưa được tính hoàn thành. Nhóm A chưa hoàn tất; xử lý các nhánh A còn thiếu rồi tiếp tục B.
