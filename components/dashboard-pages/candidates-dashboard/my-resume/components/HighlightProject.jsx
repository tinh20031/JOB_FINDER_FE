const HighlightProject = ({ project = [] }) => (
  <div className="resume-outer">
    <div className="upper-title">
      <h4>Highlight Project</h4>
      <button className="add-info-btn">
        <span className="icon flaticon-plus"></span> Add Project
      </button>
    </div>
    {project.length === 0 && <div>No Project info.</div>}
    {project.map((pro) => (
      <div className="resume-block" key={pro.highlightProjectId}>
        <div className="inner">
          <span className="name">{pro.projectName?.[0] || "?"}</span>
          <div className="title-box">
            <div className="info-box">
              <h3>{pro.projectName}</h3>
              <span>{pro.projectDescription}</span>
            </div>
            <div className="edit-box">
              <span className="year">
                {pro.yearStart?.slice(0, 4)} - {pro.yearEnd?.slice(0, 4)}
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
          <div className="text">{pro.projectLink}</div>
        </div>
      </div>
    ))}
  </div>
);

export default HighlightProject;
