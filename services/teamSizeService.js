import API_CONFIG from "../config/api.config";
import { teamSizeOptions, teamSizeFormOptions, teamSizeFilterOptions } from "../data/teamSizeOptions";

const teamSizeService = {
  getAllTeamSizes: async () => {
    try {
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.MASTER.TEAM_SIZES), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch team sizes');
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : teamSizeOptions;
    } catch (error) {
      console.error('Error fetching team sizes:', error);
      // Return default options if API fails
      return teamSizeOptions;
    }
  },

  // Get team size options for forms (with "Select" option)
  getTeamSizeOptions: async () => {
    try {
      const teamSizes = await teamSizeService.getAllTeamSizes();
      return teamSizes.map(size => ({
        value: size,
        label: size
      }));
    } catch (error) {
      console.error('Error getting team size options:', error);
      return teamSizeFormOptions;
    }
  },

  // Get team size options for admin filters
  getAdminFilterOptions: async () => {
    try {
      const teamSizes = await teamSizeService.getAllTeamSizes();
      return [
        { label: "All", value: "all" },
        ...teamSizes.map(size => ({
          label: size,
          value: size
        }))
      ];
    } catch (error) {
      console.error('Error getting admin filter options:', error);
      return teamSizeFilterOptions;
    }
  },

  // Get static team size options (for use without API calls)
  getStaticTeamSizeOptions: () => {
    return teamSizeOptions;
  },

  getStaticFormOptions: () => {
    return teamSizeFormOptions;
  },

  getStaticFilterOptions: () => {
    return teamSizeFilterOptions;
  }
};

export default teamSizeService;
