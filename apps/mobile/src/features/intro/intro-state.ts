import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
const key='uxui.intro.v1';
export async function hasSeenIntro(){return Platform.OS==='web'?localStorage.getItem(key)==='seen':(await SecureStore.getItemAsync(key))==='seen';}
export async function finishIntro(){if(Platform.OS==='web')localStorage.setItem(key,'seen');else await SecureStore.setItemAsync(key,'seen');}
