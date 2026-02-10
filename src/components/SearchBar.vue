<template>
    <section class="search-bar">
        <div class="container grid col-2" v-show="!loading">
            <Transition :css="false" @before-enter="onSlideBeforeEnter" @enter="onSlideEnter" @leave="onSlideLeave">
                <div class="keyword-search flex flex--row flex--nowrap flex--align-center flex--justify-start" v-if="!props.hideSearchBar">
                    <a href="#" @click="keywordSearchHandler"><i class="icon icon-search material-symbols-outlined"> search </i></a>
                    <input
                        type="text"
                        placeholder="Search for a country..."
                        id="keyword-search"
                        name="keyword-search"
                        aria-label="Keyword Search"
                        ref="keywordSearchInput"
                        v-model="keywordSearch"
                        @keyup="keywordSearchHandler"
                    />
                    <TooltipHelpButton>Search by Country Name, Region, Capital, or Language</TooltipHelpButton>
                </div>
            </Transition>

            <Transition name="fade" :duration="500">
                <div class="container back-button-container" v-if="props.hideSearchBar">
                    <button class="button button--has-icon" @click="goBack">
                        <i class="icon icon--left icon-arrow-left material-symbols-outlined"> arrow_back </i>
                        <span>Back</span>
                    </button>
                </div>
            </Transition>

            <Transition :css="false" @before-enter="onSlideBeforeEnter" @enter="onSlideEnter" @leave="onSlideLeave">
                <div class="region-filter flex flex--row flex--nowrap flex--align-center flex--justify-end" v-if="!props.hideSearchBar">
                    <nav class="select-dropdown">
                        <div class="select" @click="dropdownHandler">
                            <TransitionGroup name="fade">
                                <template v-if="!loadingRegions">
                                    <span class="selected-value">{{
                                        countryStore.selectedRegion === null ? `Filter by Region` : countryStore.selectedRegion
                                    }}</span>
                                    <i :class="`icon icon-arrow-down material-symbols-outlined ${dropdownOpen ? `icon-arrow-down--rotate` : ``}`">
                                        keyboard_arrow_down
                                    </i>
                                </template>
                            </TransitionGroup>
                        </div>

                        <input type="hidden" />
                        <ul :class="dropdownOpen ? `is-open` : ``">
                            <li>
                                <a href="#" @click="filterRegionHandler('All Regions')">
                                    <span>All Regions</span>
                                    <span class="icon icon-check material-symbols-outlined" v-if="countryStore.selectedRegion === 'All Regions'">
                                        check
                                    </span>
                                </a>
                            </li>
                            <template v-for="region in props.regions" :key="region">
                                <li
                                    v-if="enableHoverEffect"
                                    :class="`region-option ${enableHoverEffect ? `hover--active` : ``}`"
                                    :data-region="region"
                                >
                                    <a href="#" @click="filterRegionHandler(region)">
                                        <span>{{ region }}</span>
                                        <span class="icon icon-check material-symbols-outlined" v-if="region == countryStore.selectedRegion">
                                            check
                                        </span>
                                    </a>
                                </li>
                            </template>
                        </ul>
                    </nav>
                </div>
            </Transition>
        </div>
        <div class="container">
            <div class="clear-buttons">
                <button class="button button--has-icon clear-search" @click="clearSearch" v-if="keywordSearch.length > 0">
                    <i class="icon icon--left icon-arrow-left material-symbols-outlined"> close </i>
                    <span>Clear Search</span>
                </button>
                <button class="button button--has-icon clear-region" @click="clearRegion" v-if="countryStore.selectedRegion !== null">
                    <i class="icon icon--left icon-arrow-left material-symbols-outlined"> close </i>
                    <span>Clear Region</span>
                </button>
            </div>
        </div>
    </section>
</template>

<script setup>
import {ref, watch, onMounted} from "vue";
import {gsap} from "gsap";
import {useOpenCountryDetailsStore} from "@/stores/OpenCountryDetailsStore";
import {useCountryStore} from "@/stores/CountryStore";
import TooltipHelpButton from "@/components/TooltipHelpButton.vue";

function onSlideBeforeEnter(el) {
    gsap.set(el, {y: "-100%", opacity: 0});
}

function onSlideEnter(el, done) {
    gsap.to(el, {
        y: 0,
        opacity: 1,
        duration: 0.35,
        ease: "power2.out",
        onComplete: done,
    });
}

function onSlideLeave(el, done) {
    gsap.to(el, {
        y: "-100%",
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
        onComplete: done,
    });
}

const openDetailsStore = useOpenCountryDetailsStore();
const countryStore = useCountryStore();

const props = defineProps({
    regions: Array,
    loading: Boolean,
    hideSearchBar: Boolean,
    selectedRegionValue: String,
    clearKeywordSearch: Boolean,
});

