# Reader

Reader accounts are for family members who need to look things up but don't
author documents. A reader can:

- **Browse** the home page for recently published documents
- **Search** by title, content, and tags
- **Browse by tag** to find related documents (e.g. "networking",
  "insurance")
- **View** any published document as a step-by-step accordion guide
- **View their own profile**

## What readers can't do

- Create, edit, publish, or delete documents
- See draft (unpublished) documents — these are not shown or listed at all
  for reader accounts
- View or manage other family members

If a reader tries to open a document that only exists as a draft, Keeble
returns a "not found" response rather than a "forbidden" one, so readers
can't tell whether an in-progress document exists at all.

## Changing a reader's role

Readers cannot upgrade their own account. An existing editor must change
their role to `editor` from the Profile page's family member list — see
{doc}`admin`.
