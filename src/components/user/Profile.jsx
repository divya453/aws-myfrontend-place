import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import BookIcon from "@mui/icons-material/Book";
import StarIcon from "@mui/icons-material/Star";
import GridViewIcon from "@mui/icons-material/GridView";
import HeatMapProfile from "./HeatMapProfile";
import "./profile.css";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const loggedInUserId = localStorage.getItem("userId");
  const isOwnProfile = userId === loggedInUserId;

  const [userDetails, setUserDetails] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [starredRepoDetails, setStarredRepoDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchAllProfileData = async () => {
      setLoading(true);
      try {
        const [userRes, repoRes, allReposRes] = await Promise.all([
          axiosInstance.get(`/userProfile/${userId}`),
          axiosInstance.get(`/repo/user/${userId}`),
          axiosInstance.get("/repo/all")
        ]);

        const userData = userRes.data;
        setUserDetails(userData);
        setRepositories(repoRes.data.repositories || []);

        // ✅ fixed field name starRepos → starredRepos
        const starredIds = userData.starredRepos || [];
        const starred = allReposRes.data.filter((repo) =>
          starredIds.some((id) => id.toString() === repo._id.toString())
        );
        setStarredRepoDetails(starred);

        if (loggedInUserId && !isOwnProfile) {
          const loggedInUserRes = await axiosInstance.get(`/userProfile/${loggedInUserId}`);
          const alreadyFollowing = loggedInUserRes.data.followedUsers?.some(
            (id) => id.toString() === userId
          );
          setIsFollowing(alreadyFollowing);
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProfileData();
  }, [userId, loggedInUserId, isOwnProfile]);

  const handleFollow = async () => {
    if (!loggedInUserId) {
      alert("Please login to follow users!");
      return;
    }
    try {
      const res = await axiosInstance.post(`/followUser`, {
        userId: loggedInUserId,
        targetUserId: userId,
      });
      setIsFollowing(res.data.following);

      // ✅ update followers count in UI without refetching
      setUserDetails(prev => ({
        ...prev,
        followers: res.data.following
          ? [...(prev.followers || []), loggedInUserId]
          : (prev.followers || []).filter(id => id.toString() !== loggedInUserId)
      }));
    } catch (err) {
      console.error("Error following user:", err);
    }
  };

  if (loading) return <h2 className="profile-loading">Loading...</h2>;
  if (!userDetails) return <h2 className="profile-loading">User not found!</h2>;

  return (
    <div className="profile-main-container">
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
          {/* ✅ fixed field name */}
          <span className="profile-tab-count">{userDetails.starredRepos?.length || 0}</span>
        </button>
      </div>

      <div className="profile-wrapper">
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
            {/* ✅ fixed from hardcoded 0 */}
            <span><strong>{userDetails.followers?.length || 0}</strong> Followers</span>
          </div>
        </div>

        <div className="profile-right">
          {activeTab === "overview" && (
            <div>
              <h3 className="profile-section-header">Popular Repositories</h3>
              {repositories.length === 0 ? (
                <p className="profile-no-content">No repositories yet.</p>
              ) : (
                <div className="profile-repos-grid">
                  {repositories.slice(0, 6).map((repo) => (
                    <div
                      key={repo._id}
                      className="profile-repo-card"
                      onClick={() => navigate(`/repo/${repo._id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="profile-repo-name">
                        <h4>{repo.name}</h4>
                      </div>
                      <p className="profile-repo-description">{repo.description}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="profile-heatmap">
                <HeatMapProfile />
              </div>
            </div>
          )}

          {activeTab === "repos" && (
            <div>
              <h3 className="profile-section-header">Repositories</h3>
              {repositories.length === 0 ? (
                <p className="profile-no-content">No repositories yet.</p>
              ) : (
                <div className="profile-repos-list">
                  {repositories.map((repo) => (
                    <div
                      key={repo._id}
                      className="profile-repo-card"
                      onClick={() => navigate(`/repo/${repo._id}`)}
                      style={{ cursor: "pointer" }}
                    >
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

          {activeTab === "stars" && (
            <div>
              <h3 className="profile-section-header">Starred Repositories</h3>
              {starredRepoDetails.length === 0 ? (
                <p className="profile-no-content">No starred repositories yet.</p>
              ) : (
                <div className="profile-repos-list">
                  {starredRepoDetails.map((repo) => (
                    <div
                      key={repo._id}
                      className="profile-repo-card"
                      onClick={() => navigate(`/repo/${repo._id}`)}
                      style={{ cursor: "pointer" }}
                    >
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