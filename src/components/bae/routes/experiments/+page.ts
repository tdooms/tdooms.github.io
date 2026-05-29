import { fetchJson, experimentsIndexUrl } from "$lib/data";

interface ExperimentEntry {
  slug: string;
  kind: string;
  title: string;
}

export const prerender = false;

export const load = async ({ fetch }) => {
  const { experiments } = await fetchJson<{ experiments: ExperimentEntry[] }>(
    fetch, experimentsIndexUrl());
  return { experiments };
};
