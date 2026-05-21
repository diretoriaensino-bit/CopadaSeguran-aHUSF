# Security Specification - Safety Cup

## Data Invariants
1. A Player record must have a valid `name` and `unit`.
2. A Player can only update their own record (locked by `uid`).
3. `goalsCompleted` and `totalScore` must be non-negative integers.
4. `lastUpdated` must be the server time.

## The "Dirty Dozen" Payloads
1. **Identity Spoofing**: Attempt to update another player's record using a different `auth.uid`.
2. **State Shortcutting**: Attempt to set `goalsCompleted` to 100 without completing missions. (Note: difficult to verify fully via rules alone without mission state tracking, but we can ensure basic type and bounds).
3. **Resource Poisoning**: Attempt to inject a 1MB string into the `name` field.
4. **Timestamp Fraud**: Attempt to set `lastUpdated` to a future date from the client.
5. **Orphaned Writes**: Attempt to update a non-existent player record (though creation is allowed).
6. **Key Injection**: Attempt to add a `isAdmin: true` field to the player doc.
7. **Negative Progress**: Attempt to set `goalsCompleted` to -1.
8. **Public Scrape**: Attempt to read all private fields of all users (though most are currently public for ranking).
9. **Mass Delete**: Attempt to delete the `players` collection.
10. **Type Mismatch**: Attempt to send `goalsCompleted` as a string.
11. **ID Junk**: Attempt to create a document with a 2KB long string ID.
12. **Unverified Write**: Attempt to write without being signed in.

## Test Runner
(A `firestore.rules.test.ts` would be created here in a real environment, but I will proceed to generate the rules directly after this spec).
