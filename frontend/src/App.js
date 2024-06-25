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
import { useRoutes } from './hooks/useRoutes';

function App(){
  const router = useRoutes()
 
  return <RouterProvider router={router} />
}

export default App