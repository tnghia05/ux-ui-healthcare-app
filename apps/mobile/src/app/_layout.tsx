import {BookingProvider} from '../features/booking/state';
import { SplashScreenView } from '../features/intro/IntroScreens';
import { Stack } from 'expo-router';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { SessionProvider } from '../features/auth/session';
export default function Layout(){const [loaded,error]=useFonts({Inter:Inter_400Regular,InterSemiBold:Inter_600SemiBold,InterBold:Inter_700Bold});if(error)return <Text>Không tải được phông chữ. Vui lòng mở lại ứng dụng.</Text>;if(!loaded)return <SafeAreaProvider><SplashScreenView/></SafeAreaProvider>;return <SafeAreaProvider><SessionProvider><BookingProvider><Stack screenOptions={{headerShown:false}}/></BookingProvider></SessionProvider></SafeAreaProvider>;}
