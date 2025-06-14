const axios = require('axios')
const fs = require('fs')
const FormData = require('form-data')
const Logger = require('../Logger')
const Database = require('../Database')

class IPodManager {
  constructor() {}

  async sendFileToDevice(file, device, res) {
    Logger.info(`[IPodManager] Sending file "${file.metadata.filename}" to device "${device.name}" at ${device.ip}`)

    const form = new FormData()
    form.append('file', fs.createReadStream(file.metadata.path))

    try {
      const headers = form.getHeaders()
      if (process.env.IPOD_DOCK_API_KEY) {
        headers['Authorization'] = `Bearer ${process.env.IPOD_DOCK_API_KEY}`
      }
      await axios.post(`http://${device.ip}:8000/upload/audiobook`, form, {
        headers
      })
      res.sendStatus(200)
    } catch (error) {
      Logger.error(`[IPodManager] Failed to send file to device`, error)
      res.status(400).send(error.message || 'Failed to send file to device')
    }
  }
}

module.exports = IPodManager
