require('es6-promise').polyfill();

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import { authState } from "./modules/authState.js";
import { documentManagementState } from "./modules/documentManagementState.js";
import { graphQLState } from "./modules/graphQLState.js";
import { graphsSPARQLState } from "./modules/graphsSPARQLState.js";
import { rowsState } from "./modules/rowsState.js";
import { searchState } from "./modules/searchState.js";

const auth = new authState();
const documentManagement = new documentManagementState();
const graphQL = new graphQLState();
const graphsSPARQL = new graphsSPARQLState();
const rows = new rowsState();
const search = new searchState();

// Register the modules wiyh the Vue Store.
export default new Vuex.Store({
    modules: {
        auth,
        documentManagement,
        graphQL,
        graphsSPARQL,
        rows,
        search
    }
});