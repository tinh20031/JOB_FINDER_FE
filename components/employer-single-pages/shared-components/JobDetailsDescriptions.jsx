import GalleryBox from "./GalleryBox";

const JobDetailsDescriptions = ({ description }) => {
  return (
    <div className="job-detail">
      <h4>About Company</h4>
      {description ? (
        <div
          dangerouslySetInnerHTML={{ __html: description }}
        ></div>
      ) : (
        <div><i>No description available for this job.</i></div>
      )}
      {/* <div className="row images-outer">
        <GalleryBox />
      </div> */}
    </div>
  );
};

export default JobDetailsDescriptions;