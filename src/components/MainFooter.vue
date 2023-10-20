<template>
    <footer v-show="!props.loading && !props.loadingFilteredResults && props.countryDetailOpen">
        <div class="container text-center attribution">
            <a
                href="https://www.frontendmentor.io/challenges/rest-countries-api-with-color-theme-switcher-5cacc469fec04111f7b848ca/hub"
                target="_blank"
                >Frontend Mentor Challenge</a
            >
            by <a href="https://blakelyons.com" target="_blank">Blake Lyons</a>
        </div>
    </footer>
</template>

<script setup>
const props = defineProps({
    loading: Boolean,
    loadingFilteredResults: Boolean,
    countryDetailOpen: Boolean,
});
</script>
