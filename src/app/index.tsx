import { Redirect } from 'expo-router';

/** App entry: straight into the tabs (Home). */
export default function Entry() {
  return <Redirect href="/(tabs)" />;
}
