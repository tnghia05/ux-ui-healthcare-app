# Chat bác sĩ mô phỏng bằng Gemini

## Luồng đã triển khai

App → POST /api/v1/ai-chat/:doctorId/messages → backend xác thực tài khoản/consent → MongoDB lưu tin người dùng và trạng thái pending → đọc lịch sử của đúng tài khoản/bác sĩ, đọc danh mục MongoDB → Gemini API → MongoDB lưu phản hồi → app đọc lại qua backend.

Giao diện giữ tên/ảnh bác sĩ, thẻ thông tin, bong bóng xanh/xám và thanh nhập theo Figma màn37 (181:4312),38 (181:4363). Dòng “AI mô phỏng · Dùng cho đồ án” luôn hiện. Không mạo nhận người trong ảnh đang trả lời. Lời chào khởi tạo được ghi rõ tự động, không phải phản hồi Gemini.

## Nguồn dữ liệu trả lời

AiGroundingService truy vấn trực tiếp các collection doctors, hospitals và service_catalog mỗi lượt; không lấy thông tin bác sĩ/bệnh viện từ trí nhớ model hay hằng số phía app. Hiện có4bác sĩ và8bệnh viện trong danh mục. Mỗi loại tối đa50mục, whitelist trường công khai, giới hạn độ dài. Hệ thống gửi cả danh mục nhỏ hiện tại, chưa dùng vector DB. Mỗi lượt lưu grounding.retrievedAt cùng ID nguồn để đối chiếu.

Các trường gồm tên, chuyên khoa, liên kết bệnh viện, địa chỉ, mô tả, website và thông tin tham khảo đã có trong database. service_catalog chỉ được sử dụng nếu đã có dữ liệu active; hiện giá gói khám/xét nghiệm của các luồng cũ vẫn là hằng số backend nên không tự coi là danh mục giá MongoDB. Khi thiếu dữ liệu, prompt yêu cầu nói chưa có; không suy đoán giờ làm, lịch trống, phí hoặc địa chỉ mới.

Không gửi toàn bộ database cho model. Không đọc tài khoản, session, hồ sơ sức khỏe, tài liệu, chat bác sĩ cũ hoặc dữ liệu người khác. Phạm vi hiện tại là danh mục công khai cộng nội dung hội thoại AI của chính người dùng. Thông tin danh mục là dữ liệu đồ án; không phải tích hợp trực tiếp bệnh viện. Ghi chú bảo vệ trong prompt giảm rủi ro bịa thông tin, không bảo đảm model tuyệt đối chính xác.

## Cấu hình

Backend apps/api/.env:

    GEMINI_API_KEY=<key riêng>
    GEMINI_MODEL=gemini-3.5-flash-lite

Không đặt key vào EXPO_PUBLIC hoặc commit .env. Key chỉ gửi trong header x-goog-api-key từ backend tới Google, không gửi về client. Model đã xác minh phản hồi HTTP200 cho tài khoản hiện tại. Model3.8 ban đầu timeout;2.5FlashLite bị Google báo không còn dành cho người dùng mới và đề nghị3.5FlashLite. Backend dùng REST generateContent còn được Google hỗ trợ; có thể chuyển adapter sang Interactions sau mà giữ nguyên hợp đồng với app.

Nguồn chính thức:
- https://ai.google.dev/gemini-api/docs/api-key
- https://ai.google.dev/gemini-api/docs/generate-content/text-generation
- https://ai.google.dev/gemini-api/docs/interactions-overview

Google xử lý nội dung chat và danh mục được gửi; không đồng nghĩa dữ liệu không lưu/không dùng ở phía nhà cung cấp. Người dùng bấm đồng ý trước gửi. Chỉ dùng dữ liệu giả trong đồ án; chính sách dữ liệu/quota/chi phí theo tài khoản Gemini, không tự nâng billing. Không ghi APIkey hoặc payload y tế vào log chẩn đoán.

