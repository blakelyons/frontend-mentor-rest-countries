import {ref, computed} from "vue";
import {defineStore} from "pinia";

export const useOpenCountryDetailsStore = defineStore("openCountryDetailsStore", () => {
    const openDetails = ref(false);
    const hideSearchBar = ref(false);

    const setOpenDetails = (open) => {
        openDetails.value = open;
    };

    const getOpenDetails = computed(() => {
        return openDetails.value;
    });

    const setHideSearchBar = (hide) => {
        hideSearchBar.value = hide;
    };

    const getHideSearchBar = computed(() => {
        return hideSearchBar.value;
    });

    return {
        setOpenDetails,
        getOpenDetails,
        openDetails,
        setHideSearchBar,
        getHideSearchBar,
        hideSearchBar,
    };
});
