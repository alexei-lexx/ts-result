# ts-result

A lightweight `Result<TData, TError>` type for TypeScript.
Installed via GitHub, not published to npm — `dist/` is committed.

## Communication Style

Be concise. Skip affirmations and preambles.

## Think Before Coding

Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

- State your assumptions explicitly; if uncertain, ask
- If multiple interpretations exist, present them — don't pick silently
- If a simpler approach exists, say so; push back when warranted
- If something is unclear, stop and ask — name what's confusing

## Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked
- No abstractions for single-use code
- No "flexibility" or "configurability" that wasn't requested
- No error handling for impossible scenarios
- If you write 200 lines and it could be 50, rewrite it

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting
- Don't refactor things that aren't broken
- Match existing style, even if you'd do it differently
- If you notice unrelated dead code, mention it — don't delete it

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused
- Don't remove pre-existing dead code unless asked

The test: every changed line should trace directly to the user's request.

## Execution Boundaries

**Act only on explicit instructions:** Execute only when the user says "implement," "create," "build," "write," or "generate." Otherwise, critique and advise.

**No code changes without being asked:** For informational questions ("where is X?", "what does Y do?"), answer without touching files.

**No commits without permission:** Never commit changes unless explicitly asked.

## Code Style

All generated or manually written TypeScript code MUST adhere to strict type safety and code quality standards.

- Avoid non-null assertions (`!`) unless absolutely necessary
  - Acceptable when indexing an array (or similar structure) at a position already proven to be within bounds elsewhere in the code, even though TypeScript can't track that proof
  - In other cases when used, document the reason
- Avoid type assertions (`as any`) unless absolutely necessary
  - Document the reason when used
- Avoid unnecessary type checks (`typeof`, non-null checks, non-undefined checks) when the provided type is explicit and doesn't require such checks
- Use descriptive names for all variables, methods, parameters, and types
  - Avoid single-character names (except standard loop indices: `i`, `j`, `k`)
  - Avoid abbreviated forms that obscure meaning
  - Avoid shortened versions (e.g., use `user` instead of `usr`, `transaction` instead of `tx`)
  - Keep names concise while prioritizing clarity over brevity
- Use the following arguments rules
  - For functions with 0–2 arguments, use positional arguments for simplicity
  - For functions with 3 or more arguments, use keyword arguments (object destructuring)
- Enum-like values MUST be modeled as `as const` string-union types, not TypeScript `enum`
  - Members MUST use UPPER_CASE
  - Members MUST be either sorted alphabetically or follow a meaningful order (e.g. a workflow sequence)
- **Test files**: `describe` blocks MUST mirror the method order of the source class

## Writing Style

Applies to all generated text: code comments, commit messages, and markdown docs.

- Prefer short sentences over long compound ones
- Use common words over rare ones
- Avoid vague and filler phrases
- One sentence per bullet, no period at the end
- Break lines at punctuation or logical boundaries, never mid-phrase
  - e.g. don't split a noun from its adjective
- Lines MUST NOT exceed the project's line-length convention

## Git

- Commits MUST NOT mention AI authorship — write on behalf of a human developer
