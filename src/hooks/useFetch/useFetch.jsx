import { useState, useEffect, useMemo } from "react";

const useFetch = ({
  onRequest,
  onSuccess,
  onError,
  watch,
  autoFetch,
  loadStatus,
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const watchingValue = useMemo(() => getWatchingValue(watch), [watch]);

  const request = async (param) => {
    try {
      setError(null);
      if (loadStatus) setLoading(true);
      const res = await onRequest(param);

      if (res instanceof Promise) throw Error("REQUEST FAILED");
      if (!res.ok) throw Error(res.status);
      if (res.status === 204) throw Error(res.status);

      const response = (res.headers.get("Content-Type") || "").includes("json")
        ? await res.json()
        : res;
      onSuccess ? onSuccess(response) : setData(response);
    } catch (error) {
      if (!onError) setError(error);
      if (isFunction(onError)) onError();
      else handleFetchError(error, onError);
    } finally {
      if (loadStatus) setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch || watch) {
      request();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...watchingValue]);

  return loadStatus
    ? { data, error, loading, request }
    : { data, error, request };
};

export default useFetch;

const isFunction = (func) => typeof func === "function";

const isObject = (obj) =>
  obj !== undefined && obj !== null && obj.constructor === Object;

const getWatchingValue = (watch) => {
  if (Array.isArray(watch) || isObject(watch)) {
    return watch;
  }
  return [watch];
};

const handleFetchError = (error, errorMap) => {
  if (!error) return;

  const statusCode = Number(error.message);

  if (!errorMap && statusCode === 204) {
    console.warn("status code 204에 대한 처리가 필요합니다.");
    return alert("NO_CONTENT");
  }
  if (!errorMap) return console.warn(error);

  const handler = errorMap[statusCode];
  if (typeof handler === "string") return alert(handler);
  if (typeof handler === "function") return handler();

  if (!handler) {
    console.warn(error);
    console.warn("errorMap에 정의하지 않은 에러입니다.");
    return alert("UNKNOWN_ERROR");
  }
};
