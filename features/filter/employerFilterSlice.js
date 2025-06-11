import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    keyword: "",
    location: "",
    destination: {
        min: 0,
        max: 100,
    },
    industry: "",
    companySize: "",
    foundationDate: {
        min: 1900,
        max: 2028,
    },
    sort: "",
    perPage: {
        start: 0,
        end: 0,
    },
};

export const employerFilterSlice = createSlice({
    name: "employer-filter",
    initialState,
    reducers: {
        addKeyword: (state, { payload }) => {
            state.keyword = payload;
        },
        addLocation: (state, { payload }) => {
            state.location = payload;
        },
        addDestination: (state, { payload }) => {
            state.destination.min = payload.min;
            state.destination.max = payload.max;
        },
        addIndustry: (state, { payload }) => {
            state.industry = payload;
        },
        addCompanySize: (state, { payload }) => {
            state.companySize = payload;
        },
        addFoundationDate: (state, { payload }) => {
            state.foundationDate.min = payload.min;
            state.foundationDate.max = payload.max;
        },
        addSort: (state, { payload }) => {
            state.sort = payload;
        },
        addPerPage: (state, { payload }) => {
            state.perPage.start = payload.start;
            state.perPage.end = payload.end;
        },
    },
});

export const {
    addKeyword,
    addLocation,
    addDestination,
    addIndustry,
    addCompanySize,
    addFoundationDate,
    addSort,
    addPerPage,
} = employerFilterSlice.actions;
export default employerFilterSlice.reducer;
