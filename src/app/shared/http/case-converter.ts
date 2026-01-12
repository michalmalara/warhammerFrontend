function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

function decamelizeKey(key: string): string {
  // handles: someKey -> some_key, URLValue -> url_value, some1Key -> some1_key
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z0-9]+)/g, '$1_$2')
    .toLowerCase();
}

function camelizeKey(key: string): string {
  // some_key -> someKey
  return key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

export function toSnakeCaseDeep(input: unknown): unknown {
  if (Array.isArray(input)) {
    return input.map(toSnakeCaseDeep);
  }

  if (isPlainObject(input)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input)) {
      out[decamelizeKey(k)] = toSnakeCaseDeep(v);
    }
    return out;
  }

  return input;
}

export function toCamelCaseDeep(input: unknown): unknown {
  if (Array.isArray(input)) {
    return input.map(toCamelCaseDeep);
  }

  if (isPlainObject(input)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input)) {
      out[camelizeKey(k)] = toCamelCaseDeep(v);
    }
    return out;
  }

  return input;
}

export function toSnakeCaseKey(key: string): string {
  return decamelizeKey(key);
}

export function toCamelCaseKey(key: string): string {
  return camelizeKey(key);
}
