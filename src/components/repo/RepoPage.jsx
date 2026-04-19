import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import BookIcon from "@mui/icons-material/Book";
import StarIcon from "@mui/icons-material/Star";
import AdjustRoundedIcon from "@mui/icons-material/AdjustRounded";
import LockIcon from "@mui/icons-material/Lock";
import PublicIcon from "@mui/icons-material/Public";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CloseIcon from "@mui/icons-material/Close";
import "./repopage.css";

const RepoPage = () => {
  const { repoId } = useParams();
  const navigate = useNavigate();
  const loggedInUserId = localStorage.getItem("userId");

  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("readme");
  const [starred, setStarred] = useState(false);
  const [accessError, setAccessError] = useState(null); // "private" | "notfound" | null

  const [dotsOpen, setDotsOpen] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({ name: "", description: "", readme: "", visibility: "public" });
  const [updating, setUpdating] = useState(false);

  const dotsRef = useRef(null);

  useEffect(() => {
    const fetchRepoData = async () => {
      setLoading(true);
      setAccessError(null);
      try {
        const repoRes = await axiosInstance.get(`/repo/${repoId}`);
        const repoData = repoRes.data;
        setRepo(repoData);
        setUpdateForm({
          name: repoData.name || "",
          description: repoData.description || "",
          readme: repoData.readme || "",
          visibility: repoData.visibility || "public",
        });

        if (loggedInUserId) {
          const userRes = await axiosInstance.get(`/userProfile/${loggedInUserId}`);
          const starredList = userRes.data.starredRepos?.map((id) => id.toString()) || [];
          setStarred(starredList.includes(repoId.toString()));
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setAccessError("private");
        } else if (err.response?.status === 404) {
          setAccessError("notfound");
        } else {
          setAccessError("notfound");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRepoData();
  }, [repoId, loggedInUserId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dotsRef.current && !dotsRef.current.contains(e.target)) {
        setDotsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStar = async () => {
    if (!loggedInUserId) {
      alert("Please login to star repositories!");
      return;
    }
    try {
      const res = await axiosInstance.post("/starRepo", {
        userId: loggedInUserId,
        repoId: repoId.toString(),
      });
      setStarred(res.data.starred);
      setRepo((prev) => ({
        ...prev,
        stars: res.data.starred ? prev.stars + 1 : prev.stars - 1,
      }));
    } catch (err) {
      console.error("Error starring repo:", err);
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm("Are you sure you want to delete this repository? This cannot be undone!");
    if (!confirm) return;
    try {
      await axiosInstance.delete(`/repo/delete/${repoId}`);
      navigate("/");
    } catch (err) {
      console.error("Error deleting repo:", err);
      alert("Failed to delete repository!");
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const res = await axiosInstance.put(`/repo/update/${repoId}`, {
        name: updateForm.name,
        description: updateForm.description,
        readme: updateForm.readme,
      });

      if (updateForm.visibility !== repo.visibility) {
        await axiosInstance.patch(`/repo/toggle/${repoId}`);
      }

      setRepo((prev) => ({
        ...prev,
        ...res.data,
        visibility: updateForm.visibility,
      }));
      setShowUpdateModal(false);
    } catch (err) {
      console.error("Error updating repo:", err);
      alert("Failed to update repository!");
    } finally {
      setUpdating(false);
    }
  };

  const isOwner = repo?.owner?._id?.toString() === loggedInUserId;

  if (loading) return <h2 className="repo-loading">Loading...</h2>;

  if (accessError === "private") {
    return (
      <div className="repo-access-error">
        <LockIcon style={{ fontSize: "3rem", color: "#8b949e" }} />
        <h2>This repository is private</h2>
        <p>You don't have permission to view this repository.</p>
        <button className="repo-access-back-btn" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (accessError === "notfound" || !repo) {
    return (
      <div className="repo-access-error">
        <BookIcon style={{ fontSize: "3rem", color: "#8b949e" }} />
        <h2>Repository not found</h2>
        <p>This repository may have been deleted or doesn't exist.</p>
        <button className="repo-access-back-btn" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="repo-wrapper">
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
          <span className={`repo-visibility-badge ${repo.visibility === "public" ? "public" : "private"}`}>
            {repo.visibility === "public" ? (
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

          {isOwner && (
            <div className="repo-dots-wrapper" ref={dotsRef}>
              <button className="repo-dots-btn" onClick={() => setDotsOpen(!dotsOpen)}>
                <MoreHorizIcon fontSize="small" />
              </button>
              {dotsOpen && (
                <div className="repo-dots-dropdown">
                  <div
                    className="repo-dots-item"
                    onClick={() => {
                      setDotsOpen(false);
                      setShowUpdateModal(true);
                    }}
                  >
                    Update Repository
                  </div>
                  <div
                    className="repo-dots-item repo-dots-danger"
                    onClick={() => {
                      setDotsOpen(false);
                      handleDelete();
                    }}
                  >
                    Delete Repository
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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

      <div className="repo-main">
        <div className="repo-content">
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

      {showUpdateModal && (
        <div className="repo-modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="repo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="repo-modal-header">
              <h3>Update Repository</h3>
              <CloseIcon style={{ cursor: "pointer" }} onClick={() => setShowUpdateModal(false)} />
            </div>
            <div className="repo-modal-body">
              <label className="repo-modal-label">Name</label>
              <input
                id="repo-update-name"
                name="repo-update-name"
                className="repo-modal-input"
                type="text"
                value={updateForm.name}
                onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
              />
              <label className="repo-modal-label">Description</label>
              <input
                id="repo-update-description"
                name="repo-update-description"
                className="repo-modal-input"
                type="text"
                value={updateForm.description}
                onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
              />
              <label className="repo-modal-label">README</label>
              <textarea
                id="repo-update-readme"
                name="repo-update-readme"
                className="repo-modal-textarea"
                value={updateForm.readme}
                onChange={(e) => setUpdateForm({ ...updateForm, readme: e.target.value })}
                rows={6}
              />
              <label className="repo-modal-label">Visibility</label>
              <div className="repo-modal-visibility">
                <button
                  type="button"
                  className={`repo-modal-visibility-btn ${updateForm.visibility === "public" ? "active" : ""}`}
                  onClick={() => setUpdateForm({ ...updateForm, visibility: "public" })}
                >
                  <PublicIcon style={{ fontSize: "1rem" }} /> Public
                </button>
                <button
                  type="button"
                  className={`repo-modal-visibility-btn ${updateForm.visibility === "private" ? "active" : ""}`}
                  onClick={() => setUpdateForm({ ...updateForm, visibility: "private" })}
                >
                  <LockIcon style={{ fontSize: "1rem" }} /> Private
                </button>
              </div>
            </div>
            <div className="repo-modal-footer">
              <button className="repo-modal-cancel" onClick={() => setShowUpdateModal(false)}>
                Cancel
              </button>
              <button className="repo-modal-save" onClick={handleUpdate} disabled={updating}>
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepoPage;