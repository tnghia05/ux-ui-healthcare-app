# Icon dùng chung — Morphicons

Nguồn: https://www.morphicons.com/docs . Dùng Morphicons2.0.2 với dữ liệu Lucide1.66.0, cùng kiểu outline như mặc định trên playground. Đây là thư viện morph icon, không phải tên một bộ hình độc lập.

## Cách dùng

```tsx
import {AppIcon} from '../components/icons/AppIcon';
<AppIcon name="search" size={20} />
<AppIcon name={visible ? 'eye' : 'eye-off'} size={20} />
<AppIcon name="heart" filled={favorite} color={favorite ? '#FF6B80' : '#0C1F42'} size={16} />
```

- registry.ts chỉ import dữ liệu Lucide, không gọi API DOM của Lucide. AppIcon.tsx dùng morphicons/react-native, AppIcon.web.tsx dùng morphicons/react.
- Mặc định24px, stroke1.75, màu ink từ theme, spring snappy; reducedMotion=user cho mọi instance. Native dùng react-native-svg đã có trong Expo; không thêm native module hay yêu cầu quyền thiết bị.
- Thay name/filled tại cùng vị trí React để morph thật. Không đổi key theo trạng thái. Lần mount đầu không có animation.
- Không đặt label cho icon trang trí bên trong nút đã có accessibilityLabel/text. Icon độc lập có thể đặt label.
- LegacyIcon.tsx là adapter cho các tên asset cũ: đổi glyph thao tác sang semantic icon nhưng giữ callsite, kích thước slot và bố cục. Code mới dùng AppIcon trực tiếp.
- Màu active của thanh điều hướng lấy từ route. Yêu thích dùng outline→fill; quản lý mật khẩu đổi eye/eye-off theo secureTextEntry thật.
- Ảnh bác sĩ/bệnh viện, logo thương hiệu, bản đồ, badge thành công và các hình nền trang trí vẫn là asset gốc, không biến chúng thành icon khác. Không sửa Figma trong thay đổi này.

## Phạm vi

Điều hướng dùng chung; back/search/filter/favorite; tài khoản/cài đặt/trợ giúp; biểu tượng gói khám/thanh toán; hồ sơ sức khỏe/tài liệu; chăm sóc sau khám; chat; quyền riêng tư/bảo hiểm; icon thao tác trên Explore. Các map paths, halo, nền tròn và badge vẫn dùng SVG gốc khi đi qua adapter.

## License

Morphicons MIT; Lucide ISC. Bản notice tương ứng được giữ trong docs/licenses/morphicons-LICENSE.txt và docs/licenses/lucide-LICENSE.txt. Hai package và phiên bản cụ thể được ghi trong pnpm-lock.yaml.

## Chuyển động theo thao tác

PasswordField ở đăng nhập/đăng ký/khôi phục dùng một AppIcon ổn định, đổi eye-off↔eye đồng thời đổi secureTextEntry thật. Ô tìm kiếm đổi search↔close theo nội dung nhập; click ở trạng thái search focus ô nhập, click close xóa từ khóa. Icon đứng yên khi trạng thái không đổi, không chạy vòng lặp trang trí. App luôn tôn trọng Reduce Motion.
