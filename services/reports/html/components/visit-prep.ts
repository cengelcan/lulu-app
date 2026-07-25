import type {
  VisitBrief,
  VisitBriefDocumentLabels,
  VisitBriefSource,
} from '@/types/vet-visit';
import { escapeHtml } from '@/utils/html';

const FIRST_PAGE_QUESTION_LIMIT = 6;
const CONTINUATION_QUESTION_LIMIT = 10;

export type VisitPrepPageSlice = {
  includeOverview: boolean;
  questions: string[];
  includeDisclaimer: boolean;
};

export function paginateVisitPrep(brief: VisitBrief): VisitPrepPageSlice[] {
  const pages: VisitPrepPageSlice[] = [];
  const firstQuestions = brief.questions.slice(0, FIRST_PAGE_QUESTION_LIMIT);
  let questionIndex = firstQuestions.length;

  pages.push({
    includeOverview: true,
    questions: firstQuestions,
    includeDisclaimer: questionIndex >= brief.questions.length,
  });

  while (questionIndex < brief.questions.length) {
    const questions = brief.questions.slice(
      questionIndex,
      questionIndex + CONTINUATION_QUESTION_LIMIT
    );
    questionIndex += questions.length;
    pages.push({
      includeOverview: false,
      questions,
      includeDisclaimer: questionIndex >= brief.questions.length,
    });
  }

  return pages;
}

function formatSourceReferences(
  sources: VisitBriefSource[],
  formatDate: (date: string) => string
): string {
  const datesByLabel = new Map<string, string[]>();

  for (const source of sources) {
    const dates = datesByLabel.get(source.label) ?? [];
    dates.push(formatDate(source.date));
    datesByLabel.set(source.label, dates);
  }

  return Array.from(datesByLabel.entries())
    .map(([label, dates]) => `${label} - ${dates.join(', ')}`)
    .join('; ');
}

export function renderVisitPrepBody({
  brief,
  labels,
  page,
  questionOffset,
  formatDate,
}: {
  brief: VisitBrief;
  labels: VisitBriefDocumentLabels;
  page: VisitPrepPageSlice;
  questionOffset: number;
  formatDate: (date: string) => string;
}): string {
  const sourcesById = new Map(brief.sources.map((source) => [source.id, source]));

  const overview = page.includeOverview
    ? `
      ${
        brief.reason
          ? `<div class="visit-reason">
              <span class="visit-label">${escapeHtml(labels.reason)}</span>
              <p>${escapeHtml(brief.reason)}</p>
            </div>`
          : ''
      }
      ${
        brief.items.length > 0
          ? `<h3>${escapeHtml(labels.highlights)}</h3>
             <div class="visit-highlights">
               ${brief.items
                 .map((item) => {
                   const itemSources = item.sourceIds
                     .map((sourceId) => sourcesById.get(sourceId))
                     .filter((source): source is VisitBriefSource => Boolean(source));
                   const sourceReferences = formatSourceReferences(itemSources, formatDate);

                   return `<div class="visit-highlight visit-highlight-${item.tone}">
                     <span class="visit-dot"></span>
                     <div>
                       <p>${escapeHtml(item.text)}</p>
                       ${
                         sourceReferences
                           ? `<small>${escapeHtml(
                               labels.sourceReferences.replace('{{sources}}', sourceReferences)
                             )}</small>`
                           : ''
                       }
                     </div>
                   </div>`;
                 })
                 .join('')}
             </div>`
          : ''
      }`
    : '';

  const questions =
    page.questions.length > 0
      ? `<h3>${escapeHtml(labels.questions)}</h3>
         <div class="visit-questions">
           ${page.questions
             .map(
               (question, index) => `<div class="visit-question">
                 <span class="visit-question-number">${questionOffset + index + 1}</span>
                 <p>${escapeHtml(question)}</p>
               </div>`
             )
             .join('')}
         </div>`
      : '';

  const disclaimer = page.includeDisclaimer
    ? `<p class="visit-disclaimer">${escapeHtml(labels.disclaimer)}</p>`
    : '';

  return `
    <section class="visit-prep">
      <h2>${escapeHtml(labels.sectionTitle)}</h2>
      ${overview}
      ${questions}
      ${disclaimer}
    </section>`;
}
