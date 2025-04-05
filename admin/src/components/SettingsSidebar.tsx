"use client"

import { useNavigate } from "react-router-dom"
import {
  User,
  Settings,
  CreditCard,
  Building2,
  UserCircle,
  Shield,
  Mail,
  FileSignature,
  PenTool,
  VoicemailIcon as Fax,
  Folder,
  Tag,
  LifeBuoy,
  Plus,
} from "lucide-react"

interface SettingsSidebarProps {
  activeItem: string
}

const SettingsSidebar = ({ activeItem }: SettingsSidebarProps) => {
  const navigate = useNavigate()

  const menuItems = [
    { id: "profile", label: "Profile", icon: <User size={18} />, path: "/settings/profile" },
    { id: "preferences", label: "Preferences", icon: <Settings size={18} />, path: "/settings/preferences" },
    { id: "billing", label: "Billing", icon: <CreditCard size={18} />, path: "/settings/billing" },
    { id: "organizations", label: "Organizations", icon: <Building2 size={18} />, path: "/settings/organizations-list" },
    { id: "account", label: "Account", icon: <UserCircle size={18} />, path: "/settings/account" },
    { id: "security", label: "Security", icon: <Shield size={18} />, path: "/settings/security" },
    { id: "email", label: "Email", icon: <Mail size={18} />, path: "/settings/email" },
    { id: "sign-requests", label: "Sign Requests", icon: <FileSignature size={18} />, path: "/settings/sign-requests" },
    { id: "signatures", label: "Signatures", icon: <PenTool size={18} />, path: "/settings/signatures" },
    { id: "faxing", label: "Faxing", icon: <Fax size={18} />, path: "/settings/faxing" },
    { id: "folders", label: "Folders", icon: <Folder size={18} />, path: "/settings/folders" },
    { id: "labels", label: "Labels", icon: <Tag size={18} />, path: "/settings/labels" },
    {
      id: "support-tickets",
      label: "Support Tickets",
      icon: <LifeBuoy size={18} />,
      path: "/settings/support-tickets",
    },
  ]

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-medium text-gray-600">Personal Settings</h2>
      </div>
      <nav className="p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                  activeItem === item.id ? "bg-gray-100 text-blue-600 font-medium" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className={`mr-3 ${activeItem === item.id ? "text-blue-600" : "text-gray-500"}`}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-2 mt-4">
        <button
          onClick={() => handleNavigation("/settings/new-organization")}
          className="w-full flex items-center px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-50 border border-gray-200 bg-white"
        >
          <span className="text-gray-500 mr-3">
            <Plus size={18} />
          </span>
          New Organization
        </button>
      </div>
    </div>
  )
}

export default SettingsSidebar

