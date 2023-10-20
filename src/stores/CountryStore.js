import {ref, computed} from "vue";
import {defineStore} from "pinia";

export const useCountryStore = defineStore("countryStore", () => {
    // Countries Data
    const countries = ref([]);
    const setCountries = (newValue) => {
        countries.value = newValue;
    };
    const getCountries = computed(() => {
        return countries.value;
    });

    // Selected Country
    const selectedCountry = ref("");
    const setSelectedCountry = (country) => {
        selectedCountry.value = country;
    };
    const getSelectedCountry = computed(() => {
        return selectedCountry.value;
    });

    // Selected Region
    const selectedRegion = ref(null);
    const setSelectedRegion = (region) => {
        selectedRegion.value = region;
    };
    const getSelectedRegion = computed(() => {
        return selectedRegion.value;
    });

    // Keyword Search Value
    const keywordSearch = ref("");
    const setKeywordSearch = (keyword) => {
        keywordSearch.value = keyword;
    };
    const getKeywordSearch = computed(() => {
        return keywordSearch.value;
    });

    return {
        countries,
        setCountries,
        getCountries,
        selectedCountry,
        setSelectedCountry,
        getSelectedCountry,
        selectedRegion,
        setSelectedRegion,
        getSelectedRegion,
        keywordSearch,
        setKeywordSearch,
        getKeywordSearch,
    };
});
