import { BrowserRouter as Router } from "react-router-dom";
import ProjectRoutes from "./Routes";
import { AuthProvider, useAuth } from "./authContext";
import Navbar from "./components/Navbar";
import CreateIssueModal from "./components/issue/CreateIssue";
import './index.css';
const Layout = () => {
  const { currentUser } = useAuth();

  return (
    <>
      {currentUser && <Navbar />}
      <ProjectRoutes />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <CreateIssueModal />
        <Layout />
      </Router>
    </AuthProvider>
  );
}

export default App;