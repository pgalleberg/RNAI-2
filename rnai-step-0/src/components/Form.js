import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faTriangleExclamation,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import auth from "../firebase";

const Form = () => {
  console.log("Form rendered");
  const user = auth.currentUser;
  console.log("user: ", user);
  const [autoSuggest, setAutoSuggest] = useState(false);
  const [genericNames, setGenericNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [numberOfGrantsPerGenericName, setNumberOfGrantsPerGenericName] =
    useState(3);
  const [numberOfPatents, setNumberOfPatents] = useState(10);

  console.log("genericNames: ", genericNames);

  const fetchGenericNames = async (verticalName) => {
    setLoading(true);
    const res = await fetch(
      process.env.REACT_APP_FLASK_WEBSERVER +
        "getGenericNames?verticalName=" +
        verticalName
    );
    console.log("fetchTasks::res: ", res);
    const data = await res.json();
    console.log("fetchTasks::data: ", data);

    setGenericNames([
      {
        id: 1,
        genericName: data[0],
      },
      {
        id: 2,
        genericName: data[1],
      },
      {
        id: 3,
        genericName: data[2],
      },
      {
        id: 4,
        genericName: data[3],
      },
      {
        id: 5,
        genericName: data[4],
      },
    ]);

    setLoading(false);
  };

  const addTask = async (task) => {
    console.log("addTask::task received: ", task);
    console.log("addTask::JSON.stringify(task): ", JSON.stringify(task));
    const res = await fetch(process.env.REACT_APP_FLASK_WEBSERVER + "tasks", {
      /* TODO: Should I send request to tasks/user */ method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(task),
    });

    //const data = await res.json() //don't need to await here
    //console.log("addTask::data added: ", data)
  };

  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    console.log("Submit clicked");
    const now = new Date();
    const task = {
      query: document.getElementById("verticalName").value,
      user: {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
      },
      status: "Pending",
      time: now.toLocaleString(),
      names: [
        document.getElementById("name1").value,
        document.getElementById("name2").value,
        document.getElementById("name3").value,
        document.getElementById("name4").value,
        document.getElementById("name5").value,
      ],
      autoSuggest: autoSuggest,
      numberOfGrants: parseInt(
        document.getElementById("numberOfGrants").value,
        10
      ),
      numberOfGrantsPerGenericName: parseInt(
        document.getElementById("numberOfGrantsPerGenericName").value,
        10
      ),
      numberOfPatents: parseInt(numberOfPatents),
      OpportunityStatus: [
        document.getElementById("posted").checked === true && "posted",
        document.getElementById("forecasted").checked === true && "forecasted",
        document.getElementById("closed").checked === true && "closed",
      ].filter(Boolean),
      numberOfRelevantPapers: parseInt(
        document.getElementById("numberOfRelevantPapers").value,
        10
      ),
    };

    await addTask(task);
    setSubmitting(false);
    navigate("/dashboard");
  };

  return (
    <div className="grid-container">
      <div
        style={{
          backgroundColor: "whitesmoke",
          textAlign: "left",
          paddingBottom: "20px",
          borderRadius: "10px",
        }}
      >
        <div
          className="background"
          style={{ borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }}
        ></div>
        <div style={{ paddingLeft: "10px", paddingRight: "10px" }}>
          <p style={{ fontSize: "20px" }}>
            <strong>
              {" "}
              Configurations&nbsp;
              <FontAwesomeIcon icon={faGear} size="lg" color="black" />
            </strong>
          </p>
          {/* <hr style={{marginRight: '120px'}}></hr> */}
          <br></br>
          <div>
            <div>
              <label># of grants for vertical name:</label>
              <input
                id="numberOfGrants"
                type="number"
                defaultValue="5"
                max={10}
                min={1}
              ></input>
              <br></br>
            </div>
            <div>
              <label># of grants for generic names:</label>
              <input
                id="numberOfGrantsPerGenericName"
                type="number"
                value={numberOfGrantsPerGenericName}
                max={5}
                min={0}
                onChange={(e) => {
                  setNumberOfGrantsPerGenericName(e.target.value);
                  autoSuggest &&
                    document.getElementById("verticalName").value.length > 5 &&
                    e.target.value > 0 &&
                    document.getElementById("name1").value.length === 0 &&
                    fetchGenericNames(
                      document.getElementById("verticalName").value
                    );
                }}
              ></input>
              <br></br>
            </div>

            <div>
              <input
                type="checkbox"
                id="autoSuggestCheckbox"
                checked={autoSuggest}
                onChange={(e) => {
                  setAutoSuggest(e.currentTarget.checked);
                  document.getElementById("verticalName").value.length > 5 &&
                    numberOfGrantsPerGenericName > 0 &&
                    document.getElementById("name1").value.length == 0 &&
                    fetchGenericNames(
                      document.getElementById("verticalName").value
                    );
                }}
                disabled={loading}
              ></input>
              <label>Auto Suggest Generic Names</label>
              <br></br>
            </div>
          </div>
          <div>
            <p style={{ fontWeight: "bolder" }}>Opportunity Status:</p>
            <input type="checkbox" id="posted" defaultChecked></input>
            <label>Posted</label>
            <br></br>
            <input type="checkbox" id="forecasted" defaultChecked></input>
            <label>Forecasted</label>
            <br></br>
            <input type="checkbox" id="closed" disabled></input>
            <label>Closed</label>
            <br></br>
          </div>

          <hr
            style={{
              borderColor: "lightgray",
              borderTopWidth: "0.1px",
              margin: "20px",
            }}
          ></hr>

          <div>
            {/* <input type="checkbox" id="relevant" checked></input>
            <label>Relevant Papers</label><br></br>
            <input type="checkbox" id="recommended"></input>
            <label>Recommended Papers</label><br></br>
            <input type="checkbox" id="referenced" disabled></input>
            <label>Referenced Papers</label><br></br>
            <input type="checkbox" id="recommended" disabled></input>
            <label>Cited Papers</label><br></br> */}
          </div>

          <div>
            <div className="">
              <label># of relevant papers:</label>
              <input
                id="numberOfRelevantPapers"
                type="number"
                defaultValue="25"
                max={50}
                min={1}
              ></input>
              <br></br>
            </div>
            {/* <div className="">
              <label for="fname"># of recommended papers:</label>
              <input type="number" defaultValue="3" max={10} min={1}></input><br></br>
            </div> */}
          </div>
          <hr
            style={{
              borderColor: "lightgray",
              borderTopWidth: "0.1px",
              margin: "20px",
            }}
          ></hr>
          <div>
            <label># of patents:</label>
            <input
              id="numberOfPatents"
              type="number"
              value={numberOfPatents}
              min={10}
              max={100}
              onChange={(e) => {
                setNumberOfPatents(e.target.value);
              }}
            ></input>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div
          className="inputs"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}
        >
          <div className="grid-item"></div>
          <div className="grid-item">
            <input
              id="name1"
              type="text"
              name="name1"
              placeholder="First Generic Name"
              defaultValue={
                genericNames[0] !== undefined ? genericNames[0].genericName : ""
              }
              required={numberOfGrantsPerGenericName > 0}
              style={{
                backgroundColor: autoSuggest ? "lightyellow" : "white",
                width: "60%",
              }}
              disabled={autoSuggest ? true : false}
              // onChange={(e) => changeGenericName(genericNames[0].id, e.target.value)}
            />
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              size="lg"
              color="black"
              style={{ marginLeft: "10px", visibility: !loading && "hidden" }}
            />
          </div>
          <div className="grid-item"></div>
          <div className="grid-item">
            <input
              id="name2"
              type="text"
              name="name2"
              placeholder="Second Generic Name"
              defaultValue={
                genericNames[1] !== undefined ? genericNames[1].genericName : ""
              }
              required={numberOfGrantsPerGenericName > 0}
              style={{
                backgroundColor: autoSuggest ? "lightyellow" : "white",
                width: "60%",
              }}
              disabled={autoSuggest ? true : false}
              // onChange={(e) => changeGenericName(genericNames[1].id, e.target.value)}
            />
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              size="lg"
              color="black"
              style={{ marginLeft: "10px", visibility: !loading && "hidden" }}
            />
          </div>
          <div className="grid-item">
            <input
              id="verticalName"
              style={{ width: "60%" }}
              type="text"
              name="vertical"
              placeholder="Vertical Name"
              required
              onBlur={(e) => {
                autoSuggest &&
                e.target.value.length > 5 &&
                numberOfGrantsPerGenericName > 0
                  ? fetchGenericNames(e.target.value)
                  : setGenericNames([]);
              }}
            />
          </div>
          <div className="grid-item">
            <input
              id="name3"
              type="text"
              name="name3"
              placeholder="Third Generic Name"
              defaultValue={
                genericNames[2] !== undefined ? genericNames[2].genericName : ""
              }
              required={numberOfGrantsPerGenericName > 0}
              style={{
                backgroundColor: autoSuggest ? "lightyellow" : "white",
                width: "60%",
              }}
              disabled={autoSuggest ? true : false}
              // onChange={(e) => changeGenericName(genericNames[2].id, e.target.value)}
            />
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              size="lg"
              color="black"
              style={{ marginLeft: "10px", visibility: !loading && "hidden" }}
            />
          </div>

          <div className="grid-item"></div>
          <div className="grid-item">
            <input
              id="name4"
              type="text"
              name="name4"
              placeholder="Fourth Generic Name"
              defaultValue={
                genericNames[3] !== undefined ? genericNames[3].genericName : ""
              }
              required={numberOfGrantsPerGenericName > 0}
              style={{
                backgroundColor: autoSuggest ? "lightyellow" : "white",
                width: "60%",
              }}
              disabled={autoSuggest ? true : false}
              // onChange={(e) => changeGenericName(genericNames[3].id, e.target.value)}
            />
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              size="lg"
              color="black"
              style={{ marginLeft: "10px", visibility: !loading && "hidden" }}
            />
          </div>

          <div className="grid-item"></div>
          <div className="grid-item">
            <input
              id="name5"
              type="text"
              name="name5"
              placeholder="Fifth Generic Name"
              defaultValue={
                genericNames[4] !== undefined ? genericNames[4].genericName : ""
              }
              required={numberOfGrantsPerGenericName > 0}
              style={{
                backgroundColor: autoSuggest ? "lightyellow" : "white",
                width: "60%",
              }}
              disabled={autoSuggest ? true : false}
              // onChange={(e) => changeGenericName(genericNames[4].id, e.target.value)}
            />
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              size="lg"
              color="black"
              style={{ marginLeft: "10px", visibility: !loading && "hidden" }}
            />
          </div>
        </div>
        <br></br>
        <div>
          {submitting ? (
            <FontAwesomeIcon
              icon={faSpinner}
              style={{ color: "black" }}
              spin
              size="5x"
            ></FontAwesomeIcon>
          ) : (
            <input
              style={{ cursor: loading && "wait" }}
              type="submit"
              value="Submit"
              disabled={loading}
            />
          )}
        </div>
      </form>
    </div>
  );
};

export default Form;
