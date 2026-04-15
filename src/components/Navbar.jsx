import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import HomeIcon from "@mui/icons-material/Home";
import BookIcon from "@mui/icons-material/Book";
import CallMergeRoundedIcon from '@mui/icons-material/CallMergeRounded';
import AdjustRoundedIcon from '@mui/icons-material/AdjustRounded';
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import logo from "../assets/github-mark-white.svg";
import { useAuth } from "../authContext";
import "./navbar.css";

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [topRepos, setTopRepos] = useState([]);
  const [plusDropdown, setPlusDropdown] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [repoDropdown, setRepoDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ users: [], repos: [] });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const plusRef = useRef(null);
  const profileRef = useRef(null);
  const repoRef = useRef(null);
  const searchRef = useRef(null);

  const { logout, setIsIssueModalOpen } = useAuth();

  useEffect(() => {
    const fetchTopRepos = async () => {
      try {
        const res = await axiosInstance.get(`/repo/user/${userId}`);
        setTopRepos(res.data.repositories.slice(0, 3));
      } catch (err) {
        console.error("Error fetching top repos:", err);
      }
    };
    if (userId) fetchTopRepos();
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (plusRef.current && !plusRef.current.contains(e.target)) {
        setPlusDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdown(false);
      }
      if (repoRef.current && !repoRef.current.contains(e.target)) {
        setRepoDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults({ users: [], repos: [] });
      setShowSearchDropdown(false);
      return;
    }

    const search = async () => {
      try {
        const [usersRes, reposRes] = await Promise.all([
          axiosInstance.get("/allUsers"),
          axiosInstance.get("/repo/all"),
        ]);
        const filteredUsers = usersRes.data.filter((user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const filteredRepos = reposRes.data.filter((repo) =>
          repo.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults({ users: filteredUsers, repos: filteredRepos });
        setShowSearchDropdown(true);
      } catch (err) {
        console.error("Search error:", err);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }
    logout();
    navigate("/auth");
  };

  return (
    <>
      <nav className="navbar">
        {/* Left side */}
        <div className="navbar-left">
          <MenuIcon className="navbar-icon" onClick={() => setSidebarOpen(true)} />
          <Link to="/">
            <img src={logo} alt="GitHub" className="navbar-logo" />
          </Link>
        </div>

        {/* Right side */}
        <div className="navbar-right">

          {/* Search bar */}
          <div className="navbar-search" ref={searchRef}>
            <input
              type="text"
              placeholder="Search users or repos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowSearchDropdown(true)}
            />

            {showSearchDropdown && (
              <div className="navbar-search-dropdown">
                {searchResults.users.length > 0 && (
                  <div>
                    <p className="navbar-search-section-title">Users</p>
                    {searchResults.users.map((user) => (
                      <div
                        key={user._id}
                        className="navbar-search-item"
                        onClick={() => {
                          navigate(`/profile/${user._id}`);
                          setSearchQuery("");
                          setShowSearchDropdown(false);
                        }}
                      >
                        <div className="navbar-search-avatar">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <span>{user.username}</span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.repos.length > 0 && (
                  <div>
                    <p className="navbar-search-section-title">Repositories</p>
                    {searchResults.repos.map((repo) => (
                      <div
                        key={repo._id}
                        className="navbar-search-item"
                        onClick={() => {
                          navigate(`/repo/${repo._id}`);
                          setSearchQuery("");
                          setShowSearchDropdown(false);
                        }}
                      >
                        <BookIcon fontSize="small" style={{ color: "#8b949e" }} />
                        <div>
                          <p className="navbar-search-item-name">{repo.name}</p>
                          <p className="navbar-search-item-desc">{repo.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.users.length === 0 && searchResults.repos.length === 0 && (
                  <p className="navbar-search-empty">No results found for "{searchQuery}"</p>
                )}
              </div>
            )}
          </div>

          {/* Plus icon */}
          <div className="navbar-tooltip-wrapper" ref={plusRef}>
            <div className="navbar-plus-box" onClick={() => setPlusDropdown(!plusDropdown)}>
              <AddIcon fontSize="small" />
              <span className="navbar-plus-divider"></span>
              <ArrowDropDownIcon fontSize="small" />
            </div>
            <span className="navbar-tooltip">Create new...</span>

            {plusDropdown && (
              <div className="navbar-dropdown">
                <Link to="/repo/create" className="navbar-dropdown-item" onClick={() => setPlusDropdown(false)}>
                  <BookIcon fontSize="small" /> New repository
                </Link>
                <div
                  className="navbar-dropdown-item"
                  onClick={() => {
                    setIsIssueModalOpen(true);
                    setPlusDropdown(false);
                  }}
                >
                  <AdjustRoundedIcon fontSize="small" /> New issue
                </div>
              </div>
            )}
          </div>

          {/* Issues icon */}
          <div className="navbar-tooltip-wrapper">
            <Link to={`/issues/${userId}`} className="navbar-icon-box">
              <AdjustRoundedIcon fontSize="small" />
            </Link>
            <span className="navbar-tooltip">Issues</span>
          </div>

          {/* Pull Requests icon */}
          <div className="navbar-tooltip-wrapper">
            <Link to={`/pullrequests/${userId}`} className="navbar-icon-box">
              <CallMergeRoundedIcon fontSize="small" />
            </Link>
            <span className="navbar-tooltip">Pull Requests</span>
          </div>

          {/* Repos icon */}
          <div className="navbar-tooltip-wrapper" ref={repoRef}>
            <div className="navbar-icon-box" onClick={() => setRepoDropdown(!repoDropdown)}>
              <BookIcon fontSize="small" style={{ cursor: "pointer", color: "white" }} />
            </div>
            <span className="navbar-tooltip">Your Repositories</span>

            {repoDropdown && (
              <div className="navbar-dropdown navbar-dropdown-right">
                <p className="navbar-dropdown-header">Your Repositories</p>
                <hr className="navbar-dropdown-divider" />
                {topRepos.length === 0 ? (
                  <p className="navbar-dropdown-empty">No repositories yet</p>
                ) : (
                  topRepos.map((repo) => (
                    <Link key={repo._id} to={`/repo/${repo._id}`} className="navbar-dropdown-item" onClick={() => setRepoDropdown(false)}>
                      <BookIcon fontSize="small" /> {repo.name}
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Profile avatar */}
          <div className="navbar-tooltip-wrapper" ref={profileRef}>
            <div className="navbar-avatar" onClick={() => setProfileDropdown(!profileDropdown)}>
              {userId?.charAt(0).toUpperCase()}
            </div>

            {profileDropdown && (
              <div className="navbar-dropdown navbar-dropdown-right">
                <Link to={`/profile/${userId}`} className="navbar-dropdown-item" onClick={() => setProfileDropdown(false)}>
                  Your Profile
                </Link>
                <Link to="/" className="navbar-dropdown-item" onClick={() => setProfileDropdown(false)}>
                  Your Repositories
                </Link>
                <hr className="navbar-dropdown-divider" />
                <div className="navbar-dropdown-item" onClick={handleLogout}>
                  Sign out
                </div>
              </div>
            )}
          </div>

        </div>
      </nav>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <span>Menu</span>
          <CloseIcon onClick={() => setSidebarOpen(false)} style={{ cursor: "pointer" }} />
        </div>

        <div className="sidebar-menu">
          <Link to="/" className="sidebar-link" onClick={() => setSidebarOpen(false)}>
            <HomeIcon fontSize="small" /> Home
          </Link>
          <Link to="/" className="sidebar-link" onClick={() => setSidebarOpen(false)}>
            <BookIcon fontSize="small" /> Repositories
          </Link>
          <Link to={`/issues/${userId}`} className="sidebar-link" onClick={() => setSidebarOpen(false)}>
            <AdjustRoundedIcon fontSize="small" /> Issues
          </Link>
          <Link to={`/pullrequests/${userId}`} className="sidebar-link" onClick={() => setSidebarOpen(false)}>
            <CallMergeRoundedIcon fontSize="small" /> Pull Requests
          </Link>
        </div>

        <div className="sidebar-top-repos">
          <p className="sidebar-repos-title">Top Repositories</p>
          {topRepos.length === 0 ? (
            <p className="sidebar-no-repos">No repositories yet</p>
          ) : (
            topRepos.map((repo) => (
              <Link key={repo._id} to={`/repo/${repo._id}`} className="sidebar-repo-link" onClick={() => setSidebarOpen(false)}>
                <BookIcon fontSize="small" /> {repo.name}
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;