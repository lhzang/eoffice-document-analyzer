import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TAppFeatureKey } from '../constants/permission'
import type { CurrentAccountDetailResponse } from '../services/api'

type TDetailUser = Omit<CurrentAccountDetailResponse, 'currentPermission'> & {
  currentPermission: TAppFeatureKey[]
}

export const useUserProfileStore = defineStore(
  'profileStore',
  () => {
    const user = ref<TDetailUser | null>(null)
    const accessToken = ref<string | null>(null)
    function updateUser(newUser: TDetailUser | null) {
      if (newUser && newUser.positions) {
        const mockPositions = [
          {
            id: 'mock-pos-ban-dao-tao',
            title: 'Ban Đào tạo',
            unitId: 'mock-unit-ban-dao-tao',
            unitName: 'Trường Đại học Bách Khoa Hà Nội',
            unitShortName: 'HUST'
          },
          {
            id: 'mock-pos-ban-tcns',
            title: 'Ban Tổ chức - Nhân sự',
            unitId: 'mock-unit-ban-tcns',
            unitName: 'Trường Đại học Bách Khoa Hà Nội',
            unitShortName: 'HUST'
          }
        ]
        mockPositions.forEach(mockPos => {
          if (!newUser.positions.some(p => p.id === mockPos.id)) {
            newUser.positions.push(mockPos as any)
          }
        })
      }
      user.value = newUser
    }
    
    setTimeout(() => {
      if (user.value) {
        updateUser(user.value)
      }
    }, 500)

    function clearUserInfo() {
      user.value = null
      accessToken.value = null
    }

    function updateToken(token: string | null) {
      accessToken.value = token
    }

    return { user, updateUser, clearUserInfo, updateToken, accessToken }
  },
  {
    persist: {
      storage: localStorage
    }
  }
)
