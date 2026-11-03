from pathlib import Path
import csv
import fitz

ROOT = Path(r'E:/Code/UX_UI')
OUT = ROOT / 'docs' / 'MediConnect_Figma_to_Code_Report.pdf'
FONT = r'C:/Windows/Fonts/arial.ttf'
BOLD = r'C:/Windows/Fonts/arialbd.ttf'
doc = fitz.open()
REG = fitz.Font(fontfile=FONT)
BDF = fitz.Font(fontfile=BOLD)
W, H = 595, 842
ink = (0.06, .16, .23)
blue = (.04, .39, .61)
muted = (.35, .43, .48)

def txt(page, text, x, y, size=10, color=ink, bold=False, width=495, leading=1.35):
    f = BDF if bold else REG
    fn = 'arbd' if bold else 'ar'
    page.insert_font(fontname=fn, fontfile=BOLD if bold else FONT)
    words = str(text).split()
    line = ''
    for word in words:
        candidate = f'{line} {word}'.strip()
        if f.text_length(candidate, fontsize=size) > width and line:
            page.insert_text((x,y), line, fontname=fn, fontsize=size, color=color)
            y += size * leading
            line = word
        else: line = candidate
    if line: page.insert_text((x,y), line, fontname=fn, fontsize=size, color=color); y += size*leading
    return y

def page(title, kicker):
    p=doc.new_page(width=W,height=H)
    p.draw_rect(fitz.Rect(0,0,W,12),color=blue,fill=blue)
    txt(p,'MEDICONNECT  /  DESIGN TO CODE',50,46,9,blue,True)
    txt(p,title,50,87,23,ink,True,500)
    txt(p,kicker,50,110,10,muted)
    p.draw_line((50,122),(545,122),color=(.78,.84,.88))
    return p

def footer(p,n):
    p.draw_line((50,797),(545,797),color=(.78,.84,.88))
    txt(p,'UX/UI • Figma → React Native/Expo • 03/11/2026',50,816,8,muted)
    txt(p,f'{n} / 8',512,816,8,muted)

def section(p,heading,body,y):
    y=txt(p,heading,50,y,13,blue,True,495,1.4)
    y=txt(p,body,50,y+5,10,ink,False,495,1.43)
    return y+13

p=page('Từ Figma đến ứng dụng MediConnect','Báo cáo hướng dẫn có minh chứng • 8 trang')
y=160
y=section(p,'Đề tài và phạm vi','MediConnect – Doctor Appointment & Healthcare Management App, hướng tới SDG 3. Đây là báo cáo chung của nhóm 5 thành viên, 100 màn hình Figma: xác thực và gia đình; khám phá bác sĩ/bệnh viện; đặt khám/thanh toán; tư vấn/chăm sóc sau khám; tài khoản và hồ sơ sức khỏe.',y)
y=section(p,'Đường đi thực tế','File Figma high-fidelity → đối chiếu frame/node ID → trích thông số, asset và hành vi → React Native + Expo Router → gọi API NestJS/MongoDB → kiểm thử và sửa sai lệch.',y)
y=section(p,'Nguồn gốc minh chứng','Báo cáo tổng hợp phương pháp từ 7 PDF khác nhau trong bảng lớp (đã lọc link trùng còn 13 nhóm), rồi đối chiếu file Figma, SCREEN_MAP.csv, mã nguồn và kiểm thử của MediConnect ở E:/Code/UX_UI. Ảnh low-fidelity là tư liệu thiết kế; trích mã là mã đang tồn tại. Không xem mã AI tạo là bằng chứng đã chạy trên điện thoại.',y)
txt(p,'Figma: figma.com/design/uZZH82U4pItqxxYRubWlvO',50,677,10,blue)
txt(p,'Source: E:/Code/UX_UI  •  apps/mobile  •  apps/api',50,698,10,blue)
footer(p,1)

