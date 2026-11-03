import {hospitalCoordinates} from './hospital-coordinates.js';
// Initial local catalog from the group's Figma. Not a live hospital integration.
export const hospitals = [
 ['vinmec-da-nang','Vinmec Đà Nẵng','Đường 30 Tháng 4','Đa khoa · Tim mạch · Xét nghiệm','https://www.vinmec.com/'],
 ['hoan-my-da-nang','BV Hoàn Mỹ Đà Nẵng','291 Nguyễn Văn Linh','Đa khoa · Tim mạch · Ngoại khoa','https://hoanmy.com/'],
 ['gia-dinh-da-nang','BV Gia Đình Đà Nẵng','73 Nguyễn Hữu Thọ','Đa khoa · Nội khoa · Sản khoa','https://familyhospital.vn/'],
 ['benh-vien-da-nang','Bệnh viện Đà Nẵng','124 Hải Phòng','Đa khoa',''],
 ['benh-vien-c','Bệnh viện C Đà Nẵng','122 Hải Phòng','Đa khoa',''],
 ['benh-vien-199','Bệnh viện 199','216 Nguyễn Công Trứ','Đa khoa · Phục hồi chức năng',''],
 ['tam-tri-da-nang','BV Tâm Trí Đà Nẵng','64 Cách Mạng Tháng 8','Đa khoa · Nội khoa · Nhi khoa',''],
 ['phu-san-nhi','BV Phụ sản – Nhi Đà Nẵng','402 Lê Văn Hiến','Sản phụ khoa · Nhi · Sơ sinh',''],
].map(([id,name,address,specialties,website],i)=>({id,name,address,...(id&&hospitalCoordinates[id]?{coordinates:hospitalCoordinates[id]}:{}),city:'Đà Nẵng',specialties:specialties!.split(' · '),website,rating:4.8,imageKey:`f1_imgNhBnhVin${i||''}`,description:'Cơ sở khám chữa bệnh, cung cấp dịch vụ khám chuyên khoa và chăm sóc sức khỏe.',source:'group-figma',active:true}));
export const doctors = [
 {id:'nguyen-quoc-viet',name:'BS. Nguyễn Quốc Việt',specialty:'Tim mạch',hospitalId:'vinmec-da-nang',imageKey:'f0_imgNhBacSi',portraitKey:'f2_imgPortraitBsNguynQucVit',rating:4.9,patientCount:3500,reviewCount:5000,experienceYears:10,description:'Bác sĩ chuyên khoa Tim mạch tại Vinmec Đà Nẵng, khám và tư vấn sức khỏe tim mạch cho người lớn.'},
 {id:'le-thi-dieu-hang',name:'BS. Lê Thị Diệu Hằng',specialty:'Sản phụ khoa',hospitalId:'vinmec-da-nang',imageKey:'f0_imgNhBacSi1',rating:4.9,patientCount:1820,reviewCount:53,experienceYears:8,description:'Khám và tư vấn chuyên khoa Sản phụ khoa.'},
 {id:'nguyen-thi-my',name:'BS. Nguyễn Thị Mỹ',specialty:'Nội khoa',hospitalId:'vinmec-da-nang',imageKey:'f0_imgNhBacSi2',rating:4.9,patientCount:2360,reviewCount:87,experienceYears:11,description:'Khám và tư vấn chuyên khoa Nội khoa.'},
 {id:'nguyen-cong-canh',name:'BS. Nguyễn Công Cảnh',specialty:'Nhi khoa',imageKey:'m1_imgNhBacSi3',rating:4.9,patientCount:1640,reviewCount:62,experienceYears:9,description:'Khám và tư vấn chuyên khoa Nhi khoa.'},
 {id:'tran-minh-khoa',name:'BS. Trần Minh Khoa',specialty:'Tim mạch',hospitalId:'hoan-my-da-nang',imageKey:'f0_imgNhBacSi',rating:4.8,reviewCount:42,experienceYears:12,description:'Hồ sơ bác sĩ minh họa cho đồ án tại BV Hoàn Mỹ Đà Nẵng.'},
 {id:'pham-thi-ngoc-ha',name:'BS. Phạm Thị Ngọc Hà',specialty:'Nội khoa',hospitalId:'hoan-my-da-nang',imageKey:'f0_imgNhBacSi2',rating:4.7,reviewCount:31,experienceYears:9,description:'Hồ sơ bác sĩ minh họa cho đồ án tại BV Hoàn Mỹ Đà Nẵng.'},
 {id:'le-quang-huy',name:'BS. Lê Quang Huy',specialty:'Nội khoa',hospitalId:'gia-dinh-da-nang',imageKey:'m1_imgNhBacSi3',rating:4.8,reviewCount:36,experienceYears:11,description:'Hồ sơ bác sĩ minh họa cho đồ án tại BV Gia Đình Đà Nẵng.'},
 {id:'vo-thi-thanh-truc',name:'BS. Võ Thị Thanh Trúc',specialty:'Sản khoa',hospitalId:'gia-dinh-da-nang',imageKey:'f0_imgNhBacSi1',rating:4.9,reviewCount:28,experienceYears:8,description:'Hồ sơ bác sĩ minh họa cho đồ án tại BV Gia Đình Đà Nẵng.'},
 {id:'nguyen-van-hieu',name:'BS. Nguyễn Văn Hiếu',specialty:'Ngoại khoa',hospitalId:'benh-vien-da-nang',imageKey:'f0_imgNhBacSi',rating:4.7,reviewCount:47,experienceYears:15,description:'Hồ sơ bác sĩ minh họa cho đồ án tại Bệnh viện Đà Nẵng.'},
 {id:'tran-thi-mai-anh',name:'BS. Trần Thị Mai Anh',specialty:'Nội khoa',hospitalId:'benh-vien-da-nang',imageKey:'f0_imgNhBacSi2',rating:4.8,reviewCount:39,experienceYears:10,description:'Hồ sơ bác sĩ minh họa cho đồ án tại Bệnh viện Đà Nẵng.'},
 {id:'phan-duc-long',name:'BS. Phan Đức Long',specialty:'Tim mạch',hospitalId:'benh-vien-c',imageKey:'m1_imgNhBacSi3',rating:4.8,reviewCount:25,experienceYears:13,description:'Hồ sơ bác sĩ minh họa cho đồ án tại Bệnh viện C Đà Nẵng.'},
 {id:'ho-thi-kim-ngan',name:'BS. Hồ Thị Kim Ngân',specialty:'Nội khoa',hospitalId:'benh-vien-c',imageKey:'f0_imgNhBacSi1',rating:4.7,reviewCount:22,experienceYears:7,description:'Hồ sơ bác sĩ minh họa cho đồ án tại Bệnh viện C Đà Nẵng.'},
 {id:'dang-quoc-bao',name:'BS. Đặng Quốc Bảo',specialty:'Phục hồi chức năng',hospitalId:'benh-vien-199',imageKey:'f0_imgNhBacSi',rating:4.8,reviewCount:19,experienceYears:9,description:'Hồ sơ bác sĩ minh họa cho đồ án tại Bệnh viện 199.'},
 {id:'do-thi-phuong-linh',name:'BS. Đỗ Thị Phương Linh',specialty:'Nội khoa',hospitalId:'benh-vien-199',imageKey:'f0_imgNhBacSi2',rating:4.7,reviewCount:23,experienceYears:8,description:'Hồ sơ bác sĩ minh họa cho đồ án tại Bệnh viện 199.'},
 {id:'bui-thanh-nam',name:'BS. Bùi Thanh Nam',specialty:'Nội khoa',hospitalId:'tam-tri-da-nang',imageKey:'m1_imgNhBacSi3',rating:4.8,reviewCount:26,experienceYears:10,description:'Hồ sơ bác sĩ minh họa cho đồ án tại BV Tâm Trí Đà Nẵng.'},
 {id:'nguyen-thi-lan-chi',name:'BS. Nguyễn Thị Lan Chi',specialty:'Nhi khoa',hospitalId:'tam-tri-da-nang',imageKey:'f0_imgNhBacSi1',rating:4.9,reviewCount:34,experienceYears:12,description:'Hồ sơ bác sĩ minh họa cho đồ án tại BV Tâm Trí Đà Nẵng.'},
 {id:'truong-thi-thao-vy',name:'BS. Trương Thị Thảo Vy',specialty:'Sản phụ khoa',hospitalId:'phu-san-nhi',imageKey:'f0_imgNhBacSi2',rating:4.9,reviewCount:44,experienceYears:14,description:'Hồ sơ bác sĩ minh họa cho đồ án tại BV Phụ sản – Nhi Đà Nẵng.'},
 {id:'hoang-van-phuc',name:'BS. Hoàng Văn Phúc',specialty:'Nhi khoa',hospitalId:'phu-san-nhi',imageKey:'f0_imgNhBacSi',rating:4.8,reviewCount:37,experienceYears:11,description:'Hồ sơ bác sĩ minh họa cho đồ án tại BV Phụ sản – Nhi Đà Nẵng.'},
].map(d=>({...d,...('reviewCount' in d?{patientCount:Number(d.reviewCount)*32+480}:{}),source:'reviewCount' in d?'coursework_sample':'group-figma',active:true}));
