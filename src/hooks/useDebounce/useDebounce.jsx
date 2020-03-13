import { useCallback } from "react";

const debounce = (callback, delay = 300) => {
  let timer;
  return (...param) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...param), delay);
  };
};

const useDebounce = (callback, delay) => {
  return useCallback(debounce(callback, delay), []);
};

export default useDebounce;
