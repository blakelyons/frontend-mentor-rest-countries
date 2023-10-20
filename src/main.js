import "./assets/main.scss";
import "skeleton-elements/scss";

import {createApp} from "vue";
import {createPinia} from "pinia";
import App from "./App.vue";
import "skeleton-elements/scss";

const app = createApp(App);

app.use(createPinia());

app.mount("#countries-app");
