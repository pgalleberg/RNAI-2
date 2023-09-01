import Header from "./components/Header";
import Form from "./components/Form";
import { Configuration, OpenAIApi } from "openai";
import { useState } from "react"

const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });
const openai = new OpenAIApi(configuration);

function App() {
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
    <>
      <Header />
      <Form genericNames={names} fetchGenericNames={fetchGenericNames} changeGenericName={changeGenericName}/>
    </>
  );
}

export default App;
