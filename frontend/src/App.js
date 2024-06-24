import React, { useState } from 'react';

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Form from './components/Form';
import Header from "./components/Header";
import Line from "./components/Line";
import LogIn from './components/LogIn';
import SignUpEmail from "./components/SignUpEmail";
import SignUpGoogle from "./components/SignUpGoogle";
import TaskDetails from './components/TaskDetails';
import Tasks from './components/Tasks';


import ApprovalPending from './components/ApprovalPending';
import Author from './components/Author';
import ForgotPassword from './components/ForgotPassword';
import GrantDetails from './components/GrantDetails';
import Inventor from './components/Inventor';
import PaperDetails from './components/PaperDetails';
import PatentDetails from './components/PatentDetails';
import ResetPassword from './components/ResetPassword';
import AuthLayout from './Layouts/AuthLayout';

function App(){

  const [email, setEmail] = useState('')
  
  const setEmail_ = (email) => {
    setEmail(email)
  }

  const router = createBrowserRouter([
    {
      id: 'root',
      path: '/',
      element: <AuthLayout></AuthLayout>,
      children: [
       
        {
          path: '/',
          element:  <Form />
        },
        {
          path: '/dashboard',
          element: <Tasks />
        },
        {
          path:'/task/:id',
          element: <TaskDetails />
        },
        {
          path:'/paper/:paper_id/:vertical_id',
          element: <PaperDetails />
        },
        {
          path:'/author/:author_id/:vertical_id',
          element: <Author />
        },
        {
          path:'/grant/:grant_id',
          element: <GrantDetails />
        },
        {
          path:'/patent/:patent_id/en/:vertical_id',
          element: <PatentDetails />
        },
        {
          path:'/inventor/:inventor_name/:vertical_id',
          element: <Inventor />
        }
      ]
    },
    {
      path: '/signup',
      element: 
        <>
        <Header />
        <div className="form">
          <SignUpEmail setEmail_={setEmail}/>
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
            <LogIn setEmail_={setEmail}/>
            <Line />
            <SignUpGoogle />
          </div>
        </>
    },
    {
      path: '/reset-password',
      element: 
        <>
          <Header />
          <ForgotPassword setEmail_={setEmail_} email_={email}/>
        </>
    },
    {
      path: '/reset-password/send-email',
      element: 
        <>
          <Header />
          <ResetPassword email={email}/>
        </>
    },
    {
      path: '/approval-pending',
      element: 
        <>
          <Header />
          <ApprovalPending />
        </>
    }
  ]);

  return <RouterProvider router={router} />
}

export default App