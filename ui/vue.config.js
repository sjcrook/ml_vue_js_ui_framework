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
            entry: 'src/main.js',
            title: 'VueJS UI Framework'
        }
    }
};