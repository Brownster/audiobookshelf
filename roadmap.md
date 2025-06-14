# Audiobookshelf Roadmap

This file tracks our progress on implementing the "Send to iPod" feature.
Check items off as they are completed.

## Backend implementation

- [x] `IPodSettings` object for storing device info
- [x] Database integration for `ipodSettings`
- [x] `IPodManager` uploads files to the Pi
- [x] `IPodController` with settings and send endpoints
- [x] API routes wired in `ApiRouter`
- [x] OpenAPI documentation for new endpoints

## Frontend tasks

- [x] Expose `ipodDevices` on login and commit them to the store
- [x] Vuex state and mutations for `ipodDevices`
- [x] Listen for `ipod-devices-updated` socket events
- [x] User endpoint `/api/me/ipod-devices` and modal for editing devices
- [x] Admin configuration page `config/ipod.vue` and `IPodDeviceModal.vue`
- [x] "Send to iPod" actions on item pages and book cards
- [x] Add iPod strings to translation files
- [ ] Update OpenAPI docs and add unit tests
