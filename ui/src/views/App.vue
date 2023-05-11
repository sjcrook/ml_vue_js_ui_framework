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
