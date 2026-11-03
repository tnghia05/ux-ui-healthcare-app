import { createContext,useContext,useState,useEffect } from 'react';
import type { ReactNode } from 'react';
import { useSession } from '../auth/session';
export type Patient={name:string;phone:string;gender:string;age:number;reason:string};
export type Package={id:string;name:string;amountVnd:number;durationMinutes:number;description:string;enabled:boolean;icon:string};
export type Options={idempotencyKey:string;doctor:{id:string;name:string;specialty:string;imageKey:string;rating:number};hospital:{id:string;name:string;address:string}|null;date:string;today:string;lastDate:string;slots:{time:string;available:boolean}[];packages:Package[];walletBalanceVnd:number};
export type Draft={coupon?:{code:string;amountVnd:number;discountVnd:number};doctorId:string;date:string;time:string;packageId:string;patient:Patient;paymentMethod:'cash'|'wallet';idempotencyKey:string;options:Options};
export type Appointment={cancellation?:{reason:string;note?:string};refund?:{id:string;status:string;amountVnd:number;requestedAt:string;completedAt?:string};lastReschedule?:{previousStartsAt:string;startsAt:string;changedAt:string};completionSource?:string;id:string;code:string;doctorId:string;doctorName:string;imageKey:string;specialty:string;hospitalName:string;hospitalAddress:string;packageId:string;packageName:string;durationMinutes:number;amountVnd:number;discountVnd:number;paymentMethod:string;paymentStatus:string;status:string;patient:Patient;startsAt:string;endsAt:string;createdAt:string};
const Context=createContext<{draft:Draft|null;setDraft:(value:Draft|null)=>void}|null>(null);
export function BookingProvider({children}:{children:ReactNode}){const {user}=useSession();const [state,setState]=useState<{userId:string;draft:Draft}|null>(null);useEffect(()=>setState(null),[user?.id]);return <Context.Provider value={{draft:state?.userId===user?.id?state?.draft??null:null,setDraft:value=>setState(value&&user?{userId:user.id,draft:value}:null)}}>{children}</Context.Provider>;}
export function useBooking(){const value=useContext(Context);if(!value)throw new Error('BookingProvider required');return value;}

