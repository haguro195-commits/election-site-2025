import { ref } from 'vue'
import axios from 'axios'

const news = ref([])
const favorites = ref([])
const loading = ref(false)
const lastUpdated = ref(null)

export function useNewsStore() {
    const fetchNews = async () => {
        loading.value = true
        try {
            // Netlify Functionsからリアルタイムニュースを取得
            const response = await axios.get('/.netlify/functions/fetch-news', {
                timeout: 30000 // 30秒タイムアウト
            })

            if (response.data.success) {
                news.value = response.data.data
                lastUpdated.value = response.data.lastUpdated
                console.log(`${response.data.total}件のニュースを取得しました`)
            } else {
                throw new Error(response.data.error || 'ニュース取得に失敗')
            }
        } catch (error) {
            console.error('リアルタイムニュース取得エラー:', error)

            // フォールバック: サンプルデータを使用
            console.log('サンプルデータにフォールバック')
            const sampleNews = [
                {
                    id: 1,
                    title: '自民党、次期衆院選に向けて候補者調整を本格化',
                    summary: '自民党は2026年2月の衆議院選挙に向けて、各選挙区での候補者調整を本格化させている。特に激戦区では現職議員の再選に向けた戦略を練り直している。',
                    url: 'https://www.jimin.jp/',
                    source: '政治新聞（サンプル）',
                    date: '2026-01-22',
                    parties: ['ldp'],
                    imageUrl: null
                },
                {
                    id: 2,
                    title: '立憲民主党、野党共闘の枠組み構築を急ぐ',
                    summary: '立憲民主党は他の野党との選挙協力について協議を重ねており、候補者の一本化に向けた調整を進めている。',
                    url: 'https://cdp-japan.jp/',
                    source: '朝日新聞（サンプル）',
                    date: '2026-01-21',
                    parties: ['cdp'],
                    imageUrl: null
                },
                {
                    id: 3,
                    title: '公明党、重点政策として子育て支援を前面に',
                    summary: '公明党は次期衆院選の重点政策として、子育て支援の拡充を掲げる方針を固めた。教育費の負担軽減などを具体的な政策として打ち出す。',
                    url: 'https://www.komei.or.jp/',
                    source: '読売新聞（サンプル）',
                    date: '2026-01-21',
                    parties: ['komeito'],
                    imageUrl: null
                },
                {
                    id: 4,
                    title: '日本維新の会、関西圏での議席拡大を目指す',
                    summary: '日本維新の会は関西圏を中心に議席の拡大を図る戦略を発表。地方分権の推進を主要な争点として位置づけている。',
                    url: 'https://o-ishin.jp/',
                    source: '毎日新聞（サンプル）',
                    date: '2026-01-20',
                    parties: ['ishin'],
                    imageUrl: null
                },
                {
                    id: 5,
                    title: '国民民主党、エネルギー政策で独自色を強調',
                    summary: '国民民主党は原発政策について現実的なアプローチを取る姿勢を示し、他党との差別化を図っている。',
                    url: 'https://new-kokumin.jp/',
                    source: '日経新聞（サンプル）',
                    date: '2026-01-20',
                    parties: ['dpfp'],
                    imageUrl: null
                },
                {
                    id: 6,
                    title: '共産党、格差是正を最重要課題に位置づけ',
                    summary: '日本共産党は所得格差の是正を最重要課題として掲げ、富裕層への課税強化などの政策を提案している。',
                    url: 'https://www.jcp.or.jp/',
                    source: 'しんぶん赤旗（サンプル）',
                    date: '2026-01-19',
                    parties: ['jcp'],
                    imageUrl: null
                }
            ]

            news.value = sampleNews
            lastUpdated.value = new Date().toISOString()
        } finally {
            loading.value = false
        }
    }

    const toggleFavorite = (article) => {
        const index = favorites.value.findIndex(fav => fav.id === article.id)
        if (index > -1) {
            favorites.value.splice(index, 1)
        } else {
            favorites.value.push({
                ...article,
                savedAt: new Date().toISOString()
            })
        }
        // ローカルストレージに保存
        localStorage.setItem('favoriteNews', JSON.stringify(favorites.value))
    }

    const loadFavorites = () => {
        const saved = localStorage.getItem('favoriteNews')
        if (saved) {
            favorites.value = JSON.parse(saved)
        }
    }

    // 自動更新機能（10分ごと）
    const startAutoUpdate = () => {
        // 初回実行
        fetchNews()

        // 10分ごとに自動更新
        setInterval(() => {
            console.log('ニュースを自動更新中...')
            fetchNews()
        }, 10 * 60 * 1000) // 10分 = 600,000ミリ秒
    }

    // 初期化時にお気に入りを読み込み
    loadFavorites()

    return {
        news,
        favorites,
        loading,
        lastUpdated,
        fetchNews,
        toggleFavorite,
        loadFavorites,
        startAutoUpdate
    }
}