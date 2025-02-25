import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
const Typography = React.lazy(() => import('./views/theme/typography/Typography'))

// Document
const CreateDocument = React.lazy(() => import('./views/document/create/Create'))
const ListDocument = React.lazy(() => import('./views/document/list/List'))
const ViewDocument = React.lazy(() => import('./views/document/view/View')) // Import your view document component
const SubmitDocument = React.lazy(() => import('./views/document/submit/Submit')) // Import your view document component

// Agreement
const CreateAgreement = React.lazy(() => import('./views/agreement/create/Create'))
const ListAgreement = React.lazy(() => import('./views/agreement/list/List'))
const ViewAgreement = React.lazy(() => import('./views/agreement/view/View')) // Import your view document component
const SubmitAgreement = React.lazy(() => import('./views/agreement/submit/Submit')) // Import your view document component

// User
const CreateUser = React.lazy(() => import('./views/user/add/Add'))
const ListUser = React.lazy(() => import('./views/user/list/List'))

// Base, Buttons, Forms, Charts, Icons, Notifications, etc. (Same as before)

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },

  { path: '/user/add', name: 'Add', element: CreateUser },
  { path: '/user/list', name: 'List', element: ListUser },

  // Document
  { path: '/document/add', name: 'Add Document', element: CreateDocument },
  { path: '/document/list', name: 'List Document', element: ListDocument },
  { path: '/document/view/:documentid?', name: 'View Document', element: ViewDocument }, // Updated route to accept dynamic ID
  { path: '/document/submit/', name: 'View Document', element: SubmitDocument }, // Updated route to accept dynamic ID

  { path: '/agreement/add', name: 'Add Document', element: CreateAgreement },
  { path: '/agreement/list', name: 'List Document', element: ListAgreement },
  { path: '/agreement/view/:documentid?', name: 'View Document', element: ViewAgreement }, // Updated route to accept dynamic ID
  { path: '/agreement/submit/', name: 'View Document', element: SubmitAgreement }, // Updated route to accept dynamic ID

  // Other routes (same as before)
]

export default routes
