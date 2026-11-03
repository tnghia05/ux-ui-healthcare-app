// Domain navigation contract. Route screens are delivered with their feature, not empty copies.
export const mainTabs = [
 {key:'home',label:'Trang chủ',figmaNode:'181:2420'},
 {key:'explore',label:'Khám phá',figmaNode:'181:2480'},
 {key:'appointments',label:'Lịch hẹn',figmaNode:'181:4480'},
 {key:'messages',label:'Tin nhắn',figmaNode:'181:4312'},
 {key:'account',label:'Tài khoản',figmaNode:'181:1869'},
] as const;
export type MainTab = typeof mainTabs[number]['key'];
export type AuthRoute = 'sign-in' | 'create-account' | 'verify-code' | 'new-password';
