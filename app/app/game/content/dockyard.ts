import type { Room } from "../types";
import { dockerRun, dockerRunNoPort } from "../lib/terminal";

const KEYWORDS = ["FROM", "RUN", "COPY", "CMD", "START", "INSTALL"];

export const dockyard: Room = {
    id: "dockyard",
    name: "The Dockyard",
    topic: "Docker",
    fragment: "DE",
    story: 'You break into the vanished dev\'s workspace. The portal code is here, along with a sticky note: **"works on my machine 🤷"**. It runs nowhere else. Your first job: package it into a container so it runs the same everywhere.',
    briefing: {
        lead: "Docker packages your app **plus everything it needs** (the right Node version, libraries, settings) into one box that runs the same on any computer.",
        terms: [
            {
                term: "Dockerfile",
                def: "A recipe: step-by-step instructions for building the box.",
            },
            {
                term: "Image",
                def: "The finished box built from the recipe. You can copy and share it.",
            },
            {
                term: "Container",
                def: "A running copy of an image. One image can start many containers.",
            },
            {
                term: "Port mapping",
                def: "Containers are sealed. `-p 3000:3000` opens a door: `your-computer-port:container-port`.",
            },
        ],
        cheats: [
            {
                label: "Dockerfile keywords",
                code: "FROM    start from a base image (e.g. node:20)\nWORKDIR move into a folder inside the box\nCOPY    copy files from your computer into the box\nRUN     run a command while BUILDING (e.g. install packages)\nEXPOSE  note which port the app listens on\nCMD     the command to run when the container STARTS",
            },
            {
                label: "Commands",
                code: "docker build -t <name> .            build an image from the Dockerfile here (.)\ndocker run -p <host>:<container> <name>   start a container",
            },
        ],
    },
    puzzles: [
        {
            id: "dockerfile",
            type: "fillblank",
            title: "Repair the recipe",
            prompt: "The saboteur wiped the keywords from the Dockerfile. Pick the right instruction for each blank. Clue: `server.js` calls `app.listen(3000)`.",
            points: 200,
            code: [
                "# Recipe for the AIESEC opportunities portal",
                "[[from]] node:20-alpine",
                "WORKDIR /app",
                "COPY package.json .",
                "[[run]] npm install",
                "[[copy]] . .",
                "EXPOSE [[port]]",
                '[[cmd]] ["node", "server.js"]',
            ],
            blanks: {
                from: { options: KEYWORDS, answer: "FROM" },
                run: { options: KEYWORDS, answer: "RUN" },
                copy: { options: KEYWORDS, answer: "COPY" },
                port: {
                    options: ["80", "3000", "5432", "8080"],
                    answer: "3000",
                },
                cmd: { options: KEYWORDS, answer: "CMD" },
            },
            hints: [
                "Open the 📖 Field manual: each keyword's job is listed there. Every Dockerfile starts from a base image.",
                "Top to bottom: FROM, RUN, COPY, 3000, CMD.",
            ],
            debrief:
                "Every Dockerfile reads top to bottom like a recipe: start from a base, copy files in, install, then say how to start. `RUN` happens at **build** time; `CMD` happens when the container **starts**.",
        },
        {
            id: "build-run",
            type: "terminal",
            title: "Build it. Run it.",
            prompt: "Recipe fixed. Now use the terminal to build the image and start a container. (Type `help` any time to see your objective.)",
            points: 200,
            prefix: "hunter@dockyard:~/portal$",
            files: ["Dockerfile", "package.json", "server.js"],
            intro: [
                "Connected to the dev's workstation.",
                "Type `ls` to look around, `help` for your objective.",
            ],
            steps: [
                {
                    objective:
                        "Build an image from the Dockerfile in this folder and name it `portal`.",
                    accept: [
                        /^docker (image )?build (-t|--tag) portal(:latest)? \.\/?$/,
                        /^docker (image )?build \.\/? (-t|--tag) portal(:latest)?$/,
                    ],
                    errors: [
                        {
                            when: /^docker (image )?build \.?$/,
                            msg: "Built an image... with no name. Use -t to name (tag) it `portal` so you can find it later.",
                        },
                        {
                            when: /^docker (image )?build (-t|--tag) portal$/,
                            msg: 'ERROR: "docker build" requires exactly 1 argument: where is the Dockerfile? (this folder is written as `.`)',
                        },
                        {
                            when: /^docker (image )?build/,
                            msg: 'Almost: you need `-t portal` for the name and `.` for "the Dockerfile is in this folder".',
                        },
                        {
                            when: /^docker run/,
                            msg: "Unable to find image 'portal:latest' locally. You have to BUILD the image before you can RUN it.",
                        },
                    ],
                    output: [
                        "[+] Building 12.4s (9/9) FINISHED",
                        " => [1/5] FROM node:20-alpine",
                        " => [2/5] WORKDIR /app",
                        " => [3/5] COPY package.json .",
                        " => [4/5] RUN npm install",
                        " => [5/5] COPY . .",
                        " => naming to docker.io/library/portal:latest",
                        '✔ Image "portal" built.',
                    ],
                    hints: [
                        "Start with `docker build`. Give it a name with the `-t` flag, then tell it where the Dockerfile is.",
                        'Type exactly: docker build -t portal .   (the dot means "this folder")',
                    ],
                },
                {
                    objective:
                        "Start a container from `portal`. The app listens on port 3000 inside the box; map it to port 3000 on your machine.",
                    accept: [dockerRun("portal")],
                    errors: [
                        {
                            when: dockerRunNoPort("portal"),
                            msg: "Container started... but http://localhost:3000 refuses to connect. The port is trapped inside the box! Add -p host:container.",
                        },
                        {
                            when: /^docker (container )?run .*(-p|--publish)/,
                            msg: "The port mapping is off. The app listens on 3000 inside, and we want 3000 outside: -p 3000:3000",
                        },
                        {
                            when: /^docker (container )?run/,
                            msg: "Docker couldn't run that. The pattern is: docker run -p <host>:<container> <image>",
                        },
                    ],
                    output: [
                        "Container a3f9c2e1 started",
                        "Portal listening on http://localhost:3000 ✔",
                        "🎉 It works on your machine. Next: make it work on everyone's.",
                    ],
                    hints: [
                        "Use `docker run`, add a port mapping with `-p`, and end with the image name.",
                        "Type exactly: docker run -p 3000:3000 portal",
                    ],
                },
            ],
            debrief:
                "`docker build` turns the recipe into an **image**; `docker run` starts a **container** from it. `-p 3000:3000` connects your computer's port to the container's, otherwise nothing outside can reach the app.",
        },
    ],
};
