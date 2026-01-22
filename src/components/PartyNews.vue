<template>
  <div class="party-news">
    <div class="party-header">
      <h2>{{ partyName }}のニュース</h2>
      <p>{{ partyName }}に関する最新のニュースと情報</p>
    </div>

    <div class="news-filters">
      <select v-model="sortBy" @change="sortNews">
        <option value="date">日付順</option>
        <option value="title">タイトル順</option>
        <option value="source">情報源順</option>
      </select>
      
      <select v-model="sourceFilter" @change="filterBySource">
        <option value="">全ての情報源</option>
        <option v-for="source in availableSources" :key="source" :value="source">
          {{ source }}
        </option>
      </select>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>{{ partyName }}のニュースを取得中...</p>
    </div>

    <div v-else-if="filteredNews.length === 0" class="no-news">
      <p>{{ partyName }}に関するニュースが見つかりませんでした。</p>
      <p class="suggestion">他の政党のニュースをご覧いただくか、しばらく後に再度お試しください。</p>
      <router-link to="/" class="btn">全てのニュースを見る</router-link>
    </div>

    <div v-else class="news-list">
      <div class="news-header">
        <div class="news-count">
          {{ partyName }}関連ニュース: {{ filteredNews.length }}件
        </div>
        <div v-if="newsStore.lastUpdated" class="update-info">
          最終更新: {{ formatDate(newsStore.lastUpdated) }}
        </div>
      </div>
      
      <article 
        v-for="article in filteredNews" 
        :key="article.id"
        class="news-item card"
      >
        <div v-if="article.imageUrl" class="news-image">
          <img :src="article.imageUrl" :alt="article.title" />
        </div>
        <h3>{{ article.title }}</h3>
        <p class="news-meta">
          {{ formatDate(article.date) }} - {{ article.source }}
        </p>
        <p class="news-summary">{{ article.summary }}</p>
        <div class="news-tags" v-if="article.parties">
          <span 
            v-for="partyId in article.parties" 
            :key="partyId"
            class="tag"
            :style="{ backgroundColor: getPartyColor(partyId) }"
          >
            {{ getPartyName(partyId) }}
          </span>
        </div>
        <div class="news-actions">
          <a :href="article.url" target="_blank" class="btn">記事を読む</a>
          <button @click="toggleFavorite(article)" class="btn btn-secondary">
            {{ isFavorite(article.id) ? '★' : '☆' }} お気に入り
          </button>
          <button @click="shareArticle(article)" class="btn btn-secondary">
            共有
          </button>
        </div>
      </article>
    </div>

    <div class="load-more" v-if="hasMore && !loading">
      <button @click="loadMore" class="btn">さらに読み込む</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useNewsStore } from '../stores/newsStore'
import { useFavoritesStore } from '../stores/favoritesStore'

export default {
  name: 'PartyNews',
  setup() {
    const route = useRoute()
    const newsStore = useNewsStore()
    const favoritesStore = useFavoritesStore()
    
    const loading = ref(false)
    const sortBy = ref('date')
    const sourceFilter = ref('')
    const hasMore = ref(false)

    const partyMap = {
      'ldp': '自民党',
      'cdp': '立憲民主党',
      'komeito': '公明党',
      'dpfp': '国民民主党',
      'jcp': '共産党',
      'ishin': '日本維新の会',
      'reiwa': 'れいわ新選組',
      'sanseito': '参政党'
    }

    const partyName = computed(() => {
      return partyMap[route.params.party] || route.params.party
    })

    const partyNews = computed(() => {
      return newsStore.news.filter(article => 
        article.parties && article.parties.includes(route.params.party)
      )
    })

    const availableSources = computed(() => {
      const sources = new Set()
      partyNews.value.forEach(article => {
        sources.add(article.source)
      })
      return Array.from(sources).sort()
    })

    const filteredNews = computed(() => {
      let filtered = partyNews.value

      if (sourceFilter.value) {
        filtered = filtered.filter(article => 
          article.source === sourceFilter.value
        )
      }

      // ソート
      filtered.sort((a, b) => {
        switch (sortBy.value) {
          case 'title':
            return a.title.localeCompare(b.title)
          case 'source':
            return a.source.localeCompare(b.source)
          case 'date':
          default:
            return new Date(b.date) - new Date(a.date)
        }
      })

      return filtered
    })

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

    const shareArticle = (article) => {
      if (navigator.share) {
        navigator.share({
          title: article.title,
          text: article.summary,
          url: article.url
        })
      } else {
        navigator.clipboard.writeText(`${article.title}\n${article.url}`)
        alert('リンクをクリップボードにコピーしました')
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('ja-JP')
    }

    const sortNews = () => {
      // ソートはcomputed propertyで自動実行
    }

    const filterBySource = () => {
      // フィルタリングはcomputed propertyで自動実行
    }

    const loadMore = () => {
      // 追加のニュース読み込み実装
      console.log('Load more news for', route.params.party)
    }

    const getPartyName = (partyId) => {
      const partyNames = {
        'ldp': '自民党',
        'cdp': '立憲民主党',
        'komeito': '公明党',
        'dpfp': '国民民主党',
        'jcp': '共産党',
        'ishin': '日本維新の会',
        'reiwa': 'れいわ新選組',
        'sanseito': '参政党',
        'other': 'その他'
      }
      return partyNames[partyId] || partyId
    }

    const getPartyColor = (partyId) => {
      const colors = {
        'ldp': '#FF6B6B',
        'cdp': '#4ECDC4',
        'komeito': '#45B7D1',
        'dpfp': '#BB8FCE',
        'jcp': '#EC7063',
        'ishin': '#F7DC6F',
        'reiwa': '#85C1E9',
        'sanseito': '#F8C471',
        'other': '#95A5A6'
      }
      return colors[partyId] || '#95A5A6'
    }

    const loadPartyNews = async () => {
      loading.value = true
      // リアルタイムニュース取得を使用
      await newsStore.fetchNews()
      loading.value = false
    }

    // 政党が変更された時にニュースを再読み込み
    watch(() => route.params.party, () => {
      loadPartyNews()
    })

    onMounted(() => {
      loadPartyNews()
      // 5分ごとに自動更新
      setInterval(loadPartyNews, 5 * 60 * 1000)
    })

    return {
      loading,
      sortBy,
      sourceFilter,
      hasMore,
      partyName,
      availableSources,
      filteredNews,
      toggleFavorite,
      isFavorite,
      shareArticle,
      formatDate,
      sortNews,
      filterBySource,
      loadMore,
      getPartyName,
      getPartyColor,
      newsStore
    }
  }
}
</script>

<style scoped>
.party-header {
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  text-align: center;
}

.party-header h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.news-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.news-filters select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.no-news {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.suggestion {
  margin-top: 1rem;
  font-size: 0.9rem;
}

.news-list {
  display: grid;
  gap: 1.5rem;
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.news-count {
  font-weight: bold;
  color: #2c3e50;
}

.update-info {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.news-image {
  margin-bottom: 1rem;
}

.news-image img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 4px;
}

.news-item h3 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
  line-height: 1.4;
}

.news-meta {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.news-summary {
  line-height: 1.6;
  margin-bottom: 1rem;
}

.news-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.tag {
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.news-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.load-more {
  text-align: center;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .news-header {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .news-filters {
    flex-direction: column;
  }
  
  .news-actions {
    flex-direction: column;
  }
}
</style>