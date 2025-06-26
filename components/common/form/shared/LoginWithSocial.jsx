import { authService } from "@/services/authService";

const LoginWithSocial = () => {
  return (
    <div className="btn-box row justify-content-center">
      <div className="col-lg-6 col-md-8 d-flex justify-content-center">
        <a
          href={authService.getGoogleLoginUrl()}
          className="theme-btn social-btn-two google-btn"
        >
          <i className="fab fa-google"></i> Log In via Gmail
        </a>
      </div>
      <style jsx>{`
        .btn-box {
          margin-top: 16px;
        }
        .google-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 320px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
};

export default LoginWithSocial;
