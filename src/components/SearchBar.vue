<template>
    <section class="search-bar">
        <div class="container grid col-2" v-show="!loading">
            <Transition name="slide-fade-up">
                <div class="keyword-search flex flex--row flex--nowrap flex--align-center flex--justify-start" v-if="!props.hideSearchBar">
                    <a href="#" @click="keywordSearchHandler"><i class="icon icon-search material-symbols-outlined"> search </i></a>
                    <input
                        type="text"
                        placeholder="Search for a country..."
                        id="keyword-search"
                        name="keyword-search"
                        aria-label="Keyword Search"
                        v-model="keywordSearch"
                        @keyup="keywordSearchHandler"
                    />
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

            <Transition name="slide-fade-up">
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
    </section>
</template>

<script setup>
import {ref, watch} from "vue";
import {useOpenCountryDetailsStore} from "@/stores/OpenCountryDetailsStore";
import {useCountryStore} from "@/stores/CountryStore";

const openDetailsStore = useOpenCountryDetailsStore();
const countryStore = useCountryStore();

const props = defineProps({
    regions: Array,
    loading: Boolean,
    hideSearchBar: Boolean,
    selectedRegionValue: String,
    keyWordSearchValue: String,
});

const emit = defineEmits(["filteredCountries", "scrollToPreviousCountry"]);

const loadingRegions = ref(true);
const enableHoverEffect = ref(false);

const keywordSearch = ref("");
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

const filterRegionHandler = (region) => {
    countryStore.setSelectedRegion(region ? region : null);
    selectedRegion.value = region;

    if (countryStore.selectedRegion === "All Regions") {
        filteredCountries.value = countryStore.getCountries;
        emit("filteredCountries", filteredCountries.value);

        setTimeout(() => {
            dropdownHandler();
        }, 200);

        return;
    }

    filteredCountries.value = countryStore.getCountries.filter((country) => {
        return country.region === region;
    });

    emit("filteredCountries", filteredCountries.value);

    setTimeout(() => {
        dropdownHandler();
    }, 200);
};

const keywordSearchHandler = () => {
    // Filter Countries by Keyword Search checking Country Common Name and Region
    filteredCountries.value = countryStore.getCountries.filter((country) => {
        return (
            country.name.common.toLowerCase().includes(keywordSearch.value.toLowerCase()) ||
            country.region.toLowerCase().includes(keywordSearch.value.toLowerCase())
        );
    });

    // Search Capitals Array if Keyword Search is not found in Country Common Name or Region
    if (filteredCountries.value.length === 0) {
        filteredCountries.value = countryStore.getCountries.filter((country) => {
            return country.capital && country.capital.length > 0 && country.capital[0].toLowerCase().includes(keywordSearch.value.toLowerCase());
        });
    }

    emit("filteredCountries", filteredCountries.value);
};

const goBack = () => {
    openDetailsStore.setOpenDetails(false);
    openDetailsStore.setHideSearchBar(false);
    console.log(`Selected Country Go Back: ${countryStore.selectedCountry.name.common}`);
    emit("scrollToPreviousCountry", countryStore.selectedCountry.name.common);
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
</script>

<style lang="scss" scoped>
.user-avatar .skeleton-block {
    width: 120px;
    height: 120px;
    border-radius: 50%;
}
.search-bar {
    display: block;
    margin: 2rem 0;
    padding: 0;
    min-height: 54px;
    transition: var(--default-transition);
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
