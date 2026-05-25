import 'primevue/confirmationoptions'

declare module 'primevue/confirmationoptions' {
  interface ConfirmationOptions {
    // allow arbitrary payload for confirm dialogs
    data?: unknown
  }
}
