interface MetricCardProps {
  title: string;
  value: number;
  color: "amber" | "blue" | "green" | "red";
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, color }) => {
  const getColorClass = () => {
    switch (color) {
      case "amber":
        return "bg-amber-50 text-amber-700";
      case "blue":
        return "bg-blue-50 text-blue-700";
      case "green":
        return "bg-green-50 text-green-700";
      case "red":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  return (
    <div className={`p-4 rounded-md ${getColorClass()}`}>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
};

export default MetricCard;

