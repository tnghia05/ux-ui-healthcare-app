# Tiêu chí nghiệm thu ứng dụng

Tài liệu đi cùng `../PLAN.md`. Mục tiêu là ứng dụng hoàn chỉnh, có backend và dữ liệu lưu thật, ưu tiên chất lượng UX/UI.

## Điều kiện chung

- [ ] Chốt frontend và khóa các phiên bản tương thích trong lockfile.
- [ ] Chạy được bằng hướng dẫn từ máy sạch với env cấu hình riêng; không có secrets trong Git.
- [ ] API, database và file storage chạy được; seed không bắt buộc để tạo một tài khoản và đặt lịch mới.
- [ ] Tất cả 100 màn có mapping trong SCREEN_MAP.csv; trạng thái bổ sung được gắn về feature tương ứng.
- [ ] Không có nút quan trọng im lặng, báo thành công giả hoặc dẫn vào dữ liệu sai đối tượng.
- [ ] Có phân biệt loading, error, empty, disabled; giữ nội dung khi retry hoặc quay lại form.
- [ ] Dữ liệu ghi vẫn đúng sau đóng app, mở lại app và khởi động lại API.
- [ ] Không lấy tiền, giá, quyền truy cập hoặc trạng thái thanh toán từ client làm nguồn tin cậy.

## Kiểm tra UX/UI

- [ ] Đối chiếu Figma ở kích thước gốc; cùng typography, màu, thứ bậc, khoảng cách, icon và ảnh.
- [ ] Ảnh avatar đủ đầu, đúng bác sĩ; bệnh viện ở Đà Nẵng và đúng tên/ảnh.
- [ ] Kiểm tra 320/390/412 logical px, màn thấp, tên dài, font lớn, bàn phím và safe area.
- [ ] Navigation chung: tab Lịch hẹn là danh sách; Hồ sơ sức khỏe là tổng quan; back không làm mất dữ liệu đã chọn.
- [ ] Có phản hồi sau thao tác, chống gửi lặp và xác nhận với thao tác xóa/hủy/thu hồi quan trọng.
- [ ] Thử người dùng trên 5 task chính, ghi vấn đề và sửa các vấn đề cản trở hoàn thành task.

## Các luồng phải chạy đầu-cuối

1. Đăng ký → nhận OTP → xác thực → hoàn thiện hồ sơ → đăng nhập lại.
2. Quên mật khẩu → OTP sai/hết hạn/thử lại → mật khẩu mới → vô hiệu hóa phiên theo chính sách.
3. Tìm/lọc bác sĩ → đúng chi tiết → slot → gói → patient → thanh toán → hóa đơn/lịch hẹn.
4. Hai người đặt cùng slot capacity=1: tối đa một người được xác nhận; người còn lại được hướng dẫn chọn lại.
5. Payment pending/failed/success từ provider; webhook lặp hoặc retry không thu/nạp hai lần.
6. Đổi lịch thành công và thất bại; hủy → điều kiện hoàn → trạng thái hoàn → số dư/ledger khớp.
7. QR hợp lệ/hết hạn/đã dùng; check-in đúng actor và queue cập nhật từ server.
8. Xét nghiệm tại cơ sở và tại nhà → chọn địa chỉ/cơ sở/giờ → xác nhận → trạng thái mẫu → kết quả vào đúng patient.
9. Upload PDF/ảnh hợp lệ; tệp sai/quá 10 MB; mất mạng/retry; xem/tải lại; xóa theo quyền.
10. Thêm người thân → đặt cho người thân → chia sẻ có phạm vi → thu hồi → người từng được chia sẻ không còn đọc/tải được.
11. Chat hai tài khoản → reconnect → không mất/nhân đôi tin; không xem được hội thoại ngoài quyền.
12. Voice/video hai thiết bị → từ chối camera/mic → mất mạng → kết thúc và dữ liệu tư vấn đúng session.
13. Bác sĩ/cơ sở nhập care plan, đơn thuốc, kết quả; bệnh nhân chỉ sửa dữ liệu được phép.
14. Nhắc thuốc/đánh dấu đã uống, thay đổi timezone hoặc mở lại app; thông báo không lặp vô hạn.
15. Review sau lịch đã hoàn thành; favorites/settings/wallet/coupon/support lưu và tải lại đúng.

## Kiểm thử kỹ thuật cần có

- Unit: tính tiền, state transitions, permissions, OTP limits, cancel/refund policy.
- API integration dùng MongoDB replica set thật: concurrent booking, wallet/refund transaction, idempotency và quyền file.
- Mobile component: form validation, date/time selection, filter state, empty/error/retry và avatar geometry.
- E2E trên thiết bị/emulator: auth → khám phá → đặt lịch → thanh toán → lịch hẹn; lab; upload/sharing.
- Kiểm tra WebSocket auth/room ownership, message idempotency và reconnect.
- Kiểm tra restore dữ liệu trong môi trường thử trước khi coi backup là hoạt động.

## Bàn giao

- [ ] README chạy local và cấu hình dịch vụ bên ngoài.
- [ ] OpenAPI, schema/index/migration/seed có phiên bản.
- [ ] Asset manifest ánh xạ nguồn, node Figma, file local và crop/avatar.
- [ ] APK hoặc development/preview build đã thử trên thiết bị.
- [ ] Kết quả kiểm thử, danh sách chức năng live/sandbox/chưa cấu hình và điều kiện chuyển môi trường.
- [ ] Không gọi tích hợp chưa có credentials hoặc chưa kiểm thử là đã vận hành thật.
