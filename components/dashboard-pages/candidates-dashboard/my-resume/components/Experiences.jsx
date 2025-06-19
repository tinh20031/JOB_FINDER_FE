const Experiences = ({ experiences = [] }) => (
  <div className="resume-outer theme-blue">
    <div className="upper-title">
      <h4>Work & Experience</h4>
      <button className="add-info-btn">
        <span className="icon flaticon-plus"></span> Add Work
      </button>
    </div>
    {experiences.length === 0 && <div>No experience info.</div>}
    {experiences.map((exp) => (
      <div className="resume-block" key={exp.workExperienceId}>
        <div className="inner">
          <span className="name">{exp.companyName?.[0] || "?"}</span>
          <div className="title-box">
            <div className="info-box">
              <h3>{exp.jobTitle}</h3>
              <span>{exp.companyName}</span>
            </div>
            <div className="edit-box">
              <span className="year">
                {exp.yearStart?.slice(0, 4)} - {exp.yearEnd?.slice(0, 4)}
              </span>
              <div className="edit-btns">
                <button>
                  <span className="la la-pencil"></span>
                </button>
                <button>
                  <span className="la la-trash"></span>
                </button>
              </div>
            </div>
          </div>
          <div className="text">{exp.workDescription}</div>
        </div>
      </div>
    ))}
  </div>
);

export default Experiences;