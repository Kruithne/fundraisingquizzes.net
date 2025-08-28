-- [1] create view
CREATE OR REPLACE VIEW `view_quiz_queries` AS
SELECT
	q.`id`,
	q.`quiz_id`,
	q.`query_user_id`,
	qu.`username` AS `query_username`,
	q.`answer_user_id`,
	au.`username` AS `answer_username`,
	q.`query_text`,
	q.`answer_text`
FROM `quiz_queries` q
LEFT JOIN `users` qu ON q.`query_user_id` = qu.`id`
LEFT JOIN `users` au ON q.`answer_user_id` = au.`id`