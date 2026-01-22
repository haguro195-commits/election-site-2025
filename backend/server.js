// Express.jsバックエンドサーバー
const express = require('express')
const cors = require('cors')
const axios = require('axios')
const cron = require('node-cron')

const app = express()
const PORT = process.env.PORT || 3001

// ミドルウェア
app.use(cors())
app.use(express.json())

// データストレージ（本番環境ではデータベースを使用）
let newsCache = []
let electionData = {}

// ニュース取得エンドポイント
app.get('/api/news', async (req, res) => {
    try {
        const { party, limit = 20 } = req.query

        let filteredNews = newsCache
        if (party && party !== 'all') {
            filteredNews = newsCache.filter(article =>
                article.parties.includes(party)
            )
        }

        res.json({
            success: true,
            data: filteredNews.slice(0, limit),
            total: filteredNews.length
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'ニュース取得に失敗しました'
        })
    }
})

// 選挙区データ取得
app.get('/api/districts', async (req, res) => {
    try {
        // 総務省の選挙区データAPIから取得（仮想）
        const districts = await fetchElectionDistricts()
        res.json({
            success: true,
            data: districts
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '選挙区データ取得に失敗しました'
        })
    }
})

// 議席予測データ取得
app.get('/api/predictions', async (req, res) => {
    try {
        // 世論調査データから議席予測を計算
        const predictions = await calculateSeatPredictions()
        res.json({
            success: true,
            data: predictions
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '議席予測データ取得に失敗しました'
        })
    }
})

// ニュース自動更新（5分ごと）
cron.schedule('*/5 * * * *', async () => {
    console.log('ニュースを更新中...')
    try {
        newsCache = await fetchLatestNews()
        console.log(`${newsCache.length}件のニュースを更新しました`)
    } catch (error) {
        console.error('ニュース更新エラー:', error)
    }
})

// ニュース取得関数
async function fetchLatestNews() {
    // 複数のニュースソースから取得
    const sources = [
        'https://news.yahoo.co.jp/rss/topics/politics.xml',
        'https://www3.nhk.or.jp/rss/news/cat6.xml',
        // 他のRSSフィード
    ]

    const allNews = []

    for (const source of sources) {
        try {
            const response = await axios.get(source)
            const parsedNews = parseRSSFeed(response.data)
            allNews.push(...parsedNews)
        } catch (error) {
            console.error(`ニュース取得エラー (${source}):`, error)
        }
    }

    return allNews
}

// 選挙区データ取得関数
async function fetchElectionDistricts() {
    // 総務省APIまたは選挙管理委員会データから取得
    return [
        {
            id: 1,
            name: '東京1区',
            prefecture: '東京都',
            candidates: [
                {
                    id: 1,
                    name: '田中太郎',
                    party: '自民党',
                    age: 45
                }
            ]
        }
        // 他の選挙区データ
    ]
}

// 議席予測計算関数
async function calculateSeatPredictions() {
    // 世論調査データを基に統計的モデリング
    return {
        predictions: [
            {
                party: '自民党',
                currentSeats: 247,
                predictedSeats: 220,
                confidence: 0.85
            }
            // 他の政党データ
        ],
        lastUpdated: new Date().toISOString()
    }
}

// RSS解析関数
function parseRSSFeed(xmlData) {
    // XML解析ライブラリを使用してRSSを解析
    // 実装は省略
    return []
}

app.listen(PORT, () => {
    console.log(`サーバーがポート${PORT}で起動しました`)

    // 初回ニュース取得
    fetchLatestNews().then(news => {
        newsCache = news
        console.log('初回ニュース取得完了')
    })
})