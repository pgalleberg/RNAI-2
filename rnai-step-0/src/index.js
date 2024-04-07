import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import Header from "./components/Header";
import SignUpEmail from "./components/SignUpEmail";
import SignUpGoogle from "./components/SignUpGoogle";
import Line from "./components/Line";
import LogIn from "./components/LogIn";
import Navbar from "./components/Navbar";
import Form from "./components/Form";
import Tasks from "./components/Tasks";
import TaskDetails from "./components/TaskDetails";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { AuthContext } from "./AuthContext";

import { Protected } from "./components/Protected";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import PaperDetails from "./components/PaperDetails";
import Author from "./components/Author";
import GrantDetails from "./components/GrantDetails";
import ApprovalPending from "./components/ApprovalPending";
import PatentDetails from "./components/PatentDetail";
import InvenorDetail from "./components/InventorDetail";

function App() {
  const [email, setEmail] = useState("");

  const setEmail_ = (email) => {
    console.log("setting email");
    setEmail(email);
  };

  const router = createBrowserRouter([
    {
      id: "root",
      path: "/",
      children: [
        {
          path: "/",
          element: (
            <>
              <Protected>
                <Navbar />
                <Header />
                <Form />
              </Protected>
            </>
          ),
        },
        {
          path: "/dashboard",
          element: (
            <>
              <Protected>
                <Navbar />
                <Tasks />
              </Protected>
            </>
          ),
        },
        {
          path: "/task/:id",
          element: (
            <>
              <Protected>
                <Navbar />
                <TaskDetails />
              </Protected>
            </>
          ),
        },
        {
          path: "/paper/:paper_id/:vertical_id",
          element: (
            <>
              <Protected>
                <Navbar />
                <PaperDetails />
              </Protected>
            </>
          ),
        },
        {
          path: "/patent-detail/:publication_number/:vertical_id",
          element: (
            <>
              <Protected>
                <Navbar />
                <PatentDetails />
              </Protected>
            </>
          ),
        },
        {
          path: "/inventor-detail/:publication_number/:vertical_id",
          element: (
            <>
              <Protected>
                <Navbar />
                <InvenorDetail />
              </Protected>
            </>
          ),
        },
        {
          path: "/author/:author_id/:vertical_id",
          element: (
            <>
              <Protected>
                <Navbar />
                <Author />
              </Protected>
            </>
          ),
        },
        {
          path: "/grant/:grant_id",
          element: (
            <>
              <Protected>
                <Navbar />
                <GrantDetails />
              </Protected>
            </>
          ),
        },
      ],
    },
    {
      path: "/signup",
      element: (
        <>
          <Header />
          <div className="form">
            <SignUpEmail setEmail_={setEmail} />
            <Line />
            <SignUpGoogle />
          </div>
        </>
      ),
    },
    {
      path: "/login",
      element: (
        <>
          <Header />
          <div className="form">
            <LogIn setEmail_={setEmail} />
            <Line />
            <SignUpGoogle />
          </div>
        </>
      ),
    },
    {
      path: "/reset-password",
      element: (
        <>
          <Header />
          <ForgotPassword setEmail_={setEmail_} email_={email} />
        </>
      ),
    },
    {
      path: "/reset-password/send-email",
      element: (
        <>
          <Header />
          <ResetPassword email={email} />
        </>
      ),
    },
    {
      path: "/approval-pending",
      element: (
        <>
          <Header />
          <ApprovalPending />
        </>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <AuthContext>
    <App />
  </AuthContext>
  // </React.StrictMode>
);
