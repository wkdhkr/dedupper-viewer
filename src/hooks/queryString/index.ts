import { useState, useCallback } from "react";
import { navigate } from "@reach/router";
import UrlUtil from "../../utils/dedupper/UrlUtil";

export const setQueryString = (sp: URLSearchParams) => {
  const u = new URL(window.location.href);
  u.search = sp.toString();
  navigate(u.toString());
};

export function useQueryString(
  key: string,
  initialValue: string | null = null
): [string | null, (newValue: string | null) => void] {
  const currentValue = UrlUtil.extractParam(key);
  const [, setValue] = useState(currentValue || initialValue);
  const onSetValue = useCallback(
    newValue => {
      setValue(newValue);
      const sp = new URLSearchParams();
      if (newValue) {
        sp.set(key, newValue);
      }
      setQueryString(sp);
    },
    [key]
  );

  return [currentValue, onSetValue];
}