## Dữ liệu và độ bền

Collection ai_chat_rooms khóa theo userId+doctorId; ai_chat_turns lưu lượt hỏi/đáp, seq, thời gian, trạng thái và metadata nguồn. Idempotency key ngăn gửi trùng, kể cả gửi đồng thời. Mỗi tài khoản tối đa10lượt mới/phút, cùng một bác sĩ chỉ một lượt đang xử lý; tin lỗi gần nhất được thử lại tối đa3lần tổng cộng. Gemini timeout45s, công việc pending quá60s sẽ được chuyển failed khi mở/đọc lại, không tự gọi lại gây nhân chi phí. Chỉ lấy10lượt thành công trước đó làm ngữ cảnh; UI hiện50lượt gần nhất.

Đây là tác vụ async trong tiến trình API với lease/khôi phục trạng thái lỗi trong MongoDB, chưa có hàng đợi worker bền vững tự động tiếp tục sau restart. Không có tool-calling, đọc tệp, chẩn đoán hoặc kê đơn. Nút đính kèm giữ vị trí thiết kế và giải thích chưa gửi tài liệu. Nút gọi đã nối màn mô phỏng39/40 và kết thúc41, không bật thiết bị hay gọi provider giọng nói. Hội thoại người thật trước đây giữ riêng dưới “Hội thoại với người phụ trách”; không tự đưa lịch sử cũ lên Gemini.

## Kiểm chứng

- API integration: quyền riêng tư, consent, khóa thiếu, lưu trước khi gọi model, nguồn MongoDB đọc mới mỗi lượt, trường riêng không bị gửi, idempotency, lỗi/quota/retry, pending quá hạn và rate limit.
- Adapter: key ở header, schema yêu cầu, bỏ phần thought, từ chối phản hồi bị chặn/cắt cụt/lỗi.
- E2E UI: danh sách đúng bác sĩ, consent, pending, lỗi/thử lại, quay lại giữ lịch sử,320/390px, trạng thái chưa cấu hình; phản hồi Gemini giả lập chỉ trong test.
- Live: một câu hỏi công khai về BS.Nguyễn Quốc Việt đã đi qua backend/MongoDB/Gemini thật, trả đúng VinmecĐàNẵng và Đường30Tháng4. Ảnh thực tế .local/screenshots/ai-chat-live-gemini-390.png. Chưa nghiệm thu trên thiết bị thật.


## Nối màn39–41 vào chat AI

- Tin nhắn → bác sĩ → Gọi thoại/Gọi video → /calls/demo (mode=voice/video, doctorId đúng hồ sơ) → Kết thúc cuộc gọi → /calls/demo-end.
- Tên/ảnh/chuyên khoa đọc từ API danh mụcMongoDB. Bố cục đối chiếu node181:4407,181:4433,181:4453. Ảnh nhỏ video là ảnh mẫu Figma có nhãn, không phải camera người dùng.
- Timer là thời gian xem mô phỏng, không phải thời gian kết nối. Nút micro/camera/loa chỉ đổi trạng thái UI; không gọi getUserMedia, xin quyền hay tạo call session thật. Không ghi nhận một buổi khám hoàn thành.
- Màn41 nối về nội dung trao đổi AI, danh sách đơn thuốc đang có, lịch đã khám để chọn đánh giá47/48 và lịch khám42. Không tạo tóm tắt lâm sàng/đơn thuốc từ cuộc gọi mô phỏng.
- Dịch vụ46 → Nhắn tin với bác sĩ mở danh sáchchatAI;45Thôngbáo và42–44Lịch khám giữ đường vào hiện có.
- E2E mô phỏng giám sát getUserMedia=0, chuyểnvoice→video/tắt camera/kết thúc/quaylạichat; chăm sóc/đánhgiá vàWebRTCngười thật cũ vẫn qua kiểm thử. Ảnh .local/screenshots/demo-call-{voice,video,end}-390.png.
