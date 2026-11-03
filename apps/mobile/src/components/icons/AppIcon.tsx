import {MorphIcon} from 'morphicons/react-native';
import {colors} from '../../theme/tokens';
import {iconData,filledHeart} from './registry';
import type {AppIconProps} from './registry';
export function AppIcon({name,size=24,color=colors.ink,label,filled=false,spring='snappy'}:AppIconProps){return <MorphIcon icon={filled&&name==='heart'?filledHeart:iconData[name]} size={size} color={color} strokeWidth={1.75} spring={spring} reducedMotion="user" label={label}/>;}
