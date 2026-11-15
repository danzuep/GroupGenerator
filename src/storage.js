(function (root) {
  const KEYS = { session: "group-generator-settings", classes: "group-generator-classes", theme: "group-generator-theme" };

  // backend is anything with getItem/setItem (localStorage in the browser, a stub in tests).
  function createStorage(backend) {
    const get = (key, fallback) => {
      try {
        return JSON.parse(backend.getItem(key)) ?? fallback;
      } catch {
        return fallback;
      }
    };
    const set = (key, value) => {
      try {
        backend.setItem(key, JSON.stringify(value));
      } catch {}
    };

    return {
      session: { load: () => get(KEYS.session, {}), save: (data) => set(KEYS.session, data) },
      classes: {
        names: () => Object.keys(get(KEYS.classes, {})).sort((a, b) => a.localeCompare(b)),
        get: (name) => get(KEYS.classes, {})[name],
        // Returns true when an existing class was overwritten.
        save(name, data) {
          const all = get(KEYS.classes, {});
          const existed = name in all;
          all[name] = data;
          set(KEYS.classes, all);
          return existed;
        },
        remove(name) {
          const all = get(KEYS.classes, {});
          if (!(name in all)) return false;
          delete all[name];
          set(KEYS.classes, all);
          return true;
        },
      },
      theme: {
        // "light" | "dark" | undefined (follow the system)
        load: () => get(KEYS.theme, undefined),
        save: (theme) => set(KEYS.theme, theme),
      },
    };
  }

  const api = { createStorage };
  if (typeof module !== "undefined") module.exports = api;
  else root.GroupStorage = api;
})(typeof self !== "undefined" ? self : this);
