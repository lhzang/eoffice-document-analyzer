import { type DeviceInfo } from "../model/deviceInfo"

export interface DeviceAuthData {
    pushNotificationToken: string
    publicKeyPem: string
    deviceInfo: DeviceInfo
    id: string
    timestamp: number
}

export const dataListDevice: DeviceAuthData[] = [
    {
        pushNotificationToken: "fEJrQsieT9K_nb2-fPm35y:APA91bHRiUE9NTT29HN9kGdt785PIccR9b-r_1Yt6XNwu8KahL9EtSSGwhXZySXeKWzYEk3YQvLUa-O-KlNcbSjBlqxmMt2G7aEo_KMeKMgQt45hYUp9xsk",
        publicKeyPem: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmehTqgPOz7FAWX+uafzb\nsy8SX1GotQq3UNbagzgPbI/CTTrlmk2k12xM+8TogNzPQOFC4sFfOXBPNglhdzve\nmhTNa1g6Nuo5HdbHvSmM3GZvBQvBWeTtCTyuAer/CVTxVEGhxcQt8Rq028AEH3Ft\nipiBBW/OV5kv3vBFsdwm0VRePLAUTp/zT8pw4qh7TI1cDxn5sQJ+5ZC0lKiQCt4m\nfxqOIMo2PYvuYu+Uaa6r0hWLXzeK9EOvDK7P2abbxa+55DBFUWTK/Vjvu0giNmEA\n18Snj0d40wxEVhsXFhm28RiCSuQp3wANTWQ8rWPFJAJaYw6uv8rJb/YWP4/xcsjF\nWwIDAQAB\n-----END PUBLIC KEY-----",
        deviceInfo: {
            platform: "1thune",
            model: "2201117TG",
            name: "spes",
            id: "unknown",
            version: "13"
        },
        id: "5c55e933-6a5f-43a5-a862-fe5f62b02893",
        timestamp: 1755154345202
    },
    {
        pushNotificationToken: "fEJrQsieT9K_nb2-fPm35y:APA91bHRiUE9NTT29HN9kGdt785PIccR9b-r_1Yt6XNwu8KahL9EtSSGwhXZySXeKWzYEk3YQvLUa-O-KlNcbSjBlqxmMt2G7aEo_KMeKMgQt45hYUp9xsk",
        publicKeyPem: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmehTqgPOz7FAWX+uafzb\nsy8SX1GotQq3UNbagzgPbI/CTTrlmk2k12xM+8TogNzPQOFC4sFfOXBPNglhdzve\nmhTNa1g6Nuo5HdbHvSmM3GZvBQvBWeTtCTyuAer/CVTxVEGhxcQt8Rq028AEH3Ft\nipiBBW/OV5kv3vBFsdwm0VRePLAUTp/zT8pw4qh7TI1cDxn5sQJ+5ZC0lKiQCt4m\nfxqOIMo2PYvuYu+Uaa6r0hWLXzeK9EOvDK7P2abbxa+55DBFUWTK/Vjvu0giNmEA\n18Snj0d40wxEVhsXFhm28RiCSuQp3wANTWQ8rWPFJAJaYw6uv8rJb/YWP4/xcsjF\nWwIDAQAB\n-----END PUBLIC KEY-----",
        deviceInfo: {
            platform: "2thune",
            model: "2201117TG",
            name: "spes",
            id: "unknown",
            version: "13"
        },
        id: "5c55e933-6a5f-43a5-a862-fe5f62b02894",
        timestamp: 1755154345202
    }
]