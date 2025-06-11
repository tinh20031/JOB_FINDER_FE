'use client'

import { useState, useEffect } from 'react';
import ApiService from '../../../../../services/api.service';
import API_CONFIG from '../../../../../config/api.config';

const TopCardBlock = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmployers: 0,
    activeJobs: 0,
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

        // Fetch jobs data
        const jobsData = await ApiService.get('/' + API_CONFIG.ENDPOINTS.JOB.BASE);
        
        // Count active jobs
        const activeJobs = jobsData.filter(job => job.status === 'Active').length;

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
      <div className="col-xl-3 col-md-6 col-sm-12">
        <div className="ls-widget">
          <div className="tabs-box">
            <div className="widget-title">
              <h4>Candidate Accounts</h4>
            </div>
            <div className="widget-content">
              <div className="number">{stats.totalUsers}</div>
              <div className="text">Total Candidates</div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-xl-3 col-md-6 col-sm-12">
        <div className="ls-widget">
          <div className="tabs-box">
            <div className="widget-title">
              <h4>Company Accounts</h4>
            </div>
            <div className="widget-content">
              <div className="number">{stats.totalEmployers}</div>
              <div className="text">Total Companies</div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-xl-3 col-md-6 col-sm-12">
        <div className="ls-widget">
          <div className="tabs-box">
            <div className="widget-title">
              <h4>Active Jobs</h4>
            </div>
            <div className="widget-content">
              <div className="number">{stats.activeJobs}</div>
              <div className="text">Currently Active</div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-xl-3 col-md-6 col-sm-12">
        <div className="ls-widget">
          <div className="tabs-box">
            <div className="widget-title">
              <h4>Applications</h4>
            </div>
            <div className="widget-content">
              <div className="row">
                <div className="col-4">
                  <div className="number">{stats.applications.submitted}</div>
                  <div className="text">Submitted</div>
                </div>
                <div className="col-4">
                  <div className="number">{stats.applications.processing}</div>
                  <div className="text">Processing</div>
                </div>
                <div className="col-4">
                  <div className="number">{stats.applications.interviewing}</div>
                  <div className="text">Interviewing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopCardBlock; 