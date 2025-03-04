-- CreateTable
CREATE TABLE "ReportHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "reportType" TEXT NOT NULL,
    "reportName" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReportHistory_userId_idx" ON "ReportHistory"("userId");

-- AddForeignKey
ALTER TABLE "ReportHistory" ADD CONSTRAINT "ReportHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
