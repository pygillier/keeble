# Writer

```{note}
"Writer" describes document-authoring tasks available to any **editor**
account. For account setup and member management, see {doc}`admin`.
```

## Creating a document

From the home page, editors see a **+** button that opens the document
editor. Each document has:

- A **title**
- **Tags**, used for browsing and filtering
- **Markdown content**, written in the editor's text pane with a live
  preview alongside it

## Step-guide format

Keeble renders documents as accordion-style step guides. Each `##` heading in
your Markdown becomes a collapsible step, so structure long guides like
this:

```markdown
## Turn off the router

Unplug the power cable and wait 10 seconds.

## Turn it back on

Plug the power cable back in and wait for the lights to stabilize.
```

Content before the first `##` heading is shown as an introduction above the
steps.

## Images

The editor supports uploading images directly — drag and drop or use the
upload button. Uploaded images are inserted into the Markdown as standard
image links and stored in the server's uploads volume.

## Draft vs. published

Documents are created as **drafts** by default. Drafts are visible only to
editors; readers cannot see them (they don't even appear as "restricted" —
they're simply not returned to readers at all). Publish a document to make it
visible to everyone in the family, including readers.

## Editing and deleting

Existing documents can be reopened from their detail page via the **Edit**
link (visible only to editors). Deleting a document removes it permanently,
including its association with any tags.
