'use client';

import Image from "next/image";
import React, { useState } from "react";
import BecomeRecruiterModal from "@/components/common/form/shared/BecomeRecruiterModal";
import { useRouter } from 'next/navigation';

const CallToAction = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleOpenModal = () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setIsModalOpen(true);
    } else {
      router.push('/login');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <section className="call-to-action">
      <div className="auto-container">
        <div className="outer-box" data-aos="fade-up">
          <div className="content-column">
            <div className="sec-title">
              <h2>Recruiting?</h2>
              <div className="text">
                Advertise your jobs to millions of monthly users and search 15.8
                million
                <br /> CVs in our database.
              </div>
              <button className="theme-btn btn-style-one bg-blue" onClick={handleOpenModal}>
                <span className="btn-title">Start Recruiting Now</span>
              </button>
            </div>
          </div>
          {/* End .content-column */}

          <div
            className="image-column"
            style={{ backgroundImage: " url(/images/resource/image-1.png)" }}
          >
            <figure className="image">
              <Image
                width={417}
                height={328}
                src="/images/resource/image-1.png"
                alt="resource"
              />
            </figure>
          </div>
          {/* End .image-column */}
        </div>
      </div>
      <BecomeRecruiterModal
        open={isModalOpen}
        onCancel={handleCloseModal}
      />
    </section>
  );
};

export default CallToAction;
