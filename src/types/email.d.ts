declare module '@/lib/email' {
  type EmailPayload = {
    to: string;
    subject: string;
    html: string;
  };

  export function sendEmail(data: EmailPayload): Promise<any>;
}
