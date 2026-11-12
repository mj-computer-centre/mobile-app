// Native: Supabase keeps the signed-in session in expo-sqlite's localStorage, as Supabase's Expo
// guide recommends. (SecureStore caps values at 2 KB, smaller than a session.)
import 'expo-sqlite/localStorage/install';

export const authStorage = globalThis.localStorage;
