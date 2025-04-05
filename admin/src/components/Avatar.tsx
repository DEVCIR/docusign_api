interface AvatarProps {
    name: string
    size?: "sm" | "md" | "lg"
    className?: string
  }
  
  const Avatar = ({ name, size = "md", className = "" }: AvatarProps) => {
    // Get initials from name
    const initials = name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  
    // Determine size class
    const sizeClass = {
      sm: "h-6 w-6 text-xs",
      md: "h-8 w-8 text-sm",
      lg: "h-10 w-10 text-base",
    }[size]
  
    return (
      <div
        className={`rounded-full bg-gray-200 flex items-center justify-center text-gray-700 ${sizeClass} ${className}`}
      >
        {initials}
      </div>
    )
  }
  
  export default Avatar
  
  