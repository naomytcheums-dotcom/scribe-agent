import { Link } from 'react-router-dom'
import './Layout.css'

function Layout({ children }) {
  return (
    <div className="app-shell">
      <header className="masthead">
        <div className="masthead-inner">
          <Link to="/" className="wordmark">
            Scribe<span className="wordmark-dot">.</span>
          </Link>
          <span className="masthead-tag">Voice notes, transcribed &amp; summarized</span>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}

export default Layout
