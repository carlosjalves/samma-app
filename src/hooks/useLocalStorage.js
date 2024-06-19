import { useEffect, useState } from "react";

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) : initialValue;
  });

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.storageArea === localStorage && event.key === key) {
        const newValue =
          event.newValue !== null ? JSON.parse(event.newValue) : initialValue;

        if (newValue !== value) {
          setValue(newValue);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key, initialValue, value]);

  useEffect(() => {
    const serializedValue = JSON.stringify(value);

    if (localStorage.getItem(key) !== serializedValue) {
      localStorage.setItem(key, serializedValue);
    }
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;
