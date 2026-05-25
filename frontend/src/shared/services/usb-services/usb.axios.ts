import axios from 'axios'

const usbPluginAxios = axios.create({
  baseURL: import.meta.env.VITE_APP_ESIGN_PLUGIN_URL || 'http://localhost:54321/usb/v2'
})

export default usbPluginAxios
