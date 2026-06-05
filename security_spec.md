# Firebase Security Specification (TDD)

## 1. Data Invariants
- **Identity Integrity**: All writes (`create`, `update`, `delete`) on `custom_ahsp` or `custom_components` must be performed by the authenticated owner (`userId` must match `request.auth.uid`).
- **Input Type & Format Safety**: Indeks/coefficient and pricing values must be non-negative. All IDs must be valid (`isValidId`).
- **Timestamp Integrity**: All `createdAt` and `updatedAt` properties must strictly reference `request.time`.
- **Verified Email Access**: Access to perform modifications must be granted only to users with verified emails (`email_verified == true`).

## 2. The "Dirty Dozen" Threat Payloads
Here are 12 specific payloads designed to breach protection:
1. **Unauthenticated Read**: Attempt to read `/custom_ahsp/A.2.2.1-custom` with `request.auth == null` (Expect `PERMISSION_DENIED`).
2. **Unauthenticated Component Edit**: Attempt to create a component at `/custom_components/sand` with `request.auth == null` (Expect `PERMISSION_DENIED`).
3. **Spoofed Owner ID (Create)**: Authenticated user `user_X` tries to write `userId: "user_Y"` (Expect `PERMISSION_DENIED`).
4. **Spoofed Owner ID (Update)**: Attempt to update `userId` of an existing AHSP from `"user_X"` to `"user_Z"` (Expect `PERMISSION_DENIED`).
5. **Ghost Field Injection**: Adding an unwhitelisted field `isAdmin: true` onto a profile update payload (Expect `PERMISSION_DENIED`).
6. **Negative Value Poisoning**: Write a component with `defaultPrice: -50000` (Expect `PERMISSION_DENIED`).
7. **Privilege Escalation via Email Spoofing**: User auth contains admin email address, but `email_verified == false` (Expect `PERMISSION_DENIED`).
8. **Invalid ID Character Poisoning**: Writing a resource ID with malicious characters like `/../../` or too long (> 128 characters) (Expect `PERMISSION_DENIED`).
9. **Timestamp Spoofing**: Attempting to supply a manually typed `2026-01-01` instead of `request.time` (Expect `PERMISSION_DENIED`).
10. **Immutable Field Mutability (createdAt)**: Trying to update the structural immutable field `createdAt` (Expect `PERMISSION_DENIED`).
11. **Excessive String Poisoning**: Setting descriptive text length beyond 10,000 characters to trigger denial of wallet (Expect `PERMISSION_DENIED`).
12. **Blanket Collection Scraping**: Listing `/custom_ahsp` without a specific filter matches `resource.data.userId == request.auth.uid` (Expect `PERMISSION_DENIED`).

## 3. Test Runner Design
We secure the Firestore environment through rigorous rules verification. All 12 threat vectors above will evaluate to `PERMISSION_DENIED` thanks to our fortress-level ruleset.
