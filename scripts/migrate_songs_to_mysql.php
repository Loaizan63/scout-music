<?php
// scripts/migrate_songs_to_mysql.php
// Simple migration script: reads src/data/songs.json and inserts/updates rows in MySQL

// Usage: php scripts/migrate_songs_to_mysql.php

$root = dirname(__DIR__);
$configPath = $root . '/public/api/config.php';
if (!file_exists($configPath)) {
    echo "Missing config.php (public/api/config.php).\n";
    exit(1);
}
$cfg = include $configPath;
if (!isset($cfg['db'])) {
    echo "Invalid config.php: no db config.\n";
    exit(1);
}
$db = $cfg['db'];

try {
    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s', $db['host'], $db['dbname'], $db['charset'] ?? 'utf8mb4');
    $pdo = new PDO($dsn, $db['user'], $db['pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
} catch (PDOException $e) {
    echo "DB connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

$jsonPath = $root . '/src/data/songs.json';
if (!file_exists($jsonPath)) {
    echo "songs.json not found at $jsonPath\n";
    exit(1);
}
$raw = file_get_contents($jsonPath);
$songs = json_decode($raw, true);
if ($songs === null) {
    echo "Failed to parse songs.json\n";
    exit(1);
}

// Create table if not exists
$createSql = <<<SQL
CREATE TABLE IF NOT EXISTS songs (
  id INT PRIMARY KEY,
  title TEXT,
  artist TEXT,
  category TEXT,
  duration INT,
  coverUrl TEXT,
  audioUrl TEXT,
  description TEXT
);
SQL;

$pdo->exec($createSql);

$insertSql = "INSERT INTO songs (id, title, artist, category, duration, coverUrl, audioUrl, description) VALUES (:id, :title, :artist, :category, :duration, :coverUrl, :audioUrl, :description)
ON DUPLICATE KEY UPDATE title = VALUES(title), artist = VALUES(artist), category = VALUES(category), duration = VALUES(duration), coverUrl = VALUES(coverUrl), audioUrl = VALUES(audioUrl), description = VALUES(description)";

$stmt = $pdo->prepare($insertSql);
$count = 0;
foreach ($songs as $s) {
    $params = [
        ':id' => isset($s['id']) ? intval($s['id']) : null,
        ':title' => isset($s['title']) ? $s['title'] : null,
        ':artist' => isset($s['artist']) ? $s['artist'] : null,
        ':category' => isset($s['category']) ? $s['category'] : null,
        ':duration' => isset($s['duration']) ? intval($s['duration']) : null,
        ':coverUrl' => isset($s['coverUrl']) ? $s['coverUrl'] : null,
        ':audioUrl' => isset($s['audioUrl']) ? $s['audioUrl'] : null,
        ':description' => isset($s['description']) ? $s['description'] : null,
    ];
    $stmt->execute($params);
    $count++;
}

echo "Migrated $count songs to MySQL (table: songs).\n";
exit(0);
