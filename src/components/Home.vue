<template>
  <div class="home">
    <section class="hero">
      <h2>衆議院選挙2026 最新情報</h2>
      <p>2026年2月実施予定の衆議院選挙に関する最新ニュースと情報をお届けします</p>
    </section>

    <section class="party-tabs">
      <h3>政党別ニュース</h3>
      <div class="tabs">
        <button 
          v-for="party in parties" 
          :key="party.id"
          :class="['tab', { active: activeParty === party.id }]"
          @click="setActiveParty(party.id)"
        >
          {{ party.name }}
        </button>
      </div>
      
      <div class="tab-content">
        <div v-if="loading" class="loading">ニュースを読み込み中...</div>
        <div v-else class="news-list">
          <article 
            v-for="article in filteredNews" 
            :key="article.id"
            class="news-item card"
          >
            <h4>{{ article.title }}</h4>
            <p class="news-meta">{{ formatDate(article.date) }} - {{ article.source }}</p>
            <p>{{ article.summary }}</p>
            <div class="news-actions">
              <a :href="article.url" target="_blank" class="btn">記事を読む</a>
              <button @click="toggleFavorite(article)" class="btn btn-secondary">
                {{ isFavorite(article.id) ? '★' : '☆' }} お気に入り
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="quick-links">
      <h3>クイックアクセス</h3>
      <div class="grid grid-3">
        <router-link to="/map" class="quick-link card">
          <h4>🗾 選挙区マップ</h4>
          <p>全国の選挙区と立候補者情報を地図で確認</p>
        </router-link>
        <router-link to="/prediction" class="quick-link card">
          <h4>📊 議席予測</h4>
          <p>最新の世論調査に基づく議席予測</p>
        </router-link>
        <router-link to="/favorites" class="quick-link card">
          <h4>⭐ お気に入り</h4>
          <p>保存したニュースと情報を確認</p>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useNewsStore } from '../stores/newsStore'
import { useFavoritesStore } from '../stores/favoritesStore'

export default {
  name: 'Home',
  setup() {
    const newsStore = useNewsStore()
    const favoritesStore = useFavoritesStore()
    const activeParty = ref('all')
    const loading = ref(false)

    const parties = [
      { id: 'all', name: '全て' },
      { id: 'ldp', name: '自民党' },
      { id: 'cdp', name: '立憲民主党' },
      { id: 'komeito', name: '公明党' },
      { id: 'dpfp', name: '国民民主党' },
      { id: 'jcp', name: '共産党' },
      { id: 'ishin', name: '日本維新の会' },
      { id: 'reiwa', name: 'れいわ新選組' },
      { id: 'sanseito', name: '参政党' }
    ]

    const filteredNews = computed(() => {
      if (activeParty.value === 'all') {
        return newsStore.news
      }
      return newsStore.news.filter(article => 
        article.parties.includes(activeParty.value)
      )
    })

    const setActiveParty = (partyId) => {
      activeParty.value = partyId
    }

    const toggleFavorite = (article) => {
      if (isFavorite(article.id)) {
        favoritesStore.removeFromFavorites('news', article.id)
      } else {
        favoritesStore.addToFavorites('news', article)
      }
    }

    const isFavorite = (articleId) => {
      return favoritesStore.isFavorite('news', articleId)
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('ja-JP')
    }

    const loadNews = async () => {
      loading.value = true
      await newsStore.fetchNews()
      loading.value = false
    }

    onMounted(() => {
      loadNews()
      // 5分ごとに自動更新
      setInterval(loadNews, 5 * 60 * 1000)
    })

    return {
      parties,
      activeParty,
      loading,
      filteredNews,
      setActiveParty,
      toggleFavorite,
      isFavorite,
      formatDate
    }
  }
}
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 3rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.hero h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.party-tabs {
  margin-bottom: 3rem;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab {
  background: #ecf0f1;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
}

.tab:hover {
  background: #d5dbdb;
}

.tab.active {
  background: #3498db;
  color: white;
}

.news-list {
  display: grid;
  gap: 1rem;
}

.news-item h4 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.news-meta {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.news-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.quick-links {
  margin-top: 3rem;
}

.quick-link {
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s;
}

.quick-link:hover {
  transform: translateY(-2px);
}

.quick-link h4 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}
</style>