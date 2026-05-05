# Security policy

## Reporting a vulnerability

If you believe you have found a security vulnerability in `app-store-badges` (any package), **please do not open a public GitHub issue.**

Instead, report it privately by either:

- Emailing **dev@rewilok.com** with a description of the issue and a reproduction, or
- Using GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability) on the repository (if enabled).

Please include:

- Affected package(s) and version(s).
- A clear description of the vulnerability and its impact.
- Steps to reproduce, or a minimal proof-of-concept.
- Any suggested mitigation, if you have one.

You can expect:

- An acknowledgement within **5 business days**.
- A status update within **15 business days**, including a tentative fix timeline.
- Credit in the published advisory (if you wish), once a fix is released.

## Supported versions

While the library is pre-1.0, only the **latest 0.x minor release** of each published package receives security fixes. After a 1.0 release, this policy will be updated to cover the latest major and the most recent prior major.

| Package | Supported |
| --- | --- |
| `@rewilok/app-store-badges` | latest 0.x minor |
| `@rewilok/app-store-badges-react` | latest 0.x minor |
| `@rewilok/app-store-badges-vue` | latest 0.x minor |
| `@rewilok/app-store-badges-angular` | latest 0.x minor |

## Scope

This policy covers the source code shipped in this repository. The badge artwork itself is the property of Apple Inc. and Google LLC; trademark or brand-guideline concerns about that artwork should be raised with the respective owner, not with this project.
