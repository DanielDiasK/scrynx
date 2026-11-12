#!/usr/bin/env node
// Bump the version of all three sources of truth at once:
//   apps/desktop/src-tauri/tauri.conf.json  (updater reads this)
//   apps/desktop/src-tauri/Cargo.toml       (binary version)
//   apps/desktop/package.json               (hygiene)
// Usage: node scripts/bump.mjs [patch|minor|major]
import { readFileSync, writeFileSync } from "node:fs";

const part = process.argv[2] ?? "patch";
const bump = (v) => {
  const [maj, min, patch] = v.split(".").map(Number);
  if (part === "major") return `${maj + 1}.0.0`;
  if (part === "minor") return `${maj}.${min + 1}.0`;
  return `${maj}.${min}.${patch + 1}`;
};

const confPath = "apps/desktop/src-tauri/tauri.conf.json";
const cargoPath = "apps/desktop/src-tauri/Cargo.toml";
const pkgPath = "apps/desktop/package.json";

const conf = JSON.parse(readFileSync(confPath, "utf8"));
const current = conf.version;
const next = bump(current);

conf.version = next;
writeFileSync(confPath, JSON.stringify(conf, null, 2) + "\n");

const cargo = readFileSync(cargoPath, "utf8").replace(
  /^version = ".*"$/m,
  `version = "${next}"`,
);
writeFileSync(cargoPath, cargo);

const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
pkg.version = next;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

console.log(`✔ Bumped ${current} → ${next}`);
console.log(`\nNext steps:`);
console.log(`  git add -A && git commit -m "chore: release v${next}" && git push`);
console.log(`  The Release workflow will publish v${next} automatically.`);
