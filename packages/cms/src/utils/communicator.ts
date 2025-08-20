import { IframeCommunicator } from '@ff/utils'

export const communicator = new IframeCommunicator()

export function logoutIframeCommunicator() {
  communicator.postMessage({
    type: 'logout'
  })

  setTimeout(() => {
    window.location.replace(
      `${import.meta.env.VITE_CERTIFICATION_CENTER_PATH}?redirectURL=${window.location.href}`
    )
  }, 500)
}

export function createIframeCommunicator() {
  communicator.createIframe(import.meta.env.VITE_CERTIFICATION_CENTER_PATH)
}

export function updateIframeCommunicator({
  token,
  refreshToken
}: {
  token: string
  refreshToken: string
}) {
  communicator.postMessage({
    type: 'message',
    data: {
      token,
      refreshToken
    }
  })
}
