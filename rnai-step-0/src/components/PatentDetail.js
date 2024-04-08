import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faFilePdf } from "@fortawesome/free-solid-svg-icons";

const PatentDetail = () => {
  const { publication_number, vertical_id } = useParams();
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
  }, [publication_number]);

  const fetchPatentDetails = async () => {
    const url =
      process.env.REACT_APP_FLASK_WEBSERVER +
      "patent-detail?publication_number=" +
      publication_number +
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
      className="papers"
      style={{
        width: "75%",
      }}
    >
      <PatentDetailInner
        patentDetail={patentDetails}
        publication_number={publication_number}
        vertical_id={vertical_id}
      />
    </div>
  );
};

const PatentDetailInner = ({
  patentDetail,
  publication_number,
  vertical_id,
}) => {
  return (
    <div style={{ textAlign: "left" }}>
      <Link to={`/patent-detail/${publication_number}/${vertical_id}`}>
        <h2>{patentDetail.title}</h2>
      </Link>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ width: "48%" }}>
          <div>
            <p>
              <strong>Abstract</strong>
            </p>
            <p>{patentDetail.abstract}</p>
          </div>
        </div>
        <PatentCard patentDetail={patentDetail} />
      </div>
      <div
        style={{
          display: patentDetail.images ? "block" : "none",
        }}
      >
        <p>
          <strong>Images ({patentDetail.images?.length})</strong>
        </p>
        <div
          style={{
            display: "flex",
            width: "50%",
            overflowX: "scroll",
          }}
        >
          {patentDetail.images?.map((i) => (
            <img
              src={i}
              style={{
                border: "2px solid #e5e5e5",
                maxWidth: "100%",
                maxHeight: "100%",
                height: "150px",
                marginRight: "10px",
                display: "inline-block",
                verticalAlign: "middle",
              }}
              width="contains"
            />
          ))}
        </div>
      </div>
      {patentDetail.classifications && (
        <div>
          <p>
            <strong>Classifications</strong>
          </p>
          <table>
            {patentDetail.classifications.map((i) => (
              <tr
                style={{
                  paddingLeft: "15px",
                  fontSize: "13px",
                }}
              >
                <td
                  style={{
                    paddingTop: "5px",
                    paddingBottom: "5px",
                  }}
                >
                  {i.code} {"  "}
                </td>
                <td
                  style={{
                    paddingTop: "5px",
                    paddingBottom: "5px",
                  }}
                >
                  {i.description}
                </td>
              </tr>
            ))}
          </table>
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div
          style={{
            width: "50%",
          }}
        >
          <h4>Description</h4>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
            }}
          >
            {patentDetail.description}
          </p>
        </div>
        <div>
          {patentDetail.claims && (
            <div
              style={{
                padding: "10px",
              }}
            >
              <h4>Claims</h4>
              {patentDetail.claims?.map((i) => (
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                  }}
                >
                  {i}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
      {patentDetail?.cited_by?.original && (
        <div
          style={{
            padding: "10px",
          }}
        >
          <h4>Citations ({patentDetail?.cited_by?.original?.length})</h4>
          <table>
            <tr>
              <th>Publication number</th>
              <th>Priority date</th>
              <th>Publication date</th>
              <th>Assignee</th>
              <th>Title</th>
            </tr>
            {patentDetail?.cited_by?.original.map((i) => (
              <tr>
                <td>{i.publication_number}</td>
                <td>{i.priority_date}</td>
                <td>{i.publication_date}</td>
                <td>{i.assignee_original}</td>
                <td>{i.title}</td>
              </tr>
            ))}
          </table>
        </div>
      )}
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
      <div
        style={{
          borderBottom: "1px solid #e5e5e5",
        }}
      >
        {patentDetail.inventors && (
          <p
            style={{
              margin: 0,
              paddingLeft: "10px",
              paddingTop: "10px",
              fontSize: "13px",
            }}
          >
            <strong>Inventors</strong>:{" "}
            {patentDetail.inventors.map((inventor) => (
              <a
                href={
                  "/inventor-detail/" +
                  patentDetail.publication_number +
                  "/" +
                  patentDetail.vertical_id
                }
              >
                {inventor.name}{" "}
              </a>
            ))}
          </p>
        )}
        {patentDetail.assignees && patentDetail.assignees.length && (
          <p
            style={{
              margin: 0,
              paddingLeft: "10px",
              paddingTop: "10px",
              paddingBottom: "10px",
              fontSize: "13px",
            }}
          >
            <strong>Current Assignee</strong>:{" "}
            {patentDetail.assignees.join(", ")}
          </p>
        )}
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
              <span style={{ paddingRight: "20px", width: "100px" }}>
                <strong>{event.date}</strong>
              </span>
              <span>{event.title}</span>
            </p>
          ))}
        </p>
      </div>
      <div
        style={{
          borderBottom: "1px solid #e5e5e5",
          padding: "10px",
          display: patentDetail.external_links ? "inherit" : "none",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "13px",
          }}
        >
          <strong>External: </strong>
          {patentDetail.external_links?.map((i) => (
            <a href={i.link} target="_blank">
              {i.text}{" "}
            </a>
          ))}
        </p>
      </div>
    </div>
  );
};

export default PatentDetail;
