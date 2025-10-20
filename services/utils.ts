import i18n from "./i18n";
import { GRADE_COLORS } from "@/constants/theme/colors";

/**
 * Formate une date complète de manière localisée
 */
export function formatFullDate(dateString: string): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return date.toLocaleDateString(i18n.locale, options);
}

/**
 * Extrait uniquement l'année d'une date
 */
export function formatYear(dateString: string): string {
  if (!dateString) return "";
  return dateString.split("-")[0];
}

/**
 * Détermine la couleur selon la note
 */
export function setScoreColor(score: number, isDark: boolean): string {
  const colors = isDark ? GRADE_COLORS.dark : GRADE_COLORS.light;

  if (score >= 8) return colors.excellent;
  if (score >= 7) return colors.good;
  if (score >= 5) return colors.average;
  return colors.bad;
}

/**
 * Convertit une note sur 10 en note sur 5
 */
export function convertRatingToFive(rating: number): number {
  return Number((rating / 2).toFixed(1));
}

/**
 * Formate la durée en heures et minutes
 */
export function formatRuntime(minutes: number): string {
  if (!minutes) return "";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}min`;
  }

  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

/**
 * Calcule l'âge à partir d'une date de naissance
 */
export function calculateAge(
  birthday: string,
  deathday?: string | null,
): number {
  if (!birthday) return 0;

  const birthDate = new Date(birthday);
  const endDate = deathday ? new Date(deathday) : new Date();

  let age = endDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = endDate.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && endDate.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

/**
 * Formate le genre (gender) en texte
 */
export function formatGender(gender: number): string {
  switch (gender) {
    case 1:
      return i18n.t("screen.person.gender.female");
    case 2:
      return i18n.t("screen.person.gender.male");
    default:
      return i18n.t("screen.person.gender.other");
  }
}
