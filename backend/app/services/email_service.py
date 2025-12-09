import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
import os


class EmailService:
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("EMAIL_FROM", "noreply@flowboard.com")
        self.enabled = bool(self.smtp_user and self.smtp_password)
    
    def send_email(
        self,
        to_emails: List[str],
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send email to one or more recipients"""
        if not self.enabled:
            print(f"[EMAIL DISABLED] Would send to {to_emails}: {subject}")
            return False
        
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.from_email
            msg["To"] = ", ".join(to_emails)
            
            # Plain text fallback
            if text_content:
                part1 = MIMEText(text_content, "plain")
                msg.attach(part1)
            
            # HTML content
            part2 = MIMEText(html_content, "html")
            msg.attach(part2)
            
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.from_email, to_emails, msg.as_string())
            
            print(f"[EMAIL SENT] To: {to_emails}, Subject: {subject}")
            return True
            
        except Exception as e:
            print(f"[EMAIL ERROR] Failed to send email: {e}")
            return False


# Email templates
def card_created_email(
    card_title: str,
    list_title: str,
    board_title: str,
    created_by: str,
    board_url: str
) -> tuple[str, str]:
    """Generate card created notification email"""
    subject = f"🆕 New card in {board_title}: {card_title}"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f5f7; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 24px; }}
            .content {{ padding: 30px; }}
            .card-box {{ background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }}
            .card-title {{ font-size: 18px; font-weight: 600; color: #1a1a2e; margin: 0 0 8px 0; }}
            .meta {{ color: #6b7280; font-size: 14px; }}
            .btn {{ display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }}
            .footer {{ background: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📋 Flowboard</h1>
            </div>
            <div class="content">
                <p>Hey there! 👋</p>
                <p>A new card was added to a board you're a member of:</p>
                
                <div class="card-box">
                    <p class="card-title">{card_title}</p>
                    <p class="meta">In list: <strong>{list_title}</strong></p>
                    <p class="meta">Board: <strong>{board_title}</strong></p>
                    <p class="meta">Created by: <strong>{created_by}</strong></p>
                </div>
                
                <a href="{board_url}" class="btn">View Board →</a>
            </div>
            <div class="footer">
                <p>You're receiving this because you're a member of this board.</p>
                <p>© Flowboard - Your Kanban Workspace</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text = f"""
    New card in {board_title}
    
    Card: {card_title}
    List: {list_title}
    Created by: {created_by}
    
    View board: {board_url}
    """
    
    return subject, html, text


def card_moved_email(
    card_title: str,
    from_list: str,
    to_list: str,
    board_title: str,
    moved_by: str,
    board_url: str
) -> tuple[str, str]:
    """Generate card moved notification email"""
    subject = f"📦 Card moved in {board_title}: {card_title}"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f5f7; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
            .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 24px; }}
            .content {{ padding: 30px; }}
            .move-box {{ background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; margin: 20px 0; border-radius: 8px; }}
            .card-title {{ font-size: 18px; font-weight: 600; color: #1a1a2e; margin: 0 0 15px 0; }}
            .move-flow {{ display: flex; align-items: center; gap: 10px; font-size: 14px; color: #374151; }}
            .list-tag {{ background: #e5e7eb; padding: 4px 10px; border-radius: 4px; font-weight: 500; }}
            .arrow {{ color: #10b981; font-size: 20px; }}
            .meta {{ color: #6b7280; font-size: 14px; margin-top: 15px; }}
            .btn {{ display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }}
            .footer {{ background: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📋 Flowboard</h1>
            </div>
            <div class="content">
                <p>Hey there! 👋</p>
                <p>A card was moved on a board you're a member of:</p>
                
                <div class="move-box">
                    <p class="card-title">{card_title}</p>
                    <div class="move-flow">
                        <span class="list-tag">{from_list}</span>
                        <span class="arrow">→</span>
                        <span class="list-tag" style="background: #bbf7d0;">{to_list}</span>
                    </div>
                    <p class="meta">Board: <strong>{board_title}</strong></p>
                    <p class="meta">Moved by: <strong>{moved_by}</strong></p>
                </div>
                
                <a href="{board_url}" class="btn">View Board →</a>
            </div>
            <div class="footer">
                <p>You're receiving this because you're a member of this board.</p>
                <p>© Flowboard - Your Kanban Workspace</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text = f"""
    Card moved in {board_title}
    
    Card: {card_title}
    From: {from_list} → To: {to_list}
    Moved by: {moved_by}
    
    View board: {board_url}
    """
    
    return subject, html, text


def member_invited_email(
    board_title: str,
    invited_by: str,
    board_url: str
) -> tuple[str, str]:
    """Generate board invite notification email"""
    subject = f"🎉 You've been invited to {board_title}"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f5f7; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
            .header {{ background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 24px; }}
            .content {{ padding: 30px; text-align: center; }}
            .invite-box {{ background: #fef3c7; border: 2px dashed #f59e0b; padding: 30px; margin: 20px 0; border-radius: 12px; }}
            .board-name {{ font-size: 24px; font-weight: 700; color: #1a1a2e; margin: 0 0 10px 0; }}
            .meta {{ color: #6b7280; font-size: 14px; }}
            .btn {{ display: inline-block; background: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; font-size: 16px; }}
            .footer {{ background: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📋 Flowboard</h1>
            </div>
            <div class="content">
                <p>Hey there! 👋</p>
                <p>Great news! You've been invited to collaborate:</p>
                
                <div class="invite-box">
                    <p class="board-name">{board_title}</p>
                    <p class="meta">Invited by: <strong>{invited_by}</strong></p>
                </div>
                
                <a href="{board_url}" class="btn">Join Board →</a>
            </div>
            <div class="footer">
                <p>© Flowboard - Your Kanban Workspace</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text = f"""
    You've been invited to {board_title}!
    
    Invited by: {invited_by}
    
    Join board: {board_url}
    """
    
    return subject, html, text


# Singleton instance
email_service = EmailService()

