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
      <Link to={`/patent-detail/${patent.patent_id}/${patent.vertical_id}`}>
        <h2 style={{ marginBottom: "0px" }}>{patent.title}</h2>
      </Link>
      <div>
        {patent?.inventors &&
          patent?.inventors?.length &&
          patent.inventors.map((i) => (
            <p className="author" style={{ backgroundColor: "#E5E5E5" }}>
              {i.name}
            </p>
          ))}
      </div>
      <div>
        <p className="author" style={{ backgroundColor: "#E5E5E5" }}>
          {patent.assignee}
        </p>
        <p className="author" style={{ backgroundColor: "#E5E5E5" }}>
          {patent.publication_number}
        </p>
      </div>
      <p style={{ margin: "0px" }}>
        <span
          className="detail"
          style={{ display: patent.grant_date ? "inherit" : "none" }}
        >
          Granted: {patent.grant_date}
        </span>
        <span
          className="detail"
          style={{ display: patent.grant_date ? "inherit" : "none" }}
        >
          Filled: {patent.filing_date}
        </span>
        <span
          className="detail"
          style={{ display: patent.grant_date ? "inherit" : "none" }}
        >
          Priority: {patent.priority_date}
        </span>
        <span
          className="detail"
          style={{ display: patent.grant_date ? "inherit" : "none" }}
        >
          Published: {patent.publication_date}
        </span>
      </p>
      {patent.abstract && (
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
            <p style={{ margin: 0, textAlign: "justify" }}>{patent.abstract}</p>
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