const emit = defineEmits(["filteredCountries", "scrollToPreviousCountry"]);

const loadingRegions = ref(true);
const enableHoverEffect = ref(false);

const keywordSearch = ref("");
const keywordSearchInput = ref(null);
const dropdownOpen = ref(false);

const filteredCountries = ref(null);

const dropdownHandler = () => {
    dropdownOpen.value = !dropdownOpen.value;

    // Enable Hover Effect to reduce jink
    setTimeout(() => {
        enableHoverEffect.value = !enableHoverEffect.value;
    }, 50);
};

const countries = ref(null);
const selectedRegion = ref(null);

/** Countries to use as base for filtering: either all, or only the selected region (respects "All Regions"). */
function getBaseListByRegion() {
    const all = countryStore.getCountries;
    const region = countryStore.selectedRegion;
    if (!region || region === "All Regions") return all;
    return all.filter((country) => country.region === region);
}

function applyKeywordFilter(list) {
    const q = keywordSearch.value.trim().toLowerCase();
    if (!q) return list;
    const keywords = q.split(" ");
    return list.filter((country) => {
        const name = (country.name?.common ?? "").toString();
        const region = (country.region ?? "").toString();
        const capital =
            country.capital && country.capital.length > 0 ? String(country.capital[0]) : "";
        const languages = country.languages ? Object.values(country.languages).join(" ") : "";
        const countryData = (name + " " + region + " " + capital + " " + languages).toLowerCase();
        return keywords.every((keyword) => countryData.includes(keyword));
    });
}

const filterRegionHandler = (region) => {
    countryStore.setSelectedRegion(region ? region : null);
    selectedRegion.value = region;

    const baseList =
        !region || region === "All Regions"
            ? countryStore.getCountries
            : countryStore.getCountries.filter((country) => country.region === region);

    filteredCountries.value = applyKeywordFilter(baseList);
    emit("filteredCountries", filteredCountries.value);

    setTimeout(() => {
        dropdownHandler();
    }, 200);
};

const keywordSearchHandler = (event) => {
    keywordSearch.value = event.target.value;
    const baseList = getBaseListByRegion();
    filteredCountries.value = applyKeywordFilter(baseList);
    emit("filteredCountries", filteredCountries.value);
};

const clearSearch = () => {
    keywordSearch.value = "";
    emit("filteredCountries", getBaseListByRegion());
};

const clearRegion = () => {
    countryStore.setSelectedRegion(null);
    filteredCountries.value = countryStore.getCountries;
    emit("filteredCountries", filteredCountries.value);
};

const goBack = () => {
    const countryName = countryStore.selectedCountry?.name?.common;
    openDetailsStore.setOpenDetails(false);
    openDetailsStore.setHideSearchBar(false);
    if (countryName) emit("scrollToPreviousCountry", countryName);
};

watch(props.regions, () => {
    loadingRegions.value = false;
});

// Watch for Countries in useCountryStore
watch(
    () => countryStore.getCountries, // The getter function to watch
    (obj) => {
        countries.value = obj;
    },
    {immediate: true, deep: true}
);

// Watch for clearKeywordSearch and clear the keywordSearch value
watch(
    () => props.clearKeywordSearch,
    (newValue) => {
        if (newValue) {
            keywordSearch.value = "";
        }
    },
    {immediate: true, deep: true}
);

onMounted(() => {
    setTimeout(() => {
        keywordSearchInput.value.focus();
    }, 1000);
});
</script>

<style lang="scss" scoped>
.user-avatar .skeleton-block {
    width: 120px;
    height: 120px;
    border-radius: 50%;
}
.clear-search {
    margin-right: auto;
}
.clear-region {
    margin-left: auto;
}
.clear-buttons {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
}
.search-bar {
    display: block;
    padding: 2rem 0;
    margin: 0;
    min-height: 54px;
    transition: var(--default-transition);
    background-color: var(--body-bg-color);

    .keyword-search {
        position: relative;
        color: var(--input-text-color);

        a,
        a:active,
        a:hover,
        a:focus {
            color: inherit;
        }

        input[type="text"] {
            padding-left: 3.5rem;
            width: 100%;
            max-width: 28rem;
        }

        .icon-search {
            position: absolute;
            top: 50%;
            left: 1rem;
            transform: translateY(-50%);
            font-size: 1.5rem;
            color: inherit;
        }
    }

    .region-filter {
        position: relative;
        z-index: 0;
        @media screen and (max-width: 40em) {
            margin-top: 1.5rem;
            justify-content: flex-start;
        }
        .icon-arrow-down {
            transition: var(--default-transition);
        }
        .icon-arrow-down--rotate {
            transform: rotate(-180deg);
        }
    }
}

.back-button-container {
    display: block;
    position: absolute;
    left: 0;
    transition: var(--default-transition);
    top: 3rem;
}
</style>
