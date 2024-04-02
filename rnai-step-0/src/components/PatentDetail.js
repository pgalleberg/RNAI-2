import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faFilePdf } from "@fortawesome/free-solid-svg-icons";

const PatentDetail = () => {
  const { patent_id, vertical_id } = useParams();
  const [patentDetails, setPatentDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  sessionStorage.setItem("currentTab", "patents");

  useEffect(() => {
    const getPatentDetail = async () => {
      const patentDetail = await fetchPatentDetails();
      setPatentDetails(patentDetail);
      setIsLoading(false);
    };
    getPatentDetail();
  }, [patent_id]);

  const fetchPatentDetails = async () => {
    const url =
      process.env.REACT_APP_FLASK_WEBSERVER +
      "patent-detail?patent_id=" +
      patent_id +
      "&vertical_id=" +
      vertical_id;
    const res = await fetch(url);
    const data = await res.json();

    return data;
  };
  return isLoading ? (
    <div className="container">
      <FontAwesomeIcon icon={faSpinner} spin size="10x"></FontAwesomeIcon>
    </div>
  ) : (
    <div
      style={{
        maxWidth: "1440px",
        margin: "auto",
      }}
    >
      <PatentDetailInner patentDetail={patentDetails} />
    </div>
  );
};

const PatentDetailInner = ({ patentDetail }) => {
  return (
    <div style={{ textAlign: "left" }}>
      <h3>{patentDetail.title}</h3>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ width: "48%" }}>
          <div>
            <p>
              <strong>Abstract</strong>
            </p>
            <p>{patentDetail.abstract}</p>
          </div>
          <div>
            <p>
              <strong>Images ({patentDetail.images.length})</strong>
            </p>
            <div
              style={{
                display: "flex",
                width: "100%",
                overflowX: "scroll",
              }}
            >
              {patentDetail.images.map((i) => (
                <img
                  src={i}
                  style={{
                    border: "2px solid #e5e5e5",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    height: "150px",
                    marginRight: "10px",
                    /* Additional styles for images */
                    display: "inline-block",
                    verticalAlign: "middle",
                  }}
                  width="contains"
                />
              ))}
            </div>
          </div>
        </div>
        <PatentCard patentDetail={patentDetail} />
      </div>
      <div>
        <p>
          <strong>Classifications</strong>
        </p>
        <div
          style={{
            border: "1px solid #eaeaea",
          }}
        >
          {patentDetail.classifications.map((i) => (
            <p
              style={{
                paddingLeft: "15px",
                fontSize: "13px",
              }}
            >
              <span style={{ paddingRight: "10px" }}>
                {i.code} {"  "}
              </span>
              {i.description}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

const PatentCard = ({ patentDetail }) => {
  return (
    <div style={{ width: "38%", border: "1px solid #e5e5e5" }}>
      <div
        className="background"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          margin: 0,
          height: "100px",
        }}
      >
        <h4
          style={{
            color: "white",
            paddingLeft: "10px",
            margin: 0,
          }}
        >
          {patentDetail.application_number}
        </h4>
        <p
          style={{
            color: "white",
            paddingLeft: "10px",
            margin: 0,
          }}
        >
          {patentDetail.country}
        </p>
      </div>
      <div
        style={{
          backgroundColor: "#0c8b6a",
          height: "40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <a
          href={patentDetail.pdf && patentDetail.pdf}
          style={{ color: "white", paddingLeft: "10px" }}
          target="_blank"
        >
          <FontAwesomeIcon icon={faFilePdf} />
          Download PDF
        </a>
      </div>
      <div style={{ borderBottom: "1px solid #e5e5e5" }}>
        <p
          style={{
            margin: 0,
            paddingLeft: "10px",
            paddingTop: "10px",
            fontSize: "13px",
          }}
        >
          <strong>Inventors</strong>:{" "}
          {patentDetail.inventors.map((inventor) => inventor.name).join(", ")}
        </p>
        <p
          style={{
            margin: 0,
            paddingLeft: "10px",
            paddingTop: "10px",
            paddingBottom: "10px",
            fontSize: "13px",
          }}
        >
          <strong>Current Assignee</strong>: {patentDetail.assignees.join(", ")}
        </p>
      </div>
      <div style={{ borderBottom: "1px solid #e5e5e5", padding: "10px" }}>
        <p
          style={{
            fontSize: "13px",
            margin: 0,
          }}
        >
          <strong>Worldwide applications</strong>
        </p>
        <p
          style={{
            fontSize: "13px",
            margin: 0,
          }}
        >
          {Object.entries(patentDetail.worldwide_applications)
            .map(
              ([year, countries]) =>
                `${year} ${countries.map((i) => i.country_code).join(" ")}`
            )
            .join(", ")}
        </p>
      </div>
      <div style={{ borderBottom: "1px solid #e5e5e5", padding: "10px" }}>
        <p
          style={{
            fontSize: "13px",
            margin: 0,
          }}
        >
          <strong>Application {patentDetail.application_number}</strong>
          {patentDetail.events.map((event) => (
            <p
              style={{
                fontSize: "13px",
                margin: 0,
                display: "flex",
                width: "100%",
                textAlign: "left",
              }}
            >
              <span style={{ paddingRight: "20px" }}>
                <strong>{event.date}</strong>
              </span>
              <span>{event.title}</span>
            </p>
          ))}
        </p>
      </div>
    </div>
  );
};

export default PatentDetail;
