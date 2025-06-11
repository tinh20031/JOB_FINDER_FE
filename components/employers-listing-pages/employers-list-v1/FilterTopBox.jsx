'use client'

import Link from "next/link";
import ListingShowing from "../components/ListingShowing";
import { useDispatch, useSelector } from "react-redux";
import {
  addIndustry,
  addDestination,
  addFoundationDate,
  addKeyword,
  addLocation,
  addPerPage,
  addSort,
  addCompanySize,
} from "../../../features/filter/employerFilterSlice";
import Image from "next/image";
import { useState, useEffect } from "react";
import { jobService } from "../../../services/jobService";
import { toast } from "react-toastify";
import Cookies from 'js-cookie';
import { useRouter } from "next/navigation";
import { companyService } from "@/services/companyService";
import { industryService } from "@/services/industryService";

const FilterTopBox = () => {
  const {
    keyword,
    location,
    destination,
    industry,
    foundationDate,
    sort,
    perPage,
    companySize,
  } = useSelector((state) => state.employerFilter) || {};
  const dispatch = useDispatch();
  const router = useRouter();

  // Add state for fetched companies, loading, and error
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCompanies, setTotalCompanies] = useState(0); // Add state for total count if API returns it
  const [industries, setIndustries] = useState([]); // State to fetch industries for mapping
  const [bookmarkedCompanies, setBookmarkedCompanies] = useState([]);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);

  // Fetch industries on component mount
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const data = await industryService.getAll();
        setIndustries(data);
      } catch (err) {
        console.error("Error fetching industries:", err);
        setError(err.message || "Failed to fetch industries");
      }
    };
    fetchIndustries();
  }, []);

  // Fetch companies based on filters and pagination
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);

        let currentLimit = 10;
        let currentPage = 1;

        if (perPage.end !== 0) {
          currentLimit = perPage.end - perPage.start;
          currentPage = Math.floor(perPage.start / currentLimit) + 1;
        } else {
          currentLimit = totalCompanies || 20;
        }

        const filterParams = {
          keyword,
          location,
          industry,
          companySize,
          page: currentPage,
          limit: currentLimit
        };

        console.log('Fetching companies with params:', filterParams);
        const result = await companyService.filterCompanies(filterParams);
        
        setCompanies(result.data);
        setTotalCompanies(result.totalCount);
        
        console.log('Companies fetched:', result.data);
        console.log('Total companies:', result.totalCount);

      } catch (err) {
        console.error("Error fetching companies:", err);
        setError(err.message || 'Failed to fetch companies');
        setCompanies([]);
        setTotalCompanies(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [keyword, location, industry, companySize, perPage, totalCompanies]);

  // Lấy token helper
  const getToken = () => {
    let token = localStorage.getItem('token');
    if (!token) {
      token = Cookies.get('token');
    }
    return token;
  };

  // Lấy danh sách company đã bookmark khi load trang
  useEffect(() => {
    const fetchFavoriteCompanies = async () => {
      try {
        setIsLoadingBookmarks(true);
        const token = getToken();
        if (!token) return; // Không gọi API nếu chưa đăng nhập
        const favorites = await jobService.getFavoriteCompanies();
        setBookmarkedCompanies(favorites.map(company => Number(company.userId)));
      } catch (error) {
        console.error("Error fetching favorite companies:", error);
      } finally {
        setIsLoadingBookmarks(false);
      }
    };
    fetchFavoriteCompanies();
  }, []);

  const industryMap = industries.reduce((acc, industry) => {
    acc[industry.industryId] = industry.industryName;
    return acc;
  }, {});

  // keyword filter
  const keywordFilter = (item) =>
    keyword !== ""
      ? item?.companyName?.toLowerCase().includes(keyword?.toLowerCase()) && item // Filter on companyName from API
      : item;

  // location filter (keeping frontend filter for now if API filter is not enough)
  const locationFilter = (item) =>
    location !== ""
      ? item?.location?.toLowerCase().includes(location?.toLowerCase())
      : item;

  // destination filter (keeping frontend filter for now)
  const destinationFilter = (item) =>
    destination?.min === 0 && destination?.max === 100 ? true : // Check default range
    (item?.destination?.min >= destination?.min && // Assuming API returns destination range
    item?.destination?.max <= destination?.max);

  // industry filter (keeping frontend filter for now, mapping industryId)
  const industryFilter = (item) =>
    industry !== ""
      ? item?.industryId == industry // Compare industryId (number/string) with industry filter value
      : item;

  // company size filter (frontend filter)
  const companySizeFilter = (item) => {
    if (!companySize || companySize === "") return true; // No filter applied
    
    // Compare exact string match since we're using predefined ranges
    return item?.teamSize === companySize;
  };

  // foundation date filter (keeping frontend filter for now)
  const foundationDataFilter = (item) => {
      // Need to get foundation year from API data. Assuming an 'foundationYear' field.
      // For now, applying filter on placeholder/example data structure field `foundationDate`
       const itemFoundationYear = item?.foundationYear; // Assuming API provides this field
       return foundationDate?.min <= itemFoundationYear && itemFoundationYear <= foundationDate?.max;
  };

  // sort filter (keeping frontend filter for now)
  const sortFilter = (a, b) => {
      // Assuming sorting by company name or another relevant field
      if (sort === "asc") {
          return a.companyName?.localeCompare(b.companyName);
      } else if (sort === "des") {
          return b.companyName?.localeCompare(a.companyName);
      }
      return 0; // Default no sort
  };

  // Apply frontend filters to the fetched data if API doesn't handle them fully
  console.log('Companies before frontend filters:', companies); // Log before filters

  const filteredByKeyword = companies?.filter(keywordFilter);
  console.log('After keywordFilter:', filteredByKeyword?.length, filteredByKeyword);

  const filteredByLocation = filteredByKeyword?.filter(locationFilter);
  console.log('After locationFilter:', filteredByLocation?.length, filteredByLocation);

  const filteredByDestination = filteredByLocation?.filter(destinationFilter);
  console.log('After destinationFilter:', filteredByDestination?.length, filteredByDestination);

  const filteredByIndustry = filteredByDestination?.filter(industryFilter);
  console.log('After industryFilter:', filteredByIndustry?.length, filteredByIndustry);

  const filteredByCompanySize = filteredByIndustry?.filter(companySizeFilter);
  console.log('After companySizeFilter:', filteredByCompanySize?.length, filteredByCompanySize);

  const filteredCompanies = filteredByCompanySize; // Final filtered list

  // Apply frontend pagination after filtering and sorting
   const sortedAndPaginatedCompanies = filteredCompanies
      ?.sort(sortFilter) // Apply sort here
     ?.slice(perPage.start, perPage.end !== 0 ? perPage.end : filteredCompanies?.length); // Simplified slice logic

  console.log('After sort and slice (paginated):', sortedAndPaginatedCompanies); // Log after sort/slice

  // Xử lý click bookmark
  const handleBookmark = async (companyId) => {
    try {
      const token = getToken();
      if (!token) {
        toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
        return;
      }
      const id = Number(companyId);
      if (bookmarkedCompanies.includes(id)) {
        await jobService.unfavoriteCompany(id);
        setBookmarkedCompanies(prev => prev.filter(cid => cid !== id));
        toast.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        await jobService.favoriteCompany(id);
        setBookmarkedCompanies(prev => [...prev, id]);
        toast.success("Đã thêm vào danh sách yêu thích");
      }
    } catch (error) {
      console.error("Error handling bookmark:", error);
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      } else {
        toast.error("Có lỗi xảy ra khi xử lý yêu thích");
      }
    }
  };

  // Render danh sách company với nút bookmark
  const content = sortedAndPaginatedCompanies?.map((company) => (
    <div
      className="company-block-three"
      key={company.userId}
      style={{ cursor: 'pointer' }}
      onClick={() => router.push(`/employers-single-v1/${company.userId}`)}
    >
      <div className="inner-box position-relative d-flex align-items-center">
        <img src={company.urlCompanyLogo} alt={company.companyName} width={50} height={50} />
        <div className="ms-3">
          <h4>{company.companyName}</h4>
          <div className="d-flex align-items-center gap-3">
            <span className="icon flaticon-map-locator me-2"></span>
            <span>{company.location}</span>
            <span className="icon flaticon-briefcase me-2"></span>
            <span>{industryMap[company.industryId] || `Industry ID: ${company.industryId}`}</span>
            <span className="icon flaticon-user me-2"></span>
            <span>{company.teamSize || 'N/A'}</span>
          </div>
        </div>
        <button
          className={`bookmark-btn ${bookmarkedCompanies.includes(Number(company.userId)) ? 'active' : ''}`}
          title="Lưu công ty"
          onClick={e => {
            e.stopPropagation();
            handleBookmark(company.userId);
          }}
          disabled={isLoadingBookmarks}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: bookmarkedCompanies.includes(Number(company.userId)) ? '#ffc107' : '#666',
            fontSize: 20,
            marginLeft: 16,
            opacity: 1,
            visibility: 'visible',
          }}
        >
          <span className="flaticon-bookmark"></span>
        </button>
      </div>
    </div>
  ));

  // per page handler
  const perPageHandler = (e) => {
    const pageData = JSON.parse(e.target.value);
    dispatch(addPerPage(pageData));
  };

  // sort handler
  const sortHandler = (e) => {
    dispatch(addSort(e.target.value));
  };

  // clear handler
  const clearAll = () => {
    dispatch(addKeyword(""));
    dispatch(addLocation(""));
    dispatch(addDestination({ min: 0, max: 100 }));
    dispatch(addIndustry(""));
    dispatch(addSort(""));
    dispatch(addPerPage({ start: 0, end: 0 }));
    dispatch(addCompanySize(""));
  };

  return (
    <>
      <div className="ls-switcher">
        <div className="showing-result">
          <div className="text">
            <strong>{filteredCompanies?.length || 0}</strong> companies {/* Use filteredCompanies length before pagination for display */}
            {totalCompanies > 0 && ` of ${totalCompanies}`} {/* Show total if available */}
          </div>
        </div>
        {/* End showing-result */}

        <div className="sort-by">
          {keyword !== "" ||
          location !== "" ||
          destination.min !== 0 ||
          destination.max !== 100 ||
          industry !== "" ||
          foundationDate.min !== 1900 ||
          foundationDate.max !== 2028 ||
          sort !== "" ||
          perPage.start !== 0 ||
          perPage.end !== 0 ||
          companySize !== "" ? (
            <button
              onClick={clearAll}
              className="btn btn-danger text-nowrap me-2"
              style={{
                minHeight: "45px",
                marginBottom: "15px",
              }}
            >
              Clear All
            </button>
          ) : undefined}

          <select
            value={sort}
            className="chosen-single form-select"
            onChange={sortHandler}
          >
            <option value="">Sort by (default)</option>
            <option value="asc">Newest</option>
            <option value="des">Oldest</option>
          </select>
          {/* End select */}

          <select
            onChange={perPageHandler}
            className="chosen-single form-select ms-3 "
            value={JSON.stringify(perPage)}
          >
            <option
              value={JSON.stringify({
                start: 0,
                end: 0,
              })}
            >
              All
            </option>
            <option
              value={JSON.stringify({
                start: 0,
                end: 10,
              })}
            >
              10 per page
            </option>
            <option
              value={JSON.stringify({
                start: 0,
                end: 20,
              })}
            >
              20 per page
            </option>
            <option
              value={JSON.stringify({
                start: 0,
                end: 24,
              })}
            >
              24 per page
            </option>
          </select>
          {/* End select */}
        </div>
    </div>
      {/* End top filter bar box */}

      {loading ? ( // Show loading message
         <div className="text-center py-5">Loading companies...</div>
       ) : error ? ( // Show error message
         <div className="text-center py-5 text-danger">{error}</div>
       ) : ( // If not loading and no error, check if companies exist
         sortedAndPaginatedCompanies?.length > 0 ? ( // Show content if companies found after filtering/pagination
           content
         ) : ( // Show no results message
           <div className="text-center py-5">No companies found matching your criteria.</div>
         )
       )}

      {/* <ListingShowing /> */} {/* Keep ListingShowing if it handles pagination buttons based on totalCompanies */}
      {/* <!-- Listing Show More --> */}
    </>
  );
};

export default FilterTopBox;
