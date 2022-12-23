-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "editable" BOOLEAN NOT NULL DEFAULT true,
    "registration" TEXT,
    "studyClass" TEXT,
    "birth" DATETIME,
    "rg" TEXT,
    "cpf" TEXT,
    "phone" TEXT,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("birth", "cpf", "id", "phone", "registration", "rg", "studyClass", "userId") SELECT "birth", "cpf", "id", "phone", "registration", "rg", "studyClass", "userId" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
