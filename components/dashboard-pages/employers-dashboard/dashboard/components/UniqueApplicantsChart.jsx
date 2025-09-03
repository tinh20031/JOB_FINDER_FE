import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import apiService from "@/services/api.service";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const UniqueApplicantsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiService.get("/application/unique-applicants-by-job");
        if (res && res.success && Array.isArray(res.data)) {
          setData(res.data);
        } else {
          setError(res?.message || "No data");
        }
      } catch (err) {
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading chart...</div>;
  if (error) return <div style={{ color: "red", padding: 24 }}>{error}</div>;
  if (!data.length) return <div style={{ padding: 24 }}>No data available</div>;

  const chartData = {
    labels: data.map((job) => job.title),
    datasets: [
      {
        label: "Unique Applicants",
        data: data.map((job) => job.uniqueApplicants),
        backgroundColor: "#1967d2",
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Unique Applicants by Job",
        font: { size: 18 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} unique applicants`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Job Title" },
        ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 },
      },
      y: {
        title: { display: true, text: "Unique Applicants" },
        beginAtZero: true,
        precision: 0,
      },
    },
  };

  return (
    <div
      style={{
        width: "100%",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        position: "relative",
        overflowX: "auto",
        padding: "32px 0",
        margin: "0 auto"
      }}
    >
      <div style={{ minWidth: 900, minHeight: 400, padding: "0 32px" }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default UniqueApplicantsChart; 