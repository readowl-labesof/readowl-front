-- Backfill aggregates from existing tables

-- Chapter.totalViews
UPDATE "Chapter" c
SET "totalViews" = COALESCE(cv.cnt, 0)
FROM (
  SELECT "chapterId", COUNT(*)::int AS cnt
  FROM "ChapterView"
  GROUP BY "chapterId"
) AS cv
WHERE cv."chapterId" = c.id;

-- Book.totalViews
UPDATE "Book" b
SET "totalViews" = COALESCE(v.cnt, 0)
FROM (
  SELECT ch."bookId" AS bid, COUNT(v.*)::int AS cnt
  FROM "ChapterView" v
  JOIN "Chapter" ch ON ch.id = v."chapterId"
  GROUP BY ch."bookId"
) AS v
WHERE v.bid = b.id;

-- Book rating aggregates
WITH agg AS (
  SELECT "bookId" AS bid,
         COALESCE(SUM("score"), 0)::int AS sum,
         COUNT(*)::int AS cnt,
         CASE WHEN COUNT(*) > 0 THEN AVG("score")::float ELSE 0 END AS avg
  FROM "BookRating"
  GROUP BY "bookId"
)
UPDATE "Book" b
SET "ratingSum" = a.sum,
    "ratingCount" = a.cnt,
    "ratingAvg" = a.avg
FROM agg a
WHERE a.bid = b.id;