p=page('01  Lọc bài tham khảo đúng theo nhóm','Một nhóm có thể được 5 thành viên điền cùng link')
y=158
y=section(p,'Cách lọc','Lấy cột “Tên Nhóm” làm khóa, chuẩn hóa khoảng trắng/dấu xuống dòng, lấy link tại cột “Figma to Code” của sheet Diem GK-trước CK, rồi loại các URL lặp trong cùng nhóm. Kết quả: 13 nhóm, mỗi nhóm một nguồn duy nhất; một số nguồn là thư mục Drive hoặc DOCX nên cần mở tiếp tệp con.',y)
items=[('WellNest','11 trang; Figma MCP → Flutter; có node ID, trích code, đối chiếu.'),('EcoLoop','6 trang; plugin Figma to Code; phân tích mã HTML thô và thiếu tương tác.'),('StudyMate','5 trang; Figma JSON/SVG → Dart generator → refactor, có đường dẫn code.'),('FoodLoop','7 trang; chuẩn hóa Auto Layout, plugin và ảnh minh chứng.'),('SaveBite','13 trang; Figma MCP → Expo/React Native, mô tả hai chiều thiết kế/code.'),('JobFlow','9 trang; Figma → React Native, tokens, phân loại screen/overlay.'),('Wildguard','15 trang; Figma MCP + Codex → Flutter, đối chiếu Android.')]
for name,detail in items:
    y=txt(p,name+' — '+detail,50,y,9.5,ink,False,495,1.4)+5
y=section(p,'Kết luận áp dụng','Các bài tốt đều nêu công cụ, frame cụ thể, đầu ra mã nguồn và cách kiểm tra. Với MediConnect, dùng React Native/Expo đang có trong repo; không chép quy trình Flutter của nhóm khác.',y+8)
footer(p,2)

p=page('02  Chuẩn bị Figma trước khi sinh code','Chọn frame cụ thể và giữ dấu vết nguồn')
y=158
y=section(p,'Bước 1 — Chọn màn hình','Mở file Figma, page High-Fidelity. Chọn đúng frame trong SCREEN_MAP.csv. Ví dụ đại diện 5 phân hệ: màn 1 (181:3970), 13 (181:2420), 25 (181:3188), 37 (181:4312), 49 (181:1769). Link node giúp cả nhóm lặp lại thao tác.',y)
y=section(p,'Bước 2 — Kiểm tra lớp thiết kế','Đọc kích thước frame, Auto Layout, padding, gap, màu, kiểu chữ, ảnh và icon. Với vùng cuộn, xác định phần cố định như header/bottom tab và phần ScrollView. Kiểm tra các trạng thái loading, lỗi, rỗng và thành công trước khi viết hành vi.',y)
y=section(p,'Bước 3 — Lấy ngữ cảnh','Dùng Figma MCP hoặc Dev Mode để lấy design context và ảnh của chính frame. Xuất icon dạng SVG, ảnh raster phù hợp. Ghi node ID cạnh đường dẫn component để sau này đối chiếu. Không đưa nguyên HTML/JSX từ plugin vào React Native nếu cấu trúc và style chưa phù hợp.',y)
y=section(p,'Prompt có thể dùng lại','“Triển khai frame [NODE_ID] của MediConnect trong apps/mobile bằng React Native + Expo Router. Đọc ảnh và thuộc tính Figma trước. Kiểm tra theme, asset, component và route hiện có. Giữ kích thước, màu, chữ và khoảng cách; tách phần dùng lại; nối API thật; thêm trạng thái tải/lỗi/rỗng. Đối chiếu ở 390 và 320 px, chạy typecheck, lint và E2E liên quan. Báo rõ khác biệt còn lại.”',y)
txt(p,'Nguồn: docs/SCREEN_MAP.csv (100 dòng); Figma file uZZH82U4pItqxxYRubWlvO.',50,739,8,muted)
footer(p,3)

p=page('03  Minh chứng thiết kế của toàn nhóm','5 phân hệ, mỗi thành viên 20 màn hình')
img=Path(r'C:/Users/adm/OneDrive/Tài liệu/ChatGPT/UI/tv5-low-fidelity/51-profile.png')
if img.exists(): p.insert_image(fitz.Rect(50,145,281,645),filename=str(img),keep_proportion=True)
y=167
y=txt(p,'Đối chiếu 5 phân hệ',310,y,13,blue,True,220)+14
for line in ['TV1 • Xác thực/gia đình: màn 1, node 181:3970','TV2 • Khám phá: màn 13, node 181:2420','TV3 • Đặt khám: màn 25, node 181:3188','TV4 • Tư vấn: màn 37, node 181:4312','TV5 • Hồ sơ: màn 49, node 181:1769']:
    y=txt(p,line,310,y,9.2,ink,width=230)+12
