---
"create-t3-app": patch
---

fix: prevent empty input submission in post creation form

- Disable submit button on frontend when input is empty
- Add `.trim()` validation on backend to reject empty/whitespace-only submissions
