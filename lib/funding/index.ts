export interface FundingEligibilityRow {
  id: string;
  qualification_id: string;
  scheme: 'adult_skills_fund' | 'advanced_learner_loan' | 'lifelong_learning_entitlement' | 'apprenticeship_levy';
  learner_conditions?: string;
  covers: 'full' | 'partial' | 'loan_only';
  learner_contribution_gbp: number;
  scheme_valid_from: string; // YYYY-MM-DD
  scheme_valid_to: string;   // YYYY-MM-DD
}

/**
 * Dual Funding Resolver: Selects eligible funding schemes based on course start date.
 * Advanced Learner Loans (ALL) valid through 2027-12-31.
 * Lifelong Learning Entitlement (LLE) valid for courses starting on or after 2027-01-01.
 */
export function resolveFundingEligibility(
  fundingRows: FundingEligibilityRow[],
  courseStartDate: string // YYYY-MM-DD
): {
  eligibleSchemes: FundingEligibilityRow[];
  resolvedSchemeName: string;
  isLoan: boolean;
  notes: string;
} {
  const targetDate = new Date(courseStartDate);

  // Filter rows where courseStartDate falls within scheme_valid_from and scheme_valid_to
  const eligible = fundingRows.filter((row) => {
    const validFrom = new Date(row.scheme_valid_from);
    const validTo = new Date(row.scheme_valid_to);
    return targetDate >= validFrom && targetDate <= validTo;
  });

  if (eligible.length === 0) {
    return {
      eligibleSchemes: [],
      resolvedSchemeName: 'Self-Funded / Commercial Rate',
      isLoan: false,
      notes: `No government funding scheme active for course start date ${courseStartDate}.`,
    };
  }

  // Priority order: Full funding (ASF) > LLE (2027+) > Advanced Learner Loan
  const lleRow = eligible.find((r) => r.scheme === 'lifelong_learning_entitlement');
  const allRow = eligible.find((r) => r.scheme === 'advanced_learner_loan');
  const asfRow = eligible.find((r) => r.scheme === 'adult_skills_fund');

  if (asfRow) {
    return {
      eligibleSchemes: eligible,
      resolvedSchemeName: 'Adult Skills Fund (ASF) — Fully Funded',
      isLoan: false,
      notes: 'Fully funded via ESFA Adult Skills Fund.',
    };
  }

  if (targetDate >= new Date('2027-01-01') && lleRow) {
    return {
      eligibleSchemes: eligible,
      resolvedSchemeName: 'Lifelong Learning Entitlement (LLE)',
      isLoan: true,
      notes: `Eligible for LLE student loan account entitlement for course starting ${courseStartDate}.`,
    };
  }

  if (allRow) {
    return {
      eligibleSchemes: eligible,
      resolvedSchemeName: 'Advanced Learner Loan (ALL)',
      isLoan: true,
      notes: `Eligible for Advanced Learner Loan for course starting ${courseStartDate} (ALL active through Dec 2027).`,
    };
  }

  return {
    eligibleSchemes: eligible,
    resolvedSchemeName: eligible[0].scheme,
    isLoan: eligible[0].covers === 'loan_only',
    notes: `Resolved scheme ${eligible[0].scheme} for start date ${courseStartDate}.`,
  };
}