y=txt(p,'Ảnh bên trái là một ví dụ wireframe của nhóm (màn 51). Bằng chứng phạm vi 100 màn nằm trong SCREEN_MAP.csv: đủ 20 màn cho mỗi thành viên, kèm node ID để kiểm tra trực tiếp trên Figma.',310,y,9.2,ink,width=230)+12
txt(p,'Ảnh minh họa: tv5-low-fidelity/51-profile.png; mapping: docs/SCREEN_MAP.csv.',50,715,8.5,muted)
footer(p,4)

p=page('04  Từ frame sang component React Native','Cấu trúc mã chung cho cả 5 phân hệ')
y=160
y=section(p,'Ánh xạ thành phần','Figma Frame/Auto Layout → View, hàng ngang/dọc → flexDirection, nội dung cuộn → ScrollView/FlatList, chữ → Text, nút → Pressable, ô nhập → TextInput. Màu dùng apps/mobile/src/theme/tokens.ts; điều hướng dùng Expo Router. Mỗi màn cần đọc API và phiên người dùng thay vì giữ text cố định từ thiết kế.',y)
code='''import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

export function ProfileScreen() {
  const session = useSession();
  const [name, setName] = useState(session.user?.name ?? '');
  const [busy, setBusy] = useState(false);
  // UI và logic lưu hồ sơ nằm trong cùng luồng màn hình.
}'''
p.draw_rect(fitz.Rect(50,y,545,y+190),color=(.81,.87,.9),fill=(.96,.98,.99))
yy=y+24
for line in code.splitlines(): yy=txt(p,line or ' ',62,yy,9,ink,False,470,1.6)
y+=215
y=section(p,'Đối chiếu thêm các phân hệ','Ví dụ mã trên là màn hồ sơ. Cùng quy trình áp dụng cho AuthScreen.tsx (xác thực), ExploreScreen.tsx (khám phá), PaymentScreens.tsx (đặt khám/thanh toán) và ChatScreens.tsx (tư vấn). Mỗi màn cần nguồn Figma, component, route, API và kiểm thử tương ứng; không suy mức hoàn thành của cả nhóm từ một trích đoạn.',y)
txt(p,'Nguồn: apps/mobile/src/features/profile/ProfileScreen.tsx, dòng 1–22.',50,743,8.5,muted)
footer(p,5)

p=page('05  Gắn dữ liệu và hành vi thật','Thiết kế chỉ mô tả trạng thái; ứng dụng phải xử lý nghiệp vụ')
y=160
y=section(p,'Ví dụ theo luồng nhóm','TV1: đăng ký/OTP và quản lý người thân. TV2: tìm bác sĩ, bệnh viện, xét nghiệm. TV3: chọn lịch, người khám, phương thức thanh toán và biên nhận. TV4: nhắn tin, chăm sóc sau khám. TV5: hồ sơ cá nhân và tài liệu sức khỏe. Cả 5 luồng phải nối điều hướng và trạng thái API, vì thiết kế Figma chỉ mô tả hình thức và tương tác dự kiến.',y)
y=section(p,'Xử lý dữ liệu thật','Màn đặt khám cần slot và giá từ server; ví chỉ được ghi paid sau giao dịch hợp lệ; xét nghiệm và tài liệu sức khỏe phải kiểm tra quyền. Mỗi luồng có loading, lỗi, rỗng và thành công. Không điền dữ liệu sức khỏe thật vào prompt hoặc báo cáo công khai.',y)
y=section(p,'Cấu trúc bàn giao','Giữ mapping 100 màn trong docs/SCREEN_MAP.csv. Mã giao diện đặt theo feature trong apps/mobile/src/features; API và dữ liệu ở apps/api. Lưu asset dưới apps/mobile/src/assets. Với mỗi màn ghi: node ID Figma, route, component, API, trạng thái và kết quả kiểm tra.',y)
txt(p,'Ví dụ node xuyên nhóm: 1 → 181:3970; 13 → 181:2420;',50,672,9,ink)
txt(p,'25 → 181:3188; 37 → 181:4312; 49 → 181:1769.',50,690,9,ink)
footer(p,6)

