<template>
    <header class="sticky">
        <MainHeader @toggle-theme="toggleTheme" :loading="loading" />
        <SearchBar
            :regions="regions"
            :hideSearchBar="openDetailsStore.hideSearchBar"
            :loading="loading"
            :clearKeywordSearch="clearKeywordSearch"
            @filtered-countries="filterCountries"
            @scroll-to-previous-country="scrollToCountry"
        />
    </header>

    <div id="smooth-wrapper">
        <div id="smooth-content">
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
        </div>
    </div>

    <ScrollToTopButton :scrolled="scrolled" />
</template>

<script setup>
import {ref, onMounted, watch} from "vue";
import MainHeader from "@/components/MainHeader.vue";
import SearchBar from "@/components/SearchBar.vue";
import CountriesLister from "@/components/CountriesLister.vue";
import ScrollToTopButton from "@/components/ScrollToTopButton.vue";
import LoadingIcon from "@/components/LoadingIcon.vue";
import MainFooter from "@/components/MainFooter.vue";

// Stores
import {useCountryStore} from "@/stores/CountryStore";
import {useOpenCountryDetailsStore} from "@/stores/OpenCountryDetailsStore";

import {gsap} from "gsap";

import {ScrollTrigger} from "gsap/ScrollTrigger";
// ScrollSmoother requires ScrollTrigger
import {ScrollSmoother} from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const openDetailsStore = useOpenCountryDetailsStore();
const countryStore = useCountryStore();
const scrolled = ref(false);
const scrollProgress = ref(0);
const mainHeaderHeight = ref(0);
/** Scroll position when the details drawer was opened; restored when back is clicked */
const scrollPositionBeforeDetails = ref(null);

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
const clearKeywordSearch = ref(false);
const clearFilters = () => {
    filteredCountries.value = null;
    countryStore.setSelectedRegion(null);
    clearKeywordSearch.value = true;
};

// Save scroll position when opening the details drawer so we can restore it on back
watch(
    () => openDetailsStore.openDetails,
    (isOpen) => {
        if (isOpen) {
            const smoother = ScrollSmoother.get();
            scrollPositionBeforeDetails.value = smoother ? smoother.scrollTop() : window.scrollY;
        }
    }
);

const scrollToCountry = () => {
    const saved = scrollPositionBeforeDetails.value;
    scrollPositionBeforeDetails.value = null;

    const restoreOrScrollToElement = () => {
        const smoother = ScrollSmoother.get();
        if (smoother && typeof saved === "number") {
            smoother.scrollTo(saved, true);
        } else if (typeof saved === "number") {
            window.scrollTo({top: saved, behavior: "smooth"});
        }
    };

    setTimeout(() => {
        ScrollTrigger.refresh();
        restoreOrScrollToElement();
    }, 400);
};

onMounted(async () => {
    const header = document.querySelector("header");
    mainHeaderHeight.value = header.querySelector(".main-header").offsetHeight;
    // Update Theme
    if (theme.value !== null) {
        document.documentElement.setAttribute("data-theme", theme.value);
    } else {
        localStorage.setItem("theme", "light");
        document.documentElement.setAttribute("data-theme", "light");
    }

    gsap.to("#smooth-wrapper", {
        paddingTop: `${header.offsetHeight}px`,
    });

    // Get Countries Data (API requires fields param for /all)
    const fields = "name,capital,region,subregion,population,flags,languages,currencies,tld,borders";
    const response = await fetch(`https://restcountries.com/v3.1/all?fields=${fields}`);
    const data = await response.json();

    if (!Array.isArray(data)) {
        console.error("Failed to load countries: expected an array", data);
        loading.value = false;
        return;
    }

    const sortedCountries = data.slice().sort((a, b) => {
        const nameA = (a.name?.common ?? "").toLowerCase();
        const nameB = (b.name?.common ?? "").toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    });

    countries.value = sortedCountries;
    countryStore.setCountries(sortedCountries);

    sortedCountries.forEach((country) => {
        if (country.region) regions.value.push(country.region);
    });
    regions.value = [...new Set(regions.value)];
    regions.value.sort();

    setTimeout(() => {
        loading.value = false;
    }, 400);

    ScrollSmoother.create({
        smooth: 1,
        effects: true,
        smoothTouch: 0.1,
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        onUpdate: (self) => {
            scrollProgress.value = self.progress;
            scrolled.value = self.scrollTop() > 0;
        },
    });
});

let headerTL = gsap.timeline({defaults: {duration: 0.5, ease: "power4.inOut"}});

watch(scrolled, (isScrolled) => {
    if (isScrolled) {
        headerTL
            .to(".main-header", {
                height: "auto",
            })
            .to(
                ".search-bar",
                {
                    padding: "1rem 0",
                },
                "<"
            );
    } else {
        headerTL
            .to(".main-header", {
                height: mainHeaderHeight.value,
            })
            .to(
                ".search-bar",
                {
                    padding: "2rem 0",
                },
                "<"
            );
    }
});
</script>
