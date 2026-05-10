# Backlog: Dormant Account Policy Legal Review

- Date: 2026-05-10
- Milestone: M0/M5
- Status: Open
- Priority: P0 before M5 implementation

## Issue

PRD v0.3 previously described 1-year dormant account conversion and 30-day pre-notice as a legal duty. Current Korean privacy-law practice after the removal of the 개인정보 유효기간제 means this should not be implemented as a mandatory legal workflow without final legal review.

## Current Product Decision

Treat `DORMANT` as a reserved/optional service policy state. MVP does not automatically convert accounts to dormant after 365 days.

## Follow-Up

Before M5, confirm the final policy wording for:

- Whether the service will operate a dormant/account-protection state at all.
- Whether long-inactive users receive notification emails.
- How the policy appears in the privacy policy and admin operation guide.
