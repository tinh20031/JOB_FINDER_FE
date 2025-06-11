'use client'
import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import ApiService from '../../../../../services/api.service';
import API_CONFIG from '../../../../../config/api.config';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ProfileChart = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        // Fetch users data
        const usersData = await ApiService.get('/' + API_CONFIG.ENDPOINTS.USER.BASE);
        
        // Fetch jobs data
        const jobsData = await ApiService.get('/' + API_CONFIG.ENDPOINTS.JOB.BASE);

        // Process data based on time range
        const now = new Date();
        let labels = [];
        let applications = [];
        let jobs = [];
        let users = [];

        if (timeRange === 'day') {
          // Last 24 hours in 4-hour intervals
          labels = Array.from({length: 6}, (_, i) => {
            const d = new Date(now);
            d.setHours(d.getHours() - (24 - i * 4));
            return d.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false });
          });

          // Count data for each interval
          applications = labels.map(label => {
            const time = parseInt(label);
            return jobsData.reduce((acc, job) => 
              acc + (job.applications?.filter(app => {
                const appTime = new Date(app.createdAt).getHours();
                return appTime >= time && appTime < time + 4;
              }).length || 0), 0);
          });

          jobs = labels.map(label => {
            const time = parseInt(label);
            return jobsData.filter(job => {
              const jobTime = new Date(job.createdAt).getHours();
              return jobTime >= time && jobTime < time + 4;
            }).length;
          });

          users = labels.map(label => {
            const time = parseInt(label);
            return usersData.filter(user => {
              const userTime = new Date(user.createdAt).getHours();
              return userTime >= time && userTime < time + 4;
            }).length;
          });
        } else if (timeRange === 'week') {
          // Last 7 days
          labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          
          applications = labels.map((_, index) => {
            const day = new Date(now);
            day.setDate(day.getDate() - (6 - index));
            return jobsData.reduce((acc, job) => 
              acc + (job.applications?.filter(app => {
                const appDate = new Date(app.createdAt);
                return appDate.toDateString() === day.toDateString();
              }).length || 0), 0);
          });

          jobs = labels.map((_, index) => {
            const day = new Date(now);
            day.setDate(day.getDate() - (6 - index));
            return jobsData.filter(job => {
              const jobDate = new Date(job.createdAt);
              return jobDate.toDateString() === day.toDateString();
            }).length;
          });

          users = labels.map((_, index) => {
            const day = new Date(now);
            day.setDate(day.getDate() - (6 - index));
            return usersData.filter(user => {
              const userDate = new Date(user.createdAt);
              return userDate.toDateString() === day.toDateString();
            }).length;
          });
        } else {
          // Last 4 weeks
          labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
          
          applications = labels.map((_, index) => {
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - (28 - index * 7));
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);
            
            return jobsData.reduce((acc, job) => 
              acc + (job.applications?.filter(app => {
                const appDate = new Date(app.createdAt);
                return appDate >= weekStart && appDate < weekEnd;
              }).length || 0), 0);
          });

          jobs = labels.map((_, index) => {
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - (28 - index * 7));
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);
            
            return jobsData.filter(job => {
              const jobDate = new Date(job.createdAt);
              return jobDate >= weekStart && jobDate < weekEnd;
            }).length;
          });

          users = labels.map((_, index) => {
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - (28 - index * 7));
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);
            
            return usersData.filter(user => {
              const userDate = new Date(user.createdAt);
              return userDate >= weekStart && userDate < weekEnd;
            }).length;
          });
        }

        setChartData({
          labels,
          datasets: [
            {
              label: 'Applications',
              data: applications,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            },
            {
              label: 'New Jobs',
              data: jobs,
              borderColor: 'rgb(255, 99, 132)',
              tension: 0.1
            },
            {
              label: 'New Users',
              data: users,
              borderColor: 'rgb(54, 162, 235)',
              tension: 0.1
            }
          ]
        });
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchChartData();
  }, [timeRange]);

  return (
    <div className="widget-content">
      <div className="tabs-box">
        <div className="widget-title">
          <h4>Statistics</h4>
          <div className="chosen-outer">
            <select 
              className="chosen-select"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
        <div className="widget-content">
          <div className="chart-outer">
            <Line 
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileChart; 