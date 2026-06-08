-- 添加一个不需要审核的宗门数据
INSERT INTO clans (name, description, logo, level, members_count, contribution, leader_name, leader_id, status, location, max_members, required_level, spirit_stone)
VALUES (
    '自由门',
    '一个开放的宗门，欢迎所有修士加入，不需要审核，直接加入即可。',
    'https://example.com/logo.png',
    1,
    0,
    0,
    '自由宗主',
    1,
    'active',
    '自由之地',
    100,
    1,
    1000
);

-- 设置宗门成员默认不需要审核
UPDATE clan_member SET is_approved = 1 WHERE is_approved IS NULL;