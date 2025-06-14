# Audiobookshelf Roadmap

This file tracks our progress on implementing the "Send to iPod" feature.
Check items off as they are completed.

## Backend implementation

- [ ] `IPodSettings` object for storing device info
- [ ] Database integration for `ipodSettings`
- [ ] `IPodManager` uploads files to the Pi
- [ ] `IPodController` with settings and send endpoints
- [ ] API routes wired in `ApiRouter`
- [ ] OpenAPI documentation for new endpoints

## Frontend tasks

- [ ] Expose `ipodDevices` on login and commit them to the store
- [ ] Vuex state and mutations for `ipodDevices`
- [ ] Listen for `ipod-devices-updated` socket events
- [ ] User endpoint `/api/me/ipod-devices` and modal for editing devices
- [ ] Admin configuration page `config/ipod.vue` and `IPodDeviceModal.vue`
- [ ] "Send to iPod" actions on item pages and book cards
- [x] Add iPod strings to translation files
- [ ] Update OpenAPI docs and add unit tests
