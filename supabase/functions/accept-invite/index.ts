import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type CoupleProfilePayload = {
  id: string;
  meId: string;
  partner: {
    id: string;
    firstName: string;
    email?: string;
    displayName?: string;
  };
  reunionDate?: string;
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'missing_authorization' }, 401);
    }

    const jwt = authHeader.slice('Bearer '.length).trim();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: userData, error: authErr } = await admin.auth.getUser(jwt);
    if (authErr || !userData.user) {
      return json({ error: 'invalid_session' }, 401);
    }
    const user = userData.user;

    const body = (await req.json().catch(() => ({}))) as { token?: string };
    const token = String(body.token ?? '').trim();
    if (!token) {
      return json({ error: 'token_required' }, 400);
    }

    const { data: invite, error: invErr } = await admin
      .from('invites')
      .select('id, couple_id, inviter_id, expires_at, consumed_at')
      .eq('token', token)
      .maybeSingle();

    if (invErr || !invite) {
      return json({ error: 'invite_not_found' }, 404);
    }
    if (invite.consumed_at) {
      return json({ error: 'invite_already_used' }, 409);
    }
    if (new Date(invite.expires_at) < new Date()) {
      return json({ error: 'invite_expired' }, 410);
    }
    if (invite.inviter_id === user.id) {
      return json({ error: 'cannot_accept_own_invite' }, 400);
    }

    const { data: memberships } = await admin.from('couple_members').select('couple_id').eq('user_id', user.id);

    const coupleIds = memberships?.map((m) => m.couple_id) ?? [];
    if (coupleIds.length > 0) {
      const { data: completed } = await admin
        .from('couples')
        .select('id')
        .in('id', coupleIds)
        .eq('is_complete', true)
        .limit(1)
        .maybeSingle();
      if (completed) {
        return json({ error: 'already_paired' }, 409);
      }
    }

    const { error: memErr } = await admin.from('couple_members').insert({
      couple_id: invite.couple_id,
      user_id: user.id,
    });

    if (memErr) {
      if (memErr.code === '23505') {
        return json({ error: 'already_member' }, 409);
      }
      console.error(memErr);
      return json({ error: 'membership_failed' }, 500);
    }

    const reunion = new Date();
    reunion.setDate(reunion.getDate() + 42);

    const { error: coupErr } = await admin
      .from('couples')
      .update({ is_complete: true, reunion_date: reunion.toISOString() })
      .eq('id', invite.couple_id);

    if (coupErr) {
      console.error(coupErr);
      return json({ error: 'couple_update_failed' }, 500);
    }

    const { error: consErr } = await admin
      .from('invites')
      .update({
        consumed_at: new Date().toISOString(),
        consumed_by_user_id: user.id,
      })
      .eq('id', invite.id);

    if (consErr) {
      console.error(consErr);
    }

    const { data: members, error: memQErr } = await admin
      .from('couple_members')
      .select('user_id')
      .eq('couple_id', invite.couple_id);

    if (memQErr || !members?.length) {
      return json({ error: 'members_load_failed' }, 500);
    }

    const partnerId = members.find((m) => m.user_id !== user.id)?.user_id;
    if (!partnerId) {
      return json({ error: 'partner_not_found' }, 500);
    }

    const { data: profiles } = await admin
      .from('profiles')
      .select('id, first_name, display_name')
      .in('id', [user.id, partnerId]);

    const partnerProfile = profiles?.find((p) => p.id === partnerId);

    const { data: partnerAuth, error: pAuthErr } = await admin.auth.admin.getUserById(partnerId);
    if (pAuthErr) {
      console.error(pAuthErr);
    }

    const partnerEmail = partnerAuth?.user?.email ?? undefined;

    const payload: CoupleProfilePayload = {
      id: invite.couple_id,
      meId: user.id,
      partner: {
        id: partnerId,
        firstName: partnerProfile?.first_name?.trim() || 'Partner',
        email: partnerEmail,
        displayName: partnerProfile?.display_name ?? undefined,
      },
      reunionDate: reunion.toISOString(),
    };

    return json({ couple: payload }, 200);
  } catch (e) {
    console.error(e);
    return json({ error: 'internal_error' }, 500);
  }
});
