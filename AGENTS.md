<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application architecture
- Keep Prototype 1 in a browser-safe reducer-driven experience mounted at the index route; this makes impossible transitions guardable without backend dependencies.
- Keep scoring and signature selection in a pure model, instruments in their own module, and portal drawing and opt-in audio in isolated browser effects; this keeps local mechanics testable and SSR safe.
- Express visual styling through the global semantic design system; runtime inline properties may only specify instrument geometry and numeric effect progress.
