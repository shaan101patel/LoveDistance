import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

type NotifRow = {
  id: string;
  user_id: string;
  title: string;
  summary: string;
  href?: string | null;
};

type WebhookBody = {
  type?: string;
  table?: string;
  record?: NotifRow;
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const auth = req.headers.get('Authorization') ?? '';
  if (!serviceKey || auth !== `Bearer ${serviceKey}`) {
    return json({ error: 'unauthorized' }, 401);
  }

  const expoAccessToken = Deno.env.get('EXPO_ACCESS_TOKEN');
  if (!expoAccessToken) {
    return json({ skipped: true, reason: 'EXPO_ACCESS_TOKEN not set' }, 200);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const admin = createClient(supabaseUrl, serviceKey);

  const body = (await req.json().catch(() => ({}))) as WebhookBody | { record?: NotifRow };
  const record = 'record' in body ? body.record : undefined;
  if (!record?.id || !record.user_id) {
    return json({ error: 'record_required' }, 400);
  }

  const { data: row } = await admin.from('notifications').select('*').eq('id', record.id).maybeSingle();
  if (!row) {
    return json({ error: 'notification_not_found' }, 404);
  }

  if (row.push_dispatched_at) {
    return json({ skipped: true, reason: 'already_dispatched' }, 200);
  }

  const { data: settings } = await admin
    .from('user_app_settings')
    .select('redact_previews')
    .eq('user_id', row.user_id)
    .maybeSingle();

  const redact = settings?.redact_previews === true;
  const bodyText = redact ? 'Open LoveDistance for details.' : row.summary || row.title;

  const { data: tokens } = await admin
    .from('user_push_tokens')
    .select('expo_push_token')
    .eq('user_id', row.user_id);

  const toList = (tokens ?? []).map((t) => t.expo_push_token).filter(Boolean);
  if (toList.length === 0) {
    return json({ skipped: true, reason: 'no_tokens' }, 200);
  }

  const messages = toList.map((to) => ({
    to,
    title: row.title,
    body: bodyText,
    data: { href: row.href ?? '' },
  }));

  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${expoAccessToken}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return json({ error: 'expo_push_failed', detail: errText }, 502);
  }

  await admin
    .from('notifications')
    .update({ push_dispatched_at: new Date().toISOString() })
    .eq('id', row.id);

  return json({ ok: true, sent: toList.length }, 200);
});
