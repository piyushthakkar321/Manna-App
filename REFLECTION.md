# REFLECTION.md — Manna App

## What I Built

**Manna** is a mobile-first daily devotional app that brings together Scripture, prayer, and community in one warm, intentional experience. It includes a rotating daily Bible verse with reflection prompts, an AI Bible companion called Logos powered by Groq's Llama model, a prayer journal with writing prompts, a 90-day reading plan with a heatmap tracker, a community prayer wall, and features like dark mode, audio playback, verse share cards, streak tracking, and push notifications.

The app is live at [manna-app-henna.vercel.app](https://manna-app-henna.vercel.app)

---

## What Was Easy

The UI design came together naturally. The warm earthy palette — parchment, burgundy, dark ink, and gold — created a consistent visual language that made every screen feel cohesive without much deliberate effort. React's component structure kept the code organized even as the feature set grew significantly. localStorage persistence was also surprisingly seamless for handling offline data across the journal, reading plan, streaks, and prayer wall — no backend required for the core experience.

---

## What Was Challenging

The hardest part wasn't writing code — it was deployment. Moving the Groq API key from a frontend environment variable to a Vercel serverless function took several iterations because drag-and-drop deployments don't inject `VITE_` variables the same way connected GitHub deployments do. That distinction isn't obvious until you're staring at "Invalid API Key" on a live app at midnight.

The chat input box was another persistent challenge. Getting it to stay pinned above the tab bar on mobile required revisiting the layout four or five times — `calc` heights, then `position: fixed`, then carefully accounting for the sticky header offset. Mobile layout is unforgiving in ways desktop CSS isn't.

---

## What I Learned

The biggest lesson: **API keys belong on the server, always.** Even in a small personal project. A Vercel serverless function adds maybe twenty lines of code and completely eliminates the exposure risk.

I also learned that mobile-first layout isn't just about small screen sizes — it's about understanding how fixed elements, scroll containers, and viewport heights interact with each other. `minHeight: 0` on a flex child, for example, is one of those things that isn't obvious until you've spent two hours debugging a disappearing input box.

Finally, working iteratively with AI tools taught me the value of specific, precise problem descriptions. Vague prompts get vague fixes. The more exactly I described what was broken — including the exact CSS structure I wanted — the faster and cleaner the solutions came.

---

## What I Would Change

If I started over, I would connect Vercel to GitHub from day one instead of using drag-and-drop. That single decision would have saved hours of debugging environment variable issues.

I would also integrate Supabase for real user authentication early — not as an afterthought. The prayer wall and journal entries currently live only in localStorage, which means they're lost when the browser clears storage or a user switches devices. Real persistence would make Manna genuinely useful rather than just a well-designed prototype.

A service worker for offline support would be the other meaningful addition. A devotional app that doesn't work without internet connection misses a fundamental use case — someone opening it on the subway or in a rural area with poor signal.

The bones are good. The design holds up. The next version just needs a real foundation underneath it.