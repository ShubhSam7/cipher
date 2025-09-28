export function isValidCollegeId(email: string): boolean {
  const collegeEmailPatterns = [
    /@.*\.edu$/,           // Generic .edu domains
    /@student\..*\.edu$/,  // Student subdomains
    /@iiitn.ac.in$/        //IIITN college student verification
  ]
  
  return collegeEmailPatterns.some(pattern => pattern.test(email))
}

export function extractCollegeCode(email: string): string {
  const domain = email.split('@')[1]
  return domain.replace(/\./g, '_') // Convert to safe identifier
}