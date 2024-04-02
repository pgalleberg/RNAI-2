import { signOut } from "firebase/auth";
import auth from "../firebase";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import RNAILogo from "../RNAI_logo_II.png";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        console.log("Signed out successfully");
        navigate("/login");
      })
      .catch((error) => {
        // An error happened.
        console.log("Error: ", error);
      });
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <>
      <div
        className="navbar"
        style={{ paddingBottom: location.pathname === "/dashboard" && "100px" }}
      >
        {location.pathname === "/" ? (
          <div></div>
        ) : (
          <Link to="/">
            <img src={RNAILogo} alt="RNAI logo" style={{ height: "70px" }} />
          </Link>
        )}
        <div>
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="#" onClick={handleLogout}>
            Sign Out
          </Link>
        </div>
      </div>

      {(location.pathname.includes("/grant") ||
        location.pathname.includes("/paper/") ||
        location.pathname.includes("/author/") ||
        location.pathname.includes("/patent-detail/")) && (
        <div
          style={{
            textAlign: "left",
            width:
              location.pathname.includes("/paper/") ||
              location.pathname.includes("/patent-detail/")
                ? "75%"
                : "90%",
          }}
        >
          <Link onClick={goBack}>
            <FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon>
            &nbsp;&nbsp; Back
          </Link>
        </div>
      )}
    </>
  );
};

export default Navbar;
