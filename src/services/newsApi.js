// ニュースAPI連携サービス
import axios from 'axios'

class NewsApiService {
    constructor() {
        this.baseURL = 'https://newsapi.org/v2'
        this.apiKey = process.env.VUE_APP_NEWS_API_KEY // 環境変数で管理
    }

    // 衆院選関連ニュースを取得
    async getElectionNews(party = null) {
        try {
            let query = '衆議院選挙 OR 総選挙'

            // 政党別の検索クエリ
            if (party) {
                const partyQueries = {
                    'ldp': '自民党 OR 自由民主党',
                    'cdp': '立憲民主党',
                    'komeito': '公明党',
                    'dpfp': '国民民主党',
                    'jcp': '共産党 OR 日本共産党',
                    'ishin': '日本維新の会 OR 維新',
                    'reiwa': 'れいわ新選組',
                    'sanseito': '参政党'
                }
                query += ` AND (${partyQueries[party]})`
            }

            const response = await axios.get(`${this.baseURL}/everything`, {
                params: {
                    q: query,
                    language: 'ja',
                    sortBy: 'publishedAt',
                    pageSize: 50,
                    apiKey: this.apiKey
                }
            })

            return this.formatNewsData(response.data.articles)
        } catch (error) {
            console.error('ニュース取得エラー:', error)
            return []
        }
    }

    // Yahoo!ニュースAPIとの連携（代替案）
    async getYahooNews() {
        try {
            // Yahoo!ニュースのRSSフィードを使用
            const response = await axios.get('/api/yahoo-news-proxy')
            return this.parseRSSFeed(response.data)
        } catch (error) {
            console.error('Yahoo!ニュース取得エラー:', error)
            return []
        }
    }

    // データフォーマット
    formatNewsData(articles) {
        return articles.map(article => ({
            id: this.generateId(article.url),
            title: article.title,
            summary: article.description || article.content?.substring(0, 200) + '...',
            url: article.url,
            source: article.source.name,
            date: article.publishedAt,
            imageUrl: article.urlToImage,
            parties: this.detectParties(article.title + ' ' + article.description)
        }))
    }

    // 記事から政党を検出
    detectParties(text) {
        const parties = []
        const partyKeywords = {
            'ldp': ['自民党', '自由民主党', 'LDP'],
            'cdp': ['立憲民主党', '立憲'],
            'komeito': ['公明党'],
            'dpfp': ['国民民主党'],
            'jcp': ['共産党', '日本共産党'],
            'ishin': ['日本維新の会', '維新'],
            'reiwa': ['れいわ新選組', 'れいわ'],
            'sanseito': ['参政党']
        }

        Object.entries(partyKeywords).forEach(([party, keywords]) => {
            if (keywords.some(keyword => text.includes(keyword))) {
                parties.push(party)
            }
        })

        return parties
    }

    generateId(url) {
        return btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)
    }
}

export default new NewsApiService()