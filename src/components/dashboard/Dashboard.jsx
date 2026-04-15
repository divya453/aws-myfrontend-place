import { useEffect, useState } from "react";
import axios from "axios";
import "./dashboard.css";
import { Link } from "react-router-dom";
import BookIcon from "@mui/icons-material/Book";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [starredRepos, setStarredRepos] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const res = await axios.get(`http://3.108.191.174:3000/repo/user/${userId}`);
        setRepositories(res.data.repositories);
      } catch (err) {
        console.error("Error while fetching repositories:", err);
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const res = await axios.get(`http://3.108.191.174:3000/repo/all`);
        setSuggestedRepositories(res.data);
      } catch (err) {
        console.error("Error while fetching suggested repositories:", err);
      }
    };

    const fetchStarredRepos = async () => {
      try {
        const res = await axios.get(`http://3.108.191.174:3000/userProfile/${userId}`);
        const starred = res.data.starRepos?.map((id) => id.toString()) || [];
        setStarredRepos(starred);
      } catch (err) {
        console.error("Error fetching starred repos:", err);
      }
    };

    fetchSuggestedRepositories(); // ← always runs, doesn't need userId

    // ← only run if userId exists
    if (userId) {
      fetchRepositories();
      fetchStarredRepos();
    }
  }, [userId]); // ← added userId as dependency so it re-runs when userId becomes available

  useEffect(() => {
    if (searchQuery === "") {
      setSearchResults(repositories);
    } else {
      const filteredRepo = repositories.filter((repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredRepo);
    }
  }, [searchQuery, repositories]);

  const handleStar = async (e, repoId) => {
    e.preventDefault();
    if (!userId) return; // ← guard here too
    try {
      const res = await axios.post("http://3.108.191.174:3000/starRepo", {
        userId,
        repoId: repoId.toString(),
      });
      if (res.data.starred) {
        setStarredRepos((prev) => [...prev, repoId.toString()]);
      } else {
        setStarredRepos((prev) => prev.filter((id) => id !== repoId.toString()));
      }
    } catch (err) {
      console.error("Error starring repo:", err);
    }
  };

  return (
    <section className="dashboard-wrapper">

      {/* Left - Suggested Repositories */}
      <aside className="dashboard-left">
        <h3 className="dashboard-section-title">Suggested Repositories</h3>
        {suggestedRepositories.length === 0 ? (
          <p className="dashboard-empty">No suggestions yet.</p>
        ) : (
          suggestedRepositories.map((repo) => (
            <Link to={`/repo/${repo._id}`} key={repo._id} className="dashboard-repo-link">
              <div className="dashboard-suggested-item">
                <BookIcon fontSize="small" className="dashboard-repo-icon" />
                <div className="dashboard-suggested-info">
                  <h4 className="dashboard-repo-name">{repo.name}</h4>
                  <p className="dashboard-repo-desc">{repo.description}</p>
                </div>
                <div
                  className="dashboard-star-btn"
                  onClick={(e) => handleStar(e, repo._id)}
                >
                  {starredRepos.includes(repo._id.toString()) ? (
                    <StarIcon fontSize="small" style={{ color: "#e3b341" }} />
                  ) : (
                    <StarBorderIcon fontSize="small" style={{ color: "#8b949e" }} />
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </aside>

      {/* Vertical divider */}
      <div className="dashboard-divider" />

      {/* Main - Your Repositories */}
      <main className="dashboard-main">
        <h2 className="dashboard-section-title">Your Repositories</h2>
        <div id="search">
          <input
            type="text"
            value={searchQuery}
            placeholder="Search..."
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {searchResults.length === 0 ? (
          <p className="dashboard-empty">No repositories found.</p>
        ) : (
          searchResults.map((repo) => (
            <Link to={`/repo/${repo._id}`} key={repo._id} className="dashboard-repo-link">
              <div className="dashboard-repo-card">
                <BookIcon fontSize="small" className="dashboard-repo-icon" />
                <div>
                  <h4 className="dashboard-repo-name">{repo.name}</h4>
                  <p className="dashboard-repo-desc">{repo.description}</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </main>

      {/* Vertical divider */}
      <div className="dashboard-divider" />

      {/* Right - Upcoming Events */}
      <aside className="dashboard-right">
        <div className="dashboard-events-card">
          <h3 className="dashboard-section-title">Upcoming Events</h3>
          <div className="dashboard-event-item">
            <p className="dashboard-event-title">Tech Conference</p>
            <p className="dashboard-event-date">Dec 15</p>
          </div>
          <div className="dashboard-event-item">
            <p className="dashboard-event-title">Developer Meetup</p>
            <p className="dashboard-event-date">Dec 25</p>
          </div>
          <div className="dashboard-event-item">
            <p className="dashboard-event-title">React Summit</p>
            <p className="dashboard-event-date">Jan 5</p>
          </div>
        </div>
      </aside>

    </section>
  );
};

export default Dashboard;