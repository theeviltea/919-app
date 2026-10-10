import { Redirect } from 'expo-router';

// Until the guest zone lands, the app opens on the component kit.
export default function Index() {
  return <Redirect href="/kit" />;
}
