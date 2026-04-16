import { useEffect, useState } from "react";
import axiosInstance from "../../axiosInstance";
import { useParams, useNavigate } from "react-router-dom";
import BookIcon from "@mui/icons-material/Book";
import StarIcon from "@mui/icons-material/Star";
import AdjustRoundedIcon from "@mui/icons-material/AdjustRounded";
import LockIcon from "@mui/icons-material/Lock";
import PublicIcon from "@mui/icons-material/Public";
import "./repopage.css";

const RepoPage = () => {
  const { repoId } = useParams();
  const navigate = useNavigate();
  const loggedInUserId = localStorage.getItem("userId");

  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("readme");
  const [starred, setStarred] = useState(false);

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        const res = await axiosInstance.get(`/repo/${repoId}`);
        setRepo(res.data[0]);
      } catch (err) {
        console.error("Error fetching repo:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchStarredStatus = async () => {
      try {
        const res = await axiosInstance.get(`/userProfile/${loggedInUserId}`);
        const starredList = res.data.starRepos?.map((id) => id.toString()) || [];
        setStarred(starredList.includes(repoId.toString()));
      } catch (err) {
        console.error("Error fetching star status:", err);
      }
    };

    fetchRepo();
    if (loggedInUserId) fetchStarredStatus();
  }, [repoId]);

  const handleStar = async () => {
    if (!loggedInUserId) return;
    try {
      const res = await axiosInstance.post("/starRepo", {
        userId: loggedInUserId,
        repoId: repoId.toString(),
      });
      setStarred(res.data.starred);
    } catch (err) {
      console.error("Error starring repo:", err);
    }
  };

  if (loading) return <h2 className="repo-loading">Loading...</h2>;
  if (!repo) return <h2 className="repo-loading">Repository not found!</h2>;

  return (
    <div className="repo-wrapper">

      {/* Header */}
      <div className="repo-header">
        <div className="repo-header-left">
          <BookIcon fontSize="small" className="repo-header-icon" />
          <span
            className="repo-owner-name"
            onClick={() => navigate(`/profile/${repo.owner?._id}`)}
          >
            {repo.owner?.username}
          </span>
          <span className="repo-header-slash">/</span>
          <span className="repo-name">{repo.name}</span>
          <span className={`repo-visibility-badge ${repo.visibility ? "public" : "private"}`}>
            {repo.visibility ? (
              <><PublicIcon style={{ fontSize: "0.75rem" }} /> Public</>
            ) : (
              <><LockIcon style={{ fontSize: "0.75rem" }} /> Private</>
            )}
          </span>
        </div>

        <div className="repo-header-right">
          <button
            className={`repo-star-btn ${starred ? "starred" : ""}`}
            onClick={handleStar}
          >
            <StarIcon fontSize="small" />
            {starred ? "Starred" : "Star"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="repo-tabs">
        <button
          className={`repo-tab ${activeTab === "readme" ? "repo-tab-active" : ""}`}
          onClick={() => setActiveTab("readme")}
        >
          <BookIcon fontSize="small" /> README
        </button>
        <button
          className={`repo-tab ${activeTab === "issues" ? "repo-tab-active" : ""}`}
          onClick={() => setActiveTab("issues")}
        >
          <AdjustRoundedIcon fontSize="small" /> Issues
          <span className="repo-tab-count">{repo.issues?.length || 0}</span>
        </button>
      </div>

      {/* Main content */}
      <div className="repo-main">

        {/* Left content */}
        <div className="repo-content">

          {/* README tab */}
          {activeTab === "readme" && (
            <div className="repo-readme-card">
              <div className="repo-readme-header">
                <BookIcon fontSize="small" />
                <span>README</span>
              </div>
              <div className="repo-readme-body">
                {repo.readme ? (
                  <p>{repo.readme}</p>
                ) : (
                  <p className="repo-readme-empty">No README found for this repository.</p>
                )}
              </div>
            </div>
          )}

          {/* Issues tab */}
          {activeTab === "issues" && (
            <div>
              {repo.issues?.length === 0 ? (
                <div className="repo-empty-issues">
                  <AdjustRoundedIcon style={{ fontSize: "3rem", color: "#8b949e" }} />
                  <p>No issues yet!</p>
                </div>
              ) : (
                repo.issues?.map((issue) => (
                  <div key={issue._id} className="repo-issue-card">
                    <AdjustRoundedIcon style={{ color: "#3fb950" }} />
                    <div>
                      <p className="repo-issue-title">{issue.title}</p>
                      <p className="repo-issue-desc">{issue.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Right sidebar */}
        <div className="repo-sidebar">

          <div className="repo-sidebar-section">
            <h4 className="repo-sidebar-title">About</h4>
            <p className="repo-sidebar-desc">
              {repo.description || "No description provided."}
            </p>
          </div>

          <hr className="repo-sidebar-divider" />

          <div className="repo-sidebar-section">
            <div className="repo-stat">
              <StarIcon fontSize="small" className="repo-stat-icon" />
              <span><strong>{repo.stars || 0}</strong> stars</span>
            </div>
            <div className="repo-stat">
              <AdjustRoundedIcon fontSize="small" className="repo-stat-icon" />
              <span><strong>{repo.issues?.length || 0}</strong> issues</span>
            </div>
          </div>

          <hr className="repo-sidebar-divider" />

          <div className="repo-sidebar-section">
            <h4 className="repo-sidebar-title">Owner</h4>
            <div
              className="repo-owner-card"
              onClick={() => navigate(`/profile/${repo.owner?._id}`)}
            >
              <div className="repo-owner-avatar">
                {repo.owner?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="repo-owner-username">{repo.owner?.username}</p>
                <p className="repo-owner-email">{repo.owner?.email}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RepoPage;