-- 5 commandes SQL pour insérer des parties avec des données aléatoires
-- Exécutez ces commandes dans votre base de données SQLite

-- Partie 1: Pong 1v1 terminée
INSERT INTO games (uuid, game_type, player1, player2, users_needed, ai, start_time, end_time, winner) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'pong',
    'alice',
    'bob',
    2,
    0,
    '1703123456789',
    '1703123567890',
    'alice'
);

-- Partie 2: Block 1v1 terminée
INSERT INTO games (uuid, game_type, player1, player2, users_needed, ai, start_time, end_time, winner) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    'block',
    'charlie',
    'david',
    2,
    0,
    '1703124000000',
    '1703124100000',
    'david'
);

-- Partie 3: Pong 2v2 terminée
INSERT INTO games (uuid, game_type, player1, player2, player3, player4, users_needed, ai, start_time, end_time, winner) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    'pong',
    'emma',
    'frank',
    'grace',
    'henry',
    4,
    0,
    '1703125000000',
    '1703125200000',
    'emma'
);

-- Partie 4: Pong 1v1 contre IA terminée
INSERT INTO games (uuid, game_type, player1, player2, users_needed, ai, start_time, end_time, winner) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440004',
    'pong',
    'isabella',
    'AI_Player',
    2,
    1,
    '1703126000000',
    '1703126100000',
    'isabella'
);

-- Partie 5: Block 1v1 en cours (pas de winner ni end_time)
INSERT INTO games (uuid, game_type, player1, player2, users_needed, ai, start_time) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440005',
    'block',
    'jack',
    'kate',
    2,
    0,
    '1703127000000'
);

-- Bonus: Quelques parties supplémentaires pour avoir plus de données

-- Partie 6: Pong 1v1 terminée
INSERT INTO games (uuid, game_type, player1, player2, users_needed, ai, start_time, end_time, winner) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440006',
    'pong',
    'lucas',
    'maria',
    2,
    0,
    '1703128000000',
    '1703128100000',
    'maria'
);

-- Partie 7: Block 1v1 terminée
INSERT INTO games (uuid, game_type, player1, player2, users_needed, ai, start_time, end_time, winner) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440007',
    'block',
    'nina',
    'oliver',
    2,
    0,
    '1703129000000',
    '1703129100000',
    'nina'
);

-- Partie 8: Pong 2v2 terminée
INSERT INTO games (uuid, game_type, player1, player2, player3, player4, users_needed, ai, start_time, end_time, winner) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440008',
    'pong',
    'paul',
    'quinn',
    'rachel',
    'sam',
    4,
    0,
    '1703130000000',
    '1703130200000',
    'paul'
);

-- Partie 9: Block contre IA terminée
INSERT INTO games (uuid, game_type, player1, player2, users_needed, ai, start_time, end_time, winner) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440009',
    'block',
    'tina',
    'AI_Player',
    2,
    1,
    '1703131000000',
    '1703131100000',
    'AI_Player'
);

-- Partie 10: Pong 1v1 terminée (partie récente)
INSERT INTO games (uuid, game_type, player1, player2, users_needed, ai, start_time, end_time, winner) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440010',
    'pong',
    'ursula',
    'victor',
    2,
    0,
    '1703132000000',
    '1703132100000',
    'victor'
);

-- Parties pour l'utilisateur "q" - pour tester getUserGameHistory

-- Partie 11: q joue Pong 1v1 et gagne
INSERT INTO games (uuid, game_type, player1, player2, users_needed, ai, start_time, end_time, winner) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440011',
    'pong',
    'polo',
    'alice',
    2,
    0,
    '1703133000000',
    '1703133100000',
    'polo'
);

-- Partie 12: q joue Block 1v1 et perd
INSERT INTO games (uuid, game_type, player1, player2, users_needed, ai, start_time, end_time, winner) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440012',
    'block',
    'bob',
    'polo',
    2,
    0,
    '1703134000000',
    '1703134100000',
    'bob'
);

-- Partie 13: q joue Pong 2v2 et gagne
INSERT INTO games (uuid, game_type, player1, player2, player3, player4, users_needed, ai, start_time, end_time, winner) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440013',
    'pong',
    'polo',
    'charlie',
    'david',
    'emma',
    4,
    0,
    '1703135000000',
    '1703135200000',
    'polo'
);

-- Partie 14: q joue contre IA et gagne
INSERT INTO games (uuid, game_type, player1, player2, users_needed, ai, start_time, end_time, winner) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440014',
    'pong',
    'polo',
    'AI_Player',
    2,
    1,
    '1703136000000',
    '1703136100000',
    'polo'
);

-- Partie 15: q joue Block 1v1 et gagne
INSERT INTO games (uuid, game_type, player1, player2, users_needed, ai, start_time, end_time, winner) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440015',
    'block',
    'polo',
    'frank',
    2,
    0,
    '1703137000000',
    '1703137100000',
    'polo'
);

-- Partie 16: q joue Pong 1v1 et perd
INSERT INTO games (uuid, game_type, player1, player2, users_needed, ai, start_time, end_time, winner) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440016',
    'pong',
    'grace',
    'polo',
    2,
    0,
    '1703138000000',
    '1703138100000',
    'grace'
);

-- Partie 17: q joue Block contre IA et perd
INSERT INTO games (uuid, game_type, player1, player2, users_needed, ai, start_time, end_time, winner) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440017',
    'block',
    'polo',
    'AI_Player',
    2,
    1,
    '1703139000000',
    '1703139100000',
    'AI_Player'
);

-- Partie 18: q joue Pong 2v2 et perd
INSERT INTO games (uuid, game_type, player1, player2, player3, player4, users_needed, ai, start_time, end_time, winner) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440018',
    'pong',
    'henry',
    'polo',
    'isabella',
    'jack',
    4,
    0,
    '1703140000000',
    '1703140200000',
    'henry'
);

-- Partie 19: q joue Block 1v1 et gagne (partie récente)
INSERT INTO games (uuid, game_type, player1, player2, users_needed, ai, start_time, end_time, winner) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440019',
    'block',
    'polo',
    'kate',
    2,
    0,
    '1703141000000',
    '1703141100000',
    'polo'
);

-- Partie 20: q joue Pong 1v1 et gagne (partie très récente)
INSERT INTO games (uuid, game_type, player1, player2, users_needed, ai, start_time, end_time, winner) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440020',
    'pong',
    'polo',
    'lucas',
    2,
    0,
    '1703142000000',
    '1703142100000',
    'polo'
); 