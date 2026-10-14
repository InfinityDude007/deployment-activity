import type { Room } from "../types";

const DBS = {
    mongo: "MongoDB Atlas",
    supa: "Supabase (PostgreSQL)",
    click: "ClickHouse",
};

export const crypt: Room = {
    id: "crypt",
    name: "The Data Crypt",
    topic: "Databases recap",
    fragment: "ED",
    story: "The image deploys itself now, but the portal is an empty shell. Deep in the Data Crypt sit three vaults. Wire each part of the portal to the right one, and keep the keys out of enemy hands.",
    briefing: {
        lead: "Different data, different database. Pick the tool that fits the shape of the job.",
        terms: [
            {
                term: DBS.mongo,
                def: "Stores **documents** (like JSON). Every record can have a different shape, which makes it flexible and quick to change.",
            },
            {
                term: DBS.supa,
                def: "**Tables** with rows & columns and strict **relationships** between them, plus built-in login (auth) and instant APIs.",
            },
            {
                term: DBS.click,
                def: "A **column** store built for **analytics**: crunching millions or billions of rows for dashboards in milliseconds.",
            },
            {
                term: "Secrets",
                def: "Passwords & connection strings never go in code, images or Git. Pass them in at runtime (env vars / GitHub Secrets).",
            },
        ],
    },
    puzzles: [
        {
            id: "db-profiles",
            type: "mcq",
            title: "Vault 1: member profiles",
            prompt: "Each LC adds its **own custom fields** to member profiles. Some track languages, some track skill lists, some track nothing extra. The shape keeps changing. Which vault?",
            points: 100,
            options: [
                {
                    text: DBS.mongo,
                    correct: true,
                    why: "Documents don't need a fixed shape, so each profile can have different fields.",
                },
                {
                    text: DBS.supa,
                    why: "Possible, but you'd keep altering table columns. Strict tables fight constantly-changing shapes.",
                },
                {
                    text: DBS.click,
                    why: "ClickHouse is for analysing huge volumes of events, not editing individual profiles.",
                },
            ],
            hints: ["Which one stores flexible, JSON-like documents?"],
            debrief: "Flexible, evolving shape → document database (MongoDB).",
        },
        {
            id: "db-applications",
            type: "mcq",
            title: "Vault 2: applications",
            prompt: "Members log in and **apply** to opportunities. Every application must link exactly one member to one opportunity in one LC, with no orphans and no duplicates. Which vault?",
            points: 100,
            options: [
                {
                    text: DBS.supa,
                    correct: true,
                    why: "Relationships + constraints + built-in auth is exactly what Postgres/Supabase is great at.",
                },
                {
                    text: DBS.mongo,
                    why: "You can fake links in documents, but enforcing strict relationships is harder.",
                },
                {
                    text: DBS.click,
                    why: "ClickHouse isn't built for transactional writes with strict relationships or user logins.",
                },
            ],
            hints: [
                "Strict links between tables + logins. Which one has both relations and auth built in?",
            ],
            debrief:
                "Strict relationships and user accounts → relational database (Supabase/Postgres).",
        },
        {
            id: "db-analytics",
            type: "mcq",
            title: "Vault 3: the global dashboard",
            prompt: 'MCs want a live dashboard over **50 million** page-view events: "sign-ups per country per day", loading in under a second. Which vault?',
            points: 100,
            options: [
                {
                    text: DBS.click,
                    correct: true,
                    why: "Column storage + aggregation over huge event tables is ClickHouse's whole job.",
                },
                {
                    text: DBS.supa,
                    why: "Postgres can do it at small scale, but 50M-row aggregations in under a second is where it struggles.",
                },
                {
                    text: DBS.mongo,
                    why: "Mongo is great for documents, but not for heavy analytics over massive event logs.",
                },
            ],
            hints: [
                "Which one is built for analytics on huge numbers of rows?",
            ],
            debrief:
                "Massive event volumes + aggregations → analytics/column database (ClickHouse).",
        },
        {
            id: "secrets",
            type: "mcq",
            title: "Guard the keys",
            prompt: "The container needs `DATABASE_URL` (which contains the DB password). The saboteur is watching the repo. Where should it live?",
            points: 150,
            options: [
                {
                    text: "In a GitHub Actions secret / the host's env settings, passed in at runtime: `docker run -e DATABASE_URL=… image`",
                    correct: true,
                    why: "Secrets are injected when the container starts, so they're never stored in the image or Git history.",
                },
                {
                    text: "Hard-coded in the Dockerfile: `ENV DATABASE_URL=postgres://admin:pass@…`",
                    why: "Anyone who pulls the image can read it. Images are shareable by design!",
                },
                {
                    text: "In a `.env` file committed to the repo.",
                    why: "Git history is forever. Once pushed, assume the password is leaked.",
                },
                {
                    text: "In the image tag: `portal:admin-pass`",
                    why: "Tags are public labels. Creative, but no 😅",
                },
            ],
            hints: [
                "Images and Git repos get shared. The secret should be added only when the container starts.",
            ],
            debrief:
                "Build the image once with **no secrets inside**; inject secrets at runtime. Same image, different secrets for dev, staging and prod.",
        },
    ],
};
