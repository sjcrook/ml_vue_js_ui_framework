<template>

    <div>
        <v-app-bar
            color="primary"
            dense
            dark
        >
            <v-app-bar-nav-icon @click.stop="drawer = !drawer">
                <v-icon
                    v-if="drawer"
                >
                    mdi-close
                </v-icon>
            </v-app-bar-nav-icon>
      
            <v-toolbar-title>{{ appName }}</v-toolbar-title>
      
            <v-spacer></v-spacer>
      
            <span class="complement--text mx-3">{{ currentUser }}</span>

            <v-tooltip
                bottom
            >
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        icon
                        class="mx-3"
                        @click="dispatchLogout()"
                        v-bind="attrs"
                        v-on="on"
                    >
                        <v-icon color="complement">mdi-logout-variant</v-icon>
                    </v-btn>
                </template>
                <span>Logout</span>
            </v-tooltip>
        </v-app-bar>

        <v-navigation-drawer v-model="drawer" app class="primary mt-12" floating dark temporary>
            <v-list
                class="py-0"
                :dense="false"
            >
                <div v-for="item in list" :key="'rFL-' + item.text">
                    <v-list-item
                        v-if="!item.icon"
                        class="list-item-customization secondary"
                        :dense="false"
                    >
                        <v-list-item-content>
                            <v-list-item-title class="complement--text font-weight-bold">{{ item.text }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item
                        v-else
                        router
                        :to="item.route"
                        :target="item.target"
                        class="list-item-customization"
                        :dense="false"
                    >
                        <v-list-item-action :class="item.indented === false ? '' : 'pl-7'">
                            <v-icon color="complement">mdi-{{ item.icon }}</v-icon>
                        </v-list-item-action>
                        <v-list-item-content>
                            <v-list-item-title class="complement--text">{{ item.text }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>                    
                </div>
            </v-list>
        </v-navigation-drawer>

        <v-main>
            <router-view/>
        </v-main>
    </div>

</template>

<script>

    // Renders authenticated pages.

    import { APP_CONFIG, store } from '../local.js';

    //import FacetChipViewer from "../components/FacetChipViewer";

    export default {
        mixins: [  ],
        components: {
            //FacetChipViewer,
        },
        data() {
            return {
                drawer: false,
                list: [
                    { icon: "magnify", text: 'Search', route: { name: 'search' }, indented: false },
                    { icon: "graph", text: 'Graph SPARQL', route: { name: 'graphsparql' }, indented: false },
                    { icon: "graph", text: 'Graph SPARQL Fancy', route: { name: 'graphsparqlfancy' }, indented: false },
                    { icon: "graph", text: 'Graph QL', route: { name: 'graphql' }, indented: false },
                    { icon: "land-rows-horizontal", text: 'Rows', route: { name: 'rows' }, indented: false }
                ]
            }
        },
        mounted() {
        },
        methods: {
            dispatchLogout() {
                let that = this;
                store.dispatch('auth/logOut').catch(() => {}).finally(() => {
                    if (that.$router.currentRoute.name !== 'login') {
                        that.$router.push({ name: "login" });
                    }
                });
            }
        },
        computed: {
            appName() {
                return APP_CONFIG.APP_NAME;
            },
            currentUser() {
                return store.state.auth.username;
            }
        },
        watch: {
        }
    }

</script>

<style scoped>
    .list-item-customization {
        font-weight: bold;
        min-height: 35px !important;
    }

    .list-item-customization >>> .v-list-item__action {
        margin: 0 32px 0 0;
    }

    .list-item-customization >>> .v-list-item__content {
        padding: 0 0 !important;
    }
</style>