import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUnlock } from "@fortawesome/free-solid-svg-icons";

const Patent = ({ patent }) => {
  return (
    <div
      style={{
        marginTop: "20px",
        marginBottom: "20px",
        backgroundColor: "whitesmoke",
        padding: "10px",
        borderRadius: "10px",
      }}
    >
      <h2 style={{ marginBottom: "0px" }}>{patent.title}</h2>
      <p className="author">{patent.inventor}</p>
      <div>
        <p className="author">{patent.assignee}</p>
        <p className="author">{patent.publication_number}</p>
      </div>
      <p style={{ margin: "0px" }}>
        <span className="detail">Granted: {patent.grant_date}</span>
        <span className="detail">Filled: {patent.filing_date}</span>
        <span className="detail">Priority: {patent.priority_date}</span>
        <span className="detail">Published: {patent.publication_date}</span>
      </p>
      {patent.snippet && (
        <>
          <span className="text">Abstract</span>
          <div style={{ display: "flex", justifyContent: "space-evenly" }}>
            {patent.thumbnail && (
              <img
                src={patent.thumbnail}
                alt={patent.title}
                style={{ marginRight: "10px" }}
              />
            )}
            <p style={{ margin: 0, textAlign: "justify" }}>{patent.snippet}</p>
          </div>
        </>
      )}
      <div className="pdf">
        <br></br>
        <FontAwesomeIcon icon={faUnlock} style={{ marginRight: "10px" }} />
        <a href={patent.pdf && patent.pdf} target="_blank">
          PDF
        </a>
      </div>
    </div>
  );
};

export default Patent;
