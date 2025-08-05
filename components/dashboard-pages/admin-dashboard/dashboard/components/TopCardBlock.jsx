'use client'

import { useState, useEffect } from 'react';
import ApiService from '../../../../../services/api.service';
import API_CONFIG from '../../../../../config/api.config';
import jobService from '../../../../../services/jobService';

const TopCardBlock = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmployers: 0,
    activeJobs: 0,
    totalJobs: 0, // Add total jobs
    applications: {
      submitted: 0,
      processing: 0,
      interviewing: 0
    }
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch users data
        const usersData = await ApiService.get('/' + API_CONFIG.ENDPOINTS.USER.BASE);
        
        // Count users by role
        const totalUsers = usersData.filter(user => user.role === 'Candidate').length;
        const totalEmployers = usersData.filter(user => user.role === 'Company').length;

        // Fetch jobs data for admin
        const { data: jobsData, total: totalJobs } = await jobService.getJobs({ role: 'admin', limit: 10000 });
        // Count active jobs (handle both number and string status)
        const activeJobs = jobsData.filter(job => (job.status === 2 || String(job.status).toLowerCase() === 'active') && !job.deactivatedByAdmin && job.status !== 4).length;

        // Count applications by status
        const applications = {
          submitted: jobsData.reduce((acc, job) => acc + (job.applications?.filter(app => app.status === 'Submitted').length || 0), 0),
          processing: jobsData.reduce((acc, job) => acc + (job.applications?.filter(app => app.status === 'Processing').length || 0), 0),
          interviewing: jobsData.reduce((acc, job) => acc + (job.applications?.filter(app => app.status === 'Interviewing').length || 0), 0)
        };

        setStats({
          totalUsers,
          totalEmployers,
          activeJobs,
          totalJobs, // Set total jobs from service
          applications
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12">
        <div className="ui-item ui-blue">
          <div className="left">
            <i className="icon flaticon-briefcase"></i>
          </div>
          <div className="right">
            <h4>{stats.totalJobs}</h4>
            <p>Posted Jobs</p>
          </div>
        </div>
      </div>
      <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12">
        <div className="ui-item ui-red">
          <div className="left">
            <i className="icon la la-bolt"></i>
          </div>
          <div className="right">
            <h4>{stats.activeJobs}</h4>
            <p>Active Jobs</p>
          </div>
        </div>
      </div>
      <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12">
        <div className="ui-item ui-yellow">
          <div className="left">
            <i className="icon la la-users"></i>
          </div>
          <div className="right">
            <h4>{stats.totalUsers}</h4>
            <p>Candidate Accounts</p>
          </div>
        </div>
      </div>
      <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12">
        <div className="ui-item ui-green">
          <div className="left">
            <i className="icon la la-building"></i>
          </div>
          <div className="right">
            <h4>{stats.totalEmployers}</h4>
            <p>Company Accounts</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopCardBlock; 