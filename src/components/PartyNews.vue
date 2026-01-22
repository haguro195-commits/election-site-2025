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
      ニュースを読み込み中...
    </div>

    <div v-else-if="filteredNews.length === 0" class="no-news">
      <p>{{ partyName }}に関するニュースが見つかりませんでした。</p>
      <router-link to="/" class="btn">全てのニュースを見る</router-link>
    </div>

    <div v-else class="news-list">
      <article 
        v-for="article in filteredNews" 
        :key="article.id"
        class="news-item card"
      >
        <h3>{{ article.title }}</h3>
        <p class="news-meta">
          {{ formatDate(article.date) }} - {{ article.source }}
        </p>
        <p class="news-summary">{{ article.summary }}</p>
        <div class="news-tags">
          <span 
            v-for="tag in article.tags" 
            :key="tag"
            class="tag"
          >
            {{ tag }}
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

    const loadPartyNews = async () => {
      loading.value = true
      await newsStore.fetchNews()
      loading.value = false
    }

    // 政党が変更された時にニュースを再読み込み
    watch(() => route.params.party, () => {
      loadPartyNews()
    })

    onMounted(() => {
      loadPartyNews()
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
      loadMore
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

.loading,
.no-news {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.news-list {
  display: grid;
  gap: 1.5rem;
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
  background: #ecf0f1;
  color: #2c3e50;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
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
</style>