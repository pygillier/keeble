# Admin

```{note}
There is no separate "admin" role in Keeble — this page describes tasks
available to any **editor** account: the first-run setup and ongoing family
member management. For document authoring, see {doc}`writer`.
```

## First-run setup

The first time anyone visits a freshly deployed instance, Keeble shows a
setup wizard instead of the login page. It asks for:

1. **Family name** — the name of your household or group; all documents and
   members created afterward belong to this family
2. **First account** — name, email, and password

The account created here is automatically given the `editor` role. There is
no additional "super admin" tier — every editor has the same permissions.

## Managing family members

Editors can invite, promote/demote, and remove other family members from the
**Profile** page.

- **Invite a member**: add their name, email, and initial role
  (`editor` or `reader`)
- **Change a member's role**: switch between `editor` and `reader` at any
  time
- **Remove a member**: revokes their access immediately

### Self-protection rules

To prevent an account from locking itself out, Keeble blocks two actions:

- An editor **cannot demote their own account** to `reader`
- An editor **cannot delete their own account**

Another editor must perform these actions if needed.

## Multi-tenancy

Each family's documents, members, and tags are fully isolated. Members only
ever see and manage data that belongs to their own family, even though the
deployment may be shared.
