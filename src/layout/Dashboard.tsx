import { Outlet } from "react-router-dom"

export default function DashboardLayout() {


  return (
    <div className=" bg-gray-900 w h-screen">
      <div className="w-1/2 mx-auto">
          <Outlet />
      </div>
    </div>
  )
}