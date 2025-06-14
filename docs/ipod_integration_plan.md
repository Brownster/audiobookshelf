# iPod Sync Integration Plan and Plugin API

This document outlines the plan for adding "Send to iPod" support in Audiobookshelf and describes the REST API exposed by the Raspberry Pi sync server.

## Roadmap

1. **IPodSettings**
   - Create `server/objects/settings/IPodSettings.js` modeled after `EmailSettings`.
   - Store devices `{ name, ip, availabilityOption, users }`.
   - Methods include `construct`, `update`, `toJSON`, `checkUserCanAccessDevice`, `getIPodDevice`, and `getIPodDevices`.

2. **Database integration**
   - Extend `Database.js` and `models/Setting.getOldSettings` to load and persist `ipodSettings`.

3. **IPodManager**
   - `server/managers/IPodManager.js` posts audio files to the Pi using Axios.

4. **IPodController**
   - Handles settings CRUD and a `send` route to forward library items.

5. **Routes**
   - Add `/ipods/settings` and `/ipods/send` to `ApiRouter`.

6. **Documentation**
   - Provide OpenAPI docs `docs/objects/settings/IPodSettings.yaml` and `docs/controllers/IPodController.yaml`.

7. **Modular design**
   - Keep all iPod code in new modules so upstream updates can be merged with minimal conflicts.

## Raspberry Pi Plugin API

The Raspberry Pi sync dock exposes a simple REST interface implemented with FastAPI.

### Starting the server

```bash
python -m ipod_sync.app
```

By default the server listens on port `8000` on all interfaces.

### Endpoints

- **GET `/status`** – Health check. Returns `{"status": "ok"}`.
- **POST `/upload`** – Upload an audio file using `multipart/form-data` field `file`.

  Example:
  ```bash
  curl -F "file=@song.mp3" http://<pi>:8000/upload
  ```
  Response: `{"queued": "song.mp3"}`

- **POST `/upload/{category}`** – Upload to `music` or `audiobook` category.

  ```bash
  curl -F "file=@book.m4b" http://<pi>:8000/upload/audiobook
  ```
  Response: `{"queued": "book.m4b", "category": "audiobook"}`

- **GET `/tracks`** – Retrieve a list of tracks on the iPod.
  ```json
  [
    {"id": "1", "title": "Track Title", "artist": "Artist", "album": "Album"}
  ]
  ```

- **DELETE `/tracks/{id}`** – Remove a track by ID. Returns `{"deleted": "<id>"}` or 404 if not found.

### Notes

- Authentication is not yet implemented, so expose the API only on trusted networks.
- Uploaded files must be in a format supported by the iPod (MP3 or AAC). Conversion is outside the scope of the API.

