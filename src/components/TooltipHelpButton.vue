<template>
    <button class="button button--clear button--has-icon button--tooltip" @click="openTooltip = !openTooltip" aria-label="Open Tooltip">
        <span :class="`tooltip ${openTooltip ? `tooltip--open` : ``}`">
            <span class="tooltip__text">
                <slot></slot>
            </span>
            <span class="material-symbols-outlined close-tooltip"> close </span>
        </span>
        <span class="material-symbols-outlined icon icon--help"> help </span>
    </button>
</template>

<script setup>
import {ref, watch} from "vue";

const openTooltip = ref(false);

// Close Tooltip after 8 seconds
watch(openTooltip, (newValue) => {
    if (newValue) {
        setTimeout(() => {
            openTooltip.value = false;
        }, 8000);
    }
});
</script>

<style scoped lang="scss">
.button--tooltip {
    padding: 0.5rem;
    color: var(--tooltip-button-color);
}
.tooltip {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.25rem 0.4rem;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--tooltip-bg);
    border-radius: var(--global-radius);
    translate: 2rem 0.25rem;
    z-index: 999;
    cursor: default;
    height: auto;
    width: 22rem;
    text-align: center;
    font-size: 0.75rem;
    transition: all 200ms ease;
    transform-origin: left center;
    scale: 0;
    color: var(--tooltip-text-color);

    @media screen and (max-width: 60em) {
        translate: calc(-100% + 1.5rem) -95%;
        transform: translateY(2rem);
        transform-origin: bottom right;
        width: 50vw;
        max-width: 22rem;
    }

    .tooltip__text {
        pointer-events: none;
        color: inherit;
        font-weight: 600;
    }

    span {
        font-size: inherit;
        margin-left: 0.5rem;
        color: inherit;
    }

    &--open {
        opacity: 1;
        scale: 1;
        transform: translateY(0);
        z-index: 1000;
    }

    .close-tooltip {
        cursor: pointer;
        position: relative;
        z-index: 1001;
        color: inherit;
        font-weight: 600;
    }
}
</style>
