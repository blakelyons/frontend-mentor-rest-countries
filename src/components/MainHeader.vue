<template>
    <div class="main-header">
        <div class="container">
            <h1>Where in the world?</h1>
            <!-- TODO Make this clickable to go "home"-->
            <Transition name="fade">
                <button @click="toggleTheme" class="button button--clear button--has-icon" v-if="!props.loading">
                    <i class="icon icon--left icon-moon material-symbols-outlined"> {{ theme === "light" ? `dark_mode` : `light_mode` }} </i>
                    <span>{{ theme === "light" ? `Dark` : `Light` }} Mode</span>
                </button>
            </Transition>
        </div>
    </div>
</template>

<script setup>
import {ref} from "vue";

const emit = defineEmits(["toggleTheme"]);

const props = defineProps({
    loading: Boolean,
});

const theme = ref("light");

const toggleTheme = () => {
    if (localStorage.getItem("theme") !== null) {
        theme.value = localStorage.getItem("theme") === "light" ? "dark" : "light";
    } else {
        theme.value = "dark";
    }

    if (localStorage.getItem("theme") === null) {
        localStorage.setItem("theme", theme.value);
    }

    emit("toggleTheme", theme.value);
};
</script>
