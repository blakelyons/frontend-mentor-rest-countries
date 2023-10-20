<template>
    <header :class="scrolled ? `sticky` : ``">
        <MainHeader @toggle-theme="toggleTheme" :loading="loading" />
        <SearchBar
            :regions="regions"
            :hideSearchBar="openDetailsStore.hideSearchBar"
            :loading="loading"
            @filtered-countries="filterCountries"
            @scroll-to-previous-country="scrollToCountry"
        />
    </header>

    <LoadingIcon :loading="loading" v-if="loading" />

    <CountriesLister
        :countries="countries"
        :filteredCountries="filteredCountries"
        :loadedAll="loading"
        :loadingFilteredResults="loadingFilteredResults"
        :scrolled="scrolled"
        @clear-filters="clearFilters"
        v-else
    />

    <MainFooter :loading="loading" :loadingFilteredResults="loadingFilteredResults" :countryDetailOpen="!openDetailsStore.openDetails" />

    <ScrollToTopButton :scrolled="scrolled" />
</template>

<script setup>
import {ref, onMounted} from "vue";
import MainHeader from "@/components/MainHeader.vue";
import SearchBar from "@/components/SearchBar.vue";
import CountriesLister from "@/components/CountriesLister.vue";
import ScrollToTopButton from "@/components/ScrollToTopButton.vue";
import LoadingIcon from "@/components/LoadingIcon.vue";
import MainFooter from "@/components/MainFooter.vue";

// Stores
import {useCountryStore} from "@/stores/CountryStore";
import {useOpenCountryDetailsStore} from "@/stores/OpenCountryDetailsStore";

const openDetailsStore = useOpenCountryDetailsStore();
const countryStore = useCountryStore();
const scrolled = ref(false);

// Data
const loading = ref(true);
const countries = ref([]);
const filteredCountries = ref(null);
const regions = ref([]);
const theme = ref(localStorage.getItem("theme"));

const toggleTheme = (mode) => {
    localStorage.setItem("theme", mode);
    document.documentElement.setAttribute("data-theme", mode);
};

const loadingFilteredResults = ref(false);
const filterCountries = (obj) => {
    loadingFilteredResults.value = true;
    filteredCountries.value = obj;
    setTimeout(() => {
        loadingFilteredResults.value = false;
    }, 1000);
};

// Clearing Region and Keyword Search
const clearFilters = () => {
    console.log("Clear Filters");
    filteredCountries.value = null;
    countryStore.setSelectedRegion(null);
};

const scrollToCountry = (country) => {
    const el = document.getElementById(country.replace(/\s/g, ""));

    if (el && loadingFilteredResults.value) {
        const yOffset = el.getBoundingClientRect().top - window.innerHeight / 2 + el.clientHeight / 2;

        window.scrollTo({
            top: window.pageYOffset + yOffset,
            behavior: "smooth",
        });
    }
};

onMounted(async () => {
    // Update Theme
    if (theme.value !== null) {
        document.documentElement.setAttribute("data-theme", theme.value);
    } else {
        localStorage.setItem("theme", "light");
        document.documentElement.setAttribute("data-theme", "light");
    }

    // Get Countries Data
    await fetch("https://restcountries.com/v3.1/all")
        .then((response) => response.json())
        .then((data) => {
            countries.value = data;
            const sortedCountries = countries.value.slice().sort((a, b) => {
                const nameA = a.name.common.toLowerCase();
                const nameB = b.name.common.toLowerCase();

                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return 0;
            });

            countries.value = sortedCountries;

            //console.table(countries.value);

            countryStore.setCountries(sortedCountries);
        })
        .then(() => {
            setTimeout(() => {
                loading.value = false;
            }, 400);
        })
        .catch((error) => {
            console.error("Error:", error);
        });

    countries.value.forEach((country) => {
        // Push Regions
        regions.value.push(country.region);
    });

    // Remove Duplicates
    regions.value = [...new Set(regions.value)];

    // Sort Countries & Regions Alphabetically

    regions.value.sort();

    // Check if the Window has scrolled more than the height of the <header> then add .sticky class
    window.addEventListener("scroll", () => {
        scrolled.value = window.scrollY > 0;
    });
});
</script>
