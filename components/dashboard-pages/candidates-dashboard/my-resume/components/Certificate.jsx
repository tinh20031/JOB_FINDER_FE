const Certificate = ({ certificate = [] }) => (
  <div className="resume-outer">
    <div className="upper-title">
      <h4>Certificate</h4>
      <button className="add-info-btn">
        <span className="icon flaticon-plus"></span> Add Certificate
      </button>
    </div>
    {certificate.length === 0 && <div>No Certificate info.</div>}
    {certificate.map((cer) => (
      <div className="resume-block" key={cer.certificateId}>
        <div className="inner">
          <span className="name">{cer.certificateName?.[0] || "?"}</span>
          <div className="title-box">
            <div className="info-box">
              <h3>{cer.certificateName}</h3>
              <span>{cer.organization}</span>
            </div>
            <div className="edit-box">
              <span className="year">
                {cer.yearStart?.slice(0, 4)} - {cer.yearEnd?.slice(0, 4)}
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
          <div className="text">{cer.certificateUrl}</div>
          <div className="text">{cer.certificateDescription}</div>
        </div>
      </div>
    ))}
  </div>
);

export default Certificate;
