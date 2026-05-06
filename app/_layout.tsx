import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    // headerShown: false отключает стандартные некрасивые заголовки Expo,
    // так как мы сверстали свои собственные стильные шапки на каждом экране
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="pre-workout" />
      <Stack.Screen name="player" />
      <Stack.Screen name="post-workout" />
      <Stack.Screen name="bans" />
    </Stack>
  );
}
