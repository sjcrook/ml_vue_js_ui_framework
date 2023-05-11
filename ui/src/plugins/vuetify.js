import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

const theme = {
    dark: false,
    themes: {
        light: {
            primary: '#0047AB',
            secondary: '#4A92F7',
            accent: '#A86F00', //'#003278',
            info: '#abcdff', //'#a4c8fb', //'#bcbde4',
            success: '#56a840', //'#32CD32', //'#228B22',
            warning: '#ffa500',
            error: '#f94144',
            complement: "#ffffff",
            fade: "#cac9ca" // equivalent of placeholder - rgba(0, 0, 0, 0.38)
                            // http://marcodiiga.github.io/rgba-to-rgb-conversion
                            //      RGB_background = // #ffffff rgb(255, 255, 255)
                            //      RGBA_color = // #000000 rgba(0, 0, 0, 0.38)
        },
        dark: {
            primary: '#0047AB',
            secondary: '#4A92F7',
            accent: '#A86F00', //'#003278',
            info: '#abcdff', //'#a4c8fb', //'#bcbde4',
            success: '#56a840', //'#32CD32', //'#228B22',
            warning: '#ffa500',
            error: '#f94144',
            complement: "#ffffff",
            fade: "#cccccc"
        }            
    },
    options: {
        //customProperties: true
    }
};

export default new Vuetify({
    icons: {
        iconfont: "mdi"
    },
    theme: theme,
    breakpoint: {
        mobileBreakpoint: 'sm' // This is equivalent to a value of 960
    }
});