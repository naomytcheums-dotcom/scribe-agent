import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import RecordingDetail from './pages/RecordingDetail.jsx'
import './App.css'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recordings/:id" element={<RecordingDetail />} />
      </Routes>
    </Layout>
  )
}

export default App
