import { Redirect } from 'expo-router';
import { Text } from 'react-native';
import { useSession } from '../features/auth/session';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { Screen,styles } from '../features/auth/ui';
export default function CompleteProfile(){const session=useSession();if(session.loading)return <Screen><Text style={styles.body}>Đang tải…</Text></Screen>;if(!session.user)return <Redirect href="/sign-in"/>;return <ProfileScreen/>;}
