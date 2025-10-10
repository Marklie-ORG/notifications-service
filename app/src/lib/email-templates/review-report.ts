export const reviewReportTemplate = (clientName: string, link: string, year: string) => {
    return `<!DOCTYPE html>
<html lang="en" style="margin: 0; padding: 0;">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Client Report Ready</title>
    <style>
      body {
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f6f8;
        color: #333333;
      }

      .email-container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      }

      .header {
        background-color: #ffffff;
        padding: 24px;
        text-align: center;
        border-bottom: 1px solid #eeeeee;
      }

      .brand {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }

      .brand img {
        width: 32px;
        height: 32px;
      }

      .brand span {
        font-size: 20px;
        font-weight: 700;
        color: #111111;
        letter-spacing: 0.2px;
      }

      .content {
        padding: 32px 24px;
        line-height: 1.6;
      }

      .content h1 {
        font-size: 22px;
        color: #111111;
        margin-bottom: 16px;
      }

      .content p {
        margin: 8px 0;
      }

      .button-container {
        text-align: center;
        margin: 32px 0;
      }

      a {
        color: #ffffff;
      }

      .button {
        background-color: #1f8ded;
        color: #ffffff;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 6px;
        display: inline-block;
        font-weight: bold;
      }

      .footer {
        font-size: 13px;
        color: #777777;
        text-align: center;
        padding: 20px;
        border-top: 1px solid #e0e0e0;
      }

      @media (max-width: 600px) {
        .content {
          padding: 24px 16px;
        }

        .button {
          width: 100%;
          box-sizing: border-box;
        }
      }
    </style>
  </head>

  <body>
    <div class="email-container">
      <div class="header">
        <div class="brand">
          <img
            src="https://marklie.com/favicon.png"
            alt="Marklie Logo"
          />
          <span style="margin-left: 5px;">Marklie</span>
        </div>
      </div>

      <div class="content">
        <h1>Your client report is ready 🎉</h1>
        <p>Hi there,</p>
        <p>
          The latest <strong>performance report</strong> for your client
          <strong>${clientName}</strong> has been successfully generated.
        </p>
        <p>
          You can now review the detailed insights and share it directly with
          your client.
        </p>

        <div class="button-container">
          <a href="${link}" class="button" target="_blank" style="color: #ffffff;"
            >View Report</a
          >
        </div>

        <p>
          Thank you for using <strong>Marklie</strong> to power your marketing
          analytics.
        </p>
      </div>

      <div class="footer">
        <p>&copy; ${year} Marklie. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
`
}