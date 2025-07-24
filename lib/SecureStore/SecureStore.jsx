// lib/SecureStore/SecureStore.ts
import * as SecureStore from "expo-secure-store";

async function save(key, value) {
  try {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
    // Save timestamp separately to avoid JSON issues
    await SecureStore.setItemAsync(
      `${key}_timestamp`,
      new Date().toISOString()
    );
  } catch (e) {
    console.error("SecureStore Save Error:", e);
  }
}

async function getValueFor(key) {
  try {
    const result = await SecureStore.getItemAsync(key);
    if (!result) return null;

    // Handle potential malformed JSON
    try {
      return JSON.parse(result);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      // Clean up corrupted data
      await remove(key);
      return null;
    }
  } catch (e) {
    console.error("SecureStore Get Error:", e);
    return null;
  }
}

async function remove(key) {
  try {
    await SecureStore.deleteItemAsync(key);
    await SecureStore.deleteItemAsync(`${key}_timestamp`);
  } catch (e) {
    console.error("SecureStore Remove Error:", e);
  }
}

export { save, remove, getValueFor };
