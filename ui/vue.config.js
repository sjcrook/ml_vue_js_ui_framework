module.exports = {
    transpileDependencies: [
        'vuetify'
    ],
    lintOnSave: false,
    configureWebpack: {
        devtool: 'eval-source-maps'
    },
    pages: {
        index: {
            // This defines the entry point into the UI code.
            entry: 'src/main.js',
            title: 'VueJS UI Framework'
        }
    }
};