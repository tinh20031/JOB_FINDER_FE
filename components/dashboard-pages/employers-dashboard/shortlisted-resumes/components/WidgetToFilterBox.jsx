"use client";
import { useState } from "react";

const WidgetToFilterBox = ({ onSearch, filterTime = "Newest", setFilterTime }) => {
  const [searchValue, setSearchValue] = useState("");
  const handleChange = (e) => {
    setSearchValue(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };
  return (
    <div className="chosen-outer">
      {/* <!--search box--> */}
      <div className="search-box-one">
        <form method="post" action="#" onSubmit={e => e.preventDefault()}>
          <div className="form-group">
            <span className="icon flaticon-search-1"></span>
            <input
              type="search"
              name="search-field"
              placeholder="Search"
              value={searchValue}
              onChange={handleChange}
              required
            />
          </div>
        </form>
      </div>
      {/* End searchBox one */}
      {/* <!--Tabs Box--> */}
      <select className="chosen-single form-select chosen-container" value={filterTime} onChange={e => setFilterTime && setFilterTime(e.target.value)}>
        <option value="Newest">Newest</option>
        <option value="7d">Last 7 Days</option>
        <option value="30d">Last 30 Days</option>
        <option value="3m">Last 3 Months</option>
        <option value="6m">Last 6 Months</option>
        <option value="12m">Last 12 Months</option>
        <option value="3y">Last 3 Years</option>
        <option value="5y">Last 5 Years</option>
      </select>
    </div>
  );
};

export default WidgetToFilterBox;
