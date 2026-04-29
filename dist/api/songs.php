<?php
// public/api/songs.php
// Endpoint that serves songs data. If DB config is available and connection succeeds,
// the endpoint will use MySQL; otherwise it falls back to the static JSON file.

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

// Try to load DB config if present
$configPath = __DIR__ . '/config.php';
$dbConfig = null;
if (file_exists($configPath)) {
    $cfg = include $configPath;
    if (is_array($cfg) && isset($cfg['db'])) {
        $dbConfig = $cfg['db'];
    }
}

// Read query parameters
$id = isset($_GET['id']) ? intval($_GET['id']) : null;
$category = isset($_GET['category']) ? trim($_GET['category']) : null;
$q = isset($_GET['q']) ? trim($_GET['q']) : null;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : null;

// If DB config exists, try to use MySQL (PDO)
if ($dbConfig) {
    try {
        $dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s',
            $dbConfig['host'], $dbConfig['dbname'], $dbConfig['charset'] ?? 'utf8mb4'
        );
        $pdo = new PDO($dsn, $dbConfig['user'], $dbConfig['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);

        if ($id !== null) {
            $stmt = $pdo->prepare('SELECT * FROM songs WHERE id = :id LIMIT 1');
            $stmt->execute([':id' => $id]);
            $row = $stmt->fetch();
            if ($row) {
                echo json_encode($row, JSON_UNESCAPED_UNICODE);
                exit;
            }
            http_response_code(404);
            echo json_encode(['error' => 'song not found']);
            exit;
        }

        $where = [];
        $params = [];
        if ($category !== null && $category !== '') {
            $where[] = 'LOWER(category) = LOWER(:category)';
            $params[':category'] = $category;
        }
        if ($q !== null && $q !== '') {
            $where[] = '(title LIKE :q OR artist LIKE :q)';
            $params[':q'] = '%' . $q . '%';
        }

        $sql = 'SELECT * FROM songs';
        if (count($where) > 0) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY id ASC';
        if ($limit !== null && $limit > 0) {
            $sql .= ' LIMIT ' . intval($limit);
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();
        echo json_encode($rows, JSON_UNESCAPED_UNICODE);
        exit;
    } catch (PDOException $e) {
        // If DB connection fails, fallback to JSON file. Do not expose DB details.
        error_log('DB error in api/songs.php: ' . $e->getMessage());
    }
}

// Fallback: read the static JSON file
$jsonPath = realpath(__DIR__ . '/../../src/data/songs.json');
if (!$jsonPath || !file_exists($jsonPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'songs.json not found on server']);
    exit;
}

$raw = file_get_contents($jsonPath);
$songs = json_decode($raw, true);
if ($songs === null) {
    http_response_code(500);
    echo json_encode(['error' => 'invalid songs.json content']);
    exit;
}

if ($id !== null) {
    foreach ($songs as $s) {
        if (isset($s['id']) && intval($s['id']) === $id) {
            echo json_encode($s, JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
    http_response_code(404);
    echo json_encode(['error' => 'song not found']);
    exit;
}

$results = array_filter($songs, function ($s) use ($category, $q) {
    if ($category !== null && $category !== '') {
        if (!isset($s['category']) || strcasecmp($s['category'], $category) !== 0) {
            return false;
        }
    }
    if ($q !== null && $q !== '') {
        $qLow = mb_strtolower($q, 'UTF-8');
        $title = isset($s['title']) ? mb_strtolower($s['title'], 'UTF-8') : '';
        $artist = isset($s['artist']) ? mb_strtolower($s['artist'], 'UTF-8') : '';
        if (mb_strpos($title, $qLow) === false && mb_strpos($artist, $qLow) === false) {
            return false;
        }
    }
    return true;
});

$results = array_values($results);
if ($limit !== null && $limit > 0) {
    $results = array_slice($results, 0, $limit);
}

echo json_encode($results, JSON_UNESCAPED_UNICODE);

// EOF
