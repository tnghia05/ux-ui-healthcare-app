import {test,expect} from './fixtures.mjs';
test.use({viewport:{width:390,height:844}});
test('first launch welcome -> intro -> sign in; intro completion persists',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:8081/');
 await expect(page.getByRole('button',{name:'Bắt đầu ngay',exact:true})).toBeVisible();
 await page.screenshot({path:'.local/screenshots/welcome-390.png',fullPage:true});
 await page.getByRole('button',{name:'Bắt đầu ngay',exact:true}).click();
 await expect(page.getByText('Lưu bác sĩ và bệnh viện',{exact:false})).toBeVisible();
 await page.screenshot({path:'.local/screenshots/onboarding-390.png',fullPage:true});
 await page.getByRole('button',{name:'Tiếp tục',exact:true}).click();
 await expect(page.getByText('Chào mừng bạn trở lại!')).toBeVisible();
 await page.goto('http://127.0.0.1:8081/');
 await expect(page.getByText('Chào mừng bạn trở lại!')).toBeVisible();
 expect(errors).toEqual([]);
});
test('welcome and onboarding scroll on a small phone',async({page})=>{
 await page.setViewportSize({width:320,height:640});
 await page.goto('http://127.0.0.1:8081/welcome');
 await page.getByRole('button',{name:'Bắt đầu ngay',exact:true}).click();
 await page.getByRole('button',{name:'Bỏ qua',exact:true}).click();
 await expect(page.getByText('Chào mừng bạn trở lại!')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
