<template>

    <v-container fluid>

        <form @submit.prevent="dispatchLogIn()">

            <v-row class="justify-center mt-12">
                <v-col xs="12" sm="8" md="6" lg="5" xl="3">

                    <v-row>
                        <v-col>
                            <v-text-field
                                label="Username"
                                v-model="usn"
                                placeholder="Enter username"
                                outlined
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-text-field
                                type="password"
                                label="Password"
                                v-model="pwd"
                                placeholder="Enter password"
                                outlined
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row justify="center">
                        <v-col class="centerButton">
                            <v-btn
                                type="submit"
                                color="primary"
                                outlined
                                :disabled="loginButtonDisabled"
                            >
                                Log In
                            </v-btn>
                        </v-col>
                    </v-row>

                </v-col>
            </v-row>

        </form>

    </v-container>

</template>

<script>

    import { mapState } from "vuex";

    import { APP_CONFIG, eventHandler, getAxiosCatchMessage } from '../local.js';

    export default {
        data() {
            return {
                usn: undefined,
                pwd: undefined
            }
        },
        mounted() {
        },
        methods: {
            dispatchLogIn() {
                let that = this;
                this.$store.dispatch('auth/logIn', { username: this.usn, password: this.pwd }).then((response) => {
                    eventHandler.dispatch(
                        'masterSnackBar',
                        {
                            message: 'Login successful',
                            color: 'success',
                            timeout: APP_CONFIG.SNACKBAR_TIMEOUT_SHORT
                        }
                    );
                    that.$router.push({ name: "search" })
                }, (error) => {
                    eventHandler.dispatch(
                        'masterSnackBar',
                        {
                            message: that.AJAXResponseStatus === 401 ?  'Login failed.  Please enter valid credentials and try again.' :getAxiosCatchMessage(this.AJAXResponseStatus),
                            color: 'error',
                            timeout: APP_CONFIG.SNACKBAR_TIMEOUT_LONG
                        }
                    );
                });
            },
        },
        computed: {
            // Get  data from Vuex persistence layer
            ...mapState({
                submissionStatus: state => state.auth.submissionStatus,
                AJAXResponseStatus: state => state.auth.AJAXResponseStatus,
                error: state => state.auth.error
            }),
            loginButtonDisabled() {
                return !(this.usn && this.pwd);
            }
        },
    }
</script>

<style scoped>
    .centerButton {
        flex: 0 0 auto !important;
        width: auto !important;
        /*max-width: 100%;*/
    }
</style>