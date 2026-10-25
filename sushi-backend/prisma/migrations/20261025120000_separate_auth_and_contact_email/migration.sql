-- Old email values could be edited in the profile, so none can be trusted as
-- an authentication identity. Keep them as contact details instead.
-- Existing mixed Google/Telegram identities need individual review: an old
-- email-based link may have joined accounts owned by different people.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM "User"
        WHERE "googleId" IS NOT NULL AND "telegramId" IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'Review existing Google/Telegram linked users before applying this migration';
    END IF;
END $$;

ALTER TABLE "User" ADD COLUMN "contactEmail" TEXT;
UPDATE "User" SET "contactEmail" = "email", "email" = NULL;
