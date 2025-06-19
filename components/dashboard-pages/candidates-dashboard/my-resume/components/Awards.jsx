const Awards = ({ awards = [] }) => (
  <div className="resume-outer theme-yellow">
    <div className="upper-title">
      <h4>Awards</h4>
      <button className="add-info-btn">
        <span className="icon flaticon-plus"></span> Awards
      </button>
    </div>
    {awards.length === 0 && <div>No awards info.</div>}
    {awards.map((award) => (
      <div className="resume-block" key={award.awardId}>
        <div className="inner">
          <span className="name">{award.awardName?.[0] || "?"}</span>
          <div className="title-box">
            <div className="info-box">
              <h3>{award.awardName}</h3>
              <span>{award.awardOrganization}</span>
            </div>
            <div className="edit-box">
              <span className="year">
                {award.year?.slice(0, 4)}
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
          <div className="text">{award.awardDescription}</div>
        </div>
      </div>
    ))}
  </div>
);

export default Awards;