import { ref } from 'vue'

const favoriteNews = ref([])
const favoriteCandidates = ref([])

export function useFavoritesStore() {
    const addToFavorites = (type, item) => {
        const timestamp = new Date().toISOString()

        if (type === 'news') {
            const exists = favoriteNews.value.find(fav => fav.id === item.id)
            if (!exists) {
                favoriteNews.value.push({
                    ...item,
                    savedAt: timestamp
                })
                saveFavorites()
            }
        } else if (type === 'candidates') {
            const exists = favoriteCandidates.value.find(fav => fav.id === item.id)
            if (!exists) {
                favoriteCandidates.value.push({
                    ...item,
                    savedAt: timestamp
                })
                saveFavorites()
            }
        }
    }

    const removeFromFavorites = (type, id) => {
        if (type === 'news') {
            const index = favoriteNews.value.findIndex(fav => fav.id === id)
            if (index > -1) {
                favoriteNews.value.splice(index, 1)
                saveFavorites()
            }
        } else if (type === 'candidates') {
            const index = favoriteCandidates.value.findIndex(fav => fav.id === id)
            if (index > -1) {
                favoriteCandidates.value.splice(index, 1)
                saveFavorites()
            }
        }
    }

    const isFavorite = (type, id) => {
        if (type === 'news') {
            return favoriteNews.value.some(fav => fav.id === id)
        } else if (type === 'candidates') {
            return favoriteCandidates.value.some(fav => fav.id === id)
        }
        return false
    }

    const saveFavorites = () => {
        localStorage.setItem('favoriteNews', JSON.stringify(favoriteNews.value))
        localStorage.setItem('favoriteCandidates', JSON.stringify(favoriteCandidates.value))
    }

    const loadFavorites = () => {
        const savedNews = localStorage.getItem('favoriteNews')
        const savedCandidates = localStorage.getItem('favoriteCandidates')

        if (savedNews) {
            favoriteNews.value = JSON.parse(savedNews)
        }

        if (savedCandidates) {
            favoriteCandidates.value = JSON.parse(savedCandidates)
        }
    }

    const importFavorites = (data) => {
        if (data.news) {
            favoriteNews.value = [...favoriteNews.value, ...data.news]
        }
        if (data.candidates) {
            favoriteCandidates.value = [...favoriteCandidates.value, ...data.candidates]
        }
        saveFavorites()
    }

    const clearAllFavorites = () => {
        favoriteNews.value = []
        favoriteCandidates.value = []
        saveFavorites()
    }

    // 初期化時にお気に入りを読み込み
    loadFavorites()

    return {
        favoriteNews,
        favoriteCandidates,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        loadFavorites,
        importFavorites,
        clearAllFavorites
    }
}