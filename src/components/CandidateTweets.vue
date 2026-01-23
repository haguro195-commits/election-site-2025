<template>
  <div class="candidate-tweets">
    <div class="tweets-header">
      <h3>候補者ツイート</h3>
      <div class="tweets-controls">
        <select v-model="selectedCandidate" @change="filterTweets">
          <option value="">全候補者</option>
          <option v-for="candidate in candidates" :key="candidate" :value="candidate">
            {{ candidate }}
          </option>
        </select>
        
        <select v-model="selectedParty" @change="filterTweets">
          <option value="">全政党</option>
          <option v-for="party in parties" :key="party" :value="party">
            {{ party }}
          </option>
        </select>

        <button @click="refreshTweets" class="btn btn-secondary" :disabled="loading">
          🔄 更新
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>ツイートを取得中...</p>
    </div>

    <div v-if="lastUpdated" class="update-info">
      最終更新: {{ formatDate(lastUpdated) }}
      <span v-if="isUsingFallback" class="fallback-notice">
        （サンプルデータを使用中）
      </span>
    </div>

    <div class="tweets-list">
      <article 
        v-for="tweet in filteredTweets" 
        :key="tweet.id"
        class="tweet-card card"
      >
        <div class="tweet-header">
          <div class="candidate-info">
            <h4>{{ tweet.candidateName }}</h4>
            <span class="party-badge" :style="{ backgroundColor: getPartyColor(tweet.party) }">
              {{ tweet.party }}
            </span>
          </div>
          <div class="tweet-meta">
            <span class="username">@{{ tweet.username }}</span>
            <span class="date">{{ formatDate(tweet.createdAt) }}</span>
          </div>
        </div>

        <div class="tweet-content">
          <p>{{ tweet.text }}</p>
          
          <div v-if="tweet.isRelevant" class="relevance-badge">
            🏛️ 政治関連
          </div>
        </div>

        <div class="tweet-metrics" v-if="tweet.metrics">
          <span class="metric">
            ❤️ {{ formatNumber(tweet.metrics.like_count) }}
          </span>
          <span class="metric">
            🔄 {{ formatNumber(tweet.metrics.retweet_count) }}
          </span>
          <span class="metric">
            💬 {{ formatNumber(tweet.metrics.reply_count) }}
          </span>
        </div>

        <div class="tweet-actions">
          <a :href="tweet.url" target="_blank" class="btn btn-sm">
            🐦 Xで見る
          </a>
          <button @click="toggleFavorite(tweet)" class="btn btn-sm btn-secondary">
            {{ isFavorite(tweet.id) ? '★' : '☆' }} お気に入り
          </button>
          <button @click="shareTweet(tweet)" class="btn btn-sm btn-secondary">
            📤 共有
          </button>
        </div>
      </article>
    </div>

    <div v-if="filteredTweets.length === 0 && !loading" class="no-tweets">
      <p>表示するツイートがありません。</p>
      <p class="suggestion">フィルターを変更するか、しばらく後に再度お試しください。</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'CandidateTweets',
  setup() {
    const tweets = ref([])
    const loading = ref(false)
    const lastUpdated = ref(null)
    const isUsingFallback = ref(false)
    const selectedCandidate = ref('')
    const selectedParty = ref('')

    const candidates = computed(() => {
      const uniqueCandidates = [...new Set(tweets.value.map(t => t.candidateName))]
      return uniqueCandidates.sort()
    })

    const parties = computed(() => {
      const uniqueParties = [...new Set(tweets.value.map(t => t.party))]
      return uniqueParties.sort()
    })

    const filteredTweets = computed(() => {
      let filtered = tweets.value

      if (selectedCandidate.value) {
        filtered = filtered.filter(tweet => 
          tweet.candidateName === selectedCandidate.value
        )
      }

      if (selectedParty.value) {
        filtered = filtered.filter(tweet => 
          tweet.party === selectedParty.value
        )
      }

      return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    })

    const fetchTweets = async () => {
      loading.value = true
      try {
        const response = await axios.get('/.netlify/functions/fetch-tweets', {
          timeout: 30000
        })

        if (response.data.success) {
          tweets.value = response.data.data
          lastUpdated.value = response.data.lastUpdated
          isUsingFallback.value = !!response.data.note
          console.log(`${response.data.count}件のツイートを取得しました`)
        } else {
          throw new Error(response.data.error || 'ツイート取得に失敗')
        }
      } catch (error) {
        console.error('ツイート取得エラー:', error)
        isUsingFallback.value = true
      } finally {
        loading.value = false
      }
    }

    const refreshTweets = () => {
      fetchTweets()
    }

    const filterTweets = () => {
      // フィルタリングはcomputed propertyで自動実行
    }

    const getPartyColor = (party) => {
      const colors = {
        '自民党': '#FF6B6B',
        '立憲民主党': '#4ECDC4',
        '公明党': '#45B7D1',
        '国民民主党': '#BB8FCE',
        '共産党': '#EC7063',
        '日本維新の会': '#F7DC6F',
        'れいわ新選組': '#85C1E9',
        '参政党': '#F8C471'
      }
      return colors[party] || '#95A5A6'
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now - date
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)

      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        return `${diffMinutes}分前`
      } else if (diffHours < 24) {
        return `${diffHours}時間前`
      } else if (diffDays < 7) {
        return `${diffDays}日前`
      } else {
        return date.toLocaleDateString('ja-JP')
      }
    }

    const formatNumber = (num) => {
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
      }
      return num.toString()
    }

    const toggleFavorite = (tweet) => {
      // お気に入り機能実装
      console.log('Toggle favorite:', tweet)
    }

    const isFavorite = (tweetId) => {
      // お気に入り判定実装
      return false
    }

    const shareTweet = (tweet) => {
      if (navigator.share) {
        navigator.share({
          title: `${tweet.candidateName}のツイート`,
          text: tweet.text,
          url: tweet.url
        })
      } else {
        navigator.clipboard.writeText(`${tweet.text}\n${tweet.url}`)
        alert('ツイートをクリップボードにコピーしました')
      }
    }

    onMounted(() => {
      fetchTweets()
      // 30分ごとに自動更新
      setInterval(fetchTweets, 30 * 60 * 1000)
    })

    return {
      tweets,
      loading,
      lastUpdated,
      isUsingFallback,
      selectedCandidate,
      selectedParty,
      candidates,
      parties,
      filteredTweets,
      refreshTweets,
      filterTweets,
      getPartyColor,
      formatDate,
      formatNumber,
      toggleFavorite,
      isFavorite,
      shareTweet
    }
  }
}
</script>

