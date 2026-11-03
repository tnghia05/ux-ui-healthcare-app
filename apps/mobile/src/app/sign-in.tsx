import {Text} from 'react-native';
import {useLocalSearchParams} from 'expo-router';
import {AuthScreen} from '../features/auth/AuthScreen';
import {styles} from '../features/auth/ui';
export default function SignIn(){const {passwordChanged}=useLocalSearchParams<{passwordChanged?:string}>();return <>{passwordChanged==='1'?<Text accessibilityRole="alert" style={[styles.label,{backgroundColor:'#EDF3FF',padding:12}]}>Mật khẩu đã đổi. Vui lòng đăng nhập lại.</Text>:null}<AuthScreen mode="login"/></>;}
