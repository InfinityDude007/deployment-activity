import type { Room } from "../types";
import { dockerRun, dockerRunNoPort } from "../lib/terminal";

const IMAGE = "ghcr.io/aiesec-gid/portal:v1";

export const vault: Room = {
  id: "vault",
  name: "The Registry Vault",
  topic: "GHCR · push & pull",
  fragment: "PL",
  story:
    "The container runs, but only on **your** laptop. The deploy servers and your teammates can't reach it. You need to stash the image in the Registry Vault, GitHub's container registry, so anyone with access can pull it.",
  briefing: {
    lead: "A **registry** is like Google Drive for images: you **push** to upload and **pull** to download. GitHub runs one called **GHCR** at `ghcr.io`.",
    terms: [
      { term: "Image address", def: "`ghcr.io / aiesec-gid / portal : v1` → registry / owner / image name : tag" },
      { term: "Tag", def: "A version label after the colon, like `v1` or `latest`." },
      { term: "docker tag", def: "Gives an existing image an extra name (its full registry address). Doesn't copy anything." },
      { term: "docker login", def: "Proves who you are to a registry. For GHCR the password is a GitHub token." },
    ],
    cheats: [
      {
        label: "Commands",
        code: "docker tag <existing> <new-full-name>\ndocker login ghcr.io -u <github-username>\ndocker push <full-name>\ndocker pull <full-name>",
      },
    ],
    note: "No registry in the name? Docker assumes Docker Hub. No tag? Docker assumes `:latest`.",
  },
  puzzles: [
    {
      id: "push",
      type: "terminal",
      title: "Into the vault",
      prompt: `Tag your image with its vault address \`${IMAGE}\`, log in to GHCR, and push it.`,
      points: 200,
      prefix: "hunter@vault:~/portal$",
      files: ["Dockerfile", "package.json", "server.js"],
      intro: ["Local images: portal:latest", "Type `help` for your objective."],
      steps: [
        {
          objective: `Give the \`portal\` image its full vault address: \`${IMAGE}\``,
          accept: [/^docker (image )?tag portal(:latest)? ghcr\.io\/aiesec-gid\/portal:v1$/],
          errors: [
            { when: /^docker (image )?tag ghcr/, msg: "Order matters: docker tag SOURCE TARGET. The image you already have (`portal`) goes first." },
            { when: /^docker (image )?tag portal(:latest)? ghcr\.io\/aiesec-gid\/portal$/, msg: "Close! Without a tag Docker uses `:latest`, but the client wants version `:v1`." },
            { when: /^docker (image )?tag/, msg: `Check the spelling of the address: ${IMAGE}` },
            { when: /^docker push/, msg: "Not yet. The image doesn't have its vault address. Tag it first." },
          ],
          output: [`✔ Tagged portal → ${IMAGE}`],
          hints: [
            "The pattern is `docker tag <existing-name> <new-full-name>`.",
            `Type exactly: docker tag portal ${IMAGE}`,
          ],
        },
        {
          objective: "Log in to GitHub's container registry at `ghcr.io`.",
          accept: [
            (n) => /^(echo .*\| ?)?docker login( .*)?$/.test(n) && /(^| )ghcr\.io( |$)/.test(n),
          ],
          errors: [
            { when: /^docker login$/, msg: "That logs in to Docker Hub (the default). We need GitHub's registry: add ghcr.io" },
            { when: /^docker push/, msg: "denied: unauthenticated. The vault doesn't know who you are. Log in first." },
          ],
          output: [
            "Username: bounty-hunter",
            "Password: ********  (a GitHub Personal Access Token with write:packages)",
            "Login Succeeded",
          ],
          hints: [
            "Use `docker login` followed by the registry's address.",
            "Type: docker login ghcr.io",
          ],
        },
        {
          objective: "Upload (push) the image to the vault.",
          accept: [/^docker (image )?push ghcr\.io\/aiesec-gid\/portal:v1$/],
          errors: [
            { when: /^docker (image )?push portal/, msg: "denied: requested access to the resource is denied. `portal` alone means Docker Hub. Push the full ghcr.io address." },
            { when: /^docker (image )?push ghcr\.io\/aiesec-gid\/portal$/, msg: "tag does not exist: ghcr.io/aiesec-gid/portal:latest. You tagged it :v1!" },
            { when: /^docker (image )?pull/, msg: "Pull downloads. You want to upload." },
          ],
          output: [
            "The push refers to repository [ghcr.io/aiesec-gid/portal]",
            "5f70bf18a086: Pushed",
            "a3f9c2e1b7d4: Pushed",
            "v1: digest: sha256:9b2c41d7…e41f size: 1573",
            "✔ The image is in the vault.",
          ],
          hints: [
            "Use `docker push` with the image's FULL address (registry + name + tag).",
            `Type exactly: docker push ${IMAGE}`,
          ],
        },
      ],
      debrief:
        "Tag → login → push is the standard way to publish an image. The full address tells Docker **which** registry to upload to; GHCR keeps the image next to your code on GitHub.",
    },
    {
      id: "why-denied",
      type: "mcq",
      title: "A teammate is locked out",
      prompt:
        "Your teammate Geeneth, on a **different laptop**, runs `docker pull portal:v1` and gets:\n`Error: pull access denied for portal, repository does not exist`. Why?",
      points: 100,
      options: [
        {
          text: "They must use the full name `ghcr.io/aiesec-gid/portal:v1`. Without a registry address, Docker looks on Docker Hub.",
          correct: true,
          why: "Exactly. `portal:v1` is only a nickname on YOUR laptop. Everyone else needs the full vault address.",
        },
        { text: "Images can only be pulled on the laptop that built them.", why: "That's the whole point of a registry: anyone with access can pull." },
        { text: "They need to run `docker build` first.", why: "They don't have the source code, and they don't need it. Pulling downloads the ready-made image." },
        { text: "`v1` is an invalid tag; tags must be numbers.", why: "Tags can be any label: `v1`, `latest`, `2026-10-14`…" },
      ],
      hints: ["Look at the Field manual note: what does Docker assume when there's no registry in the name?"],
      debrief: "The registry is part of an image's name. Leave it off and Docker assumes Docker Hub.",
    },
    {
      id: "pull",
      type: "terminal",
      title: "Same box, new machine",
      prompt: "Take over Geeneth's laptop. It has **no source code**, just Docker. Pull the image from the vault and run it.",
      points: 150,
      prefix: "geeneth@laptop:~$",
      files: [],
      intro: ["Fresh laptop. No code, no images. Just Docker.", "Type `help` for your objective."],
      steps: [
        {
          objective: `Download the image \`${IMAGE}\` from the vault.`,
          accept: [/^docker (image )?pull ghcr\.io\/aiesec-gid\/portal:v1$/],
          errors: [
            { when: /^docker (image )?pull ghcr\.io\/aiesec-gid\/portal$/, msg: "manifest for ghcr.io/aiesec-gid/portal:latest not found. You pushed :v1!" },
            { when: /^docker (image )?pull portal/, msg: "pull access denied for portal. Remember Geeneth's mistake? Use the full address." },
            { when: /^docker (image )?push/, msg: "Push uploads. We want to download." },
            { when: /^docker (image )?build/, msg: "unable to prepare context: no Dockerfile here. You don't need to build; pull the finished image." },
          ],
          output: [
            "v1: Pulling from aiesec-gid/portal",
            "5f70bf18a086: Pull complete",
            "a3f9c2e1b7d4: Pull complete",
            `Status: Downloaded newer image for ${IMAGE}`,
          ],
          hints: ["Use `docker pull` with the full address.", `Type exactly: docker pull ${IMAGE}`],
        },
        {
          objective: "Run it, mapping port 3000 to 3000.",
          accept: [dockerRun(IMAGE)],
          errors: [
            { when: /^docker (container )?run (.* )?portal(:latest)?$/, msg: "Unable to find image 'portal:latest' locally. On this laptop the image only has its full name." },
            { when: dockerRunNoPort(IMAGE), msg: "Running... but the port is trapped inside the box. Add -p 3000:3000." },
            { when: /^docker (container )?run/, msg: `Pattern: docker run -p 3000:3000 ${IMAGE}` },
          ],
          output: ["Portal listening on http://localhost:3000 ✔", "Same image, different machine, same result. That's the magic of containers."],
          hints: ["Same as before, but use the full image address at the end.", `Type exactly: docker run -p 3000:3000 ${IMAGE}`],
        },
      ],
      debrief: "Pull + run works on **any** machine with Docker, with no code and no installs. That's how servers deploy your app.",
    },
  ],
};
