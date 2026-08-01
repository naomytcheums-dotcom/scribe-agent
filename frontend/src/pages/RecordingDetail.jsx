import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteRecording, getRecording, markdownDownloadUrl, transcriptDownloadUrl } from '../api.js'

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ListSection({ title, items }) {
  if (!items || items.length === 0) return null
  return (
    <div className="section">
      <h2>{title}</h2>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function RecordingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [recording, setRecording] = useState(null)
  const [showTranscript, setShowTranscript] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getRecording(id)
      .then(setRecording)
      .catch((err) => setError(err.message))
  }, [id])

  async function handleDelete() {
    if (!window.confirm('Delete this recording and its reports?')) return
    await deleteRecording(id)
    navigate('/')
  }

  if (error) {
    return (
      <div>
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <div className="form-error">{error}</div>
      </div>
    )
  }

  if (!recording) return null

  if (recording.status === 'pending') {
    return (
      <div>
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <div className="paper">
          <p>Still transcribing and summarizing this recording — this page will update automatically.</p>
        </div>
      </div>
    )
  }

  if (recording.status === 'failed') {
    return (
      <div>
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <div className="form-error">
          This recording failed to process: {recording.error_message || 'unknown error.'}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Link to="/" className="back-link">
        ← Back
      </Link>

      <div className="detail-header">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>{recording.title}</h1>
          <p>{formatDate(recording.created_at)}</p>
        </div>
      </div>

      <div className="paper">
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: '#2c2620' }}>{recording.summary}</p>
      </div>

      <div className="detail-actions">
        <a className="btn-outline" href={markdownDownloadUrl(recording.id)}>
          Download Markdown report
        </a>
        <a className="btn-outline" href={transcriptDownloadUrl(recording.id)}>
          Download transcript
        </a>
        <button className="btn-outline" onClick={() => setShowTranscript((v) => !v)}>
          {showTranscript ? 'Hide transcript' : 'View transcript'}
        </button>
      </div>

      {showTranscript && <div className="transcript-box">{recording.raw_transcript}</div>}

      <ListSection title="Main points" items={recording.main_points} />
      <ListSection title="Action items" items={recording.action_items} />
      <ListSection title="Follow-up" items={recording.follow_up} />
      <ListSection title="Stories" items={recording.stories} />
      <ListSection title="References" items={recording.references} />
      <ListSection title="Arguments" items={recording.arguments} />
      <ListSection title="Related topics" items={recording.related_topics} />

      <div className="section">
        <button className="btn-text-danger" onClick={handleDelete}>
          Delete this recording
        </button>
      </div>
    </div>
  )
}

export default RecordingDetail
