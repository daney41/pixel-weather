-- Whole Day alert time for User 15
INSERT INTO user_alert_time (user_id, start_time, end_time, is_active)
VALUES (15, '00:00:00', '23:59:59', true);

-- Other alert times for User 15
INSERT INTO user_alert_time (user_id, start_time, end_time, is_active)
VALUES (15, '08:00:00', '12:00:00', false);

INSERT INTO user_alert_time (user_id, start_time, end_time, is_active)
VALUES (15, '13:00:00', '15:00:00', true);

INSERT INTO user_alert_time (user_id, start_time, end_time, is_active)
VALUES (15, '16:00:00', '18:30:00', true);

-- Whole Day alert time for User 16
INSERT INTO user_alert_time (user_id, start_time, end_time, is_active)
VALUES (16, '00:00:00', '23:59:59', true);

-- Other alert times for User 16
INSERT INTO user_alert_time (user_id, start_time, end_time, is_active)
VALUES (16, '07:00:00', '09:00:00', false);

INSERT INTO user_alert_time (user_id, start_time, end_time, is_active)
VALUES (16, '10:00:00', '14:00:00', true);

INSERT INTO user_alert_time (user_id, start_time, end_time, is_active)
VALUES (16, '15:30:00', '17:00:00', false);