p=page('06  Kiểm chứng và ghi giới hạn','Không suy từ số file thành mức độ hoàn thiện')
y=160
y=section(p,'Bước kiểm tra có thể lặp lại','Trong E:/Code/UX_UI chạy: pnpm typecheck; pnpm lint; pnpm test; pnpm build. Để chạy E2E, bật API, Expo và dịch vụ cần thiết theo README, rồi dùng pnpm exec playwright test. Đối chiếu các màn đại diện của cả 5 phân hệ với Figma ở 390 px và 320 px; thử bấm, nhập sai, thành công, lỗi mạng và quay lại.',y)
y=section(p,'Minh chứng có thể chỉ ra','Repo có tests/e2e/auth.spec.mjs, explore.spec.mjs, booking.spec.mjs, chat.spec.mjs và account.spec.mjs cùng các bài kiểm thử API. SCREEN_MAP.csv ghi trạng thái riêng từng màn. Tệp kiểm thử hiện hữu không đồng nghĩa đã chạy lại trong lần lập báo cáo này; QA Android/iPhone phải ghi theo bằng chứng riêng.',y)
y=section(p,'Mẫu bảng nghiệm thu từng màn','Cột đề xuất: Mã màn | Node Figma | Route | Component | API | 390 px | 320 px | Tương tác | E2E | Giới hạn. Ghi “đạt” chỉ khi có ảnh đối chiếu hoặc log test đúng phiên bản; nếu chưa thử, ghi “chưa kiểm tra”.',y)
txt(p,'Nguồn: README.md; docs/SCREEN_MAP.csv; tests/e2e/*.spec.mjs.',50,712,8.5,muted)
footer(p,7)

p=page('07  Kết luận và nguồn đối chiếu','Quy trình làm lại được cho từng màn trong 100 màn')
y=154
y=section(p,'Quy trình rút gọn','1. Chọn một frame High-Fidelity. 2. Ghi node ID và lấy ảnh/thuộc tính. 3. Kiểm tra component, token, asset đã có. 4. Tạo/chỉnh mã React Native. 5. Gắn route, API và trạng thái. 6. Chạy kiểm tra. 7. So ảnh, sửa và ghi giới hạn. Lặp theo từng luồng thay vì yêu cầu sinh cả 100 màn một lần.',y)
y=section(p,'Điểm học từ bài các nhóm','WellNest và StudyMate cho thấy giá trị của node ID, đường dẫn mã và giới hạn rõ ràng; EcoLoop nêu các lỗi thường gặp của mã plugin thô; SaveBite và JobFlow gần công nghệ React Native của MediConnect. Các báo cáo này là tài liệu tham khảo phương pháp, không phải bằng chứng cho kết quả của nhóm MediConnect.',y)
sources=[('WellNest','https://drive.google.com/file/d/1T33T1GBRERbtLxFiJpxJgDCT00NRucjZ/view'),('EcoLoop','https://drive.google.com/file/d/1ALwdu1ZlOyhNZHC86SeUGmNiANosmjmF/view'),('StudyMate','https://drive.google.com/file/d/1XxKC5g-nitoGJeUVnFh9aLRk85kJCUdf/view'),('FoodLoop','https://drive.google.com/file/d/1dqWpbDIgpjfY4gcIZ4jsYeffCxmWIfZs/view'),('SaveBite','https://drive.google.com/file/d/1FFUlbQwBLriJRBC-8SxrUVIExOAKCQVH/view'),('JobFlow','https://drive.google.com/file/d/1NrzBOnf_vnFAgEaOB6R40nzd04S70VDZ/view'),('Wildguard','https://drive.google.com/file/d/10dzT1dmrmK1O3jd5vTMBI68l1qIsGusm/view')]
y=txt(p,'Các PDF đã đối chiếu trực tiếp:',50,y,11,blue,True)+4
for name,url in sources:
    y=txt(p,name+' — '+url,50,y,8.1,ink,width=500,leading=1.25)+2
txt(p,'Bảng gốc: docs.google.com/spreadsheets/d/17DHnkkZIQCg-wFBrnEXnyUp4esUkyQQ7KJHJPne4Gc4',50,744,8,muted)
footer(p,8)

OUT.parent.mkdir(parents=True,exist_ok=True)
doc.save(OUT,garbage=4,deflate=True)
print(OUT)
