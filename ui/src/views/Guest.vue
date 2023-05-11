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

            <router-link
                v-if="$route.name !== 'login'"
                :to="{ name: 'login' }"
                class="complement--text majorlink mr-4"
            >
                Login
            </router-link>
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

    import { APP_CONFIG } from '../local.js';

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
                    { icon: "view-dashboard", text: 'Link to X', route: { name: 'search' }, indented: false },
                    { icon: "account-group", text: 'Link to Y', route: { name: 'graph' }, indented: false }
                ]
            }
        },
        mounted() {
        },
        methods: {
        },
        computed: {
            appName() {
                return APP_CONFIG.APP_NAME;
            }
        },
        watch: {
            group () {
                this.drawer = false
            }
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
    a.majorlink {
        font-weight: bold;
        text-decoration: none;
    }

    a.majorlink:hover {
        text-decoration-line: underline;
        text-decoration-thickness: 2px;
        text-underline-offset: 5px
    }
</style>