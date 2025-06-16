'use client';

import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import BecomeRecruiterModal from "@/components/common/form/shared/BecomeRecruiterModal";

const CallToActions = () => {
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
    <div className="call-to-action-four ">
      <h5>Recruiting?</h5>
      <p>
        Advertise your jobs to millions of monthly users and search 15.8 million
        CVs in our database.
      </p>
      <button className="theme-btn btn-style-one bg-blue" onClick={handleOpenModal}>
        <span className="btn-title">Start Recruiting Now</span>
      </button>
      <div
        className="image"
        style={{ backgroundImage: "url(/images/resource/ads-bg-4.png)" }}
      ></div>
      <BecomeRecruiterModal
        open={isModalOpen}
        onCancel={handleCloseModal}
      />
    </div>
  );
};

export default CallToActions;
