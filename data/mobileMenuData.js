module.exports = [
  {
    id: 1,
    label: "Home",
    routePath: "/",
  },
  {
    id: 2,
    label: "Job List",
    routePath: "/job-list-v1",
  },
  {
    id: 4,
    label: "Employers List",
    routePath: "/employers-list-v1",
  },
  {
    id: 11,
    label: "Dashboard",
    items: [
      {
        name: "Employers Dashboard",
        routePath: "/employers-dashboard/dashboard",
      },
      {
        name: "Candidates Dashboard",
        routePath: "/candidates-dashboard/dashboard",
      },
    ],
  },
];
