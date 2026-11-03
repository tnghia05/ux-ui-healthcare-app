import { createContext,useContext,useEffect,useState,useCallback } from 'react';
import type { ReactNode } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ApiError,apiRequest } from '../../api/client';
export type ProfileInput={name:string;phone:string;birthDate:string;gender:'female'|'male'|'other'|'not_specified'};
export type Preferences={locationMode?:'none'|'manual'|'device';address?:string;latitude?:number;longitude?:number;locationPermission?:string;notificationPermission?:string;setupCompleted?:boolean};
export type User={hasAvatar?:boolean;avatarVersion?:number;clinician?:{doctorId:string}|null;role?:'admin'|'patient';id:string;name:string;email:string;phone?:string|null;birthDate?:string|null;gender?:ProfileInput['gender']|null;profileCompletedAt?:string|null;preferences?:Preferences};
type Draft={email:string;name:string;password:string;challengeId:string;expiresAt:string};
type ResetGrant={resetToken:string;expiresAt:string};
type Session={request:<T>(path:string,signal?:AbortSignal,options?:{method?:string;body?:unknown;binary?:boolean})=>Promise<T>;resetGrant:ResetGrant|null;setResetGrant:(grant:ResetGrant|null)=>void;user:User|null;loading:boolean;error:string;draft:Draft|null;setDraft:(draft:Draft|null)=>void;login:(email:string,password:string)=>Promise<User>;logout:()=>Promise<void>;restore:()=>Promise<void>;refresh:()=>Promise<void>;updateProfile:(input:ProfileInput)=>Promise<void>;updatePreferences:(input:Preferences)=>Promise<void>};
const Context=createContext<Session|null>(null);const key='uxui.session';let webToken:string|null=null;
const storage={get:()=>Platform.OS==='web'?Promise.resolve(webToken):SecureStore.getItemAsync(key),set:async(token:string)=>{if(Platform.OS==='web')webToken=token;else await SecureStore.setItemAsync(key,token);},clear:async()=>{if(Platform.OS==='web')webToken=null;else await SecureStore.deleteItemAsync(key);}};
export function SessionProvider({children}:{children:ReactNode}){
 const request=useCallback(async<T,>(path:string,signal?:AbortSignal,options:{method?:string;body?:unknown;binary?:boolean}={})=>{const token=await storage.get();if(!token)throw new ApiError(401,'UNAUTHORIZED','Vui lòng đăng nhập lại');return apiRequest<T>(path,signal,{...options,token});},[]);
 const [resetGrant,setResetGrant]=useState<ResetGrant|null>(null);
 const [user,setUser]=useState<User|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[draft,setDraft]=useState<Draft|null>(null);
 async function restore(){setLoading(true);setError('');try{const token=await storage.get();if(token)setUser(await apiRequest<User>('auth/me',undefined,{token}));else setUser(null);}catch(e){if(e instanceof ApiError && e.status===401){await storage.clear();setUser(null);}else setError('Chưa kiểm tra được phiên. Vui lòng thử lại.');}finally{setLoading(false);}}
 useEffect(()=>{void restore();},[]);
 async function refresh(){setUser(await request<User>('auth/me'));}
 async function login(email:string,password:string){const result=await apiRequest<{accessToken:string;user:User}>('auth/login',undefined,{method:'POST',body:{email,password}});try{await storage.set(result.accessToken);}catch(e){await apiRequest('auth/logout',undefined,{method:'POST',token:result.accessToken}).catch(()=>{});throw e;}setUser(result.user);setDraft(null);return result.user;}
 async function updateProfile(input:ProfileInput){const token=await storage.get();if(!token)throw new Error('Vui lòng đăng nhập lại');const updated=await apiRequest<User>('auth/me',undefined,{method:'PATCH',token,body:input});setUser(updated);}
 async function updatePreferences(input:Preferences){const token=await storage.get();if(!token)throw new Error('Vui lòng đăng nhập lại');setUser(await apiRequest<User>('auth/preferences',undefined,{method:'PATCH',token,body:input}));}
 async function logout(){const token=await storage.get();if(token)await apiRequest('auth/logout',undefined,{method:'POST',token}).catch(e=>{if(!(e instanceof ApiError && e.status===401))throw e;});await storage.clear();setUser(null);}
 return <Context.Provider value={{request,resetGrant,setResetGrant,user,loading,error,draft,setDraft,login,logout,restore,refresh,updateProfile,updatePreferences}}>{children}</Context.Provider>;
}
export function useSession(){const value=useContext(Context);if(!value)throw new Error('SessionProvider required');return value;}

