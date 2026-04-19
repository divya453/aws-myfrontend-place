import { useMemo } from "react";
import HeatMap from "@uiw/react-heat-map";

const PANEL_COLORS = {
  0: "#161b22",
  10: "#0e4429",
  20: "#006d32",
  30: "#26a641",
  40: "#39d353",
};

const getStartOfYear = () => {
  const currentYear = new Date().getFullYear();
  const jan1 = new Date(`${currentYear}/01/01`);
  const day = jan1.getDay();
  jan1.setDate(jan1.getDate() - day); // ✅ roll back to nearest Sunday
  return jan1;
};

const generateActivityData = () => {
  const data = [];
  const currentYear = new Date().getFullYear();
  let currentDate = new Date(`${currentYear}/01/01`);
  const end = new Date(`${currentYear}/12/31`);

  while (currentDate <= end) {
    const count = Math.floor(Math.random() * 50);
    const formattedDate = currentDate.toISOString().split("T")[0].replace(/-/g, "/");
    data.push({ date: formattedDate, count });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return data;
};

const HeatMapProfile = () => {
  const activityData = useMemo(() => generateActivityData(), []);
  const startDate = useMemo(() => getStartOfYear(), []);

  return (
    <div className="heatmap-container">
      <h4 style={{ color: "#8b949e", marginBottom: "10px", fontWeight: "400" }}>
        Recent Contributions
      </h4>
      <div style={{ overflowX: "auto" }}>
        <HeatMap
          className="HeatMapProfile"
          style={{ color: "#8b949e" }}
          width={720}
          value={activityData}
          weekLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
          startDate={startDate} // ✅ always starts on Sunday
          rectSize={14}
          space={4}
          rectProps={{ rx: 3 }}
          panelColors={PANEL_COLORS}
        />
      </div>
    </div>
  );
};

export default HeatMapProfile;