export interface CandidateValidator {
  getValidCandidates(candidates: readonly string[]): ReadonlySet<string>
  isBreakpointVariant(variant: string): boolean
}
