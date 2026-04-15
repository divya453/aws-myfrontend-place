import { useMemo } from "react";
import HeatMap from "@uiw/react-heat-map";

// Defined outside component so it never changes reference
const START_DATE = new Date("2026/01/01");

// Fixed threshold colors like GitHub style
const PANEL_COLORS = {
  0: "#161b22",
  10: "#0e4429",
  20: "#006d32",
  30: "#26a641",
  40: "#39d353",
};

// Generate activity data with corrected date format
const generateActivityData = (startDate, endDate) => {
  const data = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    const count = Math.floor(Math.random() * 50);
    // Using replace to avoid timezone off-by-one-day issues
    data.push({
      date: currentDate.toISOString().split("T")[0].replace(/-/g, "/"),
      count: count,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return data;
};

const HeatMapProfile = () => {
  // useMemo so data is only generated once, not on every render
  const activityData = useMemo(() => {
    return generateActivityData("2026/01/01", "2026/12/31");
  }, []);

  return (
    <div>
      <h4>Recent Contributions</h4>
      <HeatMap
        className="HeatMapProfile"
        style={{ color: "white" }}
        width={700}
        value={activityData}
        weekLabels={["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"]}
        startDate={START_DATE}
        rectSize={15}
        space={3}
        rectProps={{
          rx: 2.5,
        }}
        panelColors={PANEL_COLORS}
      />
    </div>
  );
};

export default HeatMapProfile;