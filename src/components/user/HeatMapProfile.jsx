import { useMemo } from "react";
import HeatMap from "@uiw/react-heat-map";

// Using a consistent date reference
const START_DATE = new Date("2026/01/01");

// Standard GitHub Contribution Colors
const PANEL_COLORS = {
  0: "#161b22",
  10: "#0e4429",
  20: "#006d32",
  30: "#26a641",
  40: "#39d353",
};

const generateActivityData = (startDateStr, endDateStr) => {
  const data = [];
  let currentDate = new Date(startDateStr);
  const end = new Date(endDateStr);

  while (currentDate <= end) {
    // Math.random simulation: in a real app, this would come from repo/user data
    const count = Math.floor(Math.random() * 50);
    
    // Formatting as YYYY/MM/DD to match the component's internal date handling
    const formattedDate = currentDate.toISOString().split("T")[0].replace(/-/g, "/");
    
    data.push({
      date: formattedDate,
      count: count,
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return data;
};

const HeatMapProfile = () => {
  // Memoize data to prevent re-generation on every UI update/tab switch
  const activityData = useMemo(() => {
    return generateActivityData("2026/01/01", "2026/12/31");
  }, []);

  return (
    <div className="heatmap-container">
      <h4 style={{ color: "#8b949e", marginBottom: "10px", fontWeight: "400" }}>
        Recent Contributions
      </h4>
      <HeatMap
        className="HeatMapProfile"
        style={{ color: "#8b949e" }} // Lighter text color to match GitHub UI
        width={720}
        value={activityData}
        weekLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
        startDate={START_DATE}
        rectSize={14}
        space={4}
        rectProps={{
          rx: 3, // Slightly rounder corners for a modern look
        }}
        panelColors={PANEL_COLORS}
      />
    </div>
  );
};

export default HeatMapProfile;