import { ref } from 'vue'
import axios from 'axios'

const news = ref([])
const favorites = ref([])

export function useNewsStore() {
    const fetchNews = async () => {
        try {
            // 実際のAPIの代わりにサンプルデータを使用
            const sampleNews = [
                {
                    id: 1,
                    title: '自民党、次期衆院選に向けて候補者調整を本格化',
                    summary: '自民党は2025年2月の衆議院選挙に向けて、各選挙区での候補者調整を本格化させている。特に激戦区では現職議員の再選に向けた戦略を練り直している。',
                    url: 'https://example.com/news/1',
                    source: '政治新聞',
                    date: '2025-01-22',
                    parties: ['ldp']
                },
                {
                    id: 2,
                    title: '立憲民主党、野党共闘の枠組み構築を急ぐ',
                    summary: '立憲民主党は他の野党との選挙協力について協議を重ねており、候補者の一本化に向けた調整を進めている。',
                    url: 'https://example.com/news/2',
                    source: '朝日新聞',
                    date: '2025-01-21',
                    parties: ['cdp']
                },
                {
                    id: 3,
                    title: '公明党、重点政策として子育て支援を前面に',
                    summary: '公明党は次期衆院選の重点政策として、子育て支援の拡充を掲げる方針を固めた。教育費の負担軽減などを具体的な政策として打ち出す。',
                    url: 'https://example.com/news/3',
                    source: '読売新聞',
                    date: '2025-01-21',
                    parties: ['komeito']
                },
                {
                    id: 4,
                    title: '日本維新の会、関西圏での議席拡大を目指す',
                    summary: '日本維新の会は関西圏を中心に議席の拡大を図る戦略を発表。地方分権の推進を主要な争点として位置づけている。',
                    url: 'https://example.com/news/4',
                    source: '毎日新聞',
                    date: '2025-01-20',
                    parties: ['ishin']
                },
                {
                    id: 5,
                    title: '国民民主党、エネルギー政策で独自色を強調',
                    summary: '国民民主党は原発政策について現実的なアプローチを取る姿勢を示し、他党との差別化を図っている。',
                    url: 'https://example.com/news/5',
                    source: '日経新聞',
                    date: '2025-01-20',
                    parties: ['dpfp']
                },
                {
                    id: 6,
                    title: '共産党、格差是正を最重要課題に位置づけ',
                    summary: '日本共産党は所得格差の是正を最重要課題として掲げ、富裕層への課税強化などの政策を提案している。',
                    url: 'https://example.com/news/6',
                    source: 'しんぶん赤旗',
                    date: '2025-01-19',
                    parties: ['jcp']
                }
            ]

            news.value = sampleNews
        } catch (error) {
            console.error('ニュースの取得に失敗しました:', error)
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

    // 初期化時にお気に入りを読み込み
    loadFavorites()

    return {
        news,
        favorites,
        fetchNews,
        toggleFavorite,
        loadFavorites
    }
}