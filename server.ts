import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API endpoint for sending a reply securely
  app.post("/api/send-reply", async (req, res) => {
    try {
      const { recipientEmail, subject, message } = req.body;

      if (!recipientEmail || !subject || !message) {
        return res.status(400).json({ error: "Required fields are missing: recipientEmail, subject, and message are required." });
      }

      console.log(`[SMTP Mailer] Initiating secure transmission to: ${recipientEmail}`);

      // Set up Nodemailer transporter
      let transporter: any = null;
      const host = process.env.SMTP_HOST;
      const portStr = process.env.SMTP_PORT;
      const port = portStr ? parseInt(portStr) : 587;
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;
      const secure = process.env.SMTP_SECURE === "true";

      const useRealSmtp = !!(host && user && pass);

      if (useRealSmtp) {
        transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass }
        });
        console.log(`[SMTP Mailer] Loaded defined environment SMTP credentials for ${host}:${port}`);
      } else {
        console.log(`[SMTP Mailer] No SMTP credentials in environment, initializing Ethereal Test Account fallback...`);
        try {
          const testAccount = await nodemailer.createTestAccount();
          transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass
            }
          });
          console.log(`[SMTP Mailer] Ethereal credentials generated successfully: ${testAccount.user}`);
        } catch (etherealErr) {
          console.error("[SMTP Mailer] Failed to generate Ethereal credentials on demand:", etherealErr);
          transporter = null;
        }
      }

      const fromName = process.env.SMTP_FROM_NAME || "Dr. Ashwin Singh Chouhan";
      const fromEmail = process.env.SMTP_FROM_EMAIL || "no-reply@chouhan-portfolio.edu";

      let mailResult = null;
      let etherealPreviewUrl = null;

      if (transporter) {
        mailResult = await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: recipientEmail,
          subject: subject,
          text: message,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px dashed #334155; border-radius: 16px; background-color: #0b0f19; color: #e2e8f0; box-shadow: 0 4px 30px rgba(0,0,0,0.5);">
              <div style="border-bottom: 2px solid #06b6d4; padding-bottom: 15px; margin-bottom: 20px; text-align: left; display: flex; align-items: center; justify-content: space-between;">
                <h2 style="color: #cbd5e1; font-weight: 700; margin: 0; font-size: 18px; letter-spacing: 0.05em;">CORRESPONDENCE SYSTEM</h2>
              </div>
              
              <p style="font-size: 13px; color: #94a3b8; margin-bottom: 5px; font-family: monospace;">Dr. Ashwin Singh Chouhan has dispatched feedback on your contact submission.</p>
              
              <div style="background-color: #030712; border-left: 3px solid #ec4899; padding: 18px; margin: 20px 0; border-radius: 8px;">
                <p style="font-size: 14px; line-height: 1.6; color: #f1f5f9; margin: 0; white-space: pre-wrap;">${message.replace(/\n/g, "<br/>")}</p>
              </div>
              
              <div style="border-top: 1px solid #1e293b; padding-top: 15px; margin-top: 25px; font-size: 11px; color: #64748b; font-family: monospace; line-height: 1.4;">
                Sender: ${fromName}<br/>
                Facilitated by: Molecular Pharmacology Portfolio Portal<br/>
                Signature Token: [SMTP-${Date.now().toString(16).toUpperCase()}]
              </div>
            </div>
          `
        });

        console.log(`[SMTP Mailer] Mail dispatched successfully. MessageID: ${mailResult.messageId}`);
        
        if (!useRealSmtp) {
          etherealPreviewUrl = nodemailer.getTestMessageUrl(mailResult);
          console.log(`[SMTP Mailer] View Ethereal Mail Delivery: ${etherealPreviewUrl}`);
        }
      } else {
        console.warn(`[SMTP Mailer] No mail transporter available (offline mode), printing to console log instead.`);
        console.log(`\n======================= OFFLINE EMAIL OUTBOX =======================\nRecipient: ${recipientEmail}\nSubject: ${subject}\nContent:\n${message}\n====================================================================\n`);
      }

      return res.status(200).json({
        success: true,
        message: "Your message has been dispatched successfully.",
        smtpUsed: useRealSmtp ? "Real SMTP" : transporter ? "Ethereal Sandboxed SMTP" : "Offline Sandbox Console",
        previewUrl: etherealPreviewUrl,
        sentDate: new Date().toISOString()
      });

    } catch (e: any) {
      console.error("[SMTP Server Error]", e);
      let errMsg = e.message || "A server side exception occurred during secure SMTP dispatch.";
      
      // Inspect for Gmail/general SMTP 535/Authentication errors
      if (
        errMsg.includes("535") || 
        errMsg.includes("Username and Password not accepted") || 
        errMsg.includes("Invalid login") ||
        errMsg.includes("Authentication")
      ) {
        errMsg = "SMTP Authentication Failed (535): Gmail rejected the account credentials. To fix this: \n1. Go to your Google Account Settings.\n2. Enable '2-Step Verification' if not already active.\n3. Search for 'App Passwords' in the search bar.\n4. Generate a new app-specific 16-character password.\n5. Copy the generated code and enter it precisely into the 'SMTP_PASS' environment variable under the Settings menu of your portfolio studio. Avoid using your standard login password.";
      }
      
      return res.status(500).json({ error: errMsg });
    }
  });

  // API endpoint for link checking/pasting validation
  app.post("/api/validate-link", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ valid: false, error: "Link URL is required." });
      }

      // 1. Basic URL format check
      let parsedUrl;
      try {
        parsedUrl = new URL(url);
      } catch (err) {
        return res.status(200).json({ valid: false, error: "Malformed URL. Please make sure the link protocol is specified (e.g. https://)." });
      }

      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return res.status(200).json({ valid: false, error: "Only HTTP or HTTPS protocols are active." });
      }

      // Check known cloud document hosts
      const lowercaseUrl = url.toLowerCase();
      const isDrive = lowercaseUrl.includes("drive.google.com") || lowercaseUrl.includes("docs.google.com");
      const isDropbox = lowercaseUrl.includes("dropbox.com");
      const isPdfExtension = parsedUrl.pathname.endsWith(".pdf") || lowercaseUrl.includes(".pdf?") || lowercaseUrl.endsWith(".pdf");

      // Attempt verification fetch with a brief timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const response = await fetch(url, {
          method: "GET",
          signal: controller.signal,
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ClinicalPortalValidator/1.0" }
        }).finally(() => clearTimeout(timeoutId));

        if (response.ok) {
          const contentType = response.headers.get("content-type") || "";
          const contentLength = response.headers.get("content-length") || "";
          
          if (contentType.includes("application/pdf") || isPdfExtension) {
            return res.status(200).json({
              valid: true,
              message: "Valid direct PDF link verified successfully.",
              info: `Content-Type: ${contentType || "application/pdf"}${contentLength ? ` (${(parseInt(contentLength) / 1024).toFixed(1)} KB)` : ""}`
            });
          } else if (isDrive || isDropbox) {
            return res.status(200).json({
              valid: true,
              message: "Valid shared document preview cloud page verified.",
              info: `Destination Host: ${parsedUrl.hostname}`
            });
          } else {
            // General link responds successfully
            return res.status(200).json({
              valid: true,
              message: "Connection verified. Link responded with a successful status.",
              info: `Status: ${response.status} | Content-Type: ${contentType}`
            });
          }
        } else {
          // If response not ok (e.g. 403 / 404 / 500)
          // It could still be valid if it's Drive/Dropbox with authentication wall
          if (isDrive || isDropbox) {
            return res.status(200).json({
              valid: true,
              warning: true,
              message: "Shared folder link check completed with login redirection requirement, which is typical for restricted shares.",
              info: `Destination Host: ${parsedUrl.hostname}`
            });
          }
          return res.status(200).json({
            valid: false,
            error: `Target address returned status ${response.status}. Please verify link settings or availability.`
          });
        }
      } catch (err: any) {
        // Fetch failed (CORS or network blockage)
        // If it's standard Google Drive/Dropbox/PDF, we can treat it as valid by syntax
        if (isDrive || isDropbox || isPdfExtension) {
          return res.status(200).json({
            valid: true,
            warning: true,
            message: "Link syntax format verified, but direct connection was skipped due to host security policies.",
            info: `Provider Match: ${isDrive ? "Google Workspace" : isDropbox ? "Dropbox" : "Direct PDF File Structure"}`
          });
        }
        return res.status(200).json({
          valid: false,
          error: "Unable to establish active server handshake connection. Please confirm the link is public and active."
        });
      }
    } catch (e: any) {
      console.error("[Link Validation Error]", e);
      return res.status(500).json({ valid: false, error: e.message || "An exception occurred during link validation." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
