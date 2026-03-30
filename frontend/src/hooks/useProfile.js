import { useCallback, useEffect, useState } from "react";
import { api } from "../utils/api";

let profileCache = null;
let inflightPromise = null;

export function invalidateProfileCache() {
  profileCache = null;
  inflightPromise = null;
}

async function loadProfile() {
  if (profileCache) return profileCache;
  if (!inflightPromise) {
    inflightPromise = api
      .get("/api/admin/profile")
      .then((res) => {
        profileCache = res.data;
        inflightPromise = null;
        return res.data;
      })
      .catch((err) => {
        inflightPromise = null;
        throw err;
      });
  }
  return inflightPromise;
}

/**
 * Fetches and caches GET /api/admin/profile for dashboard consumers.
 */
export function useProfile() {
  const [data, setData] = useState(profileCache);
  const [loading, setLoading] = useState(!profileCache);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    invalidateProfileCache();
    setLoading(true);
    setError(null);
    try {
      const next = await loadProfile();
      setData(next);
      return next;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (profileCache) {
        setData(profileCache);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const next = await loadProfile();
        if (!cancelled) setData(next);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error, refetch };
}
