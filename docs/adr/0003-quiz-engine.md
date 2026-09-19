# ADR-0003: One quiz engine for three quiz shapes

Status: **Accepted** — 19 September 2026
Supersedes: nothing. Related: ADR-0001 (content model), ADR-0002 (vote identity, open)

## Context

The site wants quizzes, and not one kind. Three shapes were asked for
together:

- **Personality.** "Which agency are you." No right answers; each option
  carries weights toward outcomes and the heaviest outcome wins.
- **Scored.** Real questions with real answers and a score at the end.
- **Branching.** Later questions depend on earlier answers — a Bureau intake
  form that escalates based on what you admit to.

The obvious failure mode is three features that happen to share a URL prefix:
three renderers, three result screens, three sets of progress logic, and a
fourth shape later that fits none of them. That is the same mistake the
incident card made when the featured report and the log card drifted apart
(ADR-0001), and it is cheaper to avoid once than to unpick twice.

## Decision

### One question graph, three scoring strategies

A quiz is a list of questions and a **scoring strategy**. The three shapes
differ only in what an option carries and how the end is computed:

| Shape       | Option carries      | End state              |
| ----------- | ------------------- | ---------------------- |
| personality | `weights` per outcome | heaviest outcome       |
| scored      | `correct`           | count of correct       |
| branching   | `next` question id  | whichever outcome it lands on |

These are not exclusive. A branching quiz can also weight outcomes; a scored
quiz can branch. So `next`, `weights` and `correct` all live on the option
type as optional fields, and the strategy is named once at the quiz level to
say how the **result** is computed — not to gate which fields are allowed.
A fourth shape adds a strategy, not a renderer.

Traversal is therefore always the same function: take the current question,
take the chosen option, go to `option.next` if it has one, otherwise the next
question in order. A flat quiz is a branching quiz where no option branches.

### Correct answers never reach the browser

For a scored quiz, shipping `correct: true` to the client means the answers
are in the page source, and "view source" is a faster way to win than
thinking. So the authored quiz and the public quiz are two different
types, and one derives from the other:

```
QuizDefinition  (authored, has `correct`)
      │  publicQuiz()  — strips it
      ▼
PublicQuiz      (what the route serves)
```

Grading for a scored quiz happens in a server function, which reads the
authored definition on the server, where `correct` still exists. The
stripping is a pure function with a test asserting no `correct` key survives
anywhere in the output, because this is exactly the kind of thing that
silently regresses when someone adds a field.

Personality quizzes have no secret — the weights are the joke as much as the
mechanism — so they grade on the client and cost no round trip.

### Results are shareable without a database

A finished quiz encodes its answers into the URL. `/quiz/which-agency?a=02131`
is the whole result: the outcome is recomputed from the answers on load, so a
shared link shows the same result to whoever opens it, with no row written
anywhere.

This matters beyond convenience. Persisting results needs to know who a
person is, which is the question ADR-0002 is still open on and which is
already blocking the polls. Encoding in the URL means the quiz feature does
not join that queue — it ships now, and response *analytics* can be added
later without changing anything a reader sees.

The encoding is positional and compact (one character per answer, base36),
so a 20-question quiz is a 20-character query string. It is tamper-evident
only in the sense that a hand-edited string produces a different valid
result — which is fine, because a personality quiz result is not a claim
about anything. A scored quiz's *score* is never trusted from the URL: the
server grades.

### Content lives in the repo, shaped to move

Quizzes are typed files under `src/content/quiz/`, registered in one index.
The chosen answer to "who authors these" was repo-now, database-later, so
the model is deliberately serializable: every field is JSON, nothing is a
function, no component references. Moving a quiz into a Supabase row is then
a loader change, not a rewrite, and the `QuizDefinition` type becomes the
row's shape.

The cost of this restraint is real: no computed questions, no functions as
weights. That has not been needed yet, and the day it is, the loader can
hydrate.

## Consequences

- One renderer, one progress bar, one result screen, three strategies.
- Scored quizzes need a server round trip to grade. Acceptable: it happens
  once, at the end.
- A quiz cannot currently ask a free-text question that affects the result,
  because free text cannot be positionally encoded into the URL. Free text
  can be collected and shown back, but not scored. If scored free text is
  ever wanted, that is when responses go to the database.
- Because results are URL-encoded, changing a published quiz's questions
  invalidates every link already shared for it. Quizzes are therefore
  append-only once published: add questions at the end, never reorder or
  remove. This is written into the content file's doc comment, and a test
  pins the question count and ids of each published quiz so a careless edit
  fails CI rather than silently breaking shared links.
