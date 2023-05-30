import Vue from 'vue';
import VueRouter from 'vue-router';

import { store } from '../local.js';

Vue.use(VueRouter);

/*
	Prior to going to the specified route, check login status.
	If undefined, get login status from the proxy.
	If authenticated, proceed.
	If not authenticated and route requires authentication, re-route to login page.
	If not authenticated and route doesn't require authentication, proceed.
*/
const checkLogin = (to, from, next) => {
	if (to.name === 'error') {
		next();
	} else if (store.state.auth.authenticated === undefined) {
		store.dispatch('auth/getAuthenticated').then(() => {
			if (store.state.auth.authenticated) {
				next();
			} else {
				if (to.matched.some(r => r.meta.requiresAuthentication)) {
					next({ name: 'login' });
				} else {
					next();
				}
			}
		}, () => {
			next({ name: 'error' });
		});
	} else if (store.state.auth.authenticated) {
		next();
	} else {
		if (to.matched.some(r => r.meta.requiresAuthentication)) {
			next({ name: 'login' });
		} else {
			next();
		}
	}
};

// import(/* webpackChunkName: "login" */ '../views/LoginPage.vue'),

const routes = {
	mode: 'history',
	base: process.env.BASE_URL,
	routes: [
		{
			name: "app",
			path: "/app",
			redirect: { name: 'search' },
			component: require("../views/Authenticated").default,
			meta: {
				requiresAuthentication: true
			},
			children: [
				{
					name: "search",
					path: "search",
					component: require("../views/Search").default
				},
				{
					name: "graphql",
					path: "graphql",
					component: require("../views/GraphQL").default
				},
				{
					name: "graphsparql",
					path: "graphsparql",
					component: require("../views/GraphSPARQL").default
				},
				{
					name: "graphsparqlfancy",
					path: "graphsparqlfancy",
					component: require("../views/GraphSPARQLFancy").default
				},
				{
					name: "rows",
					path: "rows",
					component: require("../views/Rows").default
				}
			]
		},
	    {
	        name: "guest",
	        path: "/",
	        redirect: { name: 'home' },
	        component: require("../views/Guest").default,
	        meta: {
	        },
	        children: [
	            {
	                name: "home",
	                path: "/",
	                component: require("../views/Home").default,
	                meta: {
	                }
	            },
	            {
	                name: "login",
	                path: "/login",
	                component: require("../views/Login").default,
	                meta: {
	                }
	            }
	        ]
	    },
        {
            name: "error",
            path: "/error",
            component: require("../views/Error").default,
            meta: {
            }
        }
	]
};

const router = new VueRouter(routes);

router.beforeEach(checkLogin);

export default router;