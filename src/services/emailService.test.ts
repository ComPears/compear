import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Exercise the actual EmailJS SDK against a stubbed HTTP boundary. Never send
// real email or require production credentials in the regression suite.
const fetchMock = vi.fn();
const suggestion = { name: ' Ada ', email: ' ada@example.test ', suggestion: ' Add unit prices ' };

describe('EmailJS SDK compatibility', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    vi.stubEnv('VITE_EMAILJS_SERVICE_ID', 'service_test');
    vi.stubEnv('VITE_EMAILJS_TEMPLATE_ID', 'template_test');
    vi.stubEnv('VITE_EMAILJS_PUBLIC_KEY', 'public_test');
    vi.stubEnv('VITE_ADMIN_EMAIL', 'admin@example.test');
    fetchMock.mockReset().mockResolvedValue({ ok: true, status: 200, text: async () => 'OK' });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('sends normalized suggestions through the real SDK with the public-key argument', async () => {
    const { sendSuggestion } = await import('./emailService');
    await expect(sendSuggestion(suggestion)).resolves.toMatchObject({ status: 200, text: 'OK' });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.emailjs.com/api/v1.0/email/send');
    expect(request.method).toBe('POST');
    expect(JSON.parse(request.body)).toMatchObject({
      service_id: 'service_test', template_id: 'template_test', user_id: 'public_test',
      template_params: {
        from_name: 'Ada', from_email: 'ada@example.test', message: 'Add unit prices',
        to_email: 'admin@example.test', reply_to: 'ada@example.test',
      },
    });
  });

  it('retains throttling before a second network request', async () => {
    const { sendSuggestion } = await import('./emailService');
    await sendSuggestion(suggestion);
    await expect(sendSuggestion(suggestion)).rejects.toThrow('Please wait');
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('rejects oversized input before invoking the SDK', async () => {
    const { sendSuggestion } = await import('./emailService');
    await expect(sendSuggestion({ ...suggestion, suggestion: 'x'.repeat(2001) })).rejects.toThrow('too long');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('preserves the waitlist template mapping', async () => {
    const { sendWaitlistSignup } = await import('./emailService');
    await sendWaitlistSignup({ email: ' ada@example.test ', country: 'de' });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).template_params).toMatchObject({
      from_name: 'Waitlist', from_email: 'ada@example.test', message: 'Waitlist signup for de',
    });
  });

  it('handles SDK HTTP failures without reporting success', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock.mockResolvedValue({ ok: false, status: 429, text: async () => 'Rate limited' });
    const { sendSuggestion } = await import('./emailService');
    await expect(sendSuggestion(suggestion)).rejects.toThrow('Failed to send email via EmailJS');
  });
});
