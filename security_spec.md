# Firestore Security Specification: Nexon Command Center

## 1. Data Invariants
- **Sessions**: A session cannot be created for a user other than the one currently authenticated. Only the `lastActive` timestamp can be updated by the user.
- **Settings**: Public can only increment `visitorCount`. All other changes require verified Admin status.
- **Messages/Reviews**: Public can create, but never read or delete. Admins have full control.
- **Immutability**: `userId` and `loginTime` in sessions are immutable after creation.
- **Type Safety**: All string fields have strict character limits (e.g., ID < 128 chars, UserAgent < 1000 chars).

## 2. The "Dirty Dozen" (Red Team Attack Payloads)
The following attempts **MUST** be rejected by the rules:
1. **Identity Spoofing**: Attempt to create a session with `userId: "attacker_id"` while logged in as `victim_id`.
2. **Admin Escalation**: Attempt to update a service Category while not in the allowed administrator list.
3. **Ghost Field Injection**: Attempt to create a session with an extra `isAdmin: true` field not in our schema.
4. **Timestamp Manipulation**: Attempt to set `loginTime` to a value in the future instead of using the server time.
5. **Session Hijacking**: Attempt to update another user's session `lastActive` field.
6. **Data Nuking**: Attempt to delete the `settings/global` document.
7. **Bypass Verification**: Attempt to write data using a Google account where `email_verified` is `false`.
8. **Resource Exhaustion**: Sending a 1MB string as a `message` body.
9. **ID Poisoning**: Using a document ID containing malicious characters like `../../secret`.
10. **State Corruption**: Attempting to change `email` in an existing session.
11. **Shadow List**: Attempting to list all messages without being an Admin.
12. **Metadata Tampering**: Attempting to modify the `deviceType` after a session is established.
