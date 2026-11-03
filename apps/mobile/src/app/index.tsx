import { useEffect,useState } from 'react';
import { Redirect } from 'expo-router';
import { Text } from 'react-native';
import { useSession } from '../features/auth/session';
import { Screen,Action,styles } from '../features/auth/ui';
import { SplashScreenView } from '../features/intro/IntroScreens';
import { hasSeenIntro } from '../features/intro/intro-state';
export default function Index(){const session=useSession();const [seen,setSeen]=useState<boolean|null>(null),[error,setError]=useState('');async function load(){setError('');try{setSeen(await hasSeenIntro());}catch{setError('Không đọc được thiết lập ứng dụng.');}}useEffect(()=>{void load();},[]);if(session.loading||seen===null&&!error)return <SplashScreenView/>;if(error||session.error)return <Screen><Text style={styles.error}>{error||session.error}</Text><Action label="Thử lại" onPress={()=>{void load();void session.restore();}}/></Screen>;return <Redirect href={session.user?(session.user.preferences?.setupCompleted?'/home':'/location-permission'):seen?'/sign-in':'/welcome'}/>;}
