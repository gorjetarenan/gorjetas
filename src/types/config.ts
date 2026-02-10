export interface PageConfig {
  heroTitle: string;
  heroSubtitle: string;
  formTitle: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  backgroundType: 'solid' | 'gradient' | 'image';
  backgroundColor: string;
  gradientFrom: string;
  gradientTo: string;
  gradientDirection: string;
  backgroundImage: string;
  fields: FormField[];
  maxDailyWins: number;
  maxWeeklyWins: number;
  maxMonthlyWins: number;
}

export interface FormField {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'email' | 'number';
  required: boolean;
  enabled: boolean;
}

export interface Submission {
  id: string;
  data: Record<string, string>;
  createdAt: string;
}

export interface RaffleWin {
  id: string;
  submissionId: string;
  submissionData: Record<string, string>;
  date: string;
}

export const defaultConfig: PageConfig = {
  heroTitle: '💰 Gorjetas',
  heroSubtitle: 'Cadastre-se e concorra a gorjetas incríveis!',
  formTitle: 'Preencha seus dados',
  ctaButtonText: '🎰 Cadastre-se na Casa de Apostas',
  ctaButtonLink: 'https://example.com',
  backgroundType: 'gradient',
  backgroundColor: '#0f172a',
  gradientFrom: '#0f172a',
  gradientTo: '#064e3b',
  gradientDirection: '135',
  backgroundImage: '',
  fields: [
    { id: 'fullName', label: 'Nome Completo', placeholder: 'Digite seu nome completo', type: 'text', required: true, enabled: true },
    { id: 'email', label: 'Email', placeholder: 'Digite seu email', type: 'email', required: true, enabled: true },
    { id: 'accountId', label: 'ID da Conta', placeholder: 'Digite o ID da sua conta', type: 'text', required: true, enabled: true },
  ],
  maxDailyWins: 5,
  maxWeeklyWins: 20,
  maxMonthlyWins: 50,
};
