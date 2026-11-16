# Data+Lab — DSFB Study Space

Static GitHub Pages edition of the Data Science for Business study companion.

Open the published site: https://srslyspeaking.github.io/datalab-dsfb-study/

The published site keeps study progress in the current browser. ChatGPT sign-in and cross-device synchronization are not included in this static edition.

The optional AI tutor is connected through a rate-limited Cloudflare Worker. The OpenAI API key is stored only as a Cloudflare Worker Secret and is never committed to this repository. Worker source and deployment configuration live in [`worker/`](worker/).


## Question bank: 500 exam-style questions

`extra-questions.js` adds 500 original exam-style multiple-choice questions (Chapters 1–10 and Credit Risk lectures 1–2), modelled on the SERIES 4 exam format and linked to the matching slide page. They appear in the 题库 → 真题同型 tab.