<style scoped>
.candidate-tweets {
  margin: 2rem 0;
}

.tweets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.tweets-header h3 {
  margin: 0;
  color: #2c3e50;
}

.tweets-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.tweets-controls select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.loading {
  text-align: center;
  padding: 2rem;
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

.update-info {
  background: #e8f5e8;
  color: #2d5a2d;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  text-align: center;
}

.fallback-notice {
  color: #e67e22;
  font-style: italic;
}

.tweets-list {
  display: grid;
  gap: 1rem;
}

.tweet-card {
  border-left: 4px solid #3498db;
}

.tweet-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.candidate-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.candidate-info h4 {
  margin: 0;
  color: #2c3e50;
}

.party-badge {
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.tweet-meta {
  text-align: right;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.username {
  display: block;
  margin-bottom: 0.25rem;
}

.tweet-content {
  margin-bottom: 1rem;
}

.tweet-content p {
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.relevance-badge {
  display: inline-block;
  background: #e8f5e8;
  color: #2d5a2d;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.tweet-metrics {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.metric {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.tweet-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.no-tweets {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.suggestion {
  margin-top: 1rem;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .tweets-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .tweets-controls {
    flex-direction: column;
  }
  
  .tweet-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .tweet-meta {
    text-align: left;
  }
  
  .tweet-metrics {
    flex-wrap: wrap;
  }
}
</style>