import React from 'react'
import ReactDOM from 'react-dom/client'
import ROICalculator from './components/ROICalculator/ROICalculator'
import './components/ROICalculator/ROICalculator.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ROICalculator showHero={true} />
  </React.StrictMode>
)
