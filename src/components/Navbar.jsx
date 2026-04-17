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
        // Safely access repositories array
        const repos = res.data.repositories || [];
        setTopRepos(repos.slice(0, 3));
      } catch (err) {
        console.error("Error fetching top repos:", err);
      }
    };
    if (userId) fetchTopRepos();
  }, [userId]);

  // Handle outside clicks for all dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (plusRef.current && !plusRef.current.contains(e.target)) setPlusDropdown(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileDropdown(false);
      if (repoRef.current && !repoRef.current.contains(e.target)) setRepoDropdown(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Search Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ users: [], repos: [] });
      setShowSearchDropdown(false);
      return;
    }

    const performSearch = async () => {
      try {
        // Parallel requests for speed
        const [usersRes, reposRes] = await Promise.all([
          axiosInstance.get("/allUsers"),
          axiosInstance.get("/repo/all"),
        ]);

        const filteredUsers = usersRes.data.filter((user) =>
          user.username?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const filteredRepos = reposRes.data.filter((repo) =>
          repo.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setSearchResults({ users: filteredUsers, repos: filteredRepos });
        setShowSearchDropdown(true);
      } catch (err) {
        console.error("Search error:", err);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/logout");
      // Clear local storage and context
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      logout(); 
      navigate("/auth");
    } catch (err) {
      console.error("Logout error:", err);
      // Still logout locally even if server call fails
      logout();
      navigate("/auth");
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <MenuIcon className="navbar-icon" onClick={() => setSidebarOpen(true)} />
          <Link to="/">
            <img src={logo} alt="GitHub" className="navbar-logo" />
          </Link>
        </div>

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
                  <div className="search-section">
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
                  <div className="search-section">
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
                  <p className="navbar-search-empty">No results for "{searchQuery}"</p>
                )}
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="navbar-actions">
             {/* Plus Dropdown */}
            <div className="navbar-tooltip-wrapper" ref={plusRef}>
              <div className="navbar-plus-box" onClick={() => setPlusDropdown(!plusDropdown)}>
                <AddIcon fontSize="small" />
                <ArrowDropDownIcon fontSize="small" />
              </div>
              {plusDropdown && (
                <div className="navbar-dropdown">
                  <Link to="/repo/create" className="navbar-dropdown-item" onClick={() => setPlusDropdown(false)}>
                    <BookIcon fontSize="small" /> New repository
                  </Link>
                  <div className="navbar-dropdown-item" onClick={() => { setIsIssueModalOpen(true); setPlusDropdown(false); }}>
                    <AdjustRoundedIcon fontSize="small" /> New issue
                  </div>
                </div>
              )}
            </div>

            <Link to={`/issues/${userId}`} className="navbar-icon-box"><AdjustRoundedIcon fontSize="small" /></Link>
            <Link to={`/pullrequests/${userId}`} className="navbar-icon-box"><CallMergeRoundedIcon fontSize="small" /></Link>

            {/* Repos Dropdown */}
            <div className="navbar-tooltip-wrapper" ref={repoRef}>
              <div className="navbar-icon-box" onClick={() => setRepoDropdown(!repoDropdown)}>
                <BookIcon fontSize="small" style={{ color: "white" }} />
              </div>
              {repoDropdown && (
                <div className="navbar-dropdown navbar-dropdown-right">
                  <p className="navbar-dropdown-header">Top Repositories</p>
                  <hr className="navbar-dropdown-divider" />
                  {topRepos.map((repo) => (
                    <Link key={repo._id} to={`/repo/${repo._id}`} className="navbar-dropdown-item" onClick={() => setRepoDropdown(false)}>
                      <BookIcon fontSize="small" /> {repo.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="navbar-tooltip-wrapper" ref={profileRef}>
              <div className="navbar-avatar" onClick={() => setProfileDropdown(!profileDropdown)}>
                {userId?.charAt(0).toUpperCase()}
              </div>
              {profileDropdown && (
                <div className="navbar-dropdown navbar-dropdown-right">
                  <Link to={`/profile/${userId}`} className="navbar-dropdown-item" onClick={() => setProfileDropdown(false)}>Your Profile</Link>
                  <hr className="navbar-dropdown-divider" />
                  <div className="navbar-dropdown-item" onClick={handleLogout}>Sign out</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar logic remains same */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <span>Menu</span>
          <CloseIcon onClick={() => setSidebarOpen(false)} style={{ cursor: "pointer" }} />
        </div>
        <div className="sidebar-menu">
          <Link to="/" className="sidebar-link" onClick={() => setSidebarOpen(false)}><HomeIcon fontSize="small" /> Home</Link>
          <Link to={`/profile/${userId}`} className="sidebar-link" onClick={() => setSidebarOpen(false)}><BookIcon fontSize="small" /> Profile</Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;