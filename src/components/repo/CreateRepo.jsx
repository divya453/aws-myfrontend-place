import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance"; // ← replaced axios
import "./createrepo.css";

const CreateRepo = () => {
  const navigate = useNavigate();
  const loggedInUserId = localStorage.getItem("userId");

  const [repoName, setRepoName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState(true);
  const [owner, setOwner] = useState(null);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axiosInstance.get(`/userProfile/${loggedInUserId}`); // ← updated
        setCurrentUser(res.data);
        setOwner(res.data);
        setOwnerSearch(res.data.username);
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };

    const fetchAllUsers = async () => {
      try {
        const res = await axiosInstance.get("/allUsers"); // ← updated
        setAllUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchCurrentUser();
    fetchAllUsers();
  }, [loggedInUserId]);

  const handleOwnerSearch = (e) => {
    const query = e.target.value;
    setOwnerSearch(query);
    setShowDropdown(true);

    if (query === "") {
      setFilteredUsers([]);
      return;
    }

    const filtered = allUsers.filter((user) =>
      user.username.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleSelectOwner = (user) => {
    setOwner(user);
    setOwnerSearch(user.username);
    setShowDropdown(false);
    setFilteredUsers([]);
  };

  const handleCreateRepo = async () => {
    if (!repoName) {
      alert("Repository name is required!");
      return;
    }
    if (!owner) {
      alert("Owner is required!");
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post("/repo/create", { // ← updated
        name: repoName,
        description: description,
        visibility: visibility,
        owner: owner._id,
      });
      navigate(`/profile/${loggedInUserId}`);
    } catch (err) {
      console.error("Error creating repository:", err);
      alert("Failed to create repository!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-repo-wrapper">
      <h2 className="create-repo-title">Create a new repository</h2>

      <hr className="create-repo-divider" />

      <div className="create-repo-form">

        {/* Owner + Repo Name */}
        <div className="create-repo-row">

          {/* Owner */}
          <div className="create-repo-field">
            <label className="create-repo-label">Owner</label>
            <div className="create-repo-owner-search">
              <input
                type="text"
                className="create-repo-input"
                value={ownerSearch}
                onChange={handleOwnerSearch}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search owner..."
              />
              {showDropdown && filteredUsers.length > 0 && (
                <div className="create-repo-dropdown">
                  {filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      className="create-repo-dropdown-item"
                      onClick={() => handleSelectOwner(user)}
                    >
                      <div className="create-repo-dropdown-avatar">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                      {user.username}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <span className="create-repo-slash">/</span>

          {/* Repo Name */}
          <div className="create-repo-field">
            <label className="create-repo-label">Repository name</label>
            <input
              type="text"
              className="create-repo-input"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="my-awesome-repo"
            />
          </div>
        </div>

        {/* Description */}
        <div className="create-repo-field" style={{ marginTop: "20px" }}>
          <label className="create-repo-label">
            Description <span className="create-repo-optional">(optional)</span>
          </label>
          <input
            type="text"
            className="create-repo-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description of your repository..."
          />
        </div>

        <hr className="create-repo-divider" />

        {/* Visibility */}
        <div className="create-repo-field">
          <label className="create-repo-label">Visibility</label>
          <div className="create-repo-visibility">

            <div
              className={`create-repo-visibility-option ${visibility ? "active" : ""}`}
              onClick={() => setVisibility(true)}
            >
              <div className="create-repo-visibility-radio">
                {visibility && <div className="create-repo-visibility-radio-dot" />}
              </div>
              <div>
                <p className="create-repo-visibility-title">🌐 Public</p>
                <p className="create-repo-visibility-desc">
                  Anyone on the internet can see this repository.
                </p>
              </div>
            </div>

            <div
              className={`create-repo-visibility-option ${!visibility ? "active" : ""}`}
              onClick={() => setVisibility(false)}
            >
              <div className="create-repo-visibility-radio">
                {!visibility && <div className="create-repo-visibility-radio-dot" />}
              </div>
              <div>
                <p className="create-repo-visibility-title">🔒 Private</p>
                <p className="create-repo-visibility-desc">
                  You choose who can see and commit to this repository.
                </p>
              </div>
            </div>

          </div>
        </div>

        <hr className="create-repo-divider" />

        {/* Submit button */}
        <div className="create-repo-submit">
          <button
            className="create-repo-btn"
            onClick={handleCreateRepo}
            disabled={loading || !repoName}
          >
            {loading ? "Creating..." : "Create repository"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateRepo;