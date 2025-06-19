const Award = ({ award = [] }) => (
  <div className="resume-outer">
    <div className="upper-title">
      <h4>Award</h4>
      <button className="add-info-btn">
        <span className="icon flaticon-plus"></span> Add Award
      </button>
    </div>
    {award.length === 0 && <div>No Award info.</div>}
    {award.map((awa) => (
      <div className="resume-block" key={awa.awardId}>
        <div className="inner">
          <span className="name">{awa.awardName?.[0] || "?"}</span>
          <div className="title-box">
            <div className="info-box">
              <h3>{awa.awardName}</h3>
              <span>{awa.awardOrganization}</span>
            </div>
            <div className="edit-box">
              <span className="year">
                {awa.yearStart?.slice(0, 4)} - {awa.yearEnd?.slice(0, 4)}
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
          <div className="text">{awa.awardDescription}</div>
        </div>
      </div>
    ))}
  </div>
);

export default Award;
