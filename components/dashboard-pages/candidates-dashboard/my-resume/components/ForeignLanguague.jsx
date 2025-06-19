const ForeignLanguague = ({ foreignlanguage = [] }) => (
  <div className="resume-outer">
    <div className="upper-title">
      <h4>Foreign Languague</h4>
      <button className="add-info-btn">
        <span className="icon flaticon-plus"></span> Add Foreign Language
      </button>
    </div>
    {foreignlanguage.length === 0 && <div>No Foreign Language info.</div>}
    {foreignlanguage.map((flangua) => (
      <div className="resume-block" key={flangua.foreignlanguage}>
        <div className="inner">
          <span className="name">{flangua.languageLevel?.[0] || "?"}</span>
          <div className="title-box">
            <div className="info-box">
              <h3>{flangua.languageName}</h3>
              <span>{flangua.languageLevel}</span>
            </div>
            <div className="edit-box">
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
        </div>
      </div>
    ))}
  </div>
);

export default ForeignLanguague;
