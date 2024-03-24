import React from "react";

const PatentDetails = ({ patent }) => {
  return (
    <div
      style={{
        marginTop: "20px",
        marginBottom: "20px",
        backgroundColor: "whitesmoke",
        padding: "10px",
      }}
    >
      <h3 style={{ margin: "0px" }}>{patent.title}</h3>
      <p>{patent.snippet}</p>
      <p style={{ margin: "0px" }}>Filing Date: {patent.filing_date}</p>
      <p style={{ margin: "0px" }}>Grant Date: {patent.grant_date}</p>
      <p style={{ margin: "0px" }}>Inventor: {patent.inventor}</p>
    </div>
  );
};

export default PatentDetails;
