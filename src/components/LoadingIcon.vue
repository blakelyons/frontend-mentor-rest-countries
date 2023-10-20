<template>
    <div class="loading" v-if="props.loading">
        <div class="loader"></div>
        <div class="loader-text">Loading<span> .</span><span> .</span><span> .</span></div>
    </div>
</template>

<script setup>
const props = defineProps({
    loading: Boolean,
});
</script>
