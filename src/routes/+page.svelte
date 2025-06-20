<script lang="ts">
    import Navbar from "$lib/navbar.svelte";
</script>


<Navbar />

<div class="columns">
    <div class="column is-3">
        <div class="box has-text-centered">
            <figure class="image is-128x128 is-inline-block">
                <img class="is-rounded" src="profile.jpg" alt="me :)" />
            </figure>
            <h4 class="subtitle is-4"> <b> Thomas Dooms </b> </h4>

            <h6 class="subtitle is-6"> Interpretability Researcher </h6>

            <hr />
            <div class="block">
                <span class="icon"><i class="fas fa-calendar"></i> </span>
                <span> <a href="https://cal.com/tdooms"> 1-on-1 </span>
            </div>
            <div class="block">
                <span class="icon"><i class="fab fa-x-twitter"></i> </span>
                <span> <a href="https://x.com/thomasdooms"> Twitter </span>
            </div>
            <div class="block">
                <span class="icon"><i class="fas fa-envelope"></i> </span>
                <span> <a href="mailto:doomsthomas@gmail.com"> Email </span>
            </div>
            <div class="block">
                <span class="icon"><i class="fab fa-linkedin"></i> </span>
                <span> <a href="https://www.linkedin.com/in/thomas-dooms-5518a4169/"> LinkedIn </a> </span>
            </div>
            
            <div class="block">
                <span class="icon"><i class="fab fa-github"></i> </span>
                <span> <a href="https://github.com/tdooms"> GitHub </a> </span>
            </div>
            <div class="block">
                <span class="icon"> <i class="fa-brands fa-google-scholar"></i> </span>
                <span> <a href="https://scholar.google.com/citations?user=PPakd2AAAAAJ&hl=en"> Scholar </a> </span>
            </div>
        </div>
    </div>
    <div class="column">
        <div class="box">
            <div class="content">
                <p> Hi, I'm Thomas! I'm a PhD student working on <a href="https://compinterp.github.io">compositional interpretability</a>.
                    I'm interested in understanding how neural networks encode complex behaviours and knowledge.
                </p>

                <p>
                    Modern deep networks are astonishingly intricate and difficult to disentangle.
                    I argue that we should embrace this complexity rather than shoehorn them into simplistic feature sets, flattening the very structures we hope to understand.
                </p>
                <p>
                    My research treats a model's weights as a compositional system whose parts interact and recombine, much like phrases in a language.
                    By developing flexible, formally grounded tools for compositional analysis, I aim to reveal how rich mechanisms and representations arise and how we can reason about them.
                </p>
                <p>
                    Outside of work, I love to go on long bike rides, game with friends, go skiing and wear shorts.
                    I used to play a lot of Diablo 3, achieving <span title="Suck it Elon">rank 1</span> in grift leaderboards at some point.
                </p>
            </div>
        </div>
    </div>
</div>
