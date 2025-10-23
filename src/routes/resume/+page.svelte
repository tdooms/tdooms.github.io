<script lang="ts">
    import Media from "$lib/media.svelte";

    import awards from "$data/awards.json";
    import education from "$data/education.json";
    import work from "$data/work.json";
    import languages from "$data/languages.json";
</script>

<div class="columns">
    <div class="column is-5">
        <h5 class="title ml-2 is-5"> Education </h5>
        <Media icon="icons/ua.png" date="Nov 2023 - TBD" title="PhD in Machine Learning">
            <p class="mt-2"> <b> Subject: </b>Weight-based interpretability</p>
            <p> <b> Advisor: </b> Jose M. Oramas </p>
        </Media>

        {#each education as study}
            <Media icon="icons/ua.png" date={study.date} title={study.title}>
                <p class="mt-2"> <b> Grade: </b> {study.grade} </p>
            </Media>
        {/each}
    </div>
    <div class="column is-7">
        <h5 class="title ml-2 is-5"> Work Experience </h5>
        {#each work as job}
            <Media {...job}> <p class="mt-2"> {job.text} </p> </Media>
        {/each}
    </div>
</div>

<div class="columns">
    <div class="column is-4">
        <h5 class="title ml-2 is-5"> Languages </h5>
        <div class="box" style="height:294px">
            {#each languages as language}
                <div class="columns">
                    <div class="column is-narrow has-text-left py-0">
                        <strong> {language.name} </strong>
                    </div>
                    <div class="column has-text-right py-0">
                        {language.level}
                    </div>
                </div>
                <progress class="progress is-danger" style="height:0.5rem" max=100 value={language.percent}> {language.percent} % </progress>
            {/each}
        </div>
    </div>
    <div class="column is-8">
        <h5 class="title ml-2 is-5"> Awards </h5>
        <div class="box">
            {#each awards as award}
                <div class="icon-text">
                    <span class="icon is-medium">
                        <i class="fas fa-lg fa-award"></i>
                    </span>
                    <span> {award.title} <small><i> {award.date} </i> </small> </span>
                </div>
            {/each}
        </div>
    </div>
</div>
