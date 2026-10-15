# Sparklin and image delivery

Sparklin first handles known chemical hazards and device care with deterministic guidance. General cleaning and routine questions use the structured OpenAI Responses integration when `OPENAI_API_KEY` is configured as a secret on the `sparkclean` Worker. The current defaults are `gpt-4o-mini` and `gpt-4o`, overridable with `OPENAI_MODEL` and `OPENAI_FALLBACK_MODEL`. `AI_DISABLED=true` disables provider requests. Existing per-user quotas remain enforced.

The production Worker had no OpenAI key when this issue was investigated. The existing project-local key was subsequently synced to the Worker as a secret; no secret value is committed. In that state, or on provider failure, the API returns `source: "fallback"` and the client labels the answer as a basic guide with AI unavailable. Missing information prompts a material/object clarification instead of an unrelated motivational sentence. Device guidance uses a microfiber cloth, power-off/unplug precautions, no direct spraying, and manufacturer instructions; liquid spills use separate precautions. See [Apple's device care guidance](https://support.apple.com/en-us/103258) and [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs).

The client sends at most four prior messages, capped at 1,000 characters each. The server accepts only user/assistant history, within the existing 8 KB request limit. History is untrusted context; it cannot supply system instructions or UI actions. Replies are displayed without the former third-message procrastination replacement.

## Images

Original artwork lives in `assets/images/`, outside the publicly deployed directory. Run `npm run images:optimize` after editing originals. Sharp generates the committed WebP files and correctly sized 192/512 PNG install icons. The avatar is a separate 128×128 WebP for 40/64 CSS-pixel displays; Pixi textures retain their 500×500 resolution and alpha channel. These static derivatives do not require a Cloudflare Images binding or runtime image transformation.

The original PNG set was 29,929,067 bytes; all generated variants total 413,916 bytes (98.6% smaller). The chat avatar changed from a 6,782,777-byte 2048×2048 PNG to a 3,070-byte 128×128 WebP. These are file-size savings, not a measured Core Web Vitals result.

Regression coverage includes English/Spanish laptop questions, chemical-warning priority, liquid spills, follow-ups, fallback transparency, bounded history, and desktop/mobile browser checks with real local authentication and D1. Local browser tests explicitly set `AI_DISABLED=true` to avoid paid calls and make fallback checks deterministic. Live provider verification is recorded separately from these checks.
