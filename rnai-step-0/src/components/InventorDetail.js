import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const fetchInventorDetail = async (vertical_id, publication_number) => {
  const url =
    process.env.REACT_APP_FLASK_WEBSERVER +
    "inventor-detail?" +
    "publication_number=" +
    publication_number +
    "&vertical_id=" +
    vertical_id;
  const res = await fetch(url);
  const data = await res.json();

  return data;
};

const InvenorDetail = () => {
  const { vertical_id, publication_number } = useParams();
  console.log(useParams());
  const [isLoading, setIsLoading] = useState(true);
  const [inventorInfo, setInventorInfo] = useState({});
  useEffect(() => {
    setIsLoading(true);
    fetchInventorDetail(vertical_id, publication_number)
      .then((res) => {
        setIsLoading(false);
        setInventorInfo(res);
        console.log(res);
      })
      .catch((err) => {
        setIsLoading(false);
        console.log("InventorDetail::e", err);
      });
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="container">
          <FontAwesomeIcon icon={faSpinner} spin size="10x"></FontAwesomeIcon>
        </div>
      ) : inventorInfo ? (
        <div className="author-container">
          <div className="author-card">
            <div className="background"></div>
            <div className="author-details">
              <p style={{ fontSize: "24px", paddingBottom: "0px" }}>
                <strong>{inventorInfo?.name?.name || ""}</strong>
              </p>

              {inventorInfo.patents && (
                <div className="author-stat">
                  <p>Highly Influential Citations</p>
                  <p>
                    <strong>{inventorInfo.patents?.length || 0}</strong>
                  </p>
                </div>
              )}
              <hr></hr>
            </div>
          </div>
          <div className="author-papers references">
            <h3>Vertical Specific Patents</h3>
            <p style={{ fontSize: "10px", color: "gray", marginTop: "0px" }}>
              &#42;&nbsp;Internal links (all Patents are present in database)
            </p>
            {
              <Link
                to={`/patent-detail/${inventorInfo.source_patent?.publication_number}/${inventorInfo.vertical_id}`}
              >
                {inventorInfo.source_patent?.title}
              </Link>
            }
            {inventorInfo.patents && (
              <>
                <p>All Patents</p>
                <p
                  style={{ fontSize: "10px", color: "gray", marginTop: "0px" }}
                >
                  &#42;&nbsp;External links (all patents are not present in the
                  database)
                </p>
                {inventorInfo.patents.map((patent) => (
                  <>
                    <Link target="_blank" to={patent.pdf}>
                      &nbsp;&nbsp;•&nbsp;&nbsp;{patent.title}
                    </Link>
                    <br></br>
                  </>
                ))}
              </>
            )}
          </div>
        </div>
      ) : (
        <h1>No details Found</h1>
      )}
    </>
  );
};

export default InvenorDetail;
