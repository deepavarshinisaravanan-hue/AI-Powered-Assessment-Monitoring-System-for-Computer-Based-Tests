import { API_BASE_URL } from "./api"

export function createWebRTCSignaling(sessionId, role, onMessage, onClose) {
  const signalingUrl = new URL(
    `${API_BASE_URL}/monitoring/ws/${sessionId}/${role}`,
    window.location.origin
  )
  signalingUrl.protocol = signalingUrl.protocol === "https:" ? "wss:" : "ws:"
  const ws = new WebSocket(signalingUrl.toString())
  const pendingMessages = []

  ws.onopen = () => {
    console.info(`[WebRTC ${sessionId}/${role}] signaling connected: ${signalingUrl.href}`)
    for (const message of pendingMessages.splice(0)) {
      try {
        ws.send(JSON.stringify(message))
      } catch (error) {
        console.error(`[WebRTC ${sessionId}/${role}] failed to flush queued ${message?.type || "message"}:`, error)
      }
    }
  }

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data)
      Promise.resolve(onMessage?.(message)).catch((error) => {
        console.error(`[WebRTC ${sessionId}/${role}] signaling message handler failed:`, error)
      })
    } catch (error) {
      console.error("Invalid WebRTC signaling message:", error)
    }
  }

  ws.onclose = (event) => {
    console.info(`[WebRTC ${sessionId}/${role}] signaling closed (${event.code}): ${event.reason || "no reason supplied"}`)
    if (pendingMessages.length) {
      console.warn(`[WebRTC ${sessionId}/${role}] discarded ${pendingMessages.length} queued signaling message(s)`)
    }
    onClose?.(event)
  }

  ws.onerror = (error) => {
    console.error(`[WebRTC ${sessionId}/${role}] signaling socket error at ${signalingUrl.href}:`, error)
  }

  const send = (message) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
      return true
    }
    if (ws.readyState === WebSocket.CONNECTING) {
      pendingMessages.push(message)
      return true
    }
    console.warn(`[WebRTC ${sessionId}/${role}] unable to send ${message?.type || "message"}; socket is closed`)
    return false
  }

  const close = () => {
    ws.close()
  }

  return {
    send,
    close,
    socket: ws,
  }
}
