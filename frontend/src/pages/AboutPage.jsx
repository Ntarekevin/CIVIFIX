import React from 'react';

export default function AboutPage() {
  return (
    <div className="about-layout">
      <div className="page-header" style={{ textAlign: 'left', padding: '0 0 20px' }}>
        <h1>About CiviFix</h1>
        <p className="text-muted">Empowering Rwandan citizens to safely report civic issues and hold authorities accountable.</p>
      </div>

      <h2>What is CiviFix?</h2>
      <p>
        CiviFix is an anonymous civic issue reporting platform designed for Rwanda. It allows any citizen
        to report corruption, poor government service, discrimination, and security concerns — without
        creating an account or revealing their identity.
      </p>

      <h2>How Does Anonymity Work?</h2>
      <p>
        We take privacy seriously. Here's what we do to protect you:
      </p>
      <ul style={{ paddingLeft: '20px', color: 'var(--color-muted)', lineHeight: 2.2 }}>
        <li>No citizen accounts or login — ever.</li>
        <li>Reports have no identifying metadata attached.</li>
        <li>Uploaded photos and videos have EXIF data (GPS, device info) automatically stripped.</li>
        <li>Public map coordinates are rounded to approximately 1 km, preventing precise location tracking.</li>
        <li>All data is encrypted at rest and in transit (HTTPS + AES-256).</li>
      </ul>

      <h2>How to Submit a Report</h2>
      <p>
        Click <strong>Report Issue</strong> in the top navigation. You'll go through a simple 4-step process:
      </p>
      <ol style={{ paddingLeft: '20px', color: 'var(--color-muted)', lineHeight: 2.4 }}>
        <li><strong>Choose a category</strong> – Corruption, Security, Discrimination, or Poor Service.</li>
        <li><strong>Pin a location</strong> – Tap the map where the incident occurred (optional).</li>
        <li><strong>Add evidence</strong> – Upload photos or a video (optional, max 5 MB).</li>
        <li><strong>Submit</strong> – You'll receive a unique tracking token.</li>
      </ol>

      <h2>Tracking Your Report</h2>
      <p>
        After submitting, you'll receive a random tracking token (a long string of letters and numbers).
        Save it. You can use it on the <strong>Track Report</strong> page to check whether authorities
        have updated the status of your report — no account required.
      </p>

      <h2>Offline Support</h2>
      <p>
        CiviFix works even when your internet connection is unreliable. Reports are saved on your device
        and automatically submitted the next time you are online. A banner at the bottom of the screen
        lets you know when you are offline.
      </p>

      <h2>Who Sees the Reports?</h2>
      <p>
        A summary (with obfuscated locations) is visible to the public on the Dashboard. Full details —
        including exact coordinates and uploaded media — are only accessible to verified government
        authority accounts through a separate private portal.
      </p>

      <h2>Contact / Open Source</h2>
      <p>
        CiviFix is an open-source civic tech project. If you are a Rwandan NGO, government body, or
        developer interested in contributing, please reach out at{' '}
        <a href="mailto:hello@civifix.rw">hello@civifix.rw</a>.
      </p>

      {/* Privacy note */}
      <div className="alert alert-info" style={{ marginTop: '40px' }}>
        🛡 CiviFix does not collect personal data and does not share any information with third parties.
        This platform complies with Rwandan data protection regulations.
      </div>
    </div>
  );
}
