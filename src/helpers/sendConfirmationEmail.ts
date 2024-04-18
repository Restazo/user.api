import { confirmationEmail, resend } from "../resend.js";
import logger from "./logger.js";

const emailDomain = process.env.RESEND_EMAIL_DOMAIN;

const sendConfirmationEmail = async (
  email: string,
  confirmationPin: number
) => {
  const { data, error } = await resend.emails.send({
    from: `Restazo Inc. <confirmations${emailDomain}>`,
    to: [email],
    subject: "Confirm your signing in",
    html: confirmationEmail(confirmationPin),
  });

  if (error) {
    logger(`Failed to send an email to ${email}`, error);
    return null;
  }
  return true;
};

export default sendConfirmationEmail;
