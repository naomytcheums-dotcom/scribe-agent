export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8091'

async function handle(res) {
  if (!res.ok) {
    let message = 'Something went wrong.'
    try {
      const data = await res.json()
      message = data.detail || message
    } catch {
      // ignore
    }
    throw new Error(message)
  }
  return res.json()
}

export async function getConfigStatus() {
  const res = await fetch(`${API_URL}/api/config-status`)
  return handle(res)
}

export async function uploadRecording(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_URL}/api/recordings`, { method: 'POST', body: formData })
  return handle(res)
}

export async function listRecordings() {
  const res = await fetch(`${API_URL}/api/recordings`)
  return handle(res)
}

export async function getRecording(id) {
  const res = await fetch(`${API_URL}/api/recordings/${id}`)
  return handle(res)
}

export async function deleteRecording(id) {
  const res = await fetch(`${API_URL}/api/recordings/${id}`, { method: 'DELETE' })
  return handle(res)
}

export function markdownDownloadUrl(id) {
  return `${API_URL}/api/recordings/${id}/markdown`
}

export function transcriptDownloadUrl(id) {
  return `${API_URL}/api/recordings/${id}/transcript`
}
