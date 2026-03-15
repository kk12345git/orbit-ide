import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0d0d1a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: '#0d0d1a',
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Orbit IDE' }} />
    </Stack>
  );
}
