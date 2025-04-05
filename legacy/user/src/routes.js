import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
const Typography = React.lazy(() => import('./views/theme/typography/Typography'))
// Colors.apply

// Document
// const CreateDocument = React.lazy(() => import('./views/document/create/Create'))
const ListDocument = React.lazy(() => import('./views/document/list/List'))
const ViewDocument = React.lazy(() => import('./views/document/view/View')) // Import your view document component
const ViewPublicDocument = React.lazy(() => import('./views/document/view/ViewPublic')) // Import your view document component
const SubmitDocument = React.lazy(() => import('./views/document/submit/Submit')) // Import your view document component

// const CreateAgreement = React.lazy(() => import('./views/agreement/create/Create'))
const ListAgreement = React.lazy(() => import('./views/agreement/list/List'))
const ViewAgreement = React.lazy(() => import('./views/agreement/view/View')) // Import your view document component
const ViewPublicAgreement = React.lazy(() => import('./views/agreement/view/ViewPublic')) // Import your view document component
const SubmitAgreement = React.lazy(() => import('./views/agreement/submit/Submit')) // Import your view document component

// User
// const CreateUser = React.lazy(() => import('./views/user/add/Add'))
// const ListUser = React.lazy(() => import('./views/user/list/List'))

// const Signature = React.lazy(() => import('./views/document/submit/SignatureModal'))
// const ProcessDocument = React.lazy(() => import('./views/document/process/Process'))
// Base, Buttons, Forms, Charts, Icons, Notifications, etc. (Same as before)

const Logout = React.lazy(() => import('./views/logout'))
const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },

  // { path: '/user/add', name: 'Add', element: CreateUser },
  // { path: '/user/list', name: 'List', element: ListUser },

  // { path: '/document/add', name: 'Add Document', element: CreateDocument },
  { path: '/document/list', name: 'List Document', element: ListDocument },
  {
    path: '/document/view/:documentid?',
    name: 'View Document',
    element: ViewDocument,
  },
  {
    path: '/document/view_public/:documentid?',
    name: 'View Document',
    element: ViewPublicDocument,
  },
  { path: '/document/submit/', name: 'View Document', element: SubmitDocument }, // Updated route to accept dynamic ID

  // { path: '/agreement/add', name: 'Add Document', element: CreateAgreement },
  { path: '/agreement/list', name: 'List Document', element: ListAgreement },
  {
    path: '/agreement/view/:documentid?',
    name: 'View Document',
    element: ViewAgreement,
  },
  {
    path: '/agreement/view_public/:documentid?',
    name: 'View Document',
    element: ViewPublicAgreement,
  },
  { path: '/agreement/submit/', name: 'View Document', element: SubmitAgreement }, // Updated route to accept dynamic ID
  { path: '/logout/', name: 'Logout', element: Logout }, // Updated route to accept dynamic ID
  // Other routes (same as before)
]

export default routes
