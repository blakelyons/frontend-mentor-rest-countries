<template>
    <section v-if="props.selectedCountry" v-show="drawerVisible" ref="drawerRef" :data-country="props.selectedCountry" class="country-details">
        <div class="grid col-2">
            <div class="country-flag">
                <div class="country-flag-placeholder skeleton-block skeleton-effect-wave" v-if="props.loading"></div>
                <img :src="props.selectedCountry?.flags?.svg" :alt="`${props.selectedCountry?.name?.common ?? 'Country'} Flag`" v-else />
            </div>
            <div class="country-details__data">
                <h2 :class="`${props.loading ? `skeleton-text skeleton-effect-wave` : ``}`">{{ props.selectedCountry?.name?.common ?? "Unknown" }}</h2>
                <br />
                <div class="grid col-2">
                    <div class="country-details__data--left">
                        <p :class="`${props.loading ? `skeleton-text skeleton-effect-wave` : ``}`">
                            <b>Native Name: </b>{{ props.selectedCountry?.name?.common ?? "—" }}
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
                            {{ props.selectedCountry.capital && props.selectedCountry.capital.length > 0 ? props.selectedCountry.capital[0] : "n/a" }}
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
                                    ? Object.values(props.selectedCountry.currencies)
                                          .map((c) => c?.name ?? c)
                                          .join(", ")
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
                <div class="border-countries" v-if="borderCountriesWithNames.length > 0">
                    <div :class="`${props.loading ? `skeleton-text skeleton-effect-wave` : ``}`"><b>Border Countries: </b></div>
                    <div class="border-countries__list">
                        <button
                            v-for="country in borderCountriesWithNames"
                            :key="country?.cca2 ?? country?.name?.common"
                            class="button"
                            :data-country="country"
                            @click="borderCountrySelected = country"
                            :class="props.loading ? `skeleton-text skeleton-effect-wave` : ``"
                        >
                            {{ country.name.common }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import {ref, computed, watch, onMounted, nextTick} from "vue";
import {gsap} from "gsap";
import {useCountryStore} from "@/stores/CountryStore";

const countryStore = useCountryStore();
const drawerRef = ref(null);
const drawerVisible = ref(false);

const props = defineProps({
    openDetails: Boolean,
    selectedCountry: Object,
    loading: Boolean,
});

const countryDetailsTL = gsap.timeline({defaults: {duration: 0.3, ease: "power4.inOut"}});

function setDrawerClosed(el) {
    if (!el) return;
    gsap.set(el, {y: "100%"});
}

watch(
    () => props.openDetails,
    (isOpen) => {
        nextTick(() => {
            const el = drawerRef.value;
            if (!el) return;

            if (isOpen) {
                drawerVisible.value = true;
                countryDetailsTL.to(el, {y: 0});
            } else {
                if (!drawerVisible.value) {
                    setDrawerClosed(el);
                    return;
                }
                countryDetailsTL.to(el, {
                    y: "100%",
                    onComplete: () => {
                        setDrawerClosed(el);
                        drawerVisible.value = false;
                    },
                });
            }
        });
    },
    {immediate: true}
);

onMounted(() => {
    if (!props.openDetails && drawerRef.value) {
        setDrawerClosed(drawerRef.value);
    }
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

const borderCountriesWithNames = computed(() => {
    const list = borderCountries.value;
    if (!list || !Array.isArray(list)) return [];
    const currentName = props.selectedCountry?.name?.common;
    return list.filter((c) => {
        const name = c?.name?.common;
        return name && name !== currentName;
    });
});

const getCountryNameByCodes = (countryCodes) => {
    if (countryCodes === null || countryCodes === undefined) {
        return;
    }

    countryCodesParams.value = countryCodes.join(",");

    const url = `https://restcountries.com/v3.1/alpha?codes=${countryCodesParams.value}`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            const list = Array.isArray(data) ? data : [];
            const withNames = list.filter((c) => c?.name?.common);
            const sorted = withNames.slice().sort((a, b) => {
                const nameA = (a.name?.common ?? "").toLowerCase();
                const nameB = (b.name?.common ?? "").toLowerCase();
                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return 0;
            });
            borderCountries.value = sorted;
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
