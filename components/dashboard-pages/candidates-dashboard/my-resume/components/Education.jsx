const Education = ({ education = [] }) => (
  <div className="resume-outer">
    <div className="upper-title">
      <h4>Education</h4>
      <button className="add-info-btn">
        <span className="icon flaticon-plus"></span> Add Education
      </button>
    </div>
    {education.length === 0 && <div>No education info.</div>}
    {education.map((edu) => (
      <div className="resume-block" key={edu.educationId}>
        <div className="inner">
          <span className="name">{edu.school?.[0] || "?"}</span>
          <div className="title-box">
            <div className="info-box">
              <h3>{edu.degree}</h3>
              <span>{edu.school}</span>
            </div>
            <div className="edit-box">
              <span className="year">
                {edu.yearStart?.slice(0, 4)} - {edu.yearEnd?.slice(0, 4)}
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
          <div className="text">{edu.detail}</div>
        </div>
      </div>
    ))}
  </div>
);

export default Education;