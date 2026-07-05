import { Redirect, type Href } from 'expo-router';

export default function FamilySharingRedirect() {
  return <Redirect href={'/(tabs)/family' as Href} />;
}
