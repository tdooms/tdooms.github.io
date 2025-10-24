---
title: Introducing SimpleStories
date: 12 Mar 2024
back: research
---

<script>
  import Resources from "$lib/resources.svelte";
  import Cite from "$lib/cite.svelte"

  import bib from "$data/bib/simplestories.bib?raw"
</script>

<p> Lennart Finke, Chandan Sreedhara, <b>Thomas Dooms</b>, Mat Allen, Emerald Zhang, Juan Diego Rodriguez, Noa Nabeshima, Thomas Marshall, Dan Braun </p>

<div class="mt-6"> </div>

<Resources
  paper="https://openreview.net/attachment?id=JO8CtTXOsH&name=pdf",
  models="https://huggingface.co/datasets/SimpleStories/SimpleStories"
/>

To interpret deep neural networks, one needs to answer two questions simultaneously: "what to look for and how?".
It is both unknown what deep model's internal mechanisms are and how they are represented.
This stems for a lack of structure in most datasets, containing random scraps of data from the internet.
Hence, there is increasing need for structured datasets that can help guide interpretability research toward concrete goals.

One milestone toward this is [TinyStories](https://arxiv.org/abs/2305.07759), a dataset containing millions of children's stories.
Tiny language models (~10 million parameters) trained on this dataset can generate coherent and creative stories.
The combination of tiny models and constrained problem space forms a perfect testbed for understanding these models.

Unfortunately, this dataset suffers from a few issues:

- Stories are generated using old models, leading to formulaic and/or incoherent plots.
- Some stories are 'corrupted', containing large amounts of nonsense characters.
- The vocabulary isn't constrained enough, leading to complex or even misspelled words.

Furthermore, there are ample opportunities for improvement:

- Fine-grained labels about aspects of the story (tone, moral, topic) that can serve for supervised probing/finetuning.
- Strong focus on simplicity, while retaining diversity.

Keeping this in mind, we created SimpleStories.

<Cite bib={bib} />