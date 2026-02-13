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
  submitButtonColor: string;
  submitButtonTextColor: string;
  ctaButtonColor: string;
  ctaButtonTextColor: string;
  maxDailyWins: number;
  maxWeeklyWins: number;
  maxMonthlyWins: number;
  raffleRules: string;
  raffleRulesEnabled: boolean;
  emailNotificationEnabled: boolean;
  emailFromName: string;
  emailSubject: string;
  emailBody: string;
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
  submitButtonColor: '#16a34a',
  submitButtonTextColor: '#ffffff',
  ctaButtonColor: '#ca8a04',
  ctaButtonTextColor: '#000000',
  maxDailyWins: 5,
  maxWeeklyWins: 20,
  maxMonthlyWins: 50,
  raffleRules: '1. O sorteio é válido apenas para contas cadastradas.\n2. Cada participante pode ganhar no máximo uma vez por dia.\n3. O resultado é aleatório e irrevogável.\n4. Ao participar, você concorda com todas as regras.\n5. A administração se reserva o direito de desqualificar participantes que violem as regras.',
  raffleRulesEnabled: true,
  emailNotificationEnabled: false,
  emailFromName: 'Gorjetas',
  emailSubject: '🎉 Parabéns, {{fullName}}! Você foi sorteado!',
  emailBody: 'Olá {{fullName}},\n\nParabéns! Você foi sorteado no nosso sistema de gorjetas!\n\nSeu ID de conta: {{accountId}}\nData do sorteio: {{date}}\n\nEntre em contato conosco para resgatar seu prêmio.\n\nAbraços,\nEquipe Gorjetas',
};
