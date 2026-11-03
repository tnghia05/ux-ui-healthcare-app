import {test as base,expect} from '@playwright/test';
// Only browser tests proxy API traffic to the isolated test backend.
// Expo Go and normal browser sessions continue to use the developer backend.
export async function installApiProxy(page){
 await page.route('https://tile.openstreetmap.de/**',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#eef2f5"/><path d="M0 128H256M128 0V256" stroke="white" stroke-width="12"/><text x="12" y="22" fill="#7c8796" font-size="12">Map tile fixture</text></svg>'}));
 await page.route('**/api/v1/**',async route=>{
  const url=new URL(route.request().url());url.hostname='127.0.0.1';url.port='3002';
  const response=await route.fetch({url:url.toString()});await route.fulfill({response});
 });
}
export const test=base.extend({page:async({page},use)=>{
 await installApiProxy(page);
 try{await use(page);}finally{await page.unrouteAll({behavior:'wait'});}
}});
export {expect};
