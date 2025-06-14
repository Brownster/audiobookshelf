const { Request, Response, NextFunction } = require('express')
const Logger = require('../Logger')
const SocketAuthority = require('../SocketAuthority')
const Database = require('../Database')

class IPodController {
  constructor() {}

  /**
   * GET: /api/ipods/settings
   * @param {Request & {user: import('../models/User')}} req
   * @param {Response} res
   */
  getSettings(req, res) {
    res.json({
      settings: Database.ipodSettings
    })
  }

  /**
   * PATCH: /api/ipods/settings
   * @param {Request & {user: import('../models/User')}} req
   * @param {Response} res
   */
  async updateSettings(req, res) {
    const updated = Database.ipodSettings.update(req.body)
    if (updated) {
      await Database.updateSetting(Database.ipodSettings)
      SocketAuthority.adminEmitter('ipod-devices-updated', {
        ipodDevices: Database.ipodSettings.ipodDevices
      })
    }
    res.json({
      settings: Database.ipodSettings
    })
  }

  /**
   * POST: /api/ipods/send
   * @param {Request & {user: import('../models/User')}} req
   * @param {Response} res
   */
  async send(req, res) {
    const device = Database.ipodSettings.getIPodDevice(req.body.deviceName)
    if (!device) {
      return res.status(404).send('iPod device not found')
    }
    if (!Database.ipodSettings.checkUserCanAccessDevice(device, req.user)) {
      return res.sendStatus(403)
    }
    const libraryItem = await Database.libraryItemModel.getExpandedById(req.body.libraryItemId)
    if (!libraryItem) {
      return res.status(404).send('Library item not found')
    }
    if (!req.user.checkCanAccessLibraryItem(libraryItem)) {
      return res.sendStatus(403)
    }
    const file = libraryItem.media.audioFiles?.[0]
    if (!file) {
      return res.status(404).send('Audio file not found')
    }
    this.ipodManager.sendFileToDevice(file, device, res)
  }

  adminMiddleware(req, res, next) {
    if (!req.user.isAdminOrUp) {
      return res.sendStatus(404)
    }
    next()
  }
}

module.exports = new IPodController()
