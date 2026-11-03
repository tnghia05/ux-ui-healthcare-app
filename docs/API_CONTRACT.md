# Hợp đồng API
REST /api/v1. OpenAPI: /api/docs và /api/docs-json.
IDs là chuỗi; thời gian ISO UTC, hiển thị Asia/Ho_Chi_Minh. Tiền là số nguyên VND.
Lỗi: {error:{code,message,details?},requestId}; không trả stack hoặc URI database.
Patient/caregiver/provider/admin phải được kiểm quyền từng tài nguyên; module auth chưa triển khai.
Booking và wallet cần transaction replica set, idempotency key và giá do server tính.
Không có endpoint giả thanh toán/OTP/kết quả khám. Health/live kiểm tra process; health/ready kiểm tra DB ping.
Module kế tiếp: auth, patients/family, catalog, appointments, labs, payments, records, messaging, support.

Password recovery: POST auth/password-reset/request trả challengeId và thông báo chung; verify trả resetToken 5 phút; complete đổi mật khẩu tối thiểu 12 ký tự và thu hồi mọi session trong transaction. Token reset chỉ ở bộ nhớ client, không đưa vào URL hoặc log. OTP tối đa 5 lần thử, request giới hạn email/IP.
