import { useState, useEffect, useRef } from "react";
import axiosInstance from "../../axiosInstance"; // ← replaced axios
import { useAuth } from "../../authContext";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import "./CreateIssue.css";

const CreateIssueModal = () => {
  const { isIssueModalOpen, setIsIssueModalOpen } = useAuth();
  const loggedInUserId = localStorage.getItem("userId");

  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await axiosInstance.get(`/repo/user/${loggedInUserId}`); // ← updated
        const userRepos = res.data.repositories || [];
        setRepos(userRepos);
        if (userRepos.length > 0) {
          setSelectedRepo(userRepos[0]);
        }
      } catch (err) {
        console.error("Error fetching repos:", err);
      }
    };

    if (isIssueModalOpen) fetchRepos();
  }, [isIssueModalOpen, loggedInUserId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowRepoDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClose = () => {
    setIsIssueModalOpen(false);
    setShowForm(false);
    setTitle("");
    setDescription("");
  };

  const handleCreateIssue = async () => {
    if (!title) {
      alert("Title is required!");
      return;
    }
    if (!selectedRepo) {
      alert("Please select a repository!");
      return;
    }
    try {
      setLoading(true);
      await axiosInstance.post("/issue/create", { // ← updated
        title,
        description,
        repository: selectedRepo._id,
      });
      alert("Issue created successfully!");
      handleClose();
    } catch (err) {
      console.error("Error creating issue:", err);
      alert("Failed to create issue!");
    } finally {
      setLoading(false);
    }
  };

  if (!isIssueModalOpen) return null;

  return (
    <div className="issue-modal-overlay" onClick={handleClose}>
      <div className="issue-modal" onClick={(e) => e.stopPropagation()}>

        {/* Modal header */}
        <div className="issue-modal-header">
          <h3>Create new issue</h3>
          <CloseIcon className="issue-modal-close" onClick={handleClose} />
        </div>

        {/* Repo selector */}
        <div className="issue-modal-repo" ref={dropdownRef}>
          <label className="issue-modal-label">Repository</label>
          <div
            className="issue-modal-repo-selector"
            onClick={() => setShowRepoDropdown(!showRepoDropdown)}
          >
            <span>{selectedRepo ? selectedRepo.name : "Select a repository"}</span>
            <ArrowDropDownIcon fontSize="small" />
          </div>

          {showRepoDropdown && (
            <div className="issue-modal-repo-dropdown">
              {repos.length === 0 ? (
                <p className="issue-modal-no-repos">No repositories found</p>
              ) : (
                repos.map((repo) => (
                  <div
                    key={repo._id}
                    className="issue-modal-repo-item"
                    onClick={() => {
                      setSelectedRepo(repo);
                      setShowRepoDropdown(false);
                    }}
                  >
                    {repo.name}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Blank issue template */}
        {!showForm && (
          <div className="issue-modal-template" onClick={() => setShowForm(true)}>
            <div className="issue-modal-template-text">
              <p className="issue-modal-template-title">Blank issue</p>
              <p className="issue-modal-template-desc">Create a new issue from scratch</p>
            </div>
            <ArrowForwardIcon fontSize="small" />
          </div>
        )}

        {/* Issue form */}
        {showForm && (
          <div className="issue-modal-form">
            <input
              type="text"
              className="issue-modal-input"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="issue-modal-textarea"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
            <div className="issue-modal-actions">
              <button className="issue-modal-cancel" onClick={handleClose}>
                Cancel
              </button>
              <button
                className="issue-modal-submit"
                onClick={handleCreateIssue}
                disabled={loading || !title}
              >
                {loading ? "Creating..." : "Create issue"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CreateIssueModal;