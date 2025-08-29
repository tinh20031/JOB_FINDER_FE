// Comprehensive team size options for the application
export const teamSizeOptions = [
  "50 - 100",    // Small companies
  "100 - 150",   // Medium-small companies
  "200 - 250",   // Medium companies
  "300 - 350",   // Medium-large companies
  "500 - 1000", 
  "1000+" // Large companies
];

// Team size options for forms (with value/label structure)
export const teamSizeFormOptions = teamSizeOptions.map(size => ({
  value: size,
  label: size
}));

// Team size options for admin filters (with "All" option)
export const teamSizeFilterOptions = [
  { label: "All", value: "all" },
  ...teamSizeFormOptions
];

// Team size categories for better organization
export const teamSizeCategories = {
  small: "50 - 100",
  mediumSmall: "100 - 150",
  medium: "200 - 250",
  mediumLarge: "300 - 350",
  large: "500 - 1000"
};

// Helper function to get team size category
export const getTeamSizeCategory = (teamSize) => {
  if (!teamSize) return null;
  
  const size = teamSize.toString();
  if (size === "50 - 100") return "small";
  if (size === "100 - 150") return "mediumSmall";
  if (size === "200 - 250") return "medium";
  if (size === "300 - 350") return "mediumLarge";
  if (size === "500 - 1000") return "large";
  
  return null;
};

// Helper function to get display name for team size category
export const getTeamSizeCategoryName = (category) => {
  const categoryNames = {
    small: "Small Company",
    mediumSmall: "Medium-Small Company",
    medium: "Medium Company",
    mediumLarge: "Medium-Large Company",
    large: "Large Company"
  };
  
  return categoryNames[category] || category;
};

export default teamSizeOptions;

