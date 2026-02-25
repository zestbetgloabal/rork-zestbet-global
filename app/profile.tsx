import { Redirect, Href } from 'expo-router';

export default function ProfileStackScreen() {
  return <Redirect href={'/(tabs)/profile' as Href} />;
}
