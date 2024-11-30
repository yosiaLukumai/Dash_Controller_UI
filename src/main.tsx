import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { createBrowserRouter, RouterProvider, RouteObject } from 'react-router-dom'
import NotFound from './pages/NotFound'
import Login from './pages/Land/Login'
import Dashboard from './layout/Dashboard'
import Dash from './pages/Dash/Dash'
import { UserProvider } from './contexts/userContext'
import Protected from './contexts/Protected'
import Register from './pages/Land/Register'

const router: RouteObject[] = [
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ]
  },
  {
    path: "/auth/:id",
    element: <Protected><Dashboard /></Protected>,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Dash />,
      },
    ]
  }
]

const browserRouter = createBrowserRouter(router)

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <UserProvider>
        <RouterProvider router={browserRouter} />
      </UserProvider>
    </StrictMode>
  )
} else {
  console.error('Root element not found')
}

export default router