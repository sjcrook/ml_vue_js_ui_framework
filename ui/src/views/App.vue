<template>
    <v-app>
        <!--v-main>
            <router-view/>
        </v-main-->
        <master-snack-bar></master-snack-bar>
        <router-view/>
    </v-app>
</template>

<script>

    /*
        This is the top level of the Vue rendering hierarchy.
        The router-view component renders the pages.
    */

    import MasterSnackBar from "../components/MasterSnackBar";

    export default {
        components: {
            MasterSnackBar,
        },
        name: 'App',

        data: () => ({
        //
        }),
    };
</script>
