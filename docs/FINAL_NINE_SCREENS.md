# Chín màn cuối — phạm vi triển khai

Tất cả 100 mục SCREEN_MAP đã có mã giao diện/luồng ở các mức khác nhau. Điều này không phải nghiệm thu app sản xuất. Chín màn cuối không còn ở trạng thái chưa bắt đầu.

| Màn | Route | Hành vi |
|---|---|---|
|12|/privacy|Thông tin xử lý dữ liệu hiện tại; mở trung tâm quyền riêng tư; chưa phải chính sách pháp lý chính thức|
|29|/payments/add-card|Lưu nhãn thẻ riêng tư gồm loại, chủ thẻ, 4 số cuối và hạn; không PAN/CVV/token; không thể charge|
|33|/directions?id=...|Điểm đến từ lịch thuộc người dùng; sơ đồ minh họa; mở Google Maps chỉ đường thực tế|
|39/40|/calls/new → /calls/[id]|Gọi video/thoại WebRTC trên web, nhận/từ chối, bật/tắt micro/camera, kết thúc|
|41|/calls/end?id=...|Metadata thật của cuộc gọi; không thay đổi trạng thái khám hoặc tạo thông tin lâm sàng|
|54|/wallet-topup|Chọn/nhập số tiền, yêu cầu chờ đối soát, xem lịch sử yêu cầu|
|55|/wallet-topup-result?id=...|Pending/rejected/approved riêng; chỉ approved hiển thị thành công|
|56|/coupons|Mã nội bộ còn hạn; kiểm tra và chọn từ bước xem lại booking|

## Quản trị và tính nhất quán

- Quản trị → Đối soát nạp ví: kiểm tra người yêu cầu và tiền thực nhận, nhập mã đối soát duy nhất rồi duyệt. Giao dịch MongoDB cập nhật yêu cầu, wallet và ledger cùng nhau; retry không cộng thêm. Từ chối cần lý do. Không chỉnh quyết định đã chốt. Chưa có tài khoản nhận tiền/cổng thanh toán được cấu hình: dùng hỗ trợ để đối soát thủ công theo lựa chọn người dùng.
- Quản trị → Quản lý mã giảm giá: tạo mã nội bộ/ngừng mã. Không seed chiến dịch thương mại giả. Mỗi mã một lần mỗi tài khoản; mức tiền cố định, điều kiện tối thiểu và ngày hết hạn. Booking kiểm tra lại và ghi lượt dùng cùng giao dịch đặt lịch/trừ ví; hủy không hoàn lượt dùng. Số tiền phải trả tối thiểu1đ.
- Thẻ đã lưu là nhãn nhận biết, tuyệt đối không phải phương thức thanh toán đã được xác minh. Cổng thanh toán cần hosted/tokenized integration riêng.
- Cuộc gọi dùng đúng hai người của chat room và phiên phân công hiện hành. Quản trị không tự có quyền nghe/đọc tín hiệu. Hủy lịch/thu hồi phân công chặn tiếp tục; đổ chuông60giây và timeout heartbeat45giây được xét khi truy cập. Rời màn đóng media, lỗi quyền đóng thiết bị; mất máy chủ quá30giây đóng media. Tín hiệu được xóa lúc kết thúc hoặc TTL khoảng1giờ. Không ghi âm/ghi hình. Đồng hồ bắt đầu khi cả hai client báo peer connected, không phải bằng chứng đã khám.

## Giới hạn cần hoàn thiện

WebRTC hiện dùng host ICE, đã kiểm thử hai browser contexts trên cùng máy bằng thiết bị media giả của Chromium. Chưa chứng minh gọi qua Internet/khác mạng/thiết bị thật; cần TURN/STUN, triển khai HTTPS và kiểm thử mạng thực tế. Expo Go chưa có thư viện WebRTC native; cần development build và triển khai native trước khi nhận gọi trên điện thoại. Không bật các gói khám video/thoại để bán dịch vụ chưa vận hành.

Maps mở dịch vụ ngoài, không giả vị trí/distance/ETA hoặc tự check-in. QR check-in dùng luồng có sẵn. Android export không phải APK đã QA trên điện thoại. Chính sách chính thức, đơn vị vận hành và lịch lưu dữ liệu còn cần nhóm hoàn thiện.
