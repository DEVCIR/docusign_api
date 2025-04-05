const DashboardPreview = () => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Laptop screen positioned higher but still cut off at right */}
      <div 
        className="absolute" 
        style={{ 
          bottom: "15%",  // Changed from -10% to 15% to move higher
          right: "-10%",  // Keeping the horizontal position the same
          width: "min(110%, 600px)",
          transformOrigin: "bottom right"
        }}>
        {/* Laptop screen mockup with thinner bezel */}
        <div className="relative bg-gray-800 rounded-lg p-0.5 sm:p-1 md:p-1.5 w-full shadow-xl">
          {/* Screen content */}
          <div className="bg-white rounded overflow-hidden aspect-[16/10]">
            {/* Dashboard screenshot */}
            <img
              src="/image.png"
              alt="Dashboard Preview"
              className="object-cover w-full h-full"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/800x500?text=Dashboard+Preview"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPreview

