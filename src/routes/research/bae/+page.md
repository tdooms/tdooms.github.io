---
title: Bilinear Autoencoders
back: research
---

<script>
  import Resources from "$lib/resources.svelte";
  import Cite from "$lib/cite.svelte"

  import bib from "$data/bib/bae.bib?raw"
</script>

<p> <b>Thomas Dooms</b>, Ward Gauderis </p>

<div class="mt-6"> </div>

<Resources
    paper="https://openreview.net/pdf?id=ybJXIh4vcF"
    code="https://github.com/tdooms/bae"
    models="https://huggingface.co/tdooms/qwen3-0.6b-base-scope"
    demo="/demos/manifolds"
/>

### Technique

Sparse autoencoders are the standard tool to find interpretable features within model activations in unsupervised fashion.
Yet, due to its architecture, their analysis is constrained to the precise extracted feature basis.
TConsequently, it is highly difficult to combine these features into higher-order structures like manifolds.

This paper introduces a sparse autoencoder variant that can extract superposed features, while remaining linearly analyzable.
We achieve this by linearly reconstructing the quadratic input space ($x_0^2, x_0 x_1, ..., x_n^2$), effectively decomposing the activations into polynomial factors.
These polynomial factors can be analyzed, for instance using SVD, to find further structure within the autoencoder.
We use this toward automated extraction of subspaces that are likely to contain interesting manifolds.

### Extensions

We also propose three extensions to bilinear autoencoders that impact the structure and properties of the extracted features.

First, we use a scale-invariant measure of sparsity which avoids dead features altogether. This regularization forces features to be both specific yet robust to noise, making it a much nicer metric than $L_1$.

Second, we introduce an analytic way to impose a complete importance ordering on features. This means that only using a prefix of the autoencoder will also yield good reconstructions.

Last, we discuss how to add a further bottleneck to extracted features, akin to toy models of superposition, which helps understand which features overlap and mix.

### Future work

I'm happy with this paper as it proposes quite some solutions to open problems, yet these are early days, and much work remains to be done to verify and extend this work.

<Cite bib={bib} />