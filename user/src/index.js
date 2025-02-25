import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'
import { BrowserRouter } from 'react-router-dom' // Add this import
import App from './App'
import store from './store'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      {/* <HashRouter>
      {' '} */}
      {/* Wrap App component with HashRouter */}
      {/* <DevSupport ComponentPreviews={ComponentPreviews} useInitialHook={useInitial}>
      <App />
    </DevSupport> */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
      ,{/* </HashRouter> */}
    </Provider>
    ,
  </StrictMode>,
)
