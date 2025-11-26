/**
 * Resend Email Service
 * Handles all email notifications
 */
export class EmailService {
    constructor(env) {
        this.apiKey = env.RESEND_API_KEY;
        this.fromEmail = env.EMAIL_FROM || 'notify@blessing-haven.club';
        this.fromName = env.EMAIL_FROM_NAME || 'Church Management';
    }

    /**
     * Send an email using Resend API
     * @param {Object} options - Email options
     * @param {string} options.to - Recipient email
     * @param {string} options.subject - Email subject
     * @param {string} options.html - HTML content
     * @param {string} options.text - Plain text content (optional)
     * @returns {Object} Response from Resend API
     */
    async send({ to, subject, html, text }) {
        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: `${this.fromName} <${this.fromEmail}>`,
                    to: Array.isArray(to) ? to : [to],
                    subject,
                    html,
                    text: text || this.stripHtml(html),
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Resend API error: ${error}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Email send error:', error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    /**
     * Send offering receipt
     * @param {Object} offering - Offering data
     * @param {Object} member - Member data
     */
    async sendOfferingReceipt(offering, member) {
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Noto Sans TC', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .receipt-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .label { font-weight: 600; color: #6b7280; }
          .value { color: #111827; }
          .amount { font-size: 32px; font-weight: 700; color: #667eea; text-align: center; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>奉獻收據</h1>
            <p>感謝您的奉獻，願神賜福與您</p>
          </div>
          <div class="content">
            <div class="receipt-box">
              <div class="row">
                <span class="label">收據編號</span>
                <span class="value">${offering.id}</span>
              </div>
              <div class="row">
                <span class="label">奉獻日期</span>
                <span class="value">${new Date(offering.date).toLocaleDateString('zh-TW')}</span>
              </div>
              <div class="row">
                <span class="label">奉獻類別</span>
                <span class="value">${this.getOfferingTypeName(offering.type)}</span>
              </div>
              <div class="row">
                <span class="label">奉獻方式</span>
                <span class="value">${this.getPaymentMethodName(offering.method)}</span>
              </div>
              <div class="amount">
                NT$ ${offering.amount.toLocaleString()}
              </div>
            </div>
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              此收據為電子收據，與紙本收據具同等效力
            </p>
          </div>
          <div class="footer">
            <p>如有任何問題，請聯繫教會辦公室</p>
            <p>© ${new Date().getFullYear()} Church Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;

        return await this.send({
            to: member.email,
            subject: `奉獻收據 - ${new Date(offering.date).toLocaleDateString('zh-TW')}`,
            html,
        });
    }

    /**
     * Send event registration confirmation
     * @param {Object} event - Event data
     * @param {Object} member - Member data
     * @param {Object} registration - Registration data
     */
    async sendEventConfirmation(event, member, registration) {
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Noto Sans TC', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .event-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .info-row { padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
          .label { font-weight: 600; color: #6b7280; display: block; margin-bottom: 5px; }
          .value { color: #111827; }
          .qr-code { text-align: center; margin: 20px 0; }
          .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>活動報名確認</h1>
            <p>您已成功報名以下活動</p>
          </div>
          <div class="content">
            <div class="event-box">
              <h2 style="color: #111827; margin-top: 0;">${event.title}</h2>
              <div class="info-row">
                <span class="label">活動時間</span>
                <span class="value">${new Date(event.start_date).toLocaleString('zh-TW')}</span>
              </div>
              <div class="info-row">
                <span class="label">活動地點</span>
                <span class="value">${event.location}</span>
              </div>
              ${event.fee > 0 ? `
              <div class="info-row">
                <span class="label">報名費用</span>
                <span class="value">NT$ ${event.fee.toLocaleString()}</span>
              </div>
              ` : ''}
              <div class="info-row">
                <span class="label">報名編號</span>
                <span class="value">${registration.id}</span>
              </div>
            </div>
            <div class="qr-code">
              <p style="color: #6b7280;">請於活動當天出示此 QR Code 報到</p>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${registration.id}" alt="QR Code" />
            </div>
            <div style="text-align: center;">
              <a href="#" class="button">查看活動詳情</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

        return await this.send({
            to: member.email,
            subject: `活動報名確認 - ${event.title}`,
            html,
        });
    }

    /**
     * Send birthday greeting
     * @param {Object} member - Member data
     */
    async sendBirthdayGreeting(member) {
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Noto Sans TC', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); color: #8b4513; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fffbf5; padding: 30px; border-radius: 0 0 10px 10px; text-align: center; }
          .cake { font-size: 64px; margin: 20px 0; }
          .message { font-size: 18px; color: #6b7280; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 生日快樂！🎉</h1>
          </div>
          <div class="content">
            <div class="cake">🎂</div>
            <h2 style="color: #8b4513;">親愛的 ${member.name}</h2>
            <p class="message">
              願神在新的一歲賜福與您<br>
              充滿平安、喜樂與恩典<br>
              教會全體同工與弟兄姊妹祝福您！
            </p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              「願耶和華賜福給你，保護你。<br>
              願耶和華使他的臉光照你，賜恩給你。<br>
              願耶和華向你仰臉，賜你平安。」<br>
              - 民數記 6:24-26
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

        return await this.send({
            to: member.email,
            subject: `🎂 ${member.name}，生日快樂！`,
            html,
        });
    }

    /**
     * Send event reminder
     * @param {Object} event - Event data
     * @param {Object} member - Member data
     */
    async sendEventReminder(event, member) {
        const daysUntil = Math.ceil((new Date(event.start_date) - new Date()) / (1000 * 60 * 60 * 24));

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Noto Sans TC', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #2d3748; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .reminder-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #48bb78; }
          .countdown { font-size: 48px; font-weight: 700; color: #48bb78; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ 活動提醒</h1>
          </div>
          <div class="content">
            <div class="reminder-box">
              <h2 style="margin-top: 0;">${event.title}</h2>
              <div class="countdown">${daysUntil} 天</div>
              <p style="text-align: center; color: #6b7280;">距離活動開始還有</p>
              <p><strong>時間：</strong>${new Date(event.start_date).toLocaleString('zh-TW')}</p>
              <p><strong>地點：</strong>${event.location}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px; text-align: center;">
              期待您的參與！如有任何問題，請聯繫教會辦公室。
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

        return await this.send({
            to: member.email,
            subject: `活動提醒 - ${event.title}（${daysUntil}天後）`,
            html,
        });
    }

    /**
     * Send backoffice user invite with temporary password
     */
    async sendUserInvite({ to, memberName, tempPassword, verifyUrl, churchName }) {
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Noto Sans TC', sans-serif; line-height: 1.6; color: #1f2933; background: #f5f7fb; padding: 0; margin: 0; }
          .container { max-width: 640px; margin: 0 auto; padding: 32px 24px; }
          .card { background: #ffffff; border-radius: 20px; padding: 40px; box-shadow: 0 30px 60px rgba(15, 23, 42, 0.15); }
          .title { font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #111827; }
          .temp-pass { font-size: 32px; font-weight: 700; letter-spacing: 4px; text-align: center; margin: 28px 0; color: #2563eb; }
          .button { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 14px 32px; border-radius: 999px; font-weight: 600; text-decoration: none; margin: 24px 0; }
          .note { color: #6b7280; font-size: 14px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="title">${churchName || '教會管理系統'} 後台邀請</div>
            <p>親愛的 ${memberName || '同工'}，您好：</p>
            <p>系統已為您建立後台帳號，請使用以下臨時密碼登入並完成驗證。</p>
            <div class="temp-pass">${tempPassword}</div>
            <p style="margin-bottom: 8px;">請於首次登入後立即更改密碼。</p>
            <a href="${verifyUrl}" class="button">前往驗證並登入</a>
            <p class="note">若按鈕無法開啟，請複製此連結：<br>${verifyUrl}</p>
          </div>
        </div>
      </body>
      </html>
    `;

        return await this.send({
            to,
            subject: '後台帳號邀請 - 請完成驗證',
            html,
        });
    }

    /**
     * Send verification email
     */
    async sendVerificationEmail({ to, verifyUrl }) {
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Noto Sans TC', sans-serif; line-height: 1.6; color: #1f2933; background: #f9fafb; padding: 0; margin: 0; }
          .container { max-width: 520px; margin: 0 auto; padding: 32px 24px; }
          .card { background: #ffffff; border-radius: 18px; padding: 32px; box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12); text-align: center; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 28px; border-radius: 999px; font-weight: 600; text-decoration: none; margin: 20px 0; }
          .link { font-size: 13px; color: #6b7280; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <h2 style="margin-top: 0;">驗證您的電子郵件</h2>
            <p>請點擊下方按鈕完成帳號驗證，以確保您可以正常使用後台功能。</p>
            <a href="${verifyUrl}" class="button">立即驗證</a>
            <p class="link">${verifyUrl}</p>
            <p style="color:#9ca3af; font-size: 13px;">若非本人操作，請忽略此信件。</p>
          </div>
        </div>
      </body>
      </html>
    `;

        return await this.send({
            to,
            subject: '請驗證您的教會後台帳號',
            html,
        });
    }

    // Helper methods
    stripHtml(html) {
        return html.replace(/<[^>]*>/g, '');
    }

    getOfferingTypeName(type) {
        const types = {
            'tithe': '十一奉獻',
            'thanksgiving': '感恩奉獻',
            'building': '建堂奉獻',
            'special': '特別奉獻',
        };
        return types[type] || type;
    }

    getPaymentMethodName(method) {
        const methods = {
            'cash': '現金',
            'bank': '銀行轉帳',
            'linepay': 'LINE Pay',
            'card': '信用卡',
        };
        return methods[method] || method;
    }
}
