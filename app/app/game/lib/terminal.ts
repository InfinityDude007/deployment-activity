import type { Matcher } from "../types";

/** Forgiving normalisation so beginners aren't punished for spacing, case or smart quotes. */
export function normalize(raw: string): string {
    return raw
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/^\s*\$\s*/, "")
        .trim()
        .replace(/\s+/g, " ")
        .replace(/;$/, "")
        .toLowerCase();
}

export function test(m: Matcher, cmd: string): boolean {
    return typeof m === "function" ? m(cmd) : m.test(cmd);
}

/** Matches `docker run` with -p 3000:3000 and the given image, allowing common harmless flags. */
export function dockerRun(image: string) {
    const images = image.includes(":") ? [image] : [image, `${image}:latest`];
    return (cmd: string) => {
        const m = /^docker (?:container )?run (.+)$/.exec(cmd);
        if (!m) return false;
        const t = m[1].replace(/(-p|--publish)=/g, "$1 ").split(" ");
        if (!images.includes(t[t.length - 1])) return false;
        let published = false;
        for (let i = 0; i < t.length - 1; i++) {
            const x = t[i];
            if ((x === "-p" || x === "--publish") && t[i + 1] === "3000:3000") {
                published = true;
                i++;
            } else if (x === "--name") {
                i++;
            } else if (
                !["-d", "--detach", "--rm", "-it", "-i", "-t", "-dit"].includes(
                    x,
                )
            ) {
                return false;
            }
        }
        return published;
    };
}

/** `docker run ... <image>` with no port mapping at all. */
export function dockerRunNoPort(image: string) {
    return (cmd: string) =>
        /^docker (container )?run /.test(cmd) &&
        !/(-p|--publish)/.test(cmd) &&
        (cmd.endsWith(` ${image}`) || cmd.endsWith(` ${image}:latest`));
}
