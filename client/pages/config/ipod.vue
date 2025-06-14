<template>
  <div>
    <app-settings-content :header-text="$strings.HeaderIPodDevices" :description="$strings.MessageIPodDevices">
      <template #header-items>
        <div class="grow" />
        <ui-btn color="bg-primary" small @click="addNewDeviceClick">{{ $strings.ButtonAddDevice }}</ui-btn>
      </template>

      <table v-if="existingIPodDevices.length" class="tracksTable mt-4">
        <tr>
          <th class="text-left">{{ $strings.LabelName }}</th>
          <th class="text-left">{{ $strings.LabelIPAddress }}</th>
          <th class="text-left">{{ $strings.LabelAccessibleBy }}</th>
          <th class="w-40"></th>
        </tr>
        <tr v-for="device in existingIPodDevices" :key="device.name">
          <td>
            <p class="text-sm md:text-base text-gray-100">{{ device.name }}</p>
          </td>
          <td class="text-left">
            <p class="text-sm md:text-base text-gray-100">{{ device.ip }}</p>
          </td>
          <td class="text-left">
            <p class="text-sm md:text-base text-gray-100">{{ getAccessibleBy(device) }}</p>
          </td>
          <td class="w-40">
            <div class="flex justify-end items-center h-10">
              <ui-icon-btn icon="edit" borderless :size="8" icon-font-size="1.1rem" :disabled="deletingDeviceName === device.name" class="mx-1" @click="editDeviceClick(device)" />
              <ui-icon-btn icon="delete" borderless :size="8" icon-font-size="1.1rem" :disabled="deletingDeviceName === device.name" @click="deleteDeviceClick(device)" />
            </div>
          </td>
        </tr>
      </table>
      <div v-else-if="!loading" class="text-center py-4">
        <p class="text-lg text-gray-100">{{ $strings.MessageNoDevices }}</p>
      </div>
    </app-settings-content>

    <modals-ipods-i-pod-device-modal
      v-model="showIPodDeviceModal"
      :users="users"
      :existing-devices="existingIPodDevices"
      :ipod-device="selectedIPodDevice"
      @update="ipodDevicesUpdated"
      :loadUsers="loadUsers"
    />
  </div>
</template>

<script>
export default {
  asyncData({ store, redirect }) {
    if (!store.getters['user/getIsAdminOrUp']) {
      redirect('/')
    }
  },
  data() {
    return {
      users: [],
      loading: false,
      deletingDeviceName: null,
      settings: null,
      selectedIPodDevice: null,
      showIPodDeviceModal: false
    }
  },
  computed: {
    existingIPodDevices() {
      return this.settings?.ipodDevices || []
    }
  },
  methods: {
    async loadUsers() {
      if (this.users.length) return
      this.users = await this.$axios
        .$get('/api/users')
        .then((res) => res.users.sort((a, b) => a.createdAt - b.createdAt))
        .catch(() => {
          this.$toast.error(this.$strings.ToastFailedToLoadData)
          return []
        })
    },
    getAccessibleBy(device) {
      const user = device.availabilityOption
      if (user === 'userOrUp') return 'Users (excluding Guests)'
      if (user === 'guestOrUp') return 'Users (including Guests)'
      if (user === 'specificUsers') {
        return device.users.map((id) => this.users.find((u) => u.id === id)?.username).join(', ')
      }
      return 'Admins Only'
    },
    editDeviceClick(device) {
      this.selectedIPodDevice = device
      this.showIPodDeviceModal = true
    },
    deleteDeviceClick(device) {
      const payload = {
        message: this.$getString('MessageConfirmDeleteDevice', [device.name]),
        callback: (confirmed) => {
          if (confirmed) this.deleteDevice(device)
        },
        type: 'yesNo'
      }
      this.$store.commit('globals/setConfirmPrompt', payload)
    },
    deleteDevice(device) {
      const payload = {
        ipodDevices: this.existingIPodDevices.filter((d) => d.name !== device.name)
      }
      this.deletingDeviceName = device.name
      this.$axios
        .$patch('/api/ipods/settings', payload)
        .then((data) => {
          this.ipodDevicesUpdated(data.settings.ipodDevices)
        })
        .catch(() => {
          this.$toast.error(this.$strings.ToastRemoveFailed)
        })
        .finally(() => {
          this.deletingDeviceName = null
        })
    },
    ipodDevicesUpdated(ipodDevices) {
      this.settings.ipodDevices = ipodDevices
    },
    addNewDeviceClick() {
      this.selectedIPodDevice = null
      this.showIPodDeviceModal = true
    },
    async init() {
      this.loading = true
      this.$axios
        .$get('/api/ipods/settings')
        .then(async (data) => {
          if (data.settings.ipodDevices.some((d) => d.availabilityOption === 'specificUsers')) {
            await this.loadUsers()
          }
          this.settings = data.settings
        })
        .catch(() => {
          this.$toast.error(this.$strings.ToastFailedToLoadData)
        })
        .finally(() => {
          this.loading = false
        })
    }
  },
  mounted() {
    this.init()
  }
}
</script>
