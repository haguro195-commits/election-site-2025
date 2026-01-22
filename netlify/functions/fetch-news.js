// Netlify Functions - ニュース取得API
const axios = require('axios')
const xml2js = require('xml2js')

exports.handler = async (event, context) => {
    // CORS設定
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    }

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' }
    }

    try {
        // 複数のRSSフィードから政治ニュースを取得
        const rssSources = [
            {
                url: 'https://www3.nhk.or.jp/rss/news/cat6.xml',
                source: 'NHKニュース'
            },
            {
                url: 'https://news.yahoo.co.jp/rss/topics/politics.xml',
                source: 'Yahoo!ニュース'
            }
        ]

        const allNews = []

        for (const rssSource of rssSources) {
            try {
                const response = await axios.get(rssSource.url, {
                    timeout: 10000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; Election-Site-Bot/1.0)'
                    }
                })

                const parser = new xml2js.Parser()
                const result = await parser.parseStringPromise(response.data)

                if (result.rss && result.rss.channel && result.rss.channel[0].item) {
                    const items = result.rss.channel[0].item

                    items.forEach((item, index) => {
                        const title = item.title[0]
                        const description = item.description ? item.description[0] : ''
                        const link = item.link[0]
                        const pubDate = item.pubDate ? item.pubDate[0] : new Date().toISOString()

                        // 政治・選挙関連キーワードでフィルタリング
                        const politicalKeywords = [
                            '選挙', '衆議院', '政党', '自民党', '立憲民主党', '公明党',
                            '国民民主党', '共産党', '維新', 'れいわ', '参政党',
                            '政治', '国会', '議員', '候補者', '投票', '選挙区'
                        ]

                        const isRelevant = politicalKeywords.some(keyword =>
                            title.includes(keyword) || description.includes(keyword)
                        )

                        if (isRelevant) {
                            // 政党を自動検出
                            const detectedParties = detectParties(title + ' ' + description)

                            allNews.push({
                                id: `${rssSource.source}-${index}-${Date.now()}`,
                                title: title,
                                summary: description.length > 200 ?
                                    description.substring(0, 200) + '...' : description,
                                url: link,
                                source: rssSource.source,
                                date: new Date(pubDate).toISOString(),
                                parties: detectedParties,
                                imageUrl: extractImageUrl(item)
                            })
                        }
                    })
                }
            } catch (error) {
                console.error(`RSS取得エラー (${rssSource.url}):`, error.message)
            }
        }

        // 日付順でソート（新しい順）
        allNews.sort((a, b) => new Date(b.date) - new Date(a.date))

        // 最新50件に制限
        const limitedNews = allNews.slice(0, 50)

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: limitedNews,
                total: limitedNews.length,
                lastUpdated: new Date().toISOString()
            })
        }

    } catch (error) {
        console.error('ニュース取得エラー:', error)

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'ニュースの取得に失敗しました',
                message: error.message
            })
        }
    }
}

// 政党検出関数
function detectParties(text) {
    const parties = []
    const partyKeywords = {
        'ldp': ['自民党', '自由民主党', 'LDP', '岸田', '茂木'],
        'cdp': ['立憲民主党', '立憲', '枝野', '泉'],
        'komeito': ['公明党', '山口'],
        'dpfp': ['国民民主党', '玉木'],
        'jcp': ['共産党', '日本共産党', '志位'],
        'ishin': ['日本維新の会', '維新', '馬場'],
        'reiwa': ['れいわ新選組', 'れいわ', '山本太郎'],
        'sanseito': ['参政党', '神谷']
    }

    Object.entries(partyKeywords).forEach(([party, keywords]) => {
        if (keywords.some(keyword => text.includes(keyword))) {
            parties.push(party)
        }
    })

    return parties.length > 0 ? parties : ['other']
}

// 画像URL抽出関数
function extractImageUrl(item) {
    // RSS内の画像URLを抽出（簡易版）
    if (item.enclosure && item.enclosure[0] && item.enclosure[0].$.url) {
        return item.enclosure[0].$.url
    }

    if (item.description && item.description[0]) {
        const imgMatch = item.description[0].match(/<img[^>]+src="([^">]+)"/i)
        if (imgMatch) {
            return imgMatch[1]
        }
    }

    return null
}