import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import Header from "./components/Header";
import SignUpEmail from "./components/SignUpEmail"; 
import SignUpGoogle from "./components/SignUpGoogle"; 
import Line from "./components/Line";
import LogIn from './components/LogIn';
import Navbar from './components/Navbar';
import Form from './components/Form';
import Tasks from './components/Tasks';
import TaskDetails from './components/TaskDetails';

import { createBrowserRouter, RouterProvider} from "react-router-dom"; 


const router = createBrowserRouter([
    {
      path: '/signup',
      element: 
        <>
        <Header />
        <div className="form">
          <SignUpEmail />
          <Line />
          <SignUpGoogle />
        </div>
        </>
    },
    {
      path: '/login',
      element: 
        <>
          <Header />
          <div className="form">
            <LogIn />
            <Line />
            <SignUpGoogle />
          </div>
        </>
    },
    {
      path: '/',
      element:
        <>
          <Navbar />
          <Header />
          <Form />
        </> 
    },
    {
      path: '/dashboard',
      element: 
        <>
          <Navbar />
          <Tasks />
        </> 
    },
    {
      path:'/task/:id',
      element: 
        <>
          <Navbar />
          <TaskDetails />
        </>
    }
  ]
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <RouterProvider router={router} />
  // </React.StrictMode>
);

