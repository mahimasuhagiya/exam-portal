const API_URL = 'http://localhost:8080'; 

export default API_URL;

export const setWithExpiry = (key, value, ttl) => {
    const now = new Date();
  
    const item = {
        value: value,
        expiry: now.getTime() + ttl, // TTL in milliseconds
    };
    localStorage.setItem(key, JSON.stringify(item));
  };
  
  export const getWithExpiry = (key) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
        return null;
    }
  
    const item = JSON.parse(itemStr);
    const now = new Date();
  
    // Compare the expiry time
    if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null;
    }
  
    try {
        return JSON.parse(item.value); // Parse the stored JSON string
    } catch (e) {
        return item.value; // If parsing fails, return the raw value
    }
  };