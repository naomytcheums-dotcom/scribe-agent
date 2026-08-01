import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getConfigStatus, listRecordings, uploadRecording } from '../api.js'

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function sentimentBadgeClass(sentiment) {
  if (sentiment === 'positive') return 'badge badge-positive'
  if (sentiment === 'negative') return 'badge badge-negative'
  return 'badge badge-neutral'
}

function statusBadgeClass(status) {
  if (status === 'completed') return 'badge badge-completed'
  if (status === 'failed') return 'badge badge-failed'
  return 'badge badge-pending'
}

function Home() {
  const [recordings, setRecordings] = useState([])
  const [configured, setConfigured] = useState(true)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const hasPending = recordings.some((r) => r.status === 'pending')

  const load = useCallback(async () => {
    try {
      const [status, list] = await Promise.all([getConfigStatus(), listRecordings()])
      setConfigured(status.llm_configured)
      setRecordings(list)
    } catch {
      // keep previous state
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!hasPending) return undefined
    const interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  }, [hasPending, load])

  async function handleFile(file) {
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      await uploadRecording(file)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Your recordings</h1>
        <p>
          Drop a voice memo and Scribe transcribes it, then writes a structured summary — key
          points, action items, sentiment — and a readable report you can download.
        </p>
      </div>

      {!configured && (
        <div className="form-error">
          No LLM API key is configured on the server yet — transcription and summarization won't
          work until <code>LLM_API_KEY</code> is set as an environment variable on the backend.
        </div>
      )}

      {error && <div className="form-error">{error}</div>}

      <div
        className={`dropzone${dragOver ? ' dragover' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFile(e.dataTransfer.files?.[0])
        }}
      >
        <div className="dropzone-title">{uploading ? 'Uploading...' : 'Drop an audio file here'}</div>
        <div className="dropzone-hint">or click to browse — mp3, m4a, wav, webm</div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      <div className="entry-list">
        {recordings.length === 0 && (
          <div className="empty-state">No recordings yet. Upload your first voice memo above.</div>
        )}
        {recordings.map((r) => (
          <Link to={`/recordings/${r.id}`} className="entry-card" key={r.id}>
            <div className="entry-top">
              <h3 className="entry-title">{r.title || r.original_name}</h3>
              <span className="entry-date">{formatDate(r.created_at)}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <span className={statusBadgeClass(r.status)}>{r.status}</span>
              {r.status === 'completed' && r.sentiment && (
                <span className={sentimentBadgeClass(r.sentiment)}>{r.sentiment}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Home
