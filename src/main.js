// Load the styles
import styles from './style.less';

// Load Vue and Vuex
import Vue from 'vue';

// Setup the application store
import store from './store/store.js';

// Create our root component, AppContainer, with access to the store
import AppContainer from './app-container.vue';
AppContainer.store = store;
var app = new Vue(AppContainer);

// Make the root component available from everywhere
Vue.prototype.$app = app;

// Inject a div into the document to be the mount point for our AppContainer
var appDiv = document.createElement('div');
appDiv.id = 'app';
document.body.appendChild(appDiv);

// Go!
app.$mount('#app');
