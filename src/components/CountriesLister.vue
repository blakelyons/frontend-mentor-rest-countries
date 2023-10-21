<template>
    <main>
        <div class="container">
            <CountryDetails
                :openDetails="openDetailsStore.openDetails"
                :selectedCountry="selectedCountry"
                @update-country-details="openDetailsHandler(country)"
                :loading="loading"
            />

            <div class="filtered-results" v-if="props.filteredCountries && !openDetailsStore.openDetails && !loadingFilteredResults">
                <div class="grid col-2">
                    <div class="results-found flex flex--row flex--align-center">
                        <p v-if="props.filteredCountries && props.filteredCountries.length > 0">
                            <b>{{ props.filteredCountries.length }}</b> results found
                        </p>
                        <p v-else-if="props.filteredCountries && props.filteredCountries.length === 0"><b>0</b> results found</p>
                        <button class="button button--chip button--has-icon" @click="emit('clearFilters')">
                            Clear Filter <span class="icon icon--right material-symbols-outlined"> close </span>
                        </button>
                    </div>
                    <div class="text-right"></div>
                </div>
            </div>

            <LoadingIcon :loading="props.loadingFilteredResults" />

            <div class="countries-lister" v-if="!props.loading && !props.loadingFilteredResults">
                <Transition name="fade" v-if="!openDetailsStore.openDetails">
                    <div class="grid col-4">
                        <a
                            href="#"
                            :id="country.name.common.replace(/\s/g, '')"
                            @click="openDetailsHandler(country)"
                            class="countries-lister__item"
                            v-for="(country, index) in props.filteredCountries ? props.filteredCountries : props.countries"
                            :key="index"
                        >
                            <div class="countries-lister__item-flag">
                                <img :src="country.flags.png" :alt="`${country.name.common} Flag`" />
                            </div>
                            <div class="countries-lister__item-info">
                                <h2>{{ country.name.common }}</h2>
                                <p><b>Population: </b>{{ formattedNumber(country.population) }}</p>
                                <p><b>Region: </b>{{ country.region }}</p>
                                <p><b>Capital: </b>{{ country.capital && country.capital.length > 0 ? country.capital[0] : "n/a" }}</p>
                            </div>
                        </a>
                    </div>
                </Transition>
                <div class="no-results" v-if="props.filteredCountries && props.filteredCountries.length === 0">
                    <p><span class="icon icon-no-results material-symbols-outlined"> sentiment_dissatisfied </span></p>
                    <p>Oops! No results found!</p>
                </div>
            </div>
        </div>
    </main>
</template>

<script setup>
import {ref, watch, onMounted, computed} from "vue";
import CountryDetails from "@/components/CountryDetails.vue";
import {useCountryStore} from "@/stores/CountryStore";
import {useOpenCountryDetailsStore} from "@/stores/OpenCountryDetailsStore";
import LoadingIcon from "@/components/LoadingIcon.vue";

const countryStore = useCountryStore();
const openDetailsStore = useOpenCountryDetailsStore();
const loading = ref(true);

const props = defineProps({
    countries: Array,
    filteredCountries: Array,
    openDetailsProp: Boolean,
    loadedAll: Boolean,
    loadingFilteredResults: Boolean,
    scrolled: Boolean,
});

const emit = defineEmits(["countriesMounted", "clearFilters"]);

const selectedCountry = ref(null);

const openDetailsHandler = (country) => {
    selectedCountry.value = country;

    countryStore.selectedCountry = country;

    openDetailsStore.setOpenDetails(true);
    openDetailsStore.setHideSearchBar(true);

    setTimeout(() => {
        loading.value = false;
    }, 400);
};

const formattedNumber = computed(() => (number) => {
    // A function that formats the number with commas
    if (typeof number === "number") {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return number;
});

watch(
    () => countryStore.getSelectedCountry, // The getter function to watch
    (newValue) => {
        // This function will be called when the selectedCountry in the store changes
        selectedCountry.value = newValue;
        loading.value = true;
        openDetailsHandler(selectedCountry.value);
    }
);

onMounted(() => {
    emit("countriesMounted");
});
</script>

<style lang="scss" scoped>
.filtered-results {
    position: absolute;
    translate: 0 -4rem;
}

.countries-lister {
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    align-items: center;
    min-height: 50vh;

    @media screen and (min-width: 40em) {
        margin-top: 4rem;
    }
    .countries-lister__item {
        background: var(--element-bg);
        box-shadow: var(--box-shadow);
        color: inherit;
        text-decoration: none;
        transition: all 0.2s ease-in-out;
        border-radius: var(--global-radius);
        overflow: hidden;

        &:hover {
            transform: scale(1.02);
            box-shadow: var(--box-shadow-hover);
        }

        &:active {
            transform: scale(1);
        }

        .countries-lister__item-flag {
            display: block;
            width: 100%;
            height: auto;
            aspect-ratio: 280 / 160;
            margin: 0;
            padding: 0;
            background-size: cover;
            background-repeat: no-repeat;
            background-position: center;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }

        .countries-lister__item-info {
            padding: 2rem 1.25rem 3rem 1.25rem;

            h2 {
                margin-bottom: 0.5em;
            }

            p {
                &:last-child {
                    margin-bottom: 0;
                }
            }
        }
    }
}

.results-found {
    p {
        margin: 0;
        padding: 0;
    }

    .button {
        margin-left: 1rem;
    }
}

.no-results {
    margin-top: 20vh;
    text-align: center;
    font-size: 1.5rem;

    .icon {
        font-size: 3rem;
    }
}
</style>
