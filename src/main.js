import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './components/Home.vue'
import PartyNews from './components/PartyNews.vue'
import ElectionMap from './components/ElectionMap.vue'
import SeatPrediction from './components/SeatPrediction.vue'
import Favorites from './components/Favorites.vue'
import CandidateList from './components/CandidateList.vue'
import CandidateDetail from './components/CandidateDetail.vue'
import NotFound from './components/NotFound.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/party/:party', component: PartyNews, props: true },
    { path: '/map', component: ElectionMap },
    { path: '/candidates', component: CandidateList },
    { path: '/candidate/:id', component: CandidateDetail, props: true },
    { path: '/prediction', component: SeatPrediction },
    { path: '/favorites', component: Favorites },
    { path: '/:pathMatch(.*)*', component: NotFound }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')