'use client'

import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import LoginWithSocial from "../shared/LoginWithSocial";
import Form from "./FormContent";
import Link from "next/link";
import { useState } from "react";

const Register = ({ isPopup = false, onRegistrationSuccess }) => {
  const [selectedRole, setSelectedRole] = useState('Candidate');

  const handleTabSelect = (index) => {
    setSelectedRole(index === 0 ? 'Candidate' : 'Employer');
  };

  return (
    <div className="form-inner">
      <h3>Create a JobFinder Account</h3>

      <Tabs onSelect={handleTabSelect}>
        <div className="form-group register-dual">
          <TabList className="btn-box row">
            <Tab className="col-lg-6 col-md-12">
              <button>Candidate</button>
            </Tab>
            <Tab className="col-lg-6 col-md-12">
              <button>Employer</button>
            </Tab>
          </TabList>
        </div>
        {/* End .form-group */}

        <TabPanel>
          <Form onRegistrationSuccess={onRegistrationSuccess} />
        </TabPanel>
        {/* End cadidates Form */}

        <TabPanel>
          <Form onRegistrationSuccess={onRegistrationSuccess} />
        </TabPanel>
        {/* End Employer Form */}
      </Tabs>
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
