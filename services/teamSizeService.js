import API_CONFIG from "../config/api.config";
import { teamSizeOptions, teamSizeFormOptions, teamSizeFilterOptions } from "../data/teamSizeOptions";

/**
 * Team Size Service
 * 
 * This service manages team size data for the application.
 * Currently uses static data from teamSizeOptions.js to avoid 404 errors
 * since the backend API endpoint is not yet implemented.
 * 
 * To enable API fetching when the backend is ready:
 * Set environment variable: NEXT_PUBLIC_ENABLE_TEAM_SIZES_API=true
 */

const teamSizeService = {
  getAllTeamSizes: async () => {
    // Check if team sizes API is enabled via environment variable
    const isTeamSizesApiEnabled = process.env.NEXT_PUBLIC_ENABLE_TEAM_SIZES_API === 'true';
    
    if (!isTeamSizesApiEnabled) {
      // Return default team size options directly to avoid 404 errors
      return teamSizeOptions;
    }
    
    // API is enabled, attempt to fetch from backend
    try {
      const url = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.MASTER_DATA.TEAM_SIZES);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return teamSizeOptions;
      }
      
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      } else {
        return teamSizeOptions;
      }
    } catch (error) {
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
