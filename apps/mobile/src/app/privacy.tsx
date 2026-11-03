import {router} from 'expo-router';
import {Text,View} from 'react-native';
import {Action,Screen,styles} from '../features/auth/ui';
import {useSession} from '../features/auth/session';
export default function Privacy(){const {user}=useSession();return <Screen><View style={styles.form}><Text style={styles.title}>Chính sách bảo mật</Text><Text style={styles.label}>Môi trường phát triển · phiên bản 2026-10-31</Text>{[
['Thông tin được lưu','Ứng dụng lưu tài khoản, mật khẩu đã băm, phiên đăng nhập, hồ sơ cá nhân, lịch khám, giao dịch ví, tin nhắn và tệp bạn tải lên. Hồ sơ sức khỏe, thẻ bảo hiểm và dữ liệu người thân do bạn nhập chưa được cơ sở y tế xác minh.'],
['Mục đích sử dụng','Dữ liệu phục vụ đăng nhập, đặt lịch, lưu hồ sơ, trao đổi với tài khoản được phân công và hỗ trợ. Nạp ví được quản trị đối soát thủ công; nhãn thẻ chỉ có 4 số cuối, không lưu số thẻ đầy đủ hoặc CVV.'],
['Quyền truy cập và chia sẻ','Hồ sơ riêng tư yêu cầu đăng nhập. Chia sẻ người chăm sóc theo phạm vi và thời hạn bạn cấp. Tài khoản phụ trách hội thoại do quản trị phân công, chưa xác minh danh tính hành nghề. Quản trị vận hành hàng đợi, đối soát giao dịch và xử lý nội dung hỗ trợ được gửi đến.'],
['Cuộc gọi và bản đồ','Gọi WebRTC trong trình duyệt cần quyền micro/camera; ứng dụng không ghi âm hay ghi hình. Tín hiệu kết nối có thể chứa thông tin mạng, được xóa sau khoảng một giờ hoặc khi kết thúc. Mở chỉ đường sẽ gửi điểm đến tới dịch vụ bản đồ ngoài.'],
['Lưu giữ và hỗ trợ','Chưa có lịch xóa tự động chung hoặc chức năng xóa tài khoản. Nhóm cần công bố đơn vị quản lý, thời hạn lưu, kênh liên hệ chính thức và quy trình thực hiện quyền dữ liệu trước khi vận hành thật. Bản này chưa được thẩm định pháp lý. Chỉ dùng dữ liệu thử nghiệm.']
].map(([title,body])=><View key={title} style={{gap:8}}><Text style={[styles.body,{fontFamily:'InterSemiBold'}]}>{title}</Text><Text style={styles.body}>{body}</Text></View>)}{user?<Action label="Trung tâm quyền riêng tư" secondary onPress={()=>router.push('/privacy/center')}/>:null}<Action label="Tôi đã đọc" onPress={()=>router.canGoBack()?router.back():router.replace('/welcome')}/></View></Screen>;}
