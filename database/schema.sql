-- 衆議院選挙情報サイト データベーススキーマ

-- ニュース記事テーブル
CREATE TABLE news_articles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(500) NOT NULL,
    summary TEXT,
    content TEXT,
    url VARCHAR(1000) UNIQUE NOT NULL,
    source VARCHAR(100) NOT NULL,
    published_at DATETIME NOT NULL,
    image_url VARCHAR(1000),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_published_at (published_at),
    INDEX idx_source (source)
);

-- 政党テーブル
CREATE TABLE parties (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200),
    color VARCHAR(7), -- HEXカラーコード
    logo_url VARCHAR(500),
    website_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ニュース記事と政党の関連テーブル
CREATE TABLE news_party_relations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    news_id BIGINT NOT NULL,
    party_id VARCHAR(20) NOT NULL,
    relevance_score DECIMAL(3,2) DEFAULT 1.00,
    FOREIGN KEY (news_id) REFERENCES news_articles(id) ON DELETE CASCADE,
    FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE,
    UNIQUE KEY unique_news_party (news_id, party_id)
);

-- 選挙区テーブル
CREATE TABLE electoral_districts (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    prefecture VARCHAR(20) NOT NULL,
    region VARCHAR(50),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    population INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_prefecture (prefecture)
);

-- 候補者テーブル
CREATE TABLE candidates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    party_id VARCHAR(20),
    district_id INT NOT NULL,
    age INT,
    gender ENUM('男性', '女性', 'その他'),
    experience TEXT,
    education TEXT,
    career TEXT,
    website_url VARCHAR(500),
    twitter_handle VARCHAR(50),
    photo_url VARCHAR(500),
    is_incumbent BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (party_id) REFERENCES parties(id),
    FOREIGN KEY (district_id) REFERENCES electoral_districts(id),
    INDEX idx_party (party_id),
    INDEX idx_district (district_id)
);

-- 世論調査テーブル
CREATE TABLE polls (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    organization VARCHAR(100) NOT NULL, -- 調査機関
    survey_date DATE NOT NULL,
    sample_size INT,
    methodology VARCHAR(200),
    margin_of_error DECIMAL(4,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_survey_date (survey_date)
);

-- 世論調査結果テーブル
CREATE TABLE poll_results (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    poll_id BIGINT NOT NULL,
    party_id VARCHAR(20) NOT NULL,
    support_rate DECIMAL(5,2) NOT NULL, -- 支持率（%）
    seat_prediction INT, -- 議席予測
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    FOREIGN KEY (party_id) REFERENCES parties(id),
    UNIQUE KEY unique_poll_party (poll_id, party_id)
);

-- ユーザーお気に入りテーブル
CREATE TABLE user_favorites (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_session VARCHAR(100) NOT NULL, -- セッションID
    item_type ENUM('news', 'candidate') NOT NULL,
    item_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_session (user_session),
    INDEX idx_item (item_type, item_id)
);

-- 議席予測履歴テーブル
CREATE TABLE prediction_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    party_id VARCHAR(20) NOT NULL,
    predicted_seats INT NOT NULL,
    confidence_level DECIMAL(4,2),
    prediction_date DATE NOT NULL,
    model_version VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (party_id) REFERENCES parties(id),
    INDEX idx_prediction_date (prediction_date)
);

-- 初期データ挿入
INSERT INTO parties (id, name, full_name, color) VALUES
('ldp', '自民党', '自由民主党', '#FF6B6B'),
('cdp', '立憲民主党', '立憲民主党', '#4ECDC4'),
('komeito', '公明党', '公明党', '#45B7D1'),
('dpfp', '国民民主党', '国民民主党', '#BB8FCE'),
('jcp', '共産党', '日本共産党', '#EC7063'),
('ishin', '日本維新の会', '日本維新の会', '#F7DC6F'),
('reiwa', 'れいわ新選組', 'れいわ新選組', '#85C1E9'),
('sanseito', '参政党', '参政党', '#F8C471');