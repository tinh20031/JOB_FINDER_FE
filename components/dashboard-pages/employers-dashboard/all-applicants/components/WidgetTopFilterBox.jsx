const WidgetTopFilterBox = ({ candidateName, onCandidateNameChange }) => {
  return (
    <>
      <div className="chosen-outer" style={{ display: 'flex', gap: 12 }}>
        <input
          type="text"
          className="chosen-single form-select chosen-container"
          placeholder="Enter Candidate name..."
          value={candidateName}
          onChange={e => onCandidateNameChange(e.target.value)}
          style={{ minWidth: 220, background: '#f5f8fa', border: '1px solid #e5e9ec', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', height: 48, boxShadow: 'none', outline: 'none', color: '#6f6f6f', fontWeight: 400, paddingLeft: 16, width: '100%' }}
        />
        {/* <select className="chosen-single form-select chosen-container">
          <option>Select Jobs</option>
          <option>Last 12 Months</option>
          <option>Last 16 Months</option>
          <option>Last 24 Months</option>
          <option>Last 5 year</option>
        </select> */}
        {/* <!--Tabs Box--> */}

        {/* <select className="chosen-single form-select chosen-container">
          <option>All Status</option>
          <option>Last 12 Months</option>
          <option>Last 16 Months</option>
          <option>Last 24 Months</option>
          <option>Last 5 year</option>
        </select> */}
        {/* <!--Tabs Box--> */}
      </div>
      <style jsx global>{`
        .chosen-single.form-select.chosen-container,
        .chosen-single.form-select.chosen-container input[type="text"] {
          font-size: 14px;
          color: #6f6f6f;
          font-weight: 400;
          font-family: inherit;
        }
        .chosen-single.form-select.chosen-container input[type="text"]:focus,
        .chosen-single.form-select.chosen-container input[type="text"]:active {
          box-shadow: none;
          outline: none;
          border: none;
          text-decoration: none;
        }
      `}</style>
    </>
  );
};

export default WidgetTopFilterBox;
