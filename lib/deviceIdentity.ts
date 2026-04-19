export type DeviceIdentity = {
  id: string;
  name: string;
};

const DEVICE_ID_KEY = 'pdfshareonline-device-id';
const DEVICE_NAME_KEY = 'pdfshareonline-device-name';

function createDeviceId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `device-${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateDeviceId() {
  const existing = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }

  const nextId = createDeviceId();
  window.localStorage.setItem(DEVICE_ID_KEY, nextId);
  return nextId;
}

export function getDefaultDeviceName() {
  const platform = navigator.userAgentData?.platform || navigator.platform || 'Device';
  const isMobile = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
  return isMobile ? `Phone on ${platform}` : `${platform} browser`;
}

export function getOrCreateDeviceName() {
  const existing = window.localStorage.getItem(DEVICE_NAME_KEY);
  if (existing) {
    return existing;
  }

  const nextName = getDefaultDeviceName();
  window.localStorage.setItem(DEVICE_NAME_KEY, nextName);
  return nextName;
}

export function saveDeviceName(name: string) {
  window.localStorage.setItem(DEVICE_NAME_KEY, name);
}

export function getStoredDeviceIdentity(): DeviceIdentity {
  return {
    id: getOrCreateDeviceId(),
    name: getOrCreateDeviceName(),
  };
}
