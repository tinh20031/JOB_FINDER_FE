'use client'

import Awards from "./Awards";
import Education from "./Education";
import Experiences from "./Experiences";
import SkillsMultiple from "./SkillsMultiple";
import useResumeData from "@/services/useResumeData";
import ProfileCard from "./ProfileCard";
// import AboutMe from "./AboutMe";
  
const index = () => {
  const {aboutme, profile,education, experiences, awards, skills, loading } = useResumeData();
  if (loading) return <div>Loading...</div>;
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <form className="default-form" onClick={handleSubmit}>
      <div className="row">
        <div className ="form-group col-lg-12 col-md-12">
         <ProfileCard profile = {profile}/>
        </div>
        {/* <div className ="form-group col-lg-12 col-md-12">
         <AboutMe aboutme = {aboutme}/>
        </div> */}
        <div className="form-group col-lg-12 col-md-12">
          <Education education={education} />
          <Experiences experiences={experiences} />     
        </div>
      
        <div className="form-group col-lg-12 col-md-12">
          <Awards awards={awards} />
        </div>
        <div className="form-group col-lg-12 col-md-12">
          <label>Skills</label>
          <SkillsMultiple skills={skills} />
        </div>
        {/* <!-- End Award --> */}

        <div className="form-group col-lg-6 col-md-12">
          <label>Skills </label>
          <SkillsMultiple />
        </div>
        {/* <!-- Multi Selectbox --> */}

        <div className="form-group col-lg-12 col-md-12">
          <button type="submit" className="theme-btn btn-style-one">
            Save
          </button>
        </div>
        {/* <!-- Input --> */}
      </div>
      {/* End .row */}
    </form>
  );
};

export default index;
