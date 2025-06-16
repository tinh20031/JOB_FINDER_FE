'use client'

import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import LoginWithSocial from "../shared/LoginWithSocial";
import Form from "./FormContent";
import Link from "next/link";
import { useState } from "react";

const Register = ({ isPopup = false, onRegistrationSuccess }) => {
  return (
    <div className="form-inner">
      <h3>Create a JobFinder Account</h3>

      <div className="form-group register-dual">
          </div>
        {/* End .form-group */}

          <Form onRegistrationSuccess={onRegistrationSuccess} />
        {/* End cadidates Form */}

        {/* End Employer Form */}
      {/* End form-group */}

      <div className="bottom-box">
        <div className="text">
          Already have an account?{" "}
          {isPopup ? (
            <Link
              href="#"
              className="call-modal login"
              data-bs-toggle="modal"
              data-bs-dismiss="modal"
              data-bs-target="#loginPopupModal"
            >
              LogIn
            </Link>
          ) : (
            <Link href="/login" className="call-modal login">
              LogIn
            </Link>
          )}
        </div>
        <div className="divider">
        </div>
        {/* <LoginWithSocial /> */}
      </div>
      {/* End bottom-box LoginWithSocial */}
    </div>
  );
};

export default Register;
