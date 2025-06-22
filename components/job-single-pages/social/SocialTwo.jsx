import { useEffect, useState } from "react";

const SocialTwo = () => {
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const socialContent = [
    {
      id: 1,
      name: "Facebook",
      icon: "fa-facebook-f",
      iconClass: "facebook",
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    },
    {
      id: 2,
      name: "Twitter",
      icon: "fa-twitter",
      iconClass: "twitter",
      link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`,
    },
    {
      id: 3,
      name: "LinkedIn",
      icon: "fa-linkedin-in",
      iconClass: "linkedin",
      link: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}`,
    },
  ];

  return (
    <>
      {socialContent.map((item) => (
        <a
          href={item.link}
          className={item.iconClass}
          target="_blank"
          rel="noopener noreferrer"
          key={item.id}
        >
          <i className={`fab ${item.icon}`}></i> {item.name}
        </a>
      ))}
    </>
  );
};

export default SocialTwo;
