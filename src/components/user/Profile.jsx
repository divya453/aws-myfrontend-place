import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import BookIcon from "@mui/icons-material/Book";
import StarIcon from "@mui/icons-material/Star";
import GridViewIcon from "@mui/icons-material/GridView";
import HeatMapProfile from "./HeatMapProfile";
import "./profile.css";

const Profile = () => {
  const { userId } = useParams();
  const loggedInUserId = localStorage.getItem("userId");
  const isOwnProfile = userId === loggedInUserId;

  const [userDetails, setUserDetails] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [starredRepoDetails, setStarredRepoDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await axiosInstance.get(`/userProfile/${userId}`);
        setUserDetails(res.data);
      } catch (err) {
        console.error("Cannot fetch user details:", err);
      }
    };

    const fetchRepositories = async () => {
      try {
        const res = await axiosInstance.get(`/repo/user/${userId}`);
        setRepositories(res.data.repositories || []);
      } catch (err) {
        console.error("Error fetching repositories:", err);
      } finally {
        setLoading(false);
      }
    };

    const checkIfFollowing = async () => {
      try {
        const res = await axiosInstance.get(`/userProfile/${loggedInUserId}`);
        const loggedInUser = res.data;
        const alreadyFollowing = loggedInUser.followedUsers?.some(
          (id) => id.toString() === userId
        );
        setIsFollowing(alreadyFollowing);
      } catch (err) {
        console.error("Error checking follow status:", err);
      }
    };

    const fetchStarredRepos = async () => {
      try {
        const res = await axiosInstance.get(`/userProfile/${userId}`);
        const starredIds = res.data.starRepos || [];
        const allReposRes = await axiosInstance.get("/repo/all");
        const allRepos = allReposRes.data;
        const starred = allRepos.filter((repo) =>
          starredIds.some((id) => id.toString() === repo._id.toString())
        );
        setStarredRepoDetails(starred);
      } catch (err) {
        console.error("Error fetching starred repos:", err);
      }
    };

    fetchUserDetails();
    fetchRepositories();
    fetchStarredRepos();
    if (!isOwnProfile) checkIfFollowing();
  }, [userId]);

  const handleFollow = async () => {
    try {
      const res = await axiosInstance.post(`/followUser`, {
        userId: loggedInUserId,
        targetUserId: userId,
      });
      setIsFollowing(res.data.following);
    } catch (err) {
      console.error("Error following user:", err);
    }
  };

  if (loading) return <h2 className="profile-loading">Loading...</h2>;
  if (!userDetails) return <h2 className="profile-loading">User not found!</h2>;

  return (
    <div>
      {/* Tab bar */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === "overview" ? "profile-tab-active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <GridViewIcon fontSize="small" /> Overview
        </button>
        <button
          className={`profile-tab ${activeTab === "repos" ? "profile-tab-active" : ""}`}
          onClick={() => setActiveTab("repos")}
        >
          <BookIcon fontSize="small" /> Repositories
          <span className="profile-tab-count">{repositories.length}</span>
        </button>
        <button
          className={`profile-tab stars-tab ${activeTab === "stars" ? "profile-tab-active" : ""}`}
          onClick={() => setActiveTab("stars")}
        >
          <StarIcon fontSize="small" /> Stars
          <span className="profile-tab-count">{userDetails.starRepos?.length || 0}</span>
        </button>
      </div>

      {/* Main content */}
      <div className="profile-wrapper">

        {/* Left sidebar */}
        <div className="profile-left">
          <div className="profile-avatar">
            {userDetails.username?.charAt(0).toUpperCase()}
          </div>
          <h2 className="profile-username">{userDetails.username}</h2>
          <p className="profile-email">{userDetails.email}</p>

          {!isOwnProfile && (
            <button
              className={`profile-follow-btn ${isFollowing ? "following" : ""}`}
              onClick={handleFollow}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}

          <div className="profile-stats">
            <span><strong>{userDetails.followedUsers?.length || 0}</strong> Following</span>
            <span><strong>0</strong> Followers</span>
          </div>
        </div>

        {/* Right main content */}
        <div className="profile-right">

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              <h3 className="profile-section-header">Popular Repositories</h3>
              {repositories.length === 0 ? (
                <p className="profile-no-content">No repositories yet.</p>
              ) : (
                <div className="profile-repos-grid">
                  {repositories.slice(0, 6).map((repo) => (
                    <div key={repo._id} className="profile-repo-card">
                      <div className="profile-repo-name">
                        <h4>{repo.name}</h4>
                      </div>
                      <p className="profile-repo-description">{repo.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Heatmap */}
              <div className="profile-heatmap">
                <HeatMapProfile />
              </div>
            </div>
          )}

          {/* Repos Tab */}
          {activeTab === "repos" && (
            <div>
              <h3 className="profile-section-header">Repositories</h3>
              {repositories.length === 0 ? (
                <p className="profile-no-content">No repositories yet.</p>
              ) : (
                <div className="profile-repos-list">
                  {repositories.map((repo) => (
                    <div key={repo._id} className="profile-repo-card">
                      <div className="profile-repo-name">
                        <BookIcon fontSize="small" />
                        <h4>{repo.name}</h4>
                      </div>
                      <p className="profile-repo-description">{repo.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stars Tab */}
          {activeTab === "stars" && (
            <div>
              <h3 className="profile-section-header">Starred Repositories</h3>
              {starredRepoDetails.length === 0 ? (
                <p className="profile-no-content">No starred repositories yet.</p>
              ) : (
                <div className="profile-repos-list">
                  {starredRepoDetails.map((repo) => (
                    <div key={repo._id} className="profile-repo-card">
                      <div className="profile-repo-name">
                        <BookIcon fontSize="small" />
                        <h4>{repo.name}</h4>
                      </div>
                      <p className="profile-repo-description">{repo.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;