<script lang="ts">
  import { quiz, sourceById } from '$data';
  import { isCorrect, togglePick, summarize, shuffle, type AnswerState } from '$lib/quiz/engine';

  const QUESTIONS_PER_SESSION = 20;

  let sessionSeed = $state(Date.now());
  const sessionQuestions = $derived(shuffle(quiz, sessionSeed).slice(0, QUESTIONS_PER_SESSION));
  let answers = $state<Record<string, AnswerState>>({});
  let idx = $state(0);
  let finished = $state(false);

  const current = $derived(sessionQuestions[idx]);
  const currentAnswer = $derived<AnswerState>(
    answers[current?.id] ?? { picks: [], submitted: false, correct: false }
  );
  const progress = $derived(Object.values(answers).filter((a) => a.submitted).length);
  const summary = $derived(finished ? summarize(sessionQuestions, answers) : null);

  function pick(i: number) {
    if (!current || currentAnswer.submitted) return;
    const next = togglePick(current, currentAnswer.picks, i);
    answers = { ...answers, [current.id]: { picks: next, submitted: false, correct: false } };
  }

  function submit() {
    if (!current || currentAnswer.picks.length === 0 || currentAnswer.submitted) return;
    const correct = isCorrect(current, currentAnswer.picks);
    answers = {
      ...answers,
      [current.id]: { picks: currentAnswer.picks, submitted: true, correct }
    };
  }

  function next() {
    if (idx < sessionQuestions.length - 1) {
      idx += 1;
    } else {
      finished = true;
    }
  }

  function restart() {
    sessionSeed = Date.now();
    answers = {};
    idx = 0;
    finished = false;
  }

  function isPicked(i: number): boolean {
    return currentAnswer.picks.includes(i);
  }

  function correctPicks(): number[] {
    if (!current) return [];
    return current.type === 'qcu' ? [current.answer] : current.answers;
  }

  function optionClass(i: number): string {
    if (!currentAnswer.submitted) {
      return isPicked(i)
        ? 'border-accent bg-accent/10 text-ink'
        : 'border-surface-3 bg-surface-1 hover:border-accent/50 hover:bg-surface-2';
    }
    const correct = correctPicks();
    const wasPicked = isPicked(i);
    const shouldBe = correct.includes(i);
    if (shouldBe && wasPicked) return 'border-ok bg-ok/10 text-ink';
    if (shouldBe && !wasPicked) return 'border-ok/60 bg-ok/5 text-muted';
    if (!shouldBe && wasPicked) return 'border-danger bg-danger/10 text-ink';
    return 'border-surface-3 bg-surface-1 text-muted opacity-70';
  }
</script>

