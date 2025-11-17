-- Add nullable slug column then backfill and set NOT NULL
ALTER TABLE "Book"
  ADD COLUMN IF NOT EXISTS "slug" VARCHAR(220);

-- Backfill from title using a simple transliteration/slugify in SQL (lowercase, hyphens)
-- Note: this is a simplistic slug; for complex cases rely on app-level slugify during writes
UPDATE "Book"
SET "slug" = lower(regexp_replace(regexp_replace("title", '\\s+', '-', 'g'), '[^a-z0-9\-]', '', 'g'))
WHERE "slug" IS NULL;

-- Ensure uniqueness by appending short suffix when conflicts occur
-- Loop-style dedupe in SQL: attempt to fix duplicates by adding -<shortid>
WITH dups AS (
  SELECT "slug", array_agg("id") AS ids
  FROM "Book"
  GROUP BY "slug"
  HAVING COUNT(*) > 1
), fix AS (
  SELECT b."id", b."slug", (b."slug" || '-' || substr(md5(b."id"), 1, 6)) AS new_slug,
         row_number() OVER (PARTITION BY b."slug" ORDER BY b."id") AS rn
  FROM "Book" b
  JOIN dups d ON d."slug" = b."slug"
)
UPDATE "Book" b
SET "slug" = f.new_slug
FROM fix f
WHERE f."id" = b."id" AND f.rn > 1;

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS "Book_slug_key" ON "Book"("slug");

-- Finally set NOT NULL (if your data guarantees slug exists for all rows)
ALTER TABLE "Book" ALTER COLUMN "slug" SET NOT NULL;
