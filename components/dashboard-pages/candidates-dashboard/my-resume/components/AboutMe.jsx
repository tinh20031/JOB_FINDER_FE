import React from "react";

const AboutMe = ({ aboutme }) => (
  <div className="resume-outer">
    <div className="upper-title">
      <h4>About Me</h4>
      <button className="add-info-btn">
        <span className="icon flaticon-plus"></span> Add Info
      </button>
    </div>
    {!aboutme?.aboutMeDescription && <div>No about me info.</div>}
    {aboutme?.aboutMeDescription && (
      <div className="resume-block">
        <div className="inner">
          <div className="title-box">
            <div className="edit-box">
              <div className="text">{aboutme.aboutMeDescription}</div>
              <div className="edit-btns">
                <button>
                  <span className="la la-pencil"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default AboutMe;
