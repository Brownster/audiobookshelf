const { expect } = require('chai')
const sinon = require('sinon')

const MeController = require('../../../server/controllers/MeController')
const Database = require('../../../server/Database')
const IPodSettings = require('../../../server/objects/settings/IPodSettings')
const SocketAuthority = require('../../../server/SocketAuthority')

describe('MeController.updateUserIPodDevices', () => {
  let ipodSettings
  beforeEach(() => {
    ipodSettings = new IPodSettings({
      ipodDevices: [
        { name: 'AdminPod', ip: '2.2.2.2', availabilityOption: 'adminOrUp', users: [] }
      ]
    })
    Database.ipodSettings = ipodSettings
    sinon.stub(Database, 'updateSetting').resolves(true)
    sinon.stub(SocketAuthority, 'clientEmitter')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should update user devices and return updated list', async () => {
    const req = {
      body: {
        ipodDevices: [
          { name: 'UserPod', ip: '1.1.1.1', availabilityOption: 'specificUsers', users: ['1'] }
        ]
      },
      user: { id: '1' }
    }
    const res = {
      status: sinon.stub().returnsThis(),
      send: sinon.spy(),
      json: sinon.spy()
    }
    await MeController.updateUserIPodDevices(req, res)
    expect(res.status.called).to.be.false
    expect(res.json.calledOnce).to.be.true
    const returned = res.json.firstCall.args[0].ipodDevices
    expect(returned.some((d) => d.name === 'UserPod')).to.be.true
    expect(Database.ipodSettings.ipodDevices.length).to.equal(2)
  })

  it('should reject payload with duplicate names', async () => {
    const req = {
      body: {
        ipodDevices: [
          { name: 'AdminPod', ip: '1.1.1.1', availabilityOption: 'specificUsers', users: ['1'] }
        ]
      },
      user: { id: '1' }
    }
    const res = {
      status: sinon.stub().returnsThis(),
      send: sinon.spy(),
      json: sinon.spy()
    }
    await MeController.updateUserIPodDevices(req, res)
    expect(res.status.calledWith(400)).to.be.true
    expect(res.send.called).to.be.true
  })
})
