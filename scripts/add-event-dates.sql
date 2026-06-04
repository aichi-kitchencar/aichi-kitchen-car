-- listings テーブルに出店日程配列カラムを追加
ALTER TABLE listings ADD COLUMN IF NOT EXISTS event_dates date[];

-- 既存レコードのバックフィル
UPDATE listings
SET event_dates =
  CASE
    WHEN event_end_date IS NOT NULL AND event_end_date != event_date
      THEN ARRAY[event_date, event_end_date]
    ELSE ARRAY[event_date]
  END
WHERE event_dates IS NULL;
