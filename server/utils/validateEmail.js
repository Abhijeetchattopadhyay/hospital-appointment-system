function getEditDistance(s1, s2) {
  const len1 = s1.length;
  const len2 = s2.length;
  let prevRow = Array(len2 + 1).fill(0).map((_, i) => i);
  let currRow = Array(len2 + 1).fill(0);

  for (let i = 0; i < len1; i++) {
    currRow[0] = i + 1;
    for (let j = 0; j < len2; j++) {
      const cost = s1[i] === s2[j] ? 0 : 1;
      currRow[j + 1] = Math.min(
        currRow[j] + 1,        // insertion
        prevRow[j + 1] + 1,    // deletion
        prevRow[j] + cost      // substitution
      );
    }
    prevRow = [...currRow];
  }
  return prevRow[len2];
}

const validateEmail = (email) => {
  if (!email) return false;
  const trimmedEmail = email.trim();
  
  // 1. Basic format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmedEmail)) return false;

  const domain = trimmedEmail.split('@')[1].toLowerCase();

  // Extract host part (before TLD)
  const parts = domain.split('.');
  let hostParts = parts.slice(0, -1);
  if (parts.length > 2) {
    const last = parts[parts.length - 1];
    const secondLast = parts[parts.length - 2];
    if (['co', 'com', 'org', 'net', 'gov', 'edu'].includes(secondLast) && last.length === 2) {
      hostParts = parts.slice(0, -2);
    }
  }
  const host = hostParts.join('.');

  // Normalize host name by stripping non-alphanumeric chars
  const normalizedHost = host.replace(/[^a-z0-9]/g, '');

  // 2. Prevent typos with non-alphanumeric chars inside common provider domains (e.g. g.mail)
  const commonProviders = ['gmail', 'yahoo', 'outlook', 'hotmail'];
  if (commonProviders.includes(normalizedHost) && host !== normalizedHost) {
    return false;
  }

  // 2b. Enforce strict domain patterns on common email providers to block invalid TLDs (e.g. gmail.co)
  if (normalizedHost === 'gmail') {
    const gmailRegex = /^gmail\.(com|co\.[a-z]{2})$/;
    if (!gmailRegex.test(domain)) return false;
  }
  
  if (normalizedHost === 'yahoo') {
    if (domain === 'yahoo.co') return false;
    const yahooRegex = /^yahoo\.(com|co\.[a-z]{2}|[a-z]{2})$/;
    if (!yahooRegex.test(domain)) return false;
  }

  if (normalizedHost === 'outlook') {
    if (domain === 'outlook.co') return false;
    const outlookRegex = /^outlook\.(com|co\.[a-z]{2}|[a-z]{2})$/;
    if (!outlookRegex.test(domain)) return false;
  }

  if (normalizedHost === 'hotmail') {
    if (domain === 'hotmail.co') return false;
    const hotmailRegex = /^hotmail\.(com|co\.[a-z]{2}|[a-z]{2})$/;
    if (!hotmailRegex.test(domain)) return false;
  }

  // 3. Prevent edit-distance misspelling of common domains, excluding valid alternatives
  const gmailDist = getEditDistance(normalizedHost, 'gmail');
  if (gmailDist > 0 && gmailDist <= 2 && normalizedHost !== 'ymail' && normalizedHost !== 'email') {
    return false;
  }

  const yahooDist = getEditDistance(normalizedHost, 'yahoo');
  if (yahooDist > 0 && yahooDist <= 2 && normalizedHost !== 'ymail') {
    return false;
  }

  const outlookDist = getEditDistance(normalizedHost, 'outlook');
  if (outlookDist > 0 && outlookDist <= 2) {
    return false;
  }

  const hotmailDist = getEditDistance(normalizedHost, 'hotmail');
  if (hotmailDist > 0 && hotmailDist <= 2) {
    return false;
  }

  // 4. Detect common TLD typos
  const tld = parts[parts.length - 1];
  const invalidTlds = ['comm', 'con', 'col', 'c', 'coom', 'cm'];
  if (invalidTlds.includes(tld)) return false;

  return true;
};

export default validateEmail;