<svelte:head>
  <title>Quiz — auto-évaluation · Islam 2026</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-10 sm:px-6">
  {#if finished && summary}
    <!-- ── Résultat ── -->
    <header class="mb-8 text-center">
      <p class="text-sm font-medium uppercase tracking-wider text-muted">Résultat</p>
      <h1 class="h-display mt-2 text-5xl">{summary.percent}%</h1>
      <p class="mt-2 text-muted">
        {summary.correct} bonnes réponses sur {summary.total}
      </p>
    </header>

    <div class="grid gap-3 sm:grid-cols-2 mb-8">
      <div class="rounded-xl border border-surface-3 bg-surface-1 p-5 text-center">
        <p class="text-xs uppercase tracking-wider text-muted">QCU</p>
        <p class="h-display mt-1 text-2xl">
          {summary.byType.qcu.correct} / {summary.byType.qcu.total}
        </p>
      </div>
      <div class="rounded-xl border border-surface-3 bg-surface-1 p-5 text-center">
        <p class="text-xs uppercase tracking-wider text-muted">QCM</p>
        <p class="h-display mt-1 text-2xl">
          {summary.byType.qcm.correct} / {summary.byType.qcm.total}
        </p>
      </div>
    </div>

    <div class="rounded-xl border border-surface-3 bg-surface-1 p-6">
      <h2 class="h-display text-xl mb-3">Retour sur les erreurs</h2>
      {#if summary.wrongIds.length === 0}
        <p class="text-sm text-ok">Aucune erreur — maîtrise excellente sur cet échantillon.</p>
      {:else}
        <ol class="space-y-4">
          {#each summary.wrongIds as id (id)}
            {@const q = sessionQuestions.find((s) => s.id === id)}
            {#if q}
              <li class="border-l-4 border-danger/60 pl-4">
                <p class="font-medium">{q.question}</p>
                <p class="mt-1 text-sm text-muted">{q.explain}</p>
              </li>
            {/if}
          {/each}
        </ol>
      {/if}
    </div>

    <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        class="rounded-lg bg-accent px-5 py-3 font-medium text-white shadow-soft hover:brightness-110"
        onclick={restart}
      >
        Recommencer avec {QUESTIONS_PER_SESSION} nouvelles questions
      </button>
    </div>

    <p class="mt-8 text-center text-xs text-muted">
      Auto-évaluation pédagogique · sans valeur certifiante.
    </p>
  {:else if current}
    <!-- ── Question courante ── -->
    <header class="mb-6">
      <div class="flex items-center justify-between text-sm">
        <p class="font-medium text-muted">
          Question {idx + 1} / {sessionQuestions.length}
        </p>
        <p class="text-muted">Score en cours : {progress} répondues</p>
      </div>
      <div class="mt-2 h-1 overflow-hidden rounded-full bg-surface-3">
        <div
          class="h-full bg-accent transition-all"
          style="width: {((idx + 1) / sessionQuestions.length) * 100}%"
        ></div>
      </div>
    </header>

    <article class="rounded-2xl border border-surface-3 bg-surface-1 p-6 shadow-soft">
      <p class="mb-4 text-xs font-semibold uppercase tracking-wider text-accent">
        {current.type === 'qcu'
          ? 'QCU — une seule bonne réponse'
          : 'QCM — plusieurs bonnes réponses'}
      </p>
      <h2 class="h-display text-xl leading-snug">{current.question}</h2>

      <ul class="mt-5 space-y-2">
        {#each current.options as opt, i}
          <li>
            <button
              type="button"
              class="flex w-full items-start gap-3 rounded-lg border p-3.5 text-left transition {optionClass(
                i
              )}"
              disabled={currentAnswer.submitted}
              onclick={() => pick(i)}
              aria-pressed={isPicked(i)}
            >
              <span
                class="mt-0.5 grid size-5 shrink-0 place-items-center border-2
                       {current.type === 'qcu' ? 'rounded-full' : 'rounded-sm'}
                       {isPicked(i) ? 'border-accent bg-accent text-white' : 'border-surface-3'}"
                aria-hidden="true"
              >
                {#if isPicked(i)}✓{/if}
              </span>
              <span class="flex-1 text-sm">{opt}</span>
            </button>
          </li>
        {/each}
      </ul>

      {#if currentAnswer.submitted}
        <div
          class="mt-5 rounded-lg border p-4 text-sm
                 {currentAnswer.correct ? 'border-ok/40 bg-ok/5' : 'border-danger/40 bg-danger/5'}"
        >
          <p class="font-medium">
            {currentAnswer.correct ? '✓ Bonne réponse' : '✕ Réponse incorrecte'}
          </p>
          <p class="mt-1.5 text-muted">{current.explain}</p>
          {#if current.sourceId && sourceById.get(current.sourceId)}
            {@const src = sourceById.get(current.sourceId)!}
            <p class="mt-2 text-xs">
              Source :
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                class="text-accent underline underline-offset-2 hover:no-underline"
              >
                {src.label} ↗
              </a>
            </p>
          {/if}
        </div>
      {/if}
    </article>

    <div class="mt-5 flex items-center justify-end gap-3">
      {#if !currentAnswer.submitted}
        <button
          type="button"
          class="rounded-lg bg-accent px-5 py-2.5 font-medium text-white shadow-soft hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={currentAnswer.picks.length === 0}
          onclick={submit}
        >
          Valider
        </button>
      {:else}
        <button
          type="button"
          class="rounded-lg bg-accent px-5 py-2.5 font-medium text-white shadow-soft hover:brightness-110"
          onclick={next}
        >
          {idx === sessionQuestions.length - 1 ? 'Voir le résultat' : 'Question suivante →'}
        </button>
      {/if}
    </div>
  {/if}
</div>
