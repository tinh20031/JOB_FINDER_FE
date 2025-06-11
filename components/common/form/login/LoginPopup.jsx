'use client'

import Register from "../register/Register";
import FormContent from "./FormContent";
import { useEffect } from "react";

const LoginPopup = () => {

  const switchModals = () => {
    // Ensure Bootstrap is loaded before trying to use it
    if (typeof window !== 'undefined' && window.bootstrap && window.bootstrap.Modal) {
      console.log('Bootstrap and Modal are loaded.');
      // Close the registration modal
      const registerModal = document.getElementById('registerModal');
      console.log('Register modal element:', registerModal);
      
      const registerModalInstance = window.bootstrap.Modal.getInstance(registerModal);
      console.log('Register modal instance:', registerModalInstance);

      if (registerModalInstance) {
        registerModalInstance.hide();
        console.log('Register modal hidden.');
      }

      // Open the login modal
      const loginModal = document.getElementById('loginPopupModal');
      console.log('Login modal element:', loginModal);
      
      // Check if a modal instance already exists for the login modal
      let loginModalInstance = window.bootstrap.Modal.getInstance(loginModal);

      if (!loginModalInstance) {
        // If not, create a new one
        loginModalInstance = new window.bootstrap.Modal(loginModal);
        console.log('New login modal instance created.');
      } else {
        console.log('Existing login modal instance found.');
      }
      
      if (loginModalInstance) {
         loginModalInstance.show();
         console.log('Login modal shown.');
      }

    } else {
      console.error('Bootstrap or Modal not loaded, cannot switch modals.');
      // If Bootstrap is not loaded after waiting for window.load, something is wrong with the Bootstrap loading setup
    }
  };

  const handleRegistrationSuccess = () => {
    console.log('Registration successful, attempting to switch modals.');

    // Try to switch modals immediately
    if (typeof window !== 'undefined' && window.bootstrap && window.bootstrap.Modal) {
      switchModals();
    } else if (typeof window !== 'undefined') {
      // If not immediately available, wait for window load event
      console.log('Bootstrap not immediately available, waiting for window load.');
      window.addEventListener('load', switchModals);
    } else {
       console.error('Window is not defined, cannot load Bootstrap.');
    }
  };

  useEffect(() => {
    // The require("bootstrap/dist/js/bootstrap") in layout.js handles loading
    // We just need to make sure calls to bootstrap.Modal are guarded.
    
    // Clean up the event listener if the component unmounts
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('load', switchModals);
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <>
      <div className="modal fade" id="loginPopupModal">
        <div className="modal-dialog modal-lg modal-dialog-centered login-modal modal-dialog-scrollable">
          <div className="modal-content">
            <button
              type="button"
              className="closed-modal"
              data-bs-dismiss="modal"
            ></button>
            {/* End close modal btn */}

            <div className="modal-body">
              {/* <!-- Login modal --> */}
              <div id="login-modal">
                {/* <!-- Login Form --> */}
                <div className="login-form default-form">
                  <FormContent isPopup={true} />
                </div>
                {/* <!--End Login Form --> */}
              </div>
              {/* <!-- End Login Module --> */}
            </div>
            {/* En modal-body */}
          </div>
          {/* End modal-content */}
        </div>
      </div>
      {/* <!-- Login Popup Modal --> */}

      <div className="modal fade" id="registerModal">
        <div className="modal-dialog modal-lg modal-dialog-centered login-modal modal-dialog-scrollable">
          <div className="modal-content">
            <button
              type="button"
              className="closed-modal"
              data-bs-dismiss="modal"
            ></button>
            {/* End close modal btn */}

            <div className="modal-body">
              {/* <!-- Login modal --> */}
              <div id="login-modal">
                {/* <!-- Login Form --> */}
                <div className="login-form default-form">
                  <Register isPopup={true} onRegistrationSuccess={handleRegistrationSuccess} />
                </div>
                {/* <!--End Login Form --> */}
              </div>
              {/* <!-- End Login Module --> */}
            </div>
            {/* En modal-body */}
          </div>
          {/* End modal-content */}
        </div>
      </div>
      {/* <!-- Login Popup Modal --> */}
    </>
  );
};

export default LoginPopup;
