import GalleryBox from "./GalleryBox";

const JobDetailsDescriptions = ({ description }) => {
  return (
    <div className="job-detail">
      <h4>About Company</h4>
      <div
        dangerouslySetInnerHTML={{
          __html: description || `Moody's Corporation, often referred to as Moody's, is an American
        business and financial services company. It is the holding company for
        Moody's Investors Service (MIS), an American credit rating agency, and
        Moody's Analytics (MA), an American provider of financial analysis
        software and services.`,
        }}
      ></div>
      <div className="row images-outer">
        <GalleryBox />
      </div>
    </div>
  );
};

export default JobDetailsDescriptions;