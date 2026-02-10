<template>
    <Transition name="slide-in-left">
        <section :data-country="props.selectedCountry" class="country-details" v-if="props.openDetails">
            <div class="grid col-2">
                <div class="country-flag">
                    <div class="country-flag-placeholder skeleton-block skeleton-effect-wave" v-if="props.loading"></div>
                    <img :src="props.selectedCountry.flags.svg" :alt="`${props.selectedCountry.name.common} Flag`" v-else />
                </div>
                <div class="country-details__data">
                    <h2 :class="`${props.loading ? `skeleton-text skeleton-effect-wave` : ``}`">{{ props.selectedCountry.name.common }}</h2>
                    <br />
                    <div class="grid col-2">
                        <div class="country-details__data--left">
                            <p :class="`${props.loading ? `skeleton-text skeleton-effect-wave` : ``}`">
                                <b>Native Name: </b>{{ props.selectedCountry.name.common }}
                            </p>
                            <p :class="`${props.loading ? `skeleton-text skeleton-effect-wave` : ``}`">
                                <b>Population: </b>{{ props.selectedCountry.population }}
                            </p>
                            <p :class="`${props.loading ? `skeleton-text skeleton-effect-wave` : ``}`">
                                <b>Region: </b>{{ props.selectedCountry.region }}
                            </p>
                            <p :class="`${props.loading ? `skeleton-text skeleton-effect-wave` : ``}`">
                                <b>Sub Region: </b>{{ props.selectedCountry.subregion }}
                            </p>
                            <p :class="`${props.loading ? `skeleton-text skeleton-effect-wave` : ``}`">
                                <b>Capital: </b>
                                {{
                                    props.selectedCountry.capital && props.selectedCountry.capital.length > 0
                                        ? props.selectedCountry.capital[0]
                                        : "n/a"
                                }}
                            </p>
                        </div>
                        <div class="country-details__data--right">
                            <p :class="`${props.loading ? `skeleton-text skeleton-effect-wave` : ``}`">
                                <b>Top Level Domain: </b>
                                {{ props.selectedCountry.tld && props.selectedCountry.tld.length > 0 ? props.selectedCountry.tld[0] : "n/a" }}
                            </p>
                            <p :class="`${props.loading ? `skeleton-text skeleton-effect-wave` : ``}`">
                                <b>Currencies: </b>
                                {{
                                    props.selectedCountry.currencies && Object.keys(props.selectedCountry.currencies).length > 0
                                        ? Object.values(props.selectedCountry.currencies).map((c) => c?.name ?? c).join(", ")
                                        : "n/a"
                                }}
                            </p>
                            <p :class="`${props.loading ? `skeleton-text skeleton-effect-wave` : ``}`">
                                <b>Languages: </b>
                                {{
                                    props.selectedCountry.languages && Object.keys(props.selectedCountry.languages).length > 0
                                        ? Object.values(props.selectedCountry.languages).join(", ")
                                        : "n/a"
                                }}
                            </p>
                        </div>
                    </div>
                    <div class="border-countries" v-if="borderCountries">
                        <div :class="`${props.loading ? `skeleton-text skeleton-effect-wave` : ``}`"><b>Border Countries: </b></div>
                        <div class="border-countries__list">
                            <template v-for="country in borderCountries" :key="country">
                                <button
                                    class="button"
                                    :data-country="country"
                                    @click="borderCountrySelected = country"
                                    :class="props.loading ? `skeleton-text skeleton-effect-wave` : ``"
                                >
                                    {{ country.name.common }}
                                </button>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </Transition>
</template>

<script setup>
import {ref, watch} from "vue";
import {useCountryStore} from "@/stores/CountryStore";

const countryStore = useCountryStore();

const props = defineProps({
    openDetails: Boolean,
    selectedCountry: Object,
    loading: Boolean,
});

const borderCountrySelected = ref(null);

watch(
    borderCountrySelected,
    (newValue) => {
        countryStore.setSelectedCountry(newValue);
    },
    {immediate: false, deep: true}
);

// Watch props.selectedCountry
watch(
    () => props.selectedCountry,
    (newValue) => {
        if (newValue !== null) {
            getCountryNameByCodes(newValue.borders);
        }
    }
);

const countryCodesParams = ref(null);
const borderCountries = ref(null);
const getCountryNameByCodes = (countryCodes) => {
    if (countryCodes === null || countryCodes === undefined) {
        return;
    }

    countryCodesParams.value = countryCodes.join(",");

    const url = `https://restcountries.com/v3.1/alpha?codes=${countryCodesParams.value}`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            borderCountries.value = data;

            const sortedCountries = borderCountries.value.slice().sort((a, b) => {
                const nameA = a.name.common.toLowerCase();
                const nameB = b.name.common.toLowerCase();

                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return 0;
            });

            borderCountries.value = sortedCountries;
        })
        .catch((error) => {
            console.error(error);
        });
};
</script>

<style lang="scss" scoped>
.country-details {
    display: block;
    transition: var(--default-transition);
    position: absolute;
    top: 0;
    left: 0;
    width: 100;
    background: var(--body-bg-color);
    z-index: 100;
    transition: all 0.3s ease-in-out;
    padding: 1rem;
    min-height: 50em;
    overflow: hidden;

    &--show {
        transform: translateX(0);
    }

    .grid {
        gap: 1rem;
    }
}

.country-details__data {
    display: block;
    position: relative;
    padding: 0;

    @media screen and (min-width: 60em) {
        padding: 3rem;
    }
}

.border-countries {
    display: grid;
    gap: 1rem;
    width: 100%;
    gap: 1rem;
    margin-top: 3rem;

    > div:first-child {
        display: inline-block;
        flex-basis: 30%;
    }
}

.border-countries__list {
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
    align-items: center;
    gap: 1rem;
}

.country-flag {
    padding: 3rem;
    img {
        box-shadow: var(--box-shadow);
    }
}

.country-flag-placeholder {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 280 / 160;
    margin: 0;
    padding: 0;
}
</style>
