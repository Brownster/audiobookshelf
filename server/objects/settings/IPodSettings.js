const Logger = require('../../Logger')
const { areEquivalent, copyValue } = require('../../utils')

/**
 * @typedef IPodDevice
 * @property {string} name
 * @property {string} ip
 * @property {string} availabilityOption
 * @property {string[]} users
 */

class IPodSettings {
  constructor(settings = null) {
    this.id = 'ipod-settings'
    /** @type {IPodDevice[]} */
    this.ipodDevices = []

    if (settings) {
      this.construct(settings)
    }
  }

  construct(settings) {
    this.ipodDevices = settings.ipodDevices?.map((d) => ({ ...d })) || []
  }

  toJSON() {
    return {
      id: this.id,
      ipodDevices: this.ipodDevices.map((d) => ({ ...d }))
    }
  }

  update(payload) {
    if (!payload) return false

    if (payload.ipodDevices !== undefined && !Array.isArray(payload.ipodDevices)) payload.ipodDevices = undefined

    if (payload.ipodDevices?.length) {
      payload.ipodDevices = payload.ipodDevices
        .map((device) => {
          if (!device.name || !device.ip) {
            Logger.error(`[IPodSettings] Update device is invalid`, device)
            return null
          }
          if (!device.availabilityOption || !['adminOrUp', 'userOrUp', 'guestOrUp', 'specificUsers'].includes(device.availabilityOption)) {
            device.availabilityOption = 'adminOrUp'
          }
          if (device.availabilityOption === 'specificUsers' && !device.users?.length) {
            device.availabilityOption = 'adminOrUp'
          }
          if (device.availabilityOption !== 'specificUsers' && device.users?.length) {
            device.users = []
          }
          return device
        })
        .filter((d) => d)
    }

    let hasUpdates = false
    const json = this.toJSON()
    for (const key in json) {
      if (key === 'id') continue
      if (payload[key] !== undefined && !areEquivalent(payload[key], json[key])) {
        this[key] = copyValue(payload[key])
        hasUpdates = true
      }
    }
    return hasUpdates
  }

  checkUserCanAccessDevice(device, user) {
    const availability = device.availabilityOption || 'adminOrUp'
    if (availability === 'adminOrUp' && user.isAdminOrUp) return true
    if (availability === 'userOrUp' && (user.isAdminOrUp || user.isUser)) return true
    if (availability === 'guestOrUp') return true
    if (availability === 'specificUsers') {
      return (device.users || []).includes(user.id)
    }
    return false
  }

  getIPodDevices(user) {
    return this.ipodDevices.filter((d) => this.checkUserCanAccessDevice(d, user))
  }

  getIPodDevice(name) {
    return this.ipodDevices.find((d) => d.name === name)
  }
}

module.exports = IPodSettings
