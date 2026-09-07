# Security Specification: Solo Leveling System (Firestore)

## 1. Data Invariants

1. **User Isolation**: All hunter documents (`/users/{userId}`) and their subcollections (`/users/{userId}/quests/{questId}`, `/users/{userId}/dungeons/{dungeonId}`) strictly belong to the authenticated hunter (`request.auth.uid == userId`).
2. **Identity Integrity**: A hunter cannot forge or impersonate another hunter's UID or create/modify data in another hunter's path.
3. **Temporal Integrity**: All creations must timestamp `createdAt` with `request.time`, and all updates must timestamp `updatedAt` with `request.time`.
4. **Volumetric Boundaries**: String inputs (titles, names, notes) are strictly capped in length (`size() <= MAX_LEN`) to prevent Denial of Wallet and storage bloat.
5. **State Progression Gate**: Quest completion cannot be modified by unauthorized third parties; quests must be associated with the valid user.
6. **Immutable Fields**: `id`, `userId`, and `createdAt` cannot be altered upon document updates.

---

## 2. The "Dirty Dozen" Payloads (Adversarial Security Test Cases)

1. **Payload 01 - ID Spoofing on User Profile**:
   Attempt by `attacker_uid` to write to `/users/victim_uid`.
   *Expected Result*: PERMISSION_DENIED.

2. **Payload 02 - Ghost Field Injection (Shadow Update)**:
   Attempt to update a quest with an unauthorized `isAdmin: true` ghost property.
   *Expected Result*: PERMISSION_DENIED.

3. **Payload 03 - Oversized String Payload (Denial of Wallet)**:
   Attempt to insert a quest title exceeding 200 characters or junk strings.
   *Expected Result*: PERMISSION_DENIED.

4. **Payload 04 - Unauthenticated Read**:
   Attempt to read `/users/{userId}` without Firebase Auth credentials.
   *Expected Result*: PERMISSION_DENIED.

5. **Payload 05 - Cross-Hunter Subcollection Listing**:
   Attempt by `attacker_uid` to list `/users/victim_uid/quests`.
   *Expected Result*: PERMISSION_DENIED.

6. **Payload 06 - Malicious Path Variable Traversal**:
   Attempt to access `/users/../system` or malformed ID violating `^[a-zA-Z0-9_\\-]+$`.
   *Expected Result*: PERMISSION_DENIED.

7. **Payload 07 - Client Timestamp Spoofing**:
   Attempt to set `createdAt` to a fabricated past or future client timestamp instead of `request.time`.
   *Expected Result*: PERMISSION_DENIED.

8. **Payload 08 - Immutable ID Overwrite**:
   Attempt to mutate the `id` or `userId` on `/users/{userId}/quests/{questId}`.
   *Expected Result*: PERMISSION_DENIED.

9. **Payload 09 - Orphan Subcollection Creation**:
   Attempt to create a quest for a non-existent user path.
   *Expected Result*: PERMISSION_DENIED.

10. **Payload 10 - Negative Numeric Resource Values**:
    Attempt to set negative values for `gold`, `xp`, or `level`.
    *Expected Result*: PERMISSION_DENIED.

11. **Payload 11 - Arbitrary Catch-All Access**:
    Attempt to read or write to undocumented top-level collections (e.g. `/system_secrets`).
    *Expected Result*: PERMISSION_DENIED (Global Catch-All Default Deny).

12. **Payload 12 - Anonymous / Unverified Privilege Escalation**:
    Attempt by unauthenticated actor to delete another hunter's dungeon record.
    *Expected Result*: PERMISSION_DENIED.

---

## 3. Test Runner Specification (`firestore.rules.test.ts`)

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('Shadow Leveling System Firestore Security Rules', () => {
  it('rejects cross-user profile write', async () => {
    // Assert write fails when auth.uid !== userId
  });
  it('rejects unauthenticated document reads', async () => {
    // Assert read fails when auth is null
  });
  it('rejects ghost fields injection during updates', async () => {
    // Assert affectedKeys prevents ghost fields
  });
  it('rejects timestamp tampering', async () => {
    // Assert createdAt must strictly equal request.time
  });
});
```
