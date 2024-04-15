import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const confirmationEmail = (pin: number): string => {
  return `<!DOCTYPE html>
<html>
<head>
<title>Confirmation Email</title>
<style>
  body {
    background-color: #000000;
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
  }
  .email-container {
    background-color: #000000;
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    text-align: center;
  }
  .email-header {
    background-color: #000000;
    padding: 20px;
  }
  .email-content {
    color: #333333;
    padding: 20px;
    text-align: center;
  }
  .email-footer {
    background-color: #000000;
    color: #333333;
    padding: 20px;
    text-align: center;
    font-size: 12px;
  }
</style>
</head>
<body>
<div class="email-container">
  <div class="email-header">
    <!-- Logo Image -->
    <img src="https://assets.restazo.com/public/logos/58d3cf35-905d-4fc2-b990-76ce5e708066.png" alt="Restazo Logo" style="max-width: 80px; border-radius: 5px;">
  </div>
  <div class="email-content">
    <h2 style="color: #ffffff">Confirm signing in</h2>
    <p style="color: #ffffff">Let's comlete your signing in, please use the PIN code below.</p>
    <!-- PIN Code -->
    <div style="background-color: #ffffff; padding: 5px 5px; border-radius: 10px;">
      <p style="font-size: 24px; font-weight: bold; color: #000000">${pin}</p>
    </div>
    <p style="color: #ffffff">Please paste this PIN code in the waiter login confirmation.</p>
  </div>
  <div class="email-footer">
    <p style="color: #ffffff">Aleksanterinkatu 48 <br>Oulu, FI 90120</p>
  </div>
</div>
</body>
</html>
`;
};

// export default resend;
