import Image from "next/image";
import Link from "next/link";

const About = () => {
  return (
    <>
      <div className="content-column col-lg-6 col-md-12 col-sm-12 order-2">
        <div className="inner-column " data-aos="fade-left">
          <div className="sec-title">
            <h2>Millions of Jobs. Find the one that suits you.</h2>
            <div className="text">
            Discover jobs tailored just for you with AI-powered matching. Create a standout video profile, build a professional CV, and track your applications—all in one place.
            </div>
          </div>
          <ul className="list-style-one">
            <li>AI matches you with the perfect job!</li>
            <li>Stand out with a video profile.</li>
            <li>Build a professional CV in minutes</li>
            <li>Track applications and schedule interviews</li>
          </ul>
          <Link href="/register" className="theme-btn btn-style-one bg-blue">
            <span className="btn-title">Get Started</span>
          </Link>
        </div>
      </div>
      {/* End .col about left content */}

      <div className="image-column col-lg-6 col-md-12 col-sm-12">
        <figure className="image" data-aos="fade-right">
          <Image
            width={600}
            height={600}
            src="/images/resource/bannerHome.png"
            alt="about"
          />
        </figure>

        {/* <!-- Count Employers --> */}
        <div className="count-employers " data-aos="flip-right">
          <div className="check-box">
            <span className="flaticon-tick"></span>
          </div>
          <span className="title">Employers</span>
          <figure className="image">
            <Image
              width={100}
              height={61}
              src="/images/resource/multi-logo.png"
              alt="resource"
              className="w-full h-auto"
            />
          </figure>
        </div>
      </div>
      {/* <!-- Image Column --> */}
    </>
  );
};

export default About;
