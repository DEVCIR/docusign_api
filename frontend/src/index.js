import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'
import { HashRouter } from 'react-router-dom'  // Add this import

import App from './App'
import store from './store'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <HashRouter>  {/* Wrap App component with HashRouter */}
      <App />
    </HashRouter>
  </Provider>,
)
