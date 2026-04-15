import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance"; // ← replaced axios
import AdjustRoundedIcon from "@mui/icons-material/AdjustRounded";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../../authContext";
import "./issue.css";

const Issues = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { setIsIssueModalOpen } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await axiosInstance.get("/issue/all"); // ← updated
        setIssues(res.data);
      } catch (err) {
        console.error("Error fetching issues:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [userId]);

  if (loading) return <h2 style={{ color: "white", padding: "20px" }}>Loading...</h2>;

  return (
    <div className="issues-wrapper">

      {/* Header */}
      <div className="issues-header">
        <h2 className="issues-title">Issues</h2>
      </div>

      {/* No issues state */}
      {issues.length === 0 ? (
        <div className="issues-empty-card">

          {/* Close icon inside top right of card */}
          <div className="issues-empty-card-top">
            <CloseIcon
              className="issues-close-icon"
              onClick={() => navigate(-1)}
            />
          </div>

          <AdjustRoundedIcon style={{ fontSize: "3rem", color: "#8b949e" }} />
          <h3 className="issues-empty-title">No issues have been created yet!</h3>
          <p className="issues-empty-desc">
            Issues help you track bugs, tasks and feature requests.
          </p>

          {/* Create button bottom right */}
          <div className="issues-empty-card-bottom">
            <button
              className="issues-create-btn"
              onClick={() => setIsIssueModalOpen(true)}
            >
              Create your first issue
            </button>
          </div>

        </div>
      ) : (
        <div className="issues-list">
          {issues.map((issue) => (
            <div key={issue._id} className="issues-card">
              <div className="issues-card-left">
                <AdjustRoundedIcon style={{ color: "#3fb950" }} />
                <div>
                  <h4 className="issues-card-title">{issue.title}</h4>
                  <p className="issues-card-desc">{issue.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Issues;