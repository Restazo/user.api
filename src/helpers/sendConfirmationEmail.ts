import { confirmationEmail, resend } from "../resend.js";
import logger from "./logger.js";

const sendConfirmationEmail = async (
  email: string,
  confirmationPin: number
) => {
  const { data, error } = await resend.emails.send({
    from: "Restazo Inc. <confirmations@restazo.com>",
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
