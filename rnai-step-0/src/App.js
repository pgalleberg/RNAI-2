import Header from "./components/Header";
import Form from "./components/Form";
import SignUpEmail from "./components/SignUpEmail"; 
import SignUpGoogle from "./components/SignUpGoogle"; 
import LogIn from "./components/LogIn";
import Line from "./components/Line";
import Navbar from "./components/Navbar";
import { Configuration, OpenAIApi } from "openai";
import { useEffect, useState } from "react"
import { BrowserRouter as Router, Route, Routes, Redirect } from "react-router-dom"; 

import { onAuthStateChanged } from "firebase/auth";
import auth from "./firebase";
import Tasks from "./components/Tasks";
import TaskDetails from "./components/TaskDetails";

const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });
const openai = new OpenAIApi(configuration);

function App() {

  const [user, setUser] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(true); // store the whole user object or just a part of it
      } else {
        setUser(false);
      }
    });

    // Cleanup the observer on unmount
    return () => unsubscribe();
  }, []);

  const [names, setNames] = useState([
    { 
      id: 1,
    }, 
    { 
      id: 2,
    }, 
    { 
      id: 3,
    }, 
    { 
      id: 4,
    }, 
    { 
      id: 5,
    }])
  console.log("App::names:", names)

  const fetchGenericNames = async (verticalName) => {
    console.log("verticalName: ", verticalName)
    const rsp = await completion(verticalName)
    console.log("response: ", rsp['data']['choices'][0]['message']['content'])
    const parsed_rsp = parseResponse(rsp['data']['choices'][0]['message']['content'])
    console.log('parsed_rsp: ', parsed_rsp)
    setNames([
      { 
        id: 1,
        genericName: parsed_rsp[0]
      }, 
      { 
        id: 2,
        genericName: parsed_rsp[1]
      }, 
      { 
        id: 3,
        genericName: parsed_rsp[2]
      }, 
      { 
        id: 4,
        genericName: parsed_rsp[3]
      }, 
      { 
        id: 5,
        genericName: parsed_rsp[4]
      }])
  }

  const completion = (verticalName) => openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: createPrompt(verticalName)}],
    temperature: 0.0,
  });

  const createPrompt = (verticalName) => {
    return `I am looking for funding in the area of "${verticalName}". However, I am having trouble finding funding specifically for this area. Please give me five generic topics that would help me find funding for my area of interest. List each name in a new line without any formatting. For example:

    Topic 1
    Topic 2
    Topic 3
    Topic 4
    Topic 5`
  }

  const parseResponse = (response) => {
    return response.split('\n')
  }

  const changeGenericName = (id, updatedName) => {
    console.log("id: ", id)
    setNames(names.map((name) => name.id === id ? { ...name, genericName: updatedName } : name
    ))
  }

  return (
    <Router>
      <>
        <Routes>
          <Route
            path='/signup'
            element={
              <>
              <Header />
              <div className="form">
                <SignUpEmail />
                <Line />
                <SignUpGoogle />
              </div>
              </>
            }
          />
          <Route
            path='/login'
            element={
              <>
                <Header />
                <div className="form">
                  <LogIn />
                  <Line />
                  <SignUpGoogle />
                </div>
              </>
            }
          />
          <Route
            path='/'
            element={ 
              <>
                <Navbar />
                <Header />
                <Form genericNames={names} fetchGenericNames={fetchGenericNames} changeGenericName={changeGenericName}/>
              </>
            } 
          />
          <Route
            path='/dashboard'
            element={ 
              //user ?
              <>
                <Navbar />
                {/* <Header /> */}
                <Tasks />
              </>
            } 
          />
          <Route
            path='/task/:id'
            element={ 
              <>
                <Navbar />
                {/* <Header /> */}
                <TaskDetails />
              </>
            } 
          />
        </Routes>
      </>
    </Router>
  );
}

export default App;
