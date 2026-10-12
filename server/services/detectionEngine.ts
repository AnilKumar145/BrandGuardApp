import { BrandProfile, Detection, RiskLevel, SignalBreakdown } from '../../src/types';

// Levenshtein distance calculation
export function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = Array.from({ length: bn + 1 }, () => new Array(an + 1).fill(0));
  for (let i = 0; i <= an; i++) matrix[0][i] = i;
  for (let j = 0; j <= bn; j++) matrix[j][0] = j;

  for (let j = 1; j <= bn; j++) {
    for (let i = 1; i <= an; i++) {
      if (b.charAt(j - 1).toLowerCase() === a.charAt(i - 1).toLowerCase()) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1, // substitution
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i] + 1      // deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

// Calculate name similarity 0 - 100
export function calculateNameSimilarity(target: string, brandName: string): number {
  const t = target.toLowerCase().replace(/[^a-z0-9]/g, '');
  const b = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!t || !b) return 0;
  if (t === b) return 100;

  const dist = levenshteinDistance(t, b);
  const maxLen = Math.max(t.length, b.length);
  const ratio = Math.max(0, 1 - dist / maxLen);

  // Check substring containment
  const containsBrand = t.includes(b) || b.includes(t);
  const bonus = containsBrand ? 0.3 : 0;

  return Math.min(100, Math.round((ratio * 0.7 + bonus) * 100));
}

// Check homoglyph & lookalike substitutions
export function detectLookalikePatterns(text: string, brandName: string): { bonus: number; reasons: string[] } {
  let bonus = 0;
  const reasons: string[] = [];
  const lower = text.toLowerCase();
  const normalizedBrand = brandName.toLowerCase();

  // Character substitution: 1 -> i, 0 -> o, vv -> w, 5 -> s, @ -> a
  if (/1/g.test(lower) && normalizedBrand.includes('i')) {
    bonus += 8;
    reasons.push('Homoglyph substitution: digit "1" replacing letter "i"');
  }
  if (/0/g.test(lower) && normalizedBrand.includes('o')) {
    bonus += 8;
    reasons.push('Homoglyph substitution: digit "0" replacing letter "o"');
  }
  if (/ı/.test(text)) {
    bonus += 10;
    reasons.push('Unicode dotless "ı" (U+0131) homoglyph detected');
  }
  if (lower.includes(`${normalizedBrand}-`) || lower.includes(`${normalizedBrand}_`)) {
    bonus += 6;
    reasons.push(`Hyphenated/underscored variant format (${normalizedBrand}-...)`);
  }

  // Keywords that scammers frequently attach to brand names
  const scamKeywords = ['support', 'help', 'desk', 'official', 'service', 'care', 'outlet', 'clearance', 'refund', 'raffle', 'bot', 'crypto'];
  const matchedKeywords = scamKeywords.filter((kw) => lower.includes(kw));
  if (matchedKeywords.length > 0) {
    bonus += Math.min(8, matchedKeywords.length * 3);
    reasons.push(`Suspicious brand-adjacent keywords detected: ${matchedKeywords.join(', ')}`);
  }

  return { bonus: Math.min(20, bonus), reasons };
}

// Check official asset exclusion (Must return true if candidate is official, ensuring 100% false-positive immunity)
export function isOfficialAssetExcluded(
  candidate: { platform: string; handleOrPackage: string; sourceType: 'social' | 'app_store' },
  brand: BrandProfile
): boolean {
  const normHandle = candidate.handleOrPackage.toLowerCase().replace(/^@/, '').trim();

  if (candidate.sourceType === 'social') {
    return brand.officialSocialAccounts.some((acc) => {
      const accNorm = acc.handle.toLowerCase().replace(/^@/, '').trim();
      return acc.platform === candidate.platform && accNorm === normHandle;
    });
  } else {
    return brand.officialApps.some((app) => {
      const appPkg = app.packageId.toLowerCase().trim();
      return app.store === candidate.platform && appPkg === normHandle;
    });
  }
}

// Compute composite risk score
export function evaluateRiskScore(
  nameSimilarity: number,
  logoSimilarity: number,
  descriptionSimilarity: number,
  lookalikeBonus: number,
  publisherMismatchPenalty: number = 0
): { score: number; level: RiskLevel } {
  // Weights matching PRD & TDD specifications:
  // Weighted baseline: 35% Name + 25% Logo + 20% Description + Lookalike Bonus + Publisher Mismatch
  const base = nameSimilarity * 0.35 + logoSimilarity * 0.25 + descriptionSimilarity * 0.20;
  const rawScore = Math.min(100, Math.round(base + lookalikeBonus + publisherMismatchPenalty));
  const score = Math.max(10, rawScore);

  let level: RiskLevel = 'low';
  if (score >= 80) level = 'high';
  else if (score >= 50) level = 'medium';

  return { score, level };
}
