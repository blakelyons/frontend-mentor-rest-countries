<template>
    <Transition name="fade">
        <div class="back-to-top" v-if="props.scrolled">
            <button class="button button--scroll-top" @click="scrollToTop"><span class="material-symbols-outlined"> arrow_upward </span></button>
        </div>
    </Transition>
</template>

<script setup>
const props = defineProps({
    scrolled: Boolean,
});

const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
};
</script>
