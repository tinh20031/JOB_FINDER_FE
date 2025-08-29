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
import { useRouter, useSearchParams } from 'next/navigation';
import { companyService } from "@/services/companyService";
import { industryService } from "@/services/industryService";
import ClickableBox from "../../common/ClickableBox";

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
  const searchParams = useSearchParams();

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

  // Đọc page và perPage từ query string khi mount
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const perPageParam = searchParams.get('perPage');
    if (perPageParam && !isNaN(Number(perPageParam)) && Number(perPageParam) > 0) {
      dispatch(addPerPage({ start: 0, end: Number(perPageParam) }));
    }
    if (pageParam && !isNaN(Number(pageParam)) && Number(pageParam) > 0) {
      const perPageVal = perPageParam && !isNaN(Number(perPageParam)) && Number(perPageParam) > 0 ? Number(perPageParam) : (perPage.end !== 0 ? perPage.end - perPage.start : 10);
      dispatch(addPerPage({ start: (Number(pageParam) - 1) * perPageVal, end: Number(pageParam) * perPageVal }));
    }
  }, [searchParams]);

  // Khi chuyển trang, cập nhật query string
  const handleSetPage = (page) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('page', page);
    params.set('perPage', perPage.end !== 0 ? perPage.end - perPage.start : 10);
    router.replace(`?${params.toString()}`);
    const perPageVal = perPage.end !== 0 ? perPage.end - perPage.start : 10;
    dispatch(addPerPage({ start: (page - 1) * perPageVal, end: page * perPageVal }));
  };

  // Khi chọn perPage, cập nhật query string và reset về page 1
  const perPageHandler = (e) => {
    const pageData = JSON.parse(e.target.value);
    const perPageVal = pageData.end !== 0 ? pageData.end - pageData.start : 10;
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('perPage', perPageVal);
    params.set('page', 1);
    router.replace(`?${params.toString()}`);
    dispatch(addPerPage({ start: 0, end: perPageVal }));
  };

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

        const result = await companyService.filterCompanies(filterParams);
        
        setCompanies(result.data);
        setTotalCompanies(result.totalCount);

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

  const filteredByKeyword = companies?.filter(keywordFilter);

  const filteredByLocation = filteredByKeyword?.filter(locationFilter);

  const filteredByDestination = filteredByLocation?.filter(destinationFilter);

  const filteredByIndustry = filteredByDestination?.filter(industryFilter);

  const filteredByCompanySize = filteredByIndustry?.filter(companySizeFilter);

  const filteredCompanies = filteredByCompanySize; // Final filtered list

  // Apply frontend pagination after filtering and sorting
   const sortedAndPaginatedCompanies = filteredCompanies
      ?.sort(sortFilter) // Apply sort here
     ?.slice(perPage.start, perPage.end !== 0 ? perPage.end : filteredCompanies?.length); // Simplified slice logic

  // Xử lý click bookmark
  const handleBookmark = async (companyId) => {
    try {
      const token = getToken();
      if (!token) {
        toast.error("Please login to use this feature");
        return;
      }
      const id = Number(companyId);
      if (bookmarkedCompanies.includes(id)) {
        await jobService.unfavoriteCompany(id);
        setBookmarkedCompanies(prev => prev.filter(cid => cid !== id));
        toast.success("Removed from favorites");
      } else {
        await jobService.favoriteCompany(id);
        setBookmarkedCompanies(prev => [...prev, id]);
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error("Error handling bookmark:", error);
      if (error.response?.status === 401) {
        toast.error("Login session expired, please login again");
      } else {
        toast.error("An error occurred while processing favorites");
      }
    }
  };

  // Render danh sách company với nút bookmark
  const content = sortedAndPaginatedCompanies?.map((company) => (
    <ClickableBox
      key={company.userId}
      onClick={() => router.push(`/company-detail/${company.userId}`)}
      className="company-block-three"
      style={{ cursor: 'pointer' }}
    >
      <div className="d-flex align-items-center position-relative">
        <img 
          src={company.urlCompanyLogo} 
          alt={company.companyName} 
          width={50} 
          height={50} 
          style={{
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            objectFit: 'cover',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'block',
          }}
        />
        <div className="ms-3">
          <h4 style={{marginBottom: 12, transition: 'color 0.2s'}} className="company-name-hover">{company.companyName}</h4>
          <div className="d-flex align-items-center" style={{gap: 8}}>
            <span style={{
              background: '#e0edff',
              color: '#2563eb',
              borderRadius: 16,
              padding: '4px 16px',
              fontWeight: 500,
              fontSize: 14,
              marginRight: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span className="icon flaticon-map-locator me-2" style={{marginRight: 6}}></span>
              {company.location}
            </span>
            <span style={{
              background: '#e6f4ea',
              color: '#1dbf73',
              borderRadius: 16,
              padding: '4px 16px',
              fontWeight: 500,
              fontSize: 14,
              marginRight: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span className="icon flaticon-briefcase me-2" style={{marginRight: 6}}></span>
              {industryMap[company.industryId] || `Industry ID: ${company.industryId}`}
            </span>
            <span style={{
              background: '#fff4e6',
              color: '#ffb200',
              borderRadius: 16,
              padding: '4px 16px',
              fontWeight: 500,
              fontSize: 14,
              marginRight: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span className="icon flaticon-user me-2" style={{marginRight: 6}}></span>
              {company.teamSize || 'N/A'}
            </span>
          </div>
        </div>
        <button
          className={`bookmark-btn ${bookmarkedCompanies.includes(Number(company.userId)) ? 'active' : ''}`}
          title="Save company"
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
    </ClickableBox>
  ));

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
           <div className="row">
             {content}
           </div>
         ) : ( // Show no results message
           <div className="text-center py-5">No companies found matching your criteria.</div>
         )
       )}

      {/* <ListingShowing /> */} {/* Keep ListingShowing if it handles pagination buttons based on totalCompanies */}
      {/* <!-- Listing Show More --> */}
      {/* Thêm UI phân trang số trang phía dưới danh sách company */}
      {!loading && !error && filteredCompanies.length > 0 && (
        (() => {
          const perPageVal = perPage.end !== 0 ? perPage.end - perPage.start : 10;
          const totalPages = Math.ceil(filteredCompanies.length / perPageVal);
          const currentPage = perPageVal ? Math.floor(perPage.start / perPageVal) + 1 : 1;
          if (totalPages >= 1) {
            return (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, margin: '24px 0' }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => handleSetPage(currentPage - 1)}
                  style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: currentPage === 1 ? '#ccc' : '#444' }}
                >
                  &#8592;
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handleSetPage(i + 1)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: currentPage === i + 1 ? '#1967d2' : 'none',
                      color: currentPage === i + 1 ? '#fff' : '#444',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: 18,
                      cursor: 'pointer',
                      outline: 'none',
                      boxShadow: 'none',
                      transition: 'background 0.2s, color 0.2s'
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => handleSetPage(currentPage + 1)}
                  style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: currentPage === totalPages || totalPages === 0 ? '#ccc' : '#444' }}
                >
                  &#8594;
                </button>
              </div>
            );
          }
          return null;
        })()
      )}
      <style jsx>{`
        .company-name-hover {
          transition: color 0.2s, font-weight 0.2s;
        }
        .company-name-hover:hover {
          color: #2563eb !important;
          font-weight: 700 !important;
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default FilterTopBox;
