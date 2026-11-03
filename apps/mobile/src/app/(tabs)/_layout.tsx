import {Tabs} from 'expo-router';
import {MainTabBar} from '../../components/navigation/MainTabBar';
import type {MainTab} from '../../navigation/routes';

export default function MainTabsLayout() {
  return <Tabs
    tabBar={({state}) => <MainTabBar active={state.routes[state.index].name as MainTab}/>}
    screenOptions={{
      headerShown:false,
      animation:'fade',
      transitionSpec:{animation:'timing',config:{duration:260}},
    }}
  >
    <Tabs.Screen name="home"/>
    <Tabs.Screen name="explore"/>
    <Tabs.Screen name="appointments"/>
    <Tabs.Screen name="messages"/>
    <Tabs.Screen name="account"/>
  </Tabs>;
}
