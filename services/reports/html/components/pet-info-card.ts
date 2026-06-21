import type { ReportDocumentLabels, ReportPetSummary } from '@/types/report';
import { escapeHtml } from '@/utils/html';

type PetInfoCardParams = {
  pet: ReportPetSummary;
  petPhotoHtml: string;
  labels: ReportDocumentLabels;
};

export function renderPetInfoCard({ pet, petPhotoHtml, labels }: PetInfoCardParams): string {
  return `
    <section class="pet-info-card">
      <div class="pet-info-header">
        ${petPhotoHtml}
        <div class="pet-info-heading">
          <h1 class="pet-name">${escapeHtml(pet.name)}</h1>
          <p class="pet-breed-line">${escapeHtml(pet.speciesLabel)} · ${escapeHtml(pet.breedLabel)}</p>
        </div>
      </div>
      <div class="pet-detail-grid">
        <div class="pet-detail-cell">
          <div class="pet-detail-label">${escapeHtml(labels.species)}</div>
          <div class="pet-detail-value">${escapeHtml(pet.speciesLabel)}</div>
        </div>
        <div class="pet-detail-cell">
          <div class="pet-detail-label">${escapeHtml(labels.sex)}</div>
          <div class="pet-detail-value">${escapeHtml(pet.sexLabel)}</div>
        </div>
        <div class="pet-detail-cell">
          <div class="pet-detail-label">${escapeHtml(labels.birthDate)}</div>
          <div class="pet-detail-value">${escapeHtml(pet.birthDateLabel)}</div>
        </div>
        <div class="pet-detail-cell">
          <div class="pet-detail-label">${escapeHtml(labels.sterilization)}</div>
          <div class="pet-detail-value">${escapeHtml(pet.spayNeuterLabel)}</div>
        </div>
        <div class="pet-detail-cell">
          <div class="pet-detail-label">${escapeHtml(labels.weight)}</div>
          <div class="pet-detail-value">${escapeHtml(pet.weightLabel)}</div>
        </div>
      </div>
      <div class="pet-info-footer">
        <span>${escapeHtml(labels.owner)}: ${escapeHtml(pet.ownerName)}</span>
        <span>${escapeHtml(labels.microchip)}: ${escapeHtml(pet.microchipId)}</span>
      </div>
    </section>`;
}

export function renderPetPhotoHtml(petName: string, photoDataUri: string | null): string {
  if (photoDataUri) {
    return `<img class="pet-photo" src="${photoDataUri}" alt="${escapeHtml(petName)}" />`;
  }

  return `<div class="pet-photo pet-photo-placeholder" aria-hidden="true">🐾</div>`;
}
