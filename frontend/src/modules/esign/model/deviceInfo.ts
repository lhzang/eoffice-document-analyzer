export interface DeviceInfo {
    platform: string;
    model: string;
    name: string;
    id: string;
    version: string;
  }
  
export interface Device {
    pushNotificationToken: string;
    publicKeyPem: string;
    deviceInfo: DeviceInfo;
    id: string;
    timestamp: number;
}

export type DeviceListResponse = Device[];

export type DeleteDevicePayload = {
  deviceId: string
  accountId: string
  totp: string
}
